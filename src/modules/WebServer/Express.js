'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Express Transport
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const LIB_FS = require( 'fs' );
const LIB_EXPRESS = require( 'express' );
const LIB_EXPRESS_SESSION = require( 'express-session' );
const LIB_EXPRESS_FILEUPLOAD = require( 'express-fileupload' );
const LIB_CORS = require( 'cors' );
// const LIB_HELMET = require( 'helmet' );


//---------------------------------------------------------------------
const SRC_AUTHENTICATION_PASSPORT_LOCAL = require( './Express/Authentication/Passport_Local.js' );
const SRC_AUTHENTICATION_PASSPORT_AUTH0 = require( './Express/Authentication/Passport_Auth0.js' );
const SRC_EXPRESS_ROUTES = require( './Express/ExpressRoutes.js' );
const SRC_EXPRESS_API_CLIENT = require( './Express/ExpressApiClient.js' );
// const SRC_GENERATE_CLIENT_SWAGGER = require( './Express/SwaggerDocument.js' );


//---------------------------------------------------------------------
exports.Create =
	function Create( Server, WebServer, WebServerSettings )
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
		Express.ServerAddress =
			function ServerAddress()
			{
				let url = WebServerSettings.HttpServer.protocol
					+ '://' + WebServerSettings.HttpServer.address
					+ ':' + WebServerSettings.HttpServer.port;
				return url;
			};


		//---------------------------------------------------------------------
		// Returns the root server path.
		// Will always start and end with a '/' character.
		Express.ServerPath =
			function ServerPath()
			{
				let url = WebServerSettings.Express.server_path;
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
				url += WebServerSettings.Express.services_path;
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
				if ( WebServerSettings.Express.Authentication
					&& WebServerSettings.Express.Authentication.enabled
					&& RequiresAuthentication )
				{
					middleware =
						async function ( request, response, next )
						{
							if ( request.user ) { return next(); }
							if ( request.session )
							{
								// Remember this url so that a successful authentication can redirect to the originally requested url.
								request.session.redirect_url_after_login = request.originalUrl;
							}
							// Redirect to the login page.
							let url = `${Express.ServerPath()}${WebServerSettings.Express.Authentication.Pages.login_url}`;
							response.redirect( url );
						};
				}
				else
				{
					middleware =
						async function ( request, response, next )
						{
							if ( request.user ) { return next(); }
							// Set the Anonymous user.
							request.user = JSON.parse( JSON.stringify( WebServerSettings.Express.Authentication.AnonymousUser ) );
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
				if ( WebServerSettings.Express.Authentication
					&& WebServerSettings.Express.Authentication.enabled
					&& AllowedRoles.length )
				{
					middleware =
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
					middleware =
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
	function Initialize( Server, WebServer, WebServerSettings )
	{


		//=====================================================================
		//=====================================================================
		//
		//		Data Handling
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		if ( WebServerSettings.Express.DataHandling.JsonBodyParser
			&& WebServerSettings.Express.DataHandling.JsonBodyParser.enabled )
		{
			WebServer.Express.App.use( LIB_EXPRESS.json( WebServerSettings.Express.DataHandling.JsonBodyParser.Settings ) );
			Server.Log.trace( `WebServer.Express.DataHandling.JsonBodyParser is initialized.` );
		}


		//---------------------------------------------------------------------
		if ( WebServerSettings.Express.DataHandling.UrlEncodedParser
			&& WebServerSettings.Express.DataHandling.UrlEncodedParser.enabled )
		{
			WebServer.Express.App.use( LIB_EXPRESS.urlencoded( WebServerSettings.Express.DataHandling.UrlEncodedParser.Settings ) );
			Server.Log.trace( `WebServer.Express.DataHandling.UrlEncodedParser is initialized.` );
		}


		//---------------------------------------------------------------------
		if ( WebServerSettings.Express.DataHandling.FileUpload
			&& WebServerSettings.Express.DataHandling.FileUpload.enabled )
		{
			WebServer.Express.App.use( LIB_EXPRESS_FILEUPLOAD( WebServerSettings.Express.DataHandling.FileUpload.Settings ) );
			Server.Log.trace( `WebServer.Express.DataHandling.FileUpload is initialized.` );
		}


		//=====================================================================
		//=====================================================================
		//
		//		Security
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		if ( WebServerSettings.Express.Security.Cors
			&& WebServerSettings.Express.Security.Cors.enabled )
		{
			// - Enable CORS (see: https://medium.com/@alexishevia/using-cors-in-express-cac7e29b005b)
			// WebServer.Express.App.use( LIB_CORS( { origin: '*' } ) );
			WebServer.Express.App.use( LIB_CORS( WebServerSettings.Express.Security.Cors.Settings ) );
			Server.Log.trace( `WebServer.Express.Security.Cors is initialized.` );
		}

		// if ( WebServerSettings.Helmet && WebServerSettings.Helmet.enabled )
		// {
		// 	WebServer.Express.App.use( LIB_HELMET( WebServerSettings.Helmet ) );
		// 	Server.Log.trace( `WebServer - initialized Helmet` );
		// }


		//=====================================================================
		//=====================================================================
		//
		//		Session
		//
		//=====================================================================
		//=====================================================================


		if ( WebServerSettings.Express.Session
			&& WebServerSettings.Express.Session.enabled )
		{
			WebServer.Express.Session = LIB_EXPRESS_SESSION( WebServerSettings.Express.Session.Settings );
			WebServer.Express.App.use( WebServer.Express.Session );

			if ( WebServerSettings.Express.Session.set_express_trust_proxy )
			{
				WebServer.Express.App.set( 'trust proxy', 1 );
			}

			Server.Log.trace( `WebServer.Express.Session is initialized.` );
		}


		//=====================================================================
		//=====================================================================
		//
		//		Authentication
		//
		//=====================================================================
		//=====================================================================


		if ( WebServerSettings.Express.Authentication
			&& WebServerSettings.Express.Authentication.enabled )
		{
			if ( WebServerSettings.Express.Authentication.authentication_engine === 'Passport_Local' )
			{
				SRC_AUTHENTICATION_PASSPORT_LOCAL.Use( Server, WebServer, WebServerSettings );
				Server.Log.trace( `WebServer.Express.Authentication is using[ Passport_Local ].` );
			}
			else if ( WebServerSettings.Express.Authentication.authentication_engine === 'Passport_Auth0' )
			{
				SRC_AUTHENTICATION_PASSPORT_AUTH0.Use( Server, WebServer, WebServer.Express, WebServerSettings );
				Server.Log.trace( `WebServer.Express.Authentication is using[ Passport_Auth0 ].` );
			}
			else
			{
				throw new Error( Server.Utility.invalid_parameter_value_message(
					'Express.Authentication.authentication_engine',
					WebServerSettings.Express.Authentication.authentication_engine,
					`Must be either 'Passport_Local' or 'Passport_Auth0'.` ) );
			}
			Server.Log.trace( `WebServer.Express.Authentication is initialized.` );
		}


		//=====================================================================
		//=====================================================================
		//
		//		Client Support
		//
		//=====================================================================
		//=====================================================================


		if ( WebServerSettings.Express.ClientSupport
			&& WebServerSettings.Express.ClientSupport.enabled )
		{

			//---------------------------------------------------------------------
			// Serve public files.
			if ( WebServerSettings.Express.ClientSupport.public_files )
			{
				let path = Server.ResolveApplicationPath( WebServerSettings.Express.ClientSupport.public_files );
				LIB_FS.mkdirSync( path, { recursive: true } );
				WebServer.Express.App.use( WebServer.Express.ServerPath(), LIB_EXPRESS.static( path ) );
				Server.Log.trace( `WebServer.Express.ClientSupport using public folder [ ${path} ].` );
			}

			//---------------------------------------------------------------------
			// Serve views.
			if ( WebServerSettings.Express.ClientSupport.Views
				&& WebServerSettings.Express.ClientSupport.Views.view_engine )
			{
				let engine = WebServerSettings.Express.ClientSupport.Views.view_engine;
				let path = Server.ResolveApplicationPath( WebServerSettings.Express.ClientSupport.Views.view_files );
				LIB_FS.mkdirSync( path, { recursive: true } );
				WebServer.Express.App.set( 'view engine', engine );
				WebServer.Express.App.set( 'views', path );
				Server.Log.trace( `WebServer.Express.ClientSupport using '${engine}' views from folder[ ${path}].` );
			}

			//---------------------------------------------------------------------
			// Generate client file.
			if ( WebServerSettings.Express.ClientSupport.client_api_file )
			{
				// Generate the api client for javascript.
				let code = SRC_EXPRESS_API_CLIENT.Generate( Server, WebServer, WebServerSettings );
				let filename = Server.ResolveApplicationPath( WebServerSettings.Express.ClientSupport.client_api_file );
				LIB_FS.writeFileSync( filename, code );
				Server.Log.trace( `WebServer.Express.ClientSupport generated client file[ ${filename}].` );
			}

			//---------------------------------------------------------------------
			// Install root route.
			{
				let server_path = WebServer.Express.ServerPath();
				let home_view = WebServerSettings.Express.ClientSupport.Views.home_view;

				//---------------------------------------------------------------------
				// Default root route.
				WebServer.Express.App.get( server_path,
					WebServer.Express.AuthenticationGate( false ),
					WebServer.Express.InvocationGate(
						null, null,
						async function ( request, response, next )
						{
							response.render( home_view, { Server: Server, User: request.user } );
							return "OK";
						}
					),
				);
				Server.Log.trace( `WebServer.Express.ClientSupport mounted route '${server_path}' to view[ ${home_view}].` );

			}

			Server.Log.trace( `WebServer.Express.ClientSupport is initialized.` );
		}


		//=====================================================================
		//=====================================================================
		//
		//		Explorer
		//
		//=====================================================================
		//=====================================================================


		if ( WebServerSettings.Express.Explorer
			&& WebServerSettings.Express.Explorer.enabled )
		{


			//---------------------------------------------------------------------
			// Mount the explorer path.
			if ( WebServerSettings.Express.Explorer.explorer_path )
			{
				let route = `${WebServer.Express.ServicesPath()}${WebServerSettings.Express.Explorer.explorer_path}`;
				let explorer_view = WebServerSettings.Express.Explorer.explorer_view;

				WebServer.Express.App.get( route,
					WebServer.Express.AuthenticationGate( WebServerSettings.Express.Explorer.requires_login ),
					WebServer.Express.InvocationGate(
						null, null,
						async function ( request, response, next )
						{
							response.render( explorer_view, { Server: Server, User: request.user } );
							return "OK";
						}
					),
				);

				Server.Log.trace( `WebServer.Express.Explorer mounted route[ ${route}] to view [${explorer_view}].` );
			}

			Server.Log.trace( `WebServer.Express.Explorer is initialized.` );
		}


		//=====================================================================
		//=====================================================================
		//
		//		Application Services
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		SRC_EXPRESS_ROUTES.Use( Server, WebServer, WebServerSettings );


		//=====================================================================
		//=====================================================================
		//
		//		Report Routes
		//
		//=====================================================================
		//=====================================================================


		if ( WebServerSettings.Express.report_routes )
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
