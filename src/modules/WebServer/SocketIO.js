'use strict';


const { Socket } = require( 'dgram' );
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
	function Create( Server, WebServer )
	{
		let SocketIO = {
			IO: LIB_SOCKET_IO( WebServer.HttpServer ),
		};
		return SocketIO;
	};


//---------------------------------------------------------------------
exports.Initialize =
	function Initialize( Server, WebServer )
	{


		//=====================================================================
		//=====================================================================
		//
		//		Initialize
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// Add service origins.
		let socket_endpoints = {};
		let service_names = Object.keys( Server.Services );
		for ( let index = 0; index < service_names.length; index++ )
		{
			let service_name = service_names[ index ];
			let service = Server[ service_name ];

			// Add origins for this service.
			let origin_count = 0;
			let origin_names = Object.keys( service.ServiceDefinition.Origins );
			for ( let origin_index = 0; origin_index < origin_names.length; origin_index++ )
			{
				let origin_key = origin_names[ origin_index ];
				let origin = service.ServiceDefinition.Origins[ origin_key ];
				let origin_url = `${service.ServiceDefinition.name}.${origin.name}`;
				if ( !origin.verbs.includes( 'call' ) ) { continue; }

				// Register the socket handler function.
				socket_endpoints[ origin_url ] =
					function socket_proxy( SocketInstance ) 
					{
						return async function socket_handler( Message ) 
						{
							// Get the session user.
							if ( !SocketInstance.user )
							{
								if (
									SocketInstance.handshake
									&& SocketInstance.handshake.session
									&& SocketInstance.handshake.session.passport
									&& SocketInstance.handshake.session.passport.user
								)
								{
									SocketInstance.user = JSON.parse( JSON.stringify(
										SocketInstance.handshake.session.passport.user ) );
								}
								else
								{
									SocketInstance.user = JSON.parse( JSON.stringify(
										WebServer.Settings.AnonymousUser ) );
								}
							}

							// Invoke the origin function.
							let t0 = Date.now();
							let invocation_result = null;
							let invocation_error = null;
							try
							{
								// Get a working copy of the parameters.
								let origin_parameters = JSON.parse( JSON.stringify( Message.Payload ) );
								// Validate the parameters.
								let validation_error = Server.ValidateFields( origin.parameters, origin_parameters, true, false );
								if ( validation_error )
								{
									let error_message = `Validation Error: ${validation_error}`;
									throw new Error( error_message );
								}
								// Report.
								Server.Log.debug( `SocketIO ===> ${origin_url} ===> ${JSON.stringify( origin_parameters )}` );
								// Convert parameters to an array of values.
								let parameter_values = [];
								for ( let parameter_index = 0; parameter_index < origin.parameters.length; parameter_index++ )
								{
									let parameter = origin.parameters[ parameter_index ];
									parameter_values.push( origin_parameters[ parameter.name ] );
								}
								// Invoke the origin function.
								invocation_result = await origin.invoke( SocketInstance.user, ...parameter_values );
							}
							catch ( error )
							{
								invocation_error = error;
							}
							finally
							{
								// Duration
								let duration_text = ( Date.now() - t0 ).toString() + 'ms';
								// User
								let user_text = SocketInstance.user.user_id;

								// Wrap return values in a api_result object.
								let api_result = {
									ok: true,
									origin: origin_url,
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

								// Report.
								Server.Log.debug( `SocketIO <=== ${origin_url} <=== ${JSON.stringify( api_result )} (by:${user_text}) (duration:${duration_text})` );

								// Peform the callback.
								if ( Message.callback_name ) 
								{
									SocketInstance.emit( Message.callback_name, api_result );
								}

							}
						};
					};
				origin_count++;

			} // For each Origin
		} // For each Service


		//=====================================================================
		//=====================================================================
		//
		//		Socket Events
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// Connect to the Express Session.
		WebServer.SocketIO.IO.use(
			function ( SocketInstance, Next )
			{
				WebServer.Express.Session( SocketInstance.handshake, {}, Next );
				return;
			} );


		//---------------------------------------------------------------------
		WebServer.SocketIO.IO.on( 'connection',
			( SocketInstance ) =>
			{
				if ( WebServer.Settings.SocketIO.trace_connections )
				{
					Server.Log.trace( `SocketIO: New socket connection received.` );
				}


				//---------------------------------------------------------------------
				SocketInstance.on( 'disconnecting',
					async function ( Reason )
					{
						if ( WebServer.Settings.SocketIO.trace_connections )
						{
							Server.Log.trace( `SocketIO: Socket is disconnecting because [${Reason}].` );
						}
						return;
					} );


				//---------------------------------------------------------------------
				SocketInstance.on( 'disconnect',
					async function ( Reason )
					{
						if ( WebServer.Settings.SocketIO.trace_connections )
						{
							Server.Log.trace( `SocketIO: Socket has disconnected because [${Reason}].` );
						}
						return;
					} );


				//---------------------------------------------------------------------
				SocketInstance.on( 'connect',
					async function ( Reason )
					{
						if ( WebServer.Settings.SocketIO.trace_connections )
						{
							Server.Log.trace( `SocketIO: Socket connected.` );
						}
						return;
					} );


				//---------------------------------------------------------------------
				SocketInstance.on( 'connect_error',
					async function ( Reason )
					{
						Server.Log.error( `SocketIO: Socket connection error [${Reason}]` );
						return;
					} );


				//---------------------------------------------------------------------
				// Initialize new socket endpoints.
				let endpoint_names = Object.keys( socket_endpoints );
				for ( let endpoint_index = 0; endpoint_index < endpoint_names.length; endpoint_index++ )
				{
					let endpoint_name = endpoint_names[ endpoint_index ];
					SocketInstance.on( endpoint_name, socket_endpoints[ endpoint_name ]( SocketInstance ) );
				}


				//---------------------------------------------------------------------
				return;
			} );


		//=====================================================================
		//=====================================================================
		//
		//		Socket API Client
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// Socket API Client
		if ( WebServer.Settings.SocketIO.ClientSupport.socket_api_client )
		{
			// Generate the api client for javascript.
			let code = SRC_GENERATE_CLIENT.GenerateClient( Server, WebServer.Settings );
			let filename = Server.ResolveApplicationPath( WebServer.Settings.SocketIO.ClientSupport.socket_api_client );
			LIB_FS.writeFileSync( filename, code );
			Server.Log.trace( `WebServer.SocketIO.ClientSupport generated client file: [${filename}]` );
		}

		Server.Log.trace( `WebServer.SocketIO.ClientSupport is initialized.` );
		return;
	};

