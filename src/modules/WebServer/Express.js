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
const SRC_APPLICATION_SERVICES = require( './Express/ApplicationServices.js' );
const SRC_GENERATE_CLIENT = require( './Express/GenerateClient.js' );


//---------------------------------------------------------------------
exports.Create =
	function Create( Server, WebServer, WebServerSettings )
	{
		let Express = {
			App: LIB_EXPRESS(),
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
		Express.AuthenticationGate =
			function AuthenticationGate( RequiresAuthentication )
			{
				let middleware = null;
				if ( WebServerSettings.Express.Authentication
					&& WebServerSettings.Express.Authentication.enabled
					&& RequiresAuthentication )
				{
					middleware =
						function ( request, response, next )
						{
							if ( request.user ) { return next(); }
							if ( request.session )
							{
								// request.session.returnTo = request.originalUrl;
								request.session.redirect_url_after_login = request.originalUrl;
							}
							let url = _module.ExpressServerPath( WebServerSettings );
							url += WebServerSettings.Express.Authentication.Pages.login_url;
							response.redirect( url );
						};
				}
				else
				{
					middleware =
						function ( request, response, next )
						{
							if ( request.user ) { return next(); }
							request.user = JSON.parse( JSON.stringify( WebServerSettings.Express.Authentication.AnonymousUser ) );
							return next();
						};
				}
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
			WebServer.Express.App.use( LIB_EXPRESS_SESSION( WebServerSettings.Express.Session.Settings ) );

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
				Server.Log.trace( `WebServer.Express.Authentication is using [Passport_Local].` );
			}
			else if ( WebServerSettings.Express.Authentication.authentication_engine === 'Passport_Auth0' )
			{
				SRC_AUTHENTICATION_PASSPORT_AUTH0.Use( Server, WebServer, WebServer.Express, WebServerSettings );
				Server.Log.trace( `WebServer.Express.Authentication is using [Passport_Auth0].` );
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
				WebServer.Express.App.use( WebServerSettings.Express.ClientSupport.server_url, LIB_EXPRESS.static( path ) );
				Server.Log.trace( `WebServer.Express.ClientSupport using public folder [${path}].` );
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
				Server.Log.trace( `WebServer.Express.ClientSupport using '${engine}' views from folder [${path}].` );
			}

			//---------------------------------------------------------------------
			// Generate client file.
			if ( WebServerSettings.Express.ClientSupport.client_api_file )
			{
				// Generate the api client for javascript.
				let code = SRC_GENERATE_CLIENT.GenerateClient( Server, WebServerSettings );
				let filename = Server.ResolveApplicationPath( WebServerSettings.Express.ClientSupport.client_api_file );
				LIB_FS.writeFileSync( filename, code );
				Server.Log.trace( `WebServer.Express.ClientSupport generated client file [${filename}].` );
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
					async function ( request, response, next ) 
					{
						await WebServer.RequestProcessor( request, response, next,
							async function ( request, response, next )
							{
								// log_request( request );
								response.render( home_view, { Server: Server, User: request.user } );
								return;
							}
							, true );
					} );
				Server.Log.trace( `WebServer.Express.ClientSupport added root route '${server_path}' to view [${home_view}].` );

			}

			Server.Log.trace( `WebServer.Express.ClientSupport is initialized.` );
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

