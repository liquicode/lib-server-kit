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
// const LIB_SOCKET_IO_EXPRESS_SESSION = require( 'socket.io-express-session' );

//---------------------------------------------------------------------
// const SRC_APPLICATION_SERVICES = require( './SocketIO/ApplicationServices.js' );
const SRC_GENERATE_CLIENT = require( './SocketIO/SocketApiClient.js' );


//---------------------------------------------------------------------
exports.Create =
	function Create( Server, WebServer, WebServerSettings )
	{
		let SocketIO = {
			IO: LIB_SOCKET_IO( WebServer.HttpServer ),
		};
		return SocketIO;
	};


//---------------------------------------------------------------------
exports.Initialize =
	function Initialize( Server, WebServer, WebServerSettings )
	{

		//---------------------------------------------------------------------
		// Connect to the Express Session.
		WebServer.SocketIO.IO.use(
			function ( Socket, Next )
			{
				WebServer.Express.Session( Socket.handshake, {}, Next );
				// if ( Socket.handshake.session )
				// {
				// 	Socket.user = Socket.handshake.session.passport.user;
				// }
				// else
				// {
				// 	Socket.user = JSON.parse( JSON.stringify( WebServerSettings.Express.Authentication.AnonymousUser ) );
				// }
				return;
			} );


		//---------------------------------------------------------------------
		WebServer.SocketIO.IO.on( 'connection',
			( Socket ) =>
			{
				Server.Log.trace( `New socket connection received.` );

				// let this_session = {
				// 	socket_id: Socket.id,
				// 	User: null,
				// };


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


				// //---------------------------------------------------------------------
				// Socket.on( 'Authorize',
				// 	async function ( Message )
				// 	{
				// 		Server.Log.info( `Socket call [Authorize] (by: ${Message.User.user_id})` );
				// 		if ( Message.callback_name ) { Socket.emit( Message.callback_name, 'OK' ); }
				// 		// let user = await Server.SystemUsers.StorageFindOne( Message.User, Message.User );
				// 		// if ( user )
				// 		// {
				// 		// 	if ( Message.User.user_id === user.user_id ) // Match the user_id fields.
				// 		// 	{
				// 		// 		// Socket.User = user;
				// 		// 		this_session.User = user;
				// 		// 		if ( Message.callback_name ) { Socket.emit( Message.callback_name, 'OK' ); }
				// 		// 		Server.Log.debug( `Socket authorized user (${user.user_id})` );
				// 		// 		return;
				// 		// 	}
				// 		// }
				// 		// if ( Message.callback_name ) { Socket.emit( Message.callback_name, 'Fail' ); }
				// 		return;
				// 	} );


				// //---------------------------------------------------------------------
				// Socket.onAny(
				// 	async function ( Event, ...args )
				// 	{
				// 		Server.Log.trace( `Socket received event: ${Event}\n${JSON.stringify( args, null, '    ' )}` );
				// 		return;
				// 	} );


				//---------------------------------------------------------------------
				function add_service_origins( Service )
				{
					// Get the user
					// let user = {
					// 	user_id: 'admin',
					// 	user_role: 'admin',
					// };

					// Add origins for this service.
					let origin_count = 0;
					let origin_names = Object.keys( Service.ServiceDefinition.Origins );
					for ( let origin_index = 0; origin_index < origin_names.length; origin_index++ )
					{
						let origin_key = origin_names[ origin_index ];
						let origin = Service.ServiceDefinition.Origins[ origin_key ];
						let origin_name = `${Service.ServiceDefinition.name}.${origin.name}`;

						if ( origin.verbs.includes( 'call' ) )
						{
							// Invoke the origin function.
							Socket.on( origin_name,
								async function ( Message ) 
								{
									// Get the session user.
									try
									{
										Socket.user = JSON.parse( JSON.stringify(
											Socket.handshake.session.passport.user ) );
									}
									catch ( error )
									{
										Socket.user = JSON.parse( JSON.stringify(
											WebServerSettings.Express.Authentication.AnonymousUser ) );
									}

									// Invoke the origin function.
									let t0 = Date.now();
									let invocation_result = null;
									let invocation_error = null;
									try
									{
										invocation_result = await origin.invoke( Socket.user, ...Message.Payload );
									}
									catch ( error )
									{
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
										let user_text = Socket.user.user_id;

										// Verb
										let verb_text = 'CALL';

										// Origin
										let origin_text = origin_name;

										// Parameters
										let call_parameters = '';
										{
											let parameters = {};
											for ( let index = 0; index < origin.parameters.length; index++ )
											{
												let value = null;
												if ( index < Message.Payload.length )
												{
													value = Message.Payload[ index ];
												}
												parameters[ origin.parameters[ index ].name ] = value;
											}
											call_parameters = JSON.stringify( parameters );
										}

										// Log
										Server.Log.info(
											`${status_text.padEnd( 4 )}`
											+ ` | ${duration_text.padStart( 8 )}ms`
											+ ` | ${user_text.padEnd( 20 )}`
											+ ` | ${verb_text.padEnd( 7 )}`
											+ ` | ${origin_text}`
											+ ` ${call_parameters}`
										);
										if ( typeof invocation_result === 'undefined' )
										{
											Server.Log.debug( `    ===> no return value.` );
										}
										else
										{
											Server.Log.debug( `    ===> ${JSON.stringify( invocation_result )}` );
										}
										if ( invocation_error )
										{
											Server.Log.error( `    *** Error *** ${invocation_error.message}` );
										}

										// Peform the clalback.
										if ( Message.callback_name ) 
										{
											// Wrap return values in a api_result object.
											let api_result = {
												ok: true,
												origin: origin_name,
											};
											if ( invocation_error )
											{
												api_result.ok = false;
												api_result.error = invocation_error.message;
											}
											else
											{
												api_result.result = invocation_result;
											}
											Socket.emit( Message.callback_name, api_result );
										}

									}
								} );
							origin_count++;
						}
					}

					return origin_count;
				};


				//---------------------------------------------------------------------
				// Add service origins.
				let service_names = Object.keys( Server.Services );
				for ( let index = 0; index < service_names.length; index++ )
				{
					let service_name = service_names[ index ];
					let service = Server[ service_name ];
					let count = add_service_origins( service );
					// Server.Log.trace( `Added ${count} socket functions for [${service_name}].` );
				}


				//---------------------------------------------------------------------
				return;
			} );


		//=====================================================================
		//=====================================================================
		//
		//		Socket Endpoints
		//
		//=====================================================================
		//=====================================================================


		// //---------------------------------------------------------------------
		// let socket_endpoints = {};


		// //---------------------------------------------------------------------
		// let service_names = Object.keys( Server.Services );
		// for ( let index = 0; index < service_names.length; index++ )
		// {
		// 	let service_name = service_names[ index ];
		// 	let service = Server[ service_name ];
		// 	let count = add_service_origins( service );
		// 	Server.Log.trace( `Added ${count} socket functions for [${service_name}].` );
		// }


		// //---------------------------------------------------------------------
		// function add_service_origins( Service )
		// {
		// 	// Get the user
		// 	let user = {
		// 		user_id: 'admin',
		// 		user_role: 'admin',
		// 	};

		// 	// Add origins for this service.
		// 	let origin_count = 0;
		// 	let origin_names = Object.keys( Service.ServiceDefinition.Origins );
		// 	for ( let origin_index = 0; origin_index < origin_names.length; origin_index++ )
		// 	{
		// 		let origin_name = origin_names[ origin_index ];
		// 		let full_origin_name = `${Service.ServiceDefinition.name}.${origin_name}`;
		// 		let origin = Service.ServiceDefinition.Origins[ origin_name ];

		// 		if ( origin.verbs.includes( 'call' ) )
		// 		{
		// 			// Invoke the origin function.
		// 			socket_endpoints[ full_origin_name ] =
		// 				async function ( Message ) 
		// 				{
		// 					let api_result = { ok: true };
		// 					Server.Log.info( `|    |          | CALL ${full_origin_name} (by: ${this_session.User.user_id})` );
		// 					try
		// 					{
		// 						api_result.result = await origin.invoke( this_session.User, ...Message.Payload );
		// 						if ( Message.callback_name ) { Socket.emit( Message.callback_name, api_result ); }
		// 					}
		// 					catch ( error )
		// 					{
		// 						console.error( error );
		// 						api_result.error = error.message;
		// 						if ( Message.callback_name ) { Socket.emit( Message.callback_name, api_result ); }
		// 					}
		// 				} );
		// 			origin_count++;
		// 		}
		// 	}

		// 	return origin_count;
		// };


		//=====================================================================
		//=====================================================================
		//
		//		API Client
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// API Client
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

