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
const SRC_APPLICATION_SERVICES = require( './Express/ServiceRoutes.js' );
const SRC_GENERATE_CLIENT_EXPRESS = require( './Express/ExpressApiClient.js' );
// const SRC_GENERATE_CLIENT_SWAGGER = require( './Express/SwaggerDocument.js' );


//---------------------------------------------------------------------
exports.Create =
	function Create( Server, WebServer, WebServerSettings )
	{
		let Express = {
			App: LIB_EXPRESS(),
			Session: null,
		};


		//---------------------------------------------------------------------
		Express.ServerAddress =
			function ServerAddress()
			{
				let url = WebServerSettings.HttpServer.protocol
					+ '://' + WebServerSettings.HttpServer.address
					+ ':' + WebServerSettings.HttpServer.port;
				return url;
			};


		//---------------------------------------------------------------------
		Express.ServerPath =
			function ServerPath()
			{
				let url = WebServerSettings.Express.server_path;
				if ( !url.startsWith( '/' ) ) { url = '/' + url; }
				if ( !url.endsWith( '/' ) ) { url += '/'; }
				return url;
			};


		//---------------------------------------------------------------------
		Express.ServicesPath =
			function ServicesPath()
			{
				let url = Express.ServerPath();
				url += WebServerSettings.Express.services_path;
				if ( !url.endsWith( '/' ) ) { url += '/'; }
				return url;
			};


		//---------------------------------------------------------------------
		// AuthenticationGate returns an Express middleware.
		Express.AuthenticationGate =
			function AuthenticationGate( RequiresAuthentication )
			{
				/*
					- If the user is logged in, then execution flow continues to the next middleware.
					- If the user is not logged in and a login is required, then the user is redirected to the login page.
					- If the user is not logged in and no login is required, then the user is set to Anonymous and execution flow continues.
					- request is guaranteed to have an attached user account for subsequent middlewares.
				*/
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


		//---------------------------------------------------------------------
		// AuthorizationGate returns an Express middleware.
		Express.AuthorizationGate =
			function AuthorizationGate( AllowedRoles )
			{
				/*
					- if AllowedRoles is empty, then execution flow continues to the next middleware.
					- if user_role is listed in AllowedRoles, then execution flow continues to the next middleware.
					- if user_role is not listed in AllowedRoles, a 403 (Forbidden) code is returned.
				*/
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
								response.status( 403 ).send( { error: `User is not allowed to perform this function.` } );
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


		//---------------------------------------------------------------------
		// InvocationGate returns an Express middleware.
		Express.InvocationGate =
			function InvocationGate( Invocation )
			{
				/*
					- Reports invocation status.
					- Reports invocation duration.
					- Reports error information.
				*/
				let middleware =
					async function ( request, response, next )
					{
						let t0 = Date.now();
						let invocation_result = null;
						let invocation_error = null;
						try
						{
							invocation_result = await Invocation( request, response, next );
						}
						catch ( error ) 
						{
							response.status( 500 ).send( { error: error.message } );
							invocation_error = error;
						}
						finally
						{
							// Status
							let status_text = 'ok';
							if ( invocation_error ) { status_text = 'err'; }

							// Duration
							let duration_text = ( Date.now() - t0 ).toString();

							// User
							let user_text = request.user.user_id;

							// Verb
							let verb_text = request.method;

							// Origin
							let origin_text = request.url;
							{
								let ich = origin_text.indexOf( '?' );
								if ( ich >= 0 ) { origin_text = origin_text.slice( 0, ich ); }
							}
							{
								let values = {};
								if ( request.query && Object.keys( request.query ).length ) { values = request.query; }
								else if ( request.body && Object.keys( request.body ).length ) { values = request.body; }
								else if ( request.params && Object.keys( request.params ).length ) { values = request.params; }
								origin_text += ' ' + JSON.stringify( values );
							}

							// Log
							Server.Log.info(
								`${status_text.padEnd( 4 )}`
								+ ` | ${duration_text.padStart( 8 )}ms`
								+ ` | ${user_text.padEnd( 20 )}`
								+ ` | ${verb_text.padEnd( 7 )}`
								+ ` | ${origin_text}`
							);
							if ( typeof invocation_result === 'undefined' )
							{
								// Server.Log.debug( `    ===> no return value.` );
								// - Do not log anything as this might be a page or redirect.
							}
							else
							{
								Server.Log.debug( `    ===> ${JSON.stringify( invocation_result )}` );
							}
							if ( invocation_error )
							{
								Server.Log.error( `    *** Error *** ${invocation_error.message}` );
							}

						}

					};
				return middleware;
			};


		//---------------------------------------------------------------------
		return Express;
	};


//---------------------------------------------------------------------
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
				let code = SRC_GENERATE_CLIENT_EXPRESS.Generate( Server, WebServer, WebServerSettings );
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
		SRC_APPLICATION_SERVICES.Use( Server, WebServer, WebServerSettings );


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
