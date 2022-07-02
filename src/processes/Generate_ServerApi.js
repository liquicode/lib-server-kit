'use strict';


//---------------------------------------------------------------------
exports.Generate_ServerApi = Generate_ServerApi;


//---------------------------------------------------------------------
function Generate_ServiceHttpClient( Server, Service, Code, Options )
{
	let service_name = Service.ServiceDefinition.Name;

	Code += `
// ${service_name} Service Client
Server.${service_name} =
{
	API: {},
	Pages: {},
};
`;

	// Service API Client.
	let endpoints = Service.ServiceDefinition.Endpoints;
	let endpoint_names = Object.keys( endpoints );
	for ( let index = 0; index < endpoint_names.length; index++ )
	{
		let endpoint = endpoints[ endpoint_names[ index ] ];
		Code += `
// ${service_name}.${endpoint.name}
`;
	}

	// Service Pages Client.

	// Return the code.
	return Code;
};


//---------------------------------------------------------------------
function Generate_ServiceSocketClient( Server, Service, Code, Options )
{
	let service_name = Service.ServiceDefinition.Name;
	Code += `		socket.Services.${service_name} = {};\n`;

	let endpoints = Service.ServiceDefinition.Endpoints;
	let endpoint_names = Object.keys( endpoints );
	for ( let index = 0; index < endpoint_names.length; index++ )
	{
		// Define a Service Endpoint.
		let endpoint = endpoints[ endpoint_names[ index ] ];
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
		Code += `		socket.Services.${service_name}.${endpoint.name}`;
		Code += ` = function ( ${parameters} )`;
		Code += ` { Server.SocketMessage( socket, '${service_name}.${endpoint.name}', socket.User, ${payload}, Callback ); }\n`;
	}

	return Code;
};


//---------------------------------------------------------------------
function Generate_ServerApi( Server )
{
	let code = '';
	let server_name = Server.Config.Settings.AppInfo.name;
	let service_names = Object.keys( Server.Services );
	let timestamp = ( new Date() ).toISOString();
	let timestamp_local = ( new Date() ).toString();

	code += `'use strict';
//---------------------------------------------------------------------
// Server Client File for: ${server_name}
// Generated:  ${timestamp}
//   ${timestamp_local}
//---------------------------------------------------------------------

var Server = {};

Server.SocketMessage =
	function SocketMessage( Socket, MessageName, User, Payload, Callback )
	{
		let message_id = uuidv4();
		let message = {
			id: uuidv4(),
			message_name: MessageName,
			User: User,
			Payload: Payload,
		};
		if ( Callback )
		{
			message.callback_name = ` + '`${MessageName}->${message.id}`' + `;
			Socket.io.once( message.callback_name, Callback );
		}
		Socket.io.emit( MessageName, message );
		return;
	};

Server.NewSocket =
	function NewSocket( User )
	{
		let socket = {};
		socket.io = io();
		socket.User = User;
		socket.Services = {};
		socket.Services.authorize = function ( Callback ) { Server.SocketMessage( socket, 'authorize', socket.User, {}, Callback ); };
`;

	// Generate the Socket Clients.
	for ( let index = 0; index < service_names.length; index++ )
	{
		let service = Server.Services[ service_names[ index ] ];
		code = Generate_ServiceSocketClient( Server, service, code, {} );
	}

	code += `
		return socket;
	};

`;

	// Generate the Service Clients.
	for ( let index = 0; index < service_names.length; index++ )
	{
		let service = Server.Services[ service_names[ index ] ];
		code = Generate_ServiceHttpClient( Server, service, code, {} );
	}

	// Return the code.
	return code;
};

