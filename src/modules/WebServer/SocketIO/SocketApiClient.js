'use strict';


//---------------------------------------------------------------------
exports.GenerateClient = GenerateClient;


//---------------------------------------------------------------------
function GenerateClient( Server, WebServerSettings )
{
	let code = '';
	let server_name = Server.Config.Settings.AppInfo.name;
	let service_names = Object.keys( Server.Services );
	let timestamp = ( new Date() ).toISOString();
	let timestamp_local = ( new Date() ).toString();

	code += `'use strict';
//---------------------------------------------------------------------
// Socket Api Client File for: ${server_name}
// Generated:  ${timestamp}
//   ${timestamp_local}
//---------------------------------------------------------------------

var SocketApi = {};

SocketApi.SocketMessage =
	function SocketMessage( Socket, MessageName, Payload, Callback )
	{
		console.log( "SocketApi Invoking [" + MessageName + "] --> ", Payload );
		let message_id = uuidv4();
		let message = {
			id: uuidv4(),
			message_name: MessageName,
			Payload: Payload,
		};
		// Setup the callback.
		message.callback_name = MessageName + '->' + message.id;
		function socket_proxy_callback( api_result )
		{
			if ( api_result.ok )
			{
				console.log( "SocketApi Success [" + api_result.origin + "] <-- ", api_result.result );
			}
			else
			{
				console.log( "SocketApi Failure [" + api_result.origin + "] <-- " + api_result.error );
			}
			if ( Callback )
			{
				Callback( api_result );
			}
			return;
		}
		Socket.__.io.once( message.callback_name, socket_proxy_callback );
		// Send the message.
		Socket.__.io.emit( MessageName, message );
		return;
	};

SocketApi.NewSocket =
	function NewSocket( ConnectCallback )
	{
		let socket = { __: { io: io() } };
`;

	// Generate the Socket Clients.
	for ( let index = 0; index < service_names.length; index++ )
	{
		let service = Server.Services[ service_names[ index ] ];
		let service_name = service.ServiceDefinition.name;
		code += `\n`;
		code += `		socket.${service_name} = {};\n`;

		let origins = service.ServiceDefinition.Origins;
		let origin_names = Object.keys( origins );
		for ( let index = 0; index < origin_names.length; index++ )
		{
			// Define a Service Origin.
			let origin = origins[ origin_names[ index ] ];
			let origin_name = origin.name;
			if ( origin.verbs.includes( 'call' ) )
			{
				let parameters = ``;
				let payload = ``;
				for ( let parameter_index = 0; parameter_index < origin.parameters.length; parameter_index++ )
				{
					// Construct the parameters and payload.
					let parameter_name = origin.parameters[ parameter_index ].name;
					parameters += parameter_name + ', ';
					if ( payload ) { payload += ', '; };
					// payload += parameter_name;
					payload += `${parameter_name}: ${parameter_name}`;
				}
				parameters += 'Callback';
				// payload = `[${payload}]`;
				payload = `{ ${payload} }`;

				// Define the origin.
				code += `		socket.${service_name}.${origin_name}`;
				code += ` = function ( ${parameters} )`;
				code += ` { SocketApi.SocketMessage( socket, '${service_name}.${origin_name}', ${payload}, Callback ); }\n`;
			}
		}
	}

	code += `
		socket.__.io.on( 'connect',
			() => 
			{
				console.log( 'Socket connected.' );
				if( ConnectCallback ) { ConnectCallback( socket ); }
			} );
		socket.__.io.on( 'disconnect', 
			( reason, details ) =>
			{
				if( details ) { delete details.context; }
				console.log( 'Socket disconnected. Reason [' + reason + ']; Details [' + JSON.stringify( details ) + ']' );
			} );
		socket.__.io.on( 'connect_error',
			( error ) =>
			{
				console.log( 'Socket connection error: ' + error );
			} );

		socket.__.io.connect();

		return socket;
	};

`;

	// Return the code.
	return code;
};

