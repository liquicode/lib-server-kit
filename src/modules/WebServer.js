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
				let url = WebServer.Settings.HttpServer.protocol
					+ '://' + WebServer.Settings.HttpServer.address
					+ ':' + WebServer.Settings.HttpServer.port;
				return url;
			};


		//=====================================================================
		//=====================================================================
		//
		//		StartWebServer
		//			- Callbacks: an optional object containing callback functions.
		//				- PreInitialize( Server, WebServer ) : Called after WebServer is created but before any initialization.
		//				- PreStartup( Server, WebServer ) : Called after all WebServer initialization but before running.
		//
		//=====================================================================
		//=====================================================================


		WebServer.StartWebServer =
			async function StartWebServer( Callbacks = null )
			{
				if ( WebServer.HttpServer ) { throw new Error( `HttpServer is already running. Call the StopWebServer() function.` ); }
				if ( WebServer.Express ) { throw new Error( `Express is already running. Call the StopWebServer() function.` ); }
				if ( WebServer.SocketIO ) { throw new Error( `SocketIO is already running. Call the StopWebServer() function.` ); }

				// const WebServer.Settings = Server.Config.Settings.WebServer;
				WebServer.Express = null;
				WebServer.SocketIO = null;

				//---------------------------------------------------------------------
				// Create the Express Transport.
				if ( WebServer.Settings.Express
					&& WebServer.Settings.Express.enabled )
				{
					WebServer.Express = SRC_WEBSERVER_EXPRESS.Create( Server, WebServer );
				}

				//---------------------------------------------------------------------
				// Create the HTTP Server.
				if ( WebServer.Settings.HttpServer.protocol === 'http' )
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
				else if ( WebServer.Settings.HttpServer.protocol === 'https' )
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
						WebServer.Settings.HttpServer.protocol,
						`Must be either 'http' or 'https'.` ) );
				}
				Server.Log.trace( `WebServer.HttpServer is initialized.` );

				//---------------------------------------------------------------------
				// Create and Initialize the SocketIO Transport.
				if ( WebServer.Settings.SocketIO
					&& WebServer.Settings.SocketIO.enabled )
				{
					WebServer.SocketIO = SRC_WEBSERVER_SOCKETIO.Create( Server, WebServer );
				}

				//---------------------------------------------------------------------
				// PreInitialize Callback
				if ( Callbacks && Callbacks.PreInitialize ) { await Callbacks.PreInitialize( Server, WebServer ); }

				//---------------------------------------------------------------------
				// Initialize the Express Transport.
				if ( WebServer.Settings.Express
					&& WebServer.Settings.Express.enabled
					&& WebServer.Express )
				{
					SRC_WEBSERVER_EXPRESS.Initialize( Server, WebServer );
					Server.Log.trace( `WebServer.Express is initialized.` );
				}

				//---------------------------------------------------------------------
				// Initialize the SocketIO Transport.
				if ( WebServer.Settings.SocketIO
					&& WebServer.Settings.SocketIO.enabled
					&& WebServer.SocketIO )
				{
					SRC_WEBSERVER_SOCKETIO.Initialize( Server, WebServer );
					Server.Log.trace( `WebServer.SocketIO is initialized.` );
				}

				//---------------------------------------------------------------------
				// PreStartup Callback
				if ( Callbacks && Callbacks.PreStartup ) { await Callbacks.PreStartup( Server, WebServer ); }

				//---------------------------------------------------------------------
				// Begin accepting connections.
				await new Promise(
					function ( resolve, reject )
					{
						WebServer.HttpServer.listen(
							WebServer.Settings.HttpServer.port,
							WebServer.Settings.HttpServer.address,
							function ( err ) 
							{
								if ( err ) { reject( err ); }
								else { resolve( true ); }
							} );
					} );
				Server.Log.trace( `WebServer.HttpServer is listening at [${WebServer.ServerAddress()}]` );

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
					Server.Log.trace( `WebServer.HttpServer is stopped.` );
				}
				return { ok: true };
			};


		//---------------------------------------------------------------------
		return WebServer;
	};


