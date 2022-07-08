'use strict';


//---------------------------------------------------------------------
exports.Generate_SocketApiClient = Generate_SocketApiClient;


//---------------------------------------------------------------------
function Generate_SocketApiClient( Server )
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
		let message_id = uuidv4();
		let message = {
			id: uuidv4(),
			message_name: MessageName,
			User: Socket.__.User,
			Payload: Payload,
		};
		if ( Callback )
		{
			message.callback_name = ` + '`${MessageName}->${message.id}`' + `;
			Socket.__.io.once( message.callback_name, Callback );
		}
		Socket.__.io.emit( MessageName, message );
		return;
	};

SocketApi.NewSocket =
	function NewSocket( User, Callback )
	{
		let socket = { __: { io: io(), User: User } };
		// socket.Authorize = function ( Callback ) { SocketApi.SocketMessage( socket, 'Authorize', {}, Callback ); };
`;

	// Generate the Socket Clients.
	for ( let index = 0; index < service_names.length; index++ )
	{
		let service = Server.Services[ service_names[ index ] ];
		let service_name = service.ServiceDefinition.name;
		code += `\n`;
		code += `		socket.${service_name} = {};\n`;

		let endpoints = service.ServiceDefinition.Endpoints;
		let endpoint_names = Object.keys( endpoints );
		for ( let index = 0; index < endpoint_names.length; index++ )
		{
			// Define a Service Endpoint.
			let endpoint = endpoints[ endpoint_names[ index ] ];
			if ( endpoint.verbs.includes( 'call' ) )
			{
				let parameters = ``;
				let payload = ``;
				for ( let parameter_index = 0; parameter_index < endpoint.parameters.length; parameter_index++ )
				{
					// Construct the parameters and payload.
					let parameter_name = endpoint.parameters[ parameter_index ];
					parameters += parameter_name + ', ';
					if ( payload ) { payload += ', '; };
					payload += parameter_name;
				}
				parameters += 'Callback';
				payload = `[${payload}]`;

				// Define the endpoint.
				code += `		socket.${service_name}.${endpoint.name}`;
				code += ` = function ( ${parameters} )`;
				code += ` { SocketApi.SocketMessage( socket, '${service_name}.${endpoint.name}', ${payload}, Callback ); }\n`;
			}
		}
	}

	code += `
		socket.__.io.on( 'connect',
			() => 
			{
				console.log( 'Socket connected.' );
				SocketApi.SocketMessage( socket, 'Authorize', {},
					( status ) =>
					{
						console.log( 'User authorization: ' + status );
						Callback( socket, status );
					} );
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

		return;
	};

`;

	// Return the code.
	return code;
};

