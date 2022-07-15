'use strict';


//=====================================================================
//=====================================================================
//
//		Web Server
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const SRC_MODULE_BASE = require( '../base/ModuleBase.js' );

// const LIB_FS = require( 'fs' );
// const LIB_PATH = require( 'path' );
const LIB_HTTP = require( 'http' );
const LIB_HTTPS = require( 'https' );
// const LIB_EXPRESS = require( 'express' );
// const LIB_EXPRESS_SESSION = require( 'express-session' );
// const LIB_CORS = require( 'cors' );
// // const LIB_HELMET = require( 'helmet' );
// const LIB_EXPRESS_FILEUPLOAD = require( 'express-fileupload' );
// const LIB_SOCKET_IO = require( 'socket.io' );


//---------------------------------------------------------------------
exports.Construct =
	function Construct_WebServer( Server )
	{
		let _module = SRC_MODULE_BASE.NewModule();

		// Initialized during StartWebServer()
		_module.HttpServer = null;
		_module.Express = null;
		_module.SocketIO = null;


		const SRC_WEBSERVER_CONFIGURATION = require( './WebServer/Configuration.js' );
		const SRC_WEBSERVER_EXPRESS = require( './WebServer/Express.js' );
		const SRC_WEBSERVER_SOCKETIO = require( './WebServer/SocketIO.js' );


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Module Configuration
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		_module.GetDefaults =
			function GetDefaults() 
			{
				let defaults = SRC_WEBSERVER_CONFIGURATION.GetDefaults();
				return defaults;
			};


		//---------------------------------------------------------------------
		_module.Initialize =
			function Initialize()
			{
				// Analyze the application's Settings.
				SRC_WEBSERVER_CONFIGURATION.AnalyzeSettings( Server );
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Module Functions
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		// //---------------------------------------------------------------------
		// _module.ExpressServerPath =
		// 	function ExpressServerPath( WebServerSettings )
		// 	{
		// 		let url = WebServerSettings.Express.ClientSupport.server_url;
		// 		if ( !url.startsWith( '/' ) ) { url = '/' + url; }
		// 		if ( !url.endsWith( '/' ) ) { url = url + '/'; }
		// 		return url;
		// 	};


		// //---------------------------------------------------------------------
		// _module.ExpressServicesPath =
		// 	function ExpressServicesPath( WebServerSettings )
		// 	{
		// 		let url = WebServerSettings.Express.ClientSupport.server_url;
		// 		if ( !url.startsWith( '/' ) ) { url = '/' + url; }
		// 		if ( !url.endsWith( '/' ) ) { url = url + '/'; }
		// 		url += WebServerSettings.Express.ClientSupport.services_url;
		// 		if ( !url.endsWith( '/' ) ) { url = url + '/'; }
		// 		return url;
		// 	};


		// //---------------------------------------------------------------------
		// _module.AuthenticationGate =
		// 	function AuthenticationGate( WebServerSettings, RequiresAuthentication )
		// 	{
		// 		let middleware = null;
		// 		if ( WebServerSettings.Express.Authentication
		// 			&& WebServerSettings.Express.Authentication.enabled
		// 			&& RequiresAuthentication )
		// 		{
		// 			middleware =
		// 				function ( request, response, next )
		// 				{
		// 					if ( request.user ) { return next(); }
		// 					if ( request.session )
		// 					{
		// 						// request.session.returnTo = request.originalUrl;
		// 						request.session.redirect_url_after_login = request.originalUrl;
		// 					}
		// 					let url = _module.ExpressServerPath( WebServerSettings );
		// 					url += WebServerSettings.Express.Authentication.Pages.login_url;
		// 					response.redirect( url );
		// 				};
		// 		}
		// 		else
		// 		{
		// 			middleware =
		// 				function ( request, response, next )
		// 				{
		// 					if ( request.user ) { return next(); }
		// 					request.user = JSON.parse( JSON.stringify( WebServerSettings.Express.Authentication.AnonymousUser ) );
		// 					return next();
		// 				};
		// 		}
		// 		return middleware;
		// 	};


		// //---------------------------------------------------------------------
		// _module.RequiresLogin =
		// 	function requires_login( request, response, next )
		// 	{
		// 		if ( request.user ) { return next(); }
		// 		request.session.returnTo = request.originalUrl;
		// 		response.redirect( `/${Server.Config.Settings.WebServer.Urls.login_url}` );
		// 	};


		// //---------------------------------------------------------------------
		// _module.NotRequiresLogin =
		// 	function not_requires_login( request, response, next )
		// 	{
		// 		if ( request.user ) { return next(); }
		// 		request.user = {
		// 			user_id: 'anonymous@internal',
		// 			user_role: 'public',
		// 			user_name: 'Anonymous',
		// 			image_url: '',
		// 		};
		// 		return next();
		// 	};


		//---------------------------------------------------------------------
		_module.ReportError =
			async function ReportError( error, response )
			{
				let error_text = '';
				if ( error && error.message )
				{
					error_text = error.message;
				}
				else
				{
					error_text = error.toString();
				}
				Server.Log.error( error_text );
				response.render( 'error', error_text );
				return;
			};


		//---------------------------------------------------------------------
		_module.ReportApiError =
			async function ReportApiError( api_result, response )
			{
				let error_text = 'Error in [' + api_result.origin + ']: ' + api_result.error;
				Server.Log.error( error_text );
				// response.render( 'error', { error: error_text } );
				response.send( api_result );
				return;
			};


		//---------------------------------------------------------------------
		_module.RequestProcessor =
			async function RequestProcessor( request, response, next, processor, do_render_error = false )
			{
				let error_text = null;
				let t0 = Date.now();
				try
				{
					await processor( request, response, next );
				}
				catch ( error ) 
				{
					error_text = error.message;
					if ( do_render_error )
					{
						response.render( 'error', { Server: Server, User: request.user, Error: error } );
					}
					else
					{
						// response.send( { error: error_text } );
						response.send( { error: { error: error_text } } );
					}
				}
				finally
				{
					let log_text = '';
					if ( error_text ) { log_text = ' err'; }
					else { log_text = ' ok '; }
					let t1 = Date.now();
					log_text += ` | ` + `${t1 - t0}`.padStart( 8 ) + ` ms`;
					log_text += ' | ' + request.method.padEnd( 7 ) + request.url;
					if ( request.user )
					{
						log_text += ` (by: ${request.user.user_id})`;
					}
					Server.Log.info( log_text );;
					if ( error_text )
					{
						log_text += `*** Error! ***`;
						log_text += `\n${error_text}`;
						log_text += `\n${JSON.stringify( request.query )}`;
						Server.Log.error( log_text );
					}
				}
			};


		//=====================================================================
		//=====================================================================
		//
		//		StartWebServer
		//			- Callbacks: an optional object containing callback functions.
		//				- PreInitialize( Server, Router ) : Called after Router is created but before any initialization.
		//				- PreStartup( Server, Router ) : Called after all Router initialization but before starup.
		//
		//=====================================================================
		//=====================================================================


		_module.StartWebServer =
			async function StartWebServer( Callbacks = null )
			{
				if ( _module.HttpServer ) { throw new Error( `HttpServer is already running. Call the StopWebServer() function.` ); }
				if ( _module.Express ) { throw new Error( `Express is already running. Call the StopWebServer() function.` ); }
				if ( _module.SocketIO ) { throw new Error( `SocketIO is already running. Call the StopWebServer() function.` ); }

				const WebServerSettings = Server.Config.Settings.WebServer;
				_module.Express = null;
				_module.SocketIO = null;

				//---------------------------------------------------------------------
				// Create the Express Transport.
				if ( WebServerSettings.Express
					&& WebServerSettings.Express.enabled )
				{
					_module.Express = SRC_WEBSERVER_EXPRESS.Create( Server, _module, WebServerSettings );
				}

				//---------------------------------------------------------------------
				// Create the HTTP Server.
				if ( WebServerSettings.HttpServer.protocol === 'http' )
				{
					if ( _module.Express )
					{
						_module.HttpServer = LIB_HTTP.createServer( _module.Express.App );
					}
					else
					{
						_module.HttpServer = LIB_HTTP.createServer();
					}
				}
				else if ( WebServerSettings.HttpServer.protocol === 'https' )
				{
					if ( _module.Express )
					{
						_module.HttpServer = LIB_HTTPS.createServer( _module.Express.App );
					}
					else
					{
						_module.HttpServer = LIB_HTTPS.createServer();
					}
				}
				else
				{
					throw new Error( Server.Utility.invalid_parameter_value_message(
						'HttpServer.protocol',
						WebServerSettings.HttpServer.protocol,
						`Must be either 'http' or 'https'.` ) );
				}
				Server.Log.trace( `WebServer.HttpServer is initialized.` );

				//---------------------------------------------------------------------
				// Create and Initialize the SocketIO Transport.
				if ( WebServerSettings.SocketIO
					&& WebServerSettings.SocketIO.enabled )
				{
					_module.SocketIO = SRC_WEBSERVER_SOCKETIO.Create( Server, _module, WebServerSettings );
				}

				//---------------------------------------------------------------------
				// PreInitialize Callback
				if ( Callbacks && Callbacks.PreInitialize ) { await Callbacks.PreInitialize( Server, _module, WebServerSettings ); }

				//---------------------------------------------------------------------
				// Initialize the Express Transport.
				if ( WebServerSettings.Express
					&& WebServerSettings.Express.enabled
					&& _module.Express )
				{
					SRC_WEBSERVER_EXPRESS.Initialize( Server, _module, WebServerSettings );
					Server.Log.trace( `WebServer.Express is initialized.` );
				}

				//---------------------------------------------------------------------
				// Initialize the SocketIO Transport.
				if ( WebServerSettings.SocketIO
					&& WebServerSettings.SocketIO.enabled
					&& _module.SocketIO )
				{
					SRC_WEBSERVER_SOCKETIO.Initialize( Server, _module, WebServerSettings );
					Server.Log.trace( `WebServer.SocketIO is initialized.` );
				}

				//---------------------------------------------------------------------
				// PreStartup Callback
				if ( Callbacks && Callbacks.PreStartup ) { await Callbacks.PreStartup( Server, _module, WebServerSettings ); }

				//---------------------------------------------------------------------
				// Begin accepting connections.
				await new Promise(
					function ( resolve, reject )
					{
						_module.HttpServer.listen(
							WebServerSettings.HttpServer.port,
							WebServerSettings.HttpServer.address,
							function ( err ) 
							{
								if ( err ) { reject( err ); }
								else { resolve( true ); }
							} );
					} );
				let address = _module.HttpServer.address();
				Server.Log.trace( `WebServer.HttpServer is listening at [${address.address}:${address.port}].` );

				// // Start the Socket Server.
				// if ( _module.SocketIO )
				// {
				// 	// _module.SocketIO.IO.Listen();
				// 	_module.SocketIO.IO.attach( _module.HttpServer );
				// 	Server.Log.trace( `SocketIO has attached to the WebServer.` );
				// }

				// Return
				return { ok: true };
			};


		//=====================================================================
		//=====================================================================
		//
		//		StopWebServer
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		_module.StopWebServer =
			async function StopWebServer()
			{
				if ( _module.SocketIO )
				{
					if ( _module.SocketIO.IO )
					{
						_module.SocketIO.IO.close();
					}
					_module.SocketIO = null;
					Server.Log.trace( `WebServer.SocketIO is stopped.` );
				}
				if ( _module.Express )
				{
					_module.Express = null;
					Server.Log.trace( `WebServer.Express is stopped.` );
				}
				if ( _module.HttpServer ) 
				{
					if ( _module.HttpServer.listening ) 
					{
						await new Promise(
							function ( resolve, reject )
							{
								_module.HttpServer.close(
									function ( err ) 
									{
										if ( err ) { reject( err ); }
										else { resolve( true ); }
									} );
							} );
					}
					_module.HttpServer = null;
					Server.Log.trace( `WebServer.HttpSerer is stopped.` );
				}
				return { ok: true };
			};


		//---------------------------------------------------------------------
		return _module;
	};


