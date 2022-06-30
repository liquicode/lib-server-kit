'use strict';


//---------------------------------------------------------------------
exports.Generate_HttpClient = Generate_HttpClient;


//---------------------------------------------------------------------
function Generate_ServiceClient( Server, Service, Code, Options )
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
function Generate_HttpClient( Server )
{
	let code = '';
	let server_name = Server.Config.Settings.AppInfo.name;

	code += `'use strict';
// Server Client File for: ${server_name}
var Server = {};
`;

	// Generate the Service Clients.
	let service_names = Object.keys( Server.Services );
	for ( let index = 0; index < service_names.length; index++ )
	{
		let service = Server.Services[ service_names[ index ] ];
		code = Generate_ServiceClient( Server, service, code, { mode: 'http' } );
	}

	// Return the code.
	return code;
};

