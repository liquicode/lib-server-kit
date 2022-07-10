'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Express Transport
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
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
		return LIB_EXPRESS();
	};


//---------------------------------------------------------------------
exports.Initialize =
	function Initialize( Server, WebServer, ExpressTransport, WebServerSettings )
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
			ExpressTransport.use( LIB_EXPRESS.json( WebServerSettings.Express.DataHandling.JsonBodyParser.Settings ) );
			Server.Log.trace( `WebServer.Express.DataHandling.JsonBodyParser initialized` );
		}


		//---------------------------------------------------------------------
		if ( WebServerSettings.Express.DataHandling.UrlEncodedParser
			&& WebServerSettings.Express.DataHandling.UrlEncodedParser.enabled )
		{
			ExpressTransport.use( LIB_EXPRESS.urlencoded( WebServerSettings.Express.DataHandling.UrlEncodedParser.Settings ) );
			Server.Log.trace( `WebServer.Express.DataHandling.UrlEncodedParser initialized` );
		}


		//---------------------------------------------------------------------
		if ( WebServerSettings.Express.DataHandling.FileUpload
			&& WebServerSettings.Express.DataHandling.FileUpload.enabled )
		{
			ExpressTransport.use( LIB_EXPRESS_FILEUPLOAD( WebServerSettings.Express.DataHandling.FileUpload.Settings ) );
			Server.Log.trace( `WebServer.Express.DataHandling.FileUpload initialized` );
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
			// ExpressTransport.use( LIB_CORS( { origin: '*' } ) );
			ExpressTransport.use( LIB_CORS( WebServerSettings.Express.Security.Cors.Settings ) );
			Server.Log.trace( `WebServer.Express.Security.Cors initialized` );
		}

		// if ( WebServerSettings.Helmet && WebServerSettings.Helmet.enabled )
		// {
		// 	ExpressTransport.use( LIB_HELMET( WebServerSettings.Helmet ) );
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
			ExpressTransport.use( LIB_EXPRESS_SESSION( WebServerSettings.Express.Session.Settings ) );

			if ( WebServerSettings.Express.Session.set_express_trust_proxy )
			{
				ExpressTransport.set( 'trust proxy', 1 );
			}

			Server.Log.trace( `WebServer.Express.Session initialized` );
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
				SRC_AUTHENTICATION_PASSPORT_LOCAL.Use( Server, WebServer, ExpressTransport, WebServerSettings );
				Server.Log.trace( `WebServer.Express.Authentication using [Passport_Local]` );
			}
			else if ( WebServerSettings.Express.Authentication.authentication_engine === 'Passport_Auth0' )
			{
				SRC_AUTHENTICATION_PASSPORT_AUTH0.Use( Server, WebServer, ExpressTransport, WebServerSettings );
				Server.Log.trace( `WebServer.Express.Authentication using [Passport_Auth0]` );
			}
			else
			{
				throw new Error( Server.Utility.invalid_parameter_value_message(
					'Express.Authentication.authentication_engine',
					WebServerSettings.Express.Authentication.authentication_engine,
					`Must be either 'Passport_Local' or 'Passport_Auth0'.` ) );
			}
			Server.Log.trace( `WebServer.Express.Authentication initialized` );
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
				ExpressTransport.use( WebServerSettings.Express.ClientSupport.root_url, LIB_EXPRESS.static( path ) );
				Server.Log.trace( `WebServer.Express.ClientSupport using public folder [${path}]` );
			}

			//---------------------------------------------------------------------
			// Generate client file.
			if ( WebServerSettings.Express.ClientSupport.client_api_file )
			{
				// Generate the api client for javascript.
				let code = SRC_GENERATE_CLIENT.GenerateClient( Server, WebServerSettings );
				let filename = Server.ResolveApplicationPath( WebServerSettings.Express.ClientSupport.client_api_file );
				LIB_FS.writeFileSync( filename, code );
				Server.Log.trace( `WebServer.Express.ClientSupport generated client file [${filename}]` );
			}

			//---------------------------------------------------------------------
			// Serve views.
			if ( WebServerSettings.Express.ClientSupport.Views
				&& WebServerSettings.Express.ClientSupport.Views.view_engine )
			{
				let engine = WebServerSettings.Express.ClientSupport.Views.view_engine;
				let path = Server.ResolveApplicationPath( WebServerSettings.Express.ClientSupport.Views.view_files );
				ExpressTransport.set( 'view engine', engine );
				ExpressTransport.set( 'views', path );
				Server.Log.trace( `WebServer.Express.ClientSupport using '${engine}' views from folder [${path}]` );
			}

			//---------------------------------------------------------------------
			// Install root route.
			{
				let url_prefix = WebServerSettings.Express.ClientSupport.server_url;
				if ( !url_prefix.startsWith( '/' ) ) { url_prefix = '/' + url_prefix; }
				if ( !url_prefix.endsWith( '/' ) ) { url_prefix = url_prefix + '/'; }

				//---------------------------------------------------------------------
				// Default root route.
				ExpressTransport.get( url_prefix,
					WebServer.AuthenticationGate( WebServerSettings, false ),
					async function ( request, response, next ) 
					{
						await WebServer.RequestProcessor( request, response, next,
							async function ( request, response, next )
							{
								// log_request( request );
								response.render(
									WebServerSettings.Express.ClientSupport.Views.home_page,
									{ Server: Server, User: request.user } );
								return;
							}
							, true );
					} );
				Server.Log.trace( `WebServer.Express.ClientSupport added root route '${url_prefix}' to view [${WebServerSettings.Express.ClientSupport.Views.home_page}]` );

				// let Urls = {
				// 	root_url: `/`,
				// 	home_url: `/${WebServerSettings.Authentication.Urls.home_url}`,
				// 	user_url: `/${WebServerSettings.Authentication.Urls.user_url}`,
				// };

				// //---------------------------------------------------------------------
				// // Default home route.
				// ExpressTransport.get( WebServerSettings.Authentication.Urls.home_url,
				// 	WebServer.AuthenticationGate( WebServerSettings, false ),
				// 	async function ( request, response, next ) 
				// 	{
				// 		await Server.WebServer.RequestProcessor( request, response, next,
				// 			async function ( request, response, next )
				// 			{
				// 				// log_request( request );
				// 				response.render(
				// 					WebServerSettings.Authentication.Urls.home_page,
				// 					{ Server: Server, User: request.user } );
				// 				return;
				// 			}
				// 			, true );
				// 	} );

				// //---------------------------------------------------------------------
				// // Default user route.
				// ExpressTransport.get( Urls.user_url,
				// 	WebServer.AuthenticationGate( WebServerSettings, true ),
				// 	async function ( request, response, next ) 
				// 	{
				// 		await Server.WebServer.RequestProcessor( request, response, next,
				// 			async function ( request, response, next )
				// 			{
				// 				response.render(
				// 					WebServerSettings.Authentication.Urls.user_url,
				// 					{ Server: Server, User: request.user } );
				// 			}
				// 			, true );
				// 		return;
				// 	} );

			}

			Server.Log.trace( `WebServer.Express.ClientSupport initialized` );
		}


		//=====================================================================
		//=====================================================================
		//
		//		Application Services
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		SRC_APPLICATION_SERVICES.Use( Server, WebServer, ExpressTransport, WebServerSettings );


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
			let stack = ExpressTransport._router.stack;
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

