'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - SocketIO Application Services
//
//=====================================================================
//=====================================================================


exports.Use =
	function Use( Server, WebServer, WebServerSettings )
	{


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
					WebServer.SocketIO.IO.on( full_endpoint_name,
						async function ( Message ) 
						{
							let api_result = { ok: true };
							Server.Log.info( `Socket call [${full_endpoint_name}] (by: ${this_session.User.user_id})` );
							try
							{
								api_result.result = await endpoint.invoke( this_session.User, ...Message.Payload );
								if ( Message.callback_name ) { WebServer.SocketIO.IO.emit( Message.callback_name, api_result ); }
							}
							catch ( error )
							{
								console.error( error );
								api_result.error = error.message;
								if ( Message.callback_name ) { WebServer.SocketIO.IO.emit( Message.callback_name, api_result ); }
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


	};

