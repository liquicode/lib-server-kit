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

const LIB_HTTP = require( 'http' );
const LIB_HTTPS = require( 'https' );


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


