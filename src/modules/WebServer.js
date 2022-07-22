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
		let WebServer = SRC_MODULE_BASE.NewModule();

		// Initialized during StartWebServer()
		WebServer.HttpServer = null;
		WebServer.Express = null;
		WebServer.SocketIO = null;


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
		WebServer.GetDefaults =
			function GetDefaults() 
			{
				let defaults = SRC_WEBSERVER_CONFIGURATION.GetDefaults();
				return defaults;
			};


		//---------------------------------------------------------------------
		WebServer.Initialize =
			function Initialize()
			{
				// Analyze the application's Settings.
				SRC_WEBSERVER_CONFIGURATION.AnalyzeSettings( Server );
				return;
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
		WebServer.ServerAddress =
			function ServerAddress()
			{
				let url = WebServerSettings.HttpServer.protocol
					+ '://' + WebServerSettings.HttpServer.address
					+ ':' + WebServerSettings.HttpServer.port;
				return url;
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


		WebServer.StartWebServer =
			async function StartWebServer( Callbacks = null )
			{
				if ( WebServer.HttpServer ) { throw new Error( `HttpServer is already running. Call the StopWebServer() function.` ); }
				if ( WebServer.Express ) { throw new Error( `Express is already running. Call the StopWebServer() function.` ); }
				if ( WebServer.SocketIO ) { throw new Error( `SocketIO is already running. Call the StopWebServer() function.` ); }

				const WebServerSettings = Server.Config.Settings.WebServer;
				WebServer.Express = null;
				WebServer.SocketIO = null;

				//---------------------------------------------------------------------
				// Create the Express Transport.
				if ( WebServerSettings.Express
					&& WebServerSettings.Express.enabled )
				{
					WebServer.Express = SRC_WEBSERVER_EXPRESS.Create( Server, WebServer, WebServerSettings );
				}

				//---------------------------------------------------------------------
				// Create the HTTP Server.
				if ( WebServerSettings.HttpServer.protocol === 'http' )
				{
					if ( WebServer.Express )
					{
						WebServer.HttpServer = LIB_HTTP.createServer( WebServer.Express.App );
					}
					else
					{
						WebServer.HttpServer = LIB_HTTP.createServer();
					}
				}
				else if ( WebServerSettings.HttpServer.protocol === 'https' )
				{
					if ( WebServer.Express )
					{
						WebServer.HttpServer = LIB_HTTPS.createServer( WebServer.Express.App );
					}
					else
					{
						WebServer.HttpServer = LIB_HTTPS.createServer();
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
					WebServer.SocketIO = SRC_WEBSERVER_SOCKETIO.Create( Server, WebServer, WebServerSettings );
				}

				//---------------------------------------------------------------------
				// PreInitialize Callback
				if ( Callbacks && Callbacks.PreInitialize ) { await Callbacks.PreInitialize( Server, WebServer, WebServerSettings ); }

				//---------------------------------------------------------------------
				// Initialize the Express Transport.
				if ( WebServerSettings.Express
					&& WebServerSettings.Express.enabled
					&& WebServer.Express )
				{
					SRC_WEBSERVER_EXPRESS.Initialize( Server, WebServer, WebServerSettings );
					Server.Log.trace( `WebServer.Express is initialized.` );
				}

				//---------------------------------------------------------------------
				// Initialize the SocketIO Transport.
				if ( WebServerSettings.SocketIO
					&& WebServerSettings.SocketIO.enabled
					&& WebServer.SocketIO )
				{
					SRC_WEBSERVER_SOCKETIO.Initialize( Server, WebServer, WebServerSettings );
					Server.Log.trace( `WebServer.SocketIO is initialized.` );
				}

				//---------------------------------------------------------------------
				// PreStartup Callback
				if ( Callbacks && Callbacks.PreStartup ) { await Callbacks.PreStartup( Server, WebServer, WebServerSettings ); }

				//---------------------------------------------------------------------
				// Begin accepting connections.
				await new Promise(
					function ( resolve, reject )
					{
						WebServer.HttpServer.listen(
							WebServerSettings.HttpServer.port,
							WebServerSettings.HttpServer.address,
							function ( err ) 
							{
								if ( err ) { reject( err ); }
								else { resolve( true ); }
							} );
					} );
				Server.Log.trace( `WebServer.HttpServer is listening at [${WebServer.Express.ServerAddress()}]` );

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
		WebServer.StopWebServer =
			async function StopWebServer()
			{
				if ( WebServer.SocketIO )
				{
					if ( WebServer.SocketIO.IO )
					{
						WebServer.SocketIO.IO.close();
					}
					WebServer.SocketIO = null;
					Server.Log.trace( `WebServer.SocketIO is stopped.` );
				}
				if ( WebServer.Express )
				{
					WebServer.Express = null;
					Server.Log.trace( `WebServer.Express is stopped.` );
				}
				if ( WebServer.HttpServer ) 
				{
					if ( WebServer.HttpServer.listening ) 
					{
						await new Promise(
							function ( resolve, reject )
							{
								WebServer.HttpServer.close(
									function ( err ) 
									{
										if ( err ) { reject( err ); }
										else { resolve( true ); }
									} );
							} );
					}
					WebServer.HttpServer = null;
					Server.Log.trace( `WebServer.HttpSerer is stopped.` );
				}
				return { ok: true };
			};


		//---------------------------------------------------------------------
		return WebServer;
	};


