'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - SocketIO Transport
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const LIB_SOCKET_IO = require( 'socket.io' );


//---------------------------------------------------------------------
const SRC_APPLICATION_SERVICES = require( './SocketIO/ApplicationServices.js' );
const SRC_GENERATE_CLIENT = require( './SocketIO/GenerateClient.js' );


//---------------------------------------------------------------------
exports.Create =
	function Create( Server, WebServer, WebServerSettings )
	{
		return LIB_SOCKET_IO()( WebServer.HttpServer );
	};


//---------------------------------------------------------------------
exports.Initialize =
	function Initialize( Server, WebServer, SocketTransport, WebServerSettings )
	{

		//---------------------------------------------------------------------
		SocketTransport.on( 'connection',
			( Socket ) =>
			{
				Server.Log.trace( `New socket connection received.` );

				let this_session = {
					socket_id: Socket.id,
					User: null,
				};


				//---------------------------------------------------------------------
				Socket.on( 'disconnecting',
					async function ( Reason )
					{
						Server.Log.trace( `Socket is disconnecting because [${Reason}].` );
						return;
					} );


				//---------------------------------------------------------------------
				Socket.on( 'disconnect',
					async function ( Reason )
					{
						Server.Log.trace( `Socket has disconnected because [${Reason}].` );
						return;
					} );


				//---------------------------------------------------------------------
				Socket.on( 'connect',
					async function ( Reason )
					{
						Server.Log.trace( `Socket connected.` );
						return;
					} );


				//---------------------------------------------------------------------
				Socket.on( 'connect_error',
					async function ( Reason )
					{
						Server.Log.error( `Socket connection error [${Reason}]` );
						return;
					} );


				//---------------------------------------------------------------------
				Socket.on( 'Authorize',
					async function ( Message )
					{
						Server.Log.info( `Socket call [Authorize] (by: ${Message.User.user_id})` );
						let user = await Server.SystemUsers.StorageFindOne( Message.User, Message.User );
						if ( user )
						{
							if ( Message.User.user_id === user.user_id ) // Match the user_id fields.
							{
								// Socket.User = user;
								this_session.User = user;
								if ( Message.callback_name ) { Socket.emit( Message.callback_name, 'OK' ); }
								Server.Log.debug( `Socket authorized user (${user.user_id})` );
								return;
							}
						}
						if ( Message.callback_name ) { Socket.emit( Message.callback_name, 'Fail' ); }
						return;
					} );


				// //---------------------------------------------------------------------
				// Socket.onAny(
				// 	async function ( Event, ...args )
				// 	{
				// 		Server.Log.trace( `Socket received event: ${Event}\n${JSON.stringify( args, null, '    ' )}` );
				// 		return;
				// 	} );


				//---------------------------------------------------------------------
				SRC_APPLICATION_SERVICES.Use( Server, WebServer, Socket, WebServerSettings );


				//---------------------------------------------------------------------
				if ( WebServerSettings.SocketTransport.ClientSupport.socket_api_client )
				{
					// Generate the api client for javascript.
					let code = SRC_GENERATE_CLIENT.GenerateClient( Server, WebServerSettings );
					let filename = Server.ResolveApplicationPath( WebServerSettings.SocketTransport.ClientSupport.socket_api_client );
					LIB_FS.writeFileSync( filename, code );
					Server.Log.trace( `WebServer - generated Socket Api Client: [${filename}]` );
				}


				//---------------------------------------------------------------------
				return;
			} );
	};

