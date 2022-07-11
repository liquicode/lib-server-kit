'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - SocketIO Transport
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const LIB_FS = require( 'fs' );
const LIB_SOCKET_IO = require( 'socket.io' );


//---------------------------------------------------------------------
const SRC_APPLICATION_SERVICES = require( './SocketIO/ApplicationServices.js' );
const SRC_GENERATE_CLIENT = require( './SocketIO/GenerateClient.js' );


//---------------------------------------------------------------------
exports.Create =
	function Create( Server, WebServer, WebServerSettings )
	{
		let SocketIO = {
			IO: LIB_SOCKET_IO( WebServer.HttpServer ), 
		}
		return SocketIO;
	};


//---------------------------------------------------------------------
exports.Initialize =
	function Initialize( Server, WebServer, WebServerSettings )
	{

		//---------------------------------------------------------------------
		WebServer.SocketIO.IO.on( 'connection',
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
				// SRC_APPLICATION_SERVICES.Use( Server, WebServer, Socket, WebServerSettings );


				//---------------------------------------------------------------------
				function add_service_endpoints( Service )
				{
					// Get the user
					let user = {
						user_id: 'admin',
						user_role: 'admin',
					};

					// Add endpoints for this service.
					let endpoint_count = 0;
					let endpoint_names = Object.keys( Service.ServiceDefinition.Endpoints );
					for ( let endpoint_index = 0; endpoint_index < endpoint_names.length; endpoint_index++ )
					{
						let endpoint_name = endpoint_names[ endpoint_index ];
						let full_endpoint_name = `${Service.ServiceDefinition.name}.${endpoint_name}`;
						let endpoint = Service.ServiceDefinition.Endpoints[ endpoint_name ];

						if ( endpoint.verbs.includes( 'call' ) )
						{
							// Invoke the endpoint function.
							Socket.on( full_endpoint_name,
								async function ( Message ) 
								{
									let api_result = { ok: true };
									Server.Log.info( `Socket call [${full_endpoint_name}] (by: ${this_session.User.user_id})` );
									try
									{
										api_result.result = await endpoint.invoke( this_session.User, ...Message.Payload );
										if ( Message.callback_name ) { Socket.emit( Message.callback_name, api_result ); }
									}
									catch ( error )
									{
										console.error( error );
										api_result.error = error.message;
										if ( Message.callback_name ) { Socket.emit( Message.callback_name, api_result ); }
									}
								} );
							endpoint_count++;
						}
					}

					return endpoint_count;
				};


				//---------------------------------------------------------------------
				// Add service endpoints.
				let service_names = Object.keys( Server.Services );
				for ( let index = 0; index < service_names.length; index++ )
				{
					let service_name = service_names[ index ];
					let service = Server[ service_name ];
					let count = add_service_endpoints( service );
					Server.Log.trace( `Added ${count} socket functions for [${service_name}].` );
				}


				//---------------------------------------------------------------------
				return;
			} );


		//---------------------------------------------------------------------
		if ( WebServerSettings.SocketIO.ClientSupport.socket_api_client )
		{
			// Generate the api client for javascript.
			let code = SRC_GENERATE_CLIENT.GenerateClient( Server, WebServerSettings );
			let filename = Server.ResolveApplicationPath( WebServerSettings.SocketIO.ClientSupport.socket_api_client );
			LIB_FS.writeFileSync( filename, code );
			Server.Log.trace( `WebServerSettings.SocketIO.ClientSupport generated client file: [${filename}]` );
		}

		Server.Log.trace( `WebServerSettings.SocketIO.ClientSupport is initialized.` );
		return;
	};

