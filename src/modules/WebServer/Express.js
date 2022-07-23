'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Express Transport
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
// const LIB_FS = require( 'fs' );
const LIB_EXPRESS = require( 'express' );
const LIB_EXPRESS_SESSION = require( 'express-session' );
// const LIB_EXPRESS_FILEUPLOAD = require( 'express-fileupload' );
// const LIB_CORS = require( 'cors' );
// const LIB_HELMET = require( 'helmet' );
// const LIB_MEMORYSTORE = require( 'memorystore' );
// const LIB_SESSION_FILE_STORE = require( 'session-file-store' );

//---------------------------------------------------------------------
// const SRC_AUTHENTICATION_PASSPORT_LOCAL = require( './Express/Authentication/Passport_Local.js' );
// const SRC_AUTHENTICATION_PASSPORT_AUTH0 = require( './Express/Authentication/Passport_Auth0.js' );
// const SRC_EXPRESS_ROUTES = require( './Express/ExpressRoutes.js' );
// const SRC_EXPRESS_API_CLIENT = require( './Express/ExpressApiClient.js' );
// const SRC_GENERATE_CLIENT_SWAGGER = require( './Express/SwaggerDocument.js' );


//---------------------------------------------------------------------
exports.Create =
	function Create( Server, WebServer )
	{
		let Express = {
			App: LIB_EXPRESS(),
			Session: null,
		};


		//=====================================================================
		//=====================================================================
		//
		//		Utiltiy Functions
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// Returns the server protocol, address, and port.
		// Express.ServerAddress = WebServer.ServerAddress;


		//---------------------------------------------------------------------
		// Returns the root server path.
		// Will always start and end with a '/' character.
		Express.ServerPath =
			function ServerPath()
			{
				let url = WebServer.Settings.Express.server_path;
				if ( !url.startsWith( '/' ) ) { url = '/' + url; }
				if ( !url.endsWith( '/' ) ) { url += '/'; }
				return url;
			};


		//---------------------------------------------------------------------
		// Returns the path to the services, including the root server path.
		// Will always end with a '/' character.
		Express.ServicesPath =
			function ServicesPath()
			{
				let url = Express.ServerPath();
				url += WebServer.Settings.Express.services_path;
				if ( !url.endsWith( '/' ) ) { url += '/'; }
				return url;
			};


		//=====================================================================
		//=====================================================================
		//
		//		AuthenticationGate
		//
		// - returns an Express middleware.
		// - If the user is logged in, then execution flow continues to the next middleware.
		// - If the user is not logged in and a login is required, then the user is redirected to the login page.
		// - If the user is not logged in and no login is required, then the user is set to Anonymous and execution flow continues.
		// - request is guaranteed to have an attached user account for subsequent middlewares.
		//
		//=====================================================================
		//=====================================================================


		Express.AuthenticationGate =
			function AuthenticationGate( RequiresAuthentication )
			{
				let middleware = null;
				if ( WebServer.Settings.Express.Authentication
					&& WebServer.Settings.Express.Authentication.enabled
					&& RequiresAuthentication )
				{
					middleware = // Authentication is required.
						async function ( request, response, next )
						{
							// If the user already exists and is not the Anonymous user, then continue next.
							if ( request.user )
							{
								if ( request.user.user_id !== WebServer.Settings.AnonymousUser.user_id ) 
								{
									// Server.Log.trace( `AuthenticationGate(1) is selecting the existing request.user [${request.user.user_id}].` );
									return next();
								}
							}

							// Store original url in our session.
							if ( request.session )
							{
								// Remember this url so that a successful authentication can redirect to the originally requested url.
								request.session.redirect_url_after_login = request.originalUrl;
							}

							// Redirect user to the login page.
							// Server.Log.trace( 'AuthenticationGate(1) is redirecting user to the login url.' );
							let login_url = `${Express.ServerPath()}${WebServer.Settings.Express.Authentication.Pages.login_url}`;
							response.redirect( login_url );
						};
				}
				else
				{
					middleware = // Authentication is not required.
						async function ( request, response, next )
						{
							if ( typeof request.user === 'undefined' )
							{
								// If there is a user already loaded in the session then use it otherwise set the Anonymous user.
								if ( request.session
									&& request.session.passport
									&& request.session.passport.user ) 
								{
									request.user = JSON.parse( JSON.stringify( request.session.passport.user ) );
								}
								else
								{
									// Set the Anonymous user.
									// Server.Log.trace( 'AuthenticationGate(2) is selecting the Anonymous user.' );
									request.user = JSON.parse( JSON.stringify( WebServer.Settings.AnonymousUser ) );
								}
							}
							else
							{
								// Server.Log.trace( `AuthenticationGate(2) is selecting the existing request.user [${request.user.user_id}].` );
							}
							return next();
						};
				}
				return middleware;
			};


		//=====================================================================
		//=====================================================================
		//
		//		AuthorizationGate
		//
		// - returns an Express middleware.
		// - if AllowedRoles is empty, then execution flow continues to the next middleware.
		// - if user_role is listed in AllowedRoles, then execution flow continues to the next middleware.
		// - if user_role is not listed in AllowedRoles, a 403 (Forbidden) code is returned.
		//
		//=====================================================================
		//=====================================================================


		Express.AuthorizationGate =
			function AuthorizationGate( AllowedRoles )
			{
				let middleware = null;
				if ( WebServer.Settings.Express.Authentication
					&& WebServer.Settings.Express.Authentication.enabled
					&& AllowedRoles.length )
				{
					middleware = // Authorization is required.
						async function ( request, response, next )
						{
							if ( !request.user ) { throw new Error( `request.user is null. Authentication must precede Authorization.` ); }
							if ( AllowedRoles.includes( request.user.user_role ) ) 
							{
								return next();
							}
							else
							{
								response.status( 403 ).send( { error: `This user does not have permission to perform this function.` } );
								return;
							}
						};
				}
				else
				{
					middleware = // Authorization is not required.
						async function ( request, response, next )
						{
							if ( !request.user ) { throw new Error( `request.user is null. Authentication must precede Authorization.` ); }
							return next();
						};
				}
				return middleware;
			};


		//=====================================================================
		//=====================================================================
		//
		//		InvocationGate
		//
		// - returns an Express middleware.
		// - Validates invocation parameters.
		// - Reports invocation status.
		// - Reports invocation duration.
		// - Reports error information.
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// InvocationGate returns an Express middleware.
		Express.InvocationGate =
			function InvocationGate( Service, Origin, Invocation )
			{
				let middleware =
					async function ( request, response, next )
					{
						let t0 = Date.now();
						let invocation_result = null;
						let invocation_error = null;

						// Get service and origin info.
						let service_name = '';
						if ( Service && Service.ServiceDefinition && Service.ServiceDefinition.name )
						{
							service_name = Service.ServiceDefinition.name;
						}
						let origin_url = request.url;
						{
							// Remove the query string.
							let ich = origin_url.indexOf( '?' );
							if ( ich >= 0 ) { origin_url = origin_url.slice( 0, ich ); }
							// Remove the leading slash '/'.
							// if ( origin_url.startsWith( '/' ) ) { origin_url = origin_url.slice( 1 ); }
							// Remove the trailing slash '/'.
							if ( origin_url.endsWith( '/' ) ) { origin_url = origin_url.slice( 0, origin_url.length - 1 ); }
							// Make the root url a single slash '/'.
							if ( origin_url === '' ) { origin_url = '/'; }
							// Convert to dotted notation for origin calls.
							// if ( Service && Origin )
							// {
							// 	origin_url = Server.Utility.replace_all( origin_url, '/', '.' );
							// }
						}

						try
						{
							if ( Origin )
							{
								// Get a working copy of the parameters.
								let origin_parameters = {};
								if ( request.query && Object.keys( request.query ).length ) { origin_parameters = request.query; }
								else if ( request.body && Object.keys( request.body ).length ) { origin_parameters = request.body; }
								else if ( request.params && Object.keys( request.params ).length ) { origin_parameters = request.params; }
								// Validate the parameters.
								let validation_error = Server.ValidateFields( Origin.parameters, origin_parameters, true, false );
								if ( validation_error )
								{
									let error_message = `Validation Error: ${validation_error}`;
									throw new Error( error_message );
								}
								// Set our working copy of the parmeters in the request object.
								request.origin_parameters = origin_parameters;
								// Report.
								Server.Log.debug( `Express ===> ${origin_url} ===> ${JSON.stringify( origin_parameters )}` );
							}
							else
							{
								Server.Log.debug( `Express ===> ${origin_url} ===> null` );
							}
							// Do the invocation. (amost there!)
							invocation_result = await Invocation( request, response, next );
						}
						catch ( error ) 
						{
							// Internal error.
							// response.status( 500 ).send( { error: error.message } );
							let api_result = {
								ok: false,
								origin: origin_url,
								error: error.message,
							};
							response.send( api_result );
							invocation_error = error;
						}
						finally
						{
							// Duration
							let duration_text = ( Date.now() - t0 ).toString() + 'ms';
							// User
							let user_text = request.user.user_id;
							// Report.
							if ( invocation_result )
							{
								Server.Log.debug( `Express <=== ${origin_url} <=== ${JSON.stringify( invocation_result )} (by:${user_text}) (duration:${duration_text})` );
							}
							else if ( invocation_result === null )
							{
								Server.Log.debug( `Express <=== ${origin_url} <=== null (by:${user_text}) (duration:${duration_text})` );
							}
							if ( invocation_error )
							{
								Server.Log.error( `Express <=== ${origin_url} <=== *** Error *** ${invocation_error.message} (by:${user_text}) (duration:${duration_text})` );
							}
						}

					};
				return middleware;
			};


		//---------------------------------------------------------------------
		return Express;
	};


//=====================================================================
//=====================================================================
//
//		Initialize
//
//=====================================================================
//=====================================================================


exports.Initialize =
	function Initialize( Server, WebServer )
	{

		let component_context = {
			Server: Server,
			WebServer: WebServer,
			WebServerSettings: WebServer.Settings,
			LIB_EXPRESS: LIB_EXPRESS,
			LIB_EXPRESS_SESSION: LIB_EXPRESS_SESSION,
		};

		let components = {};


		//=====================================================================
		//=====================================================================
		//
		//		Load Components
		//
		//=====================================================================
		//=====================================================================

		//---------------------------------------------------------------------
		// Data Handling
		{
			let SRC = require( './Express/Express_DataHandling.js' );
			components.Express_DataHandling_JsonBodyParser = SRC.Express_DataHandling_JsonBodyParser;
			components.Express_DataHandling_UrlEncodedParser = SRC.Express_DataHandling_UrlEncodedParser;
			components.Express_DataHandling_FileUpload = SRC.Express_DataHandling_FileUpload;
		}

		//---------------------------------------------------------------------
		// Security
		{
			let SRC = require( './Express/Express_Security.js' );
			components.Express_Security_Cors = SRC.Express_Security_Cors;
		}

		//---------------------------------------------------------------------
		// Client Support
		{
			let SRC = require( './Express/Express_ClientSupport.js' );
			components.Express_ClientSupport_ViewEngine = SRC.Express_ClientSupport_ViewEngine;
			components.Express_ClientSupport_ClientApiFile = SRC.Express_ClientSupport_ClientApiFile;
			components.Express_ClientSupport_OpenApiFile = SRC.Express_ClientSupport_OpenApiFile;
			components.Express_ClientSupport_MountPublicFiles = SRC.Express_ClientSupport_MountPublicFiles;
			components.Express_ClientSupport_MountRootRoute = SRC.Express_ClientSupport_MountRootRoute;
			components.Express_ClientSupport_MountExplorerRoute = SRC.Express_ClientSupport_MountExplorerRoute;
		}

		//---------------------------------------------------------------------
		// Express Session
		{
			let SRC = require( './Express/Express_Session.js' );
			components.Express_Session = SRC.Express_Session;
		}

		//---------------------------------------------------------------------
		// Express Authentication
		{
			let SRC = require( './Express/Express_Authentication.js' );
			components.Express_Authentication = SRC.Express_Authentication;
		}

		//---------------------------------------------------------------------
		// Express Services
		{
			let SRC = require( './Express/Express_Services.js' );
			components.Express_Services = SRC.Express_Services;
		}


		//=====================================================================
		//=====================================================================
		//
		//		Initialize Components
		//
		//=====================================================================
		//=====================================================================

		// `session-file-store` must be initialized after setting the
		// ClientSupport.public_files static folder and before the adding
		// of any routes.

		components.Express_DataHandling_JsonBodyParser( component_context );
		components.Express_DataHandling_UrlEncodedParser( component_context );
		components.Express_DataHandling_FileUpload( component_context );
		components.Express_Security_Cors( component_context );
		components.Express_ClientSupport_ViewEngine( component_context );
		components.Express_ClientSupport_ClientApiFile( component_context );
		components.Express_ClientSupport_OpenApiFile( component_context );
		components.Express_Session( component_context );
		components.Express_ClientSupport_MountPublicFiles( component_context );
		components.Express_ClientSupport_MountRootRoute( component_context );
		components.Express_ClientSupport_MountExplorerRoute( component_context );
		components.Express_Authentication( component_context );
		components.Express_Services( component_context );


		//=====================================================================
		//=====================================================================
		//
		//		Report Routes
		//
		//=====================================================================
		//=====================================================================


		if ( WebServer.Settings.Express.report_routes )
		{
			Server.Log.debug( 'Reporting express routes:' );
			let stack = WebServer.Express.App._router.stack;
			stack.forEach(
				function ( r )
				{
					if ( r.route && r.route.path )
					{
						let verbs = [];
						if ( r.route.methods.get ) { verbs.push( 'GET ' ); }
						if ( r.route.methods.put ) { verbs.push( 'PUT ' ); }
						if ( r.route.methods.post ) { verbs.push( 'POST' ); }
						if ( r.route.methods.del ) { verbs.push( 'DEL ' ); }
						let text = '  ' + verbs.join( '|' );
						text = text.padEnd( 20 );
						text += ' ' + r.route.path;
						Server.Log.debug( text );
					}
				} );
		}


		//---------------------------------------------------------------------
		return;
	};
