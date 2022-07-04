'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Socket Server
//
//=====================================================================
//=====================================================================


exports.Use =
	function Use( Server, SocketServer )
	{
		if ( !SocketServer ) { return; }

		//---------------------------------------------------------------------
		SocketServer.on( 'connection',
			( Socket ) =>
			{
				Server.Log.trace( `New socket connection received.` );

				let _session = {
					socket_id: Socket.id,
					User: null,
				};


				//---------------------------------------------------------------------
				Socket.on( 'Authorize',
					async function ( Message )
					{
						let user = await Server.SystemUsers.StorageFindOne( Message.User, Message.User );
						if ( user )
						{
							if ( Message.User.user_id === user.user_id ) // Match the user_id fields.
							{
								// Socket.User = user;
								_session.User = user;
								if ( Message.callback_name ) { Socket.emit( Message.callback_name, 'OK' ); }
								Server.Log.info( `Authorized User (${user.user_id})` );
								return;
							}
						}
						if ( Message.callback_name ) { Socket.emit( Message.callback_name, 'Fail' ); }
						return;
					} );


				//---------------------------------------------------------------------
				function add_service_endpoints( Service, Socket, ParentPath )
				{
					// Get the user
					let user = {
						user_id: 'admin',
						user_role: 'admin',
					};

					// Add endpoints for this service.
					let endpoint_names = Object.keys( Service.ServiceDefinition.Endpoints );
					for ( let endpoint_index = 0; endpoint_index < endpoint_names.length; endpoint_index++ )
					{
						let endpoint_name = endpoint_names[ endpoint_index ];
						let full_endpoint_name = `${Service.ServiceDefinition.Name}.${endpoint_name}`;
						let endpoint = Service.ServiceDefinition.Endpoints[ endpoint_name ];

						// Invoke the endpoint function.
						Socket.on( full_endpoint_name,
							async function ( Message ) 
							{
								let api_result = { ok: true };
								Server.Log.info( `service call [${full_endpoint_name}] (by: ${_session.User.user_id})` );
								try
								{
									api_result.result = await endpoint.invoke( _session.User, ...Message.Payload );
									if ( Message.callback_name ) { Socket.emit( Message.callback_name, api_result ); }
								}
								catch ( error )
								{
									console.error( error );
									api_result.error = error.message;
									if ( Message.callback_name ) { Socket.emit( Message.callback_name, api_result ); }
								}
							} );

						return;
					}

					return;
				};


				//---------------------------------------------------------------------
				// Add service endpoints.
				let service_names = Object.keys( Server.Services );
				for ( let index = 0; index < service_names.length; index++ )
				{
					let service_name = service_names[ index ];
					let service = Server[ service_name ];
					add_service_endpoints( service, Socket, `/api/${service.ServiceDefinition.Name}` );
					Server.Log.trace( `Added service routes for [${service_name}].` );
				}


				//---------------------------------------------------------------------
				return;
			} );
	};

