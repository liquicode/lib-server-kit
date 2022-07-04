'use strict';


//---------------------------------------------------------------------
exports.Generate_HttpApiClient = Generate_HttpApiClient;


//---------------------------------------------------------------------
function Generate_HttpApiClient( Server, Service, Code, Options )
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
function Generate_HttpApiClient( Server )
{
	let code = '';
	let server_name = Server.Config.Settings.AppInfo.name;
	let service_names = Object.keys( Server.Services );
	let timestamp = ( new Date() ).toISOString();
	let timestamp_local = ( new Date() ).toString();

	code += `'use strict';
//---------------------------------------------------------------------
// Http Api Client File for: ${server_name}
// Generated:  ${timestamp}
//   ${timestamp_local}
//---------------------------------------------------------------------

var HttpApi = {};

`;

	// Generate the Service Clients.
	for ( let index = 0; index < service_names.length; index++ )
	{
		let service = Server.Services[ service_names[ index ] ];
		// code = Generate_ServiceHttpClient( Server, service, code, {} );
		let service_name = service.ServiceDefinition.Name;

		code += `
HttpApi.${service_name} =
{
	API: {},
	Pages: {},
};
`;

		// Service API Client.
		let endpoints = service.ServiceDefinition.Endpoints;
		let endpoint_names = Object.keys( endpoints );
		for ( let index = 0; index < endpoint_names.length; index++ )
		{
			let endpoint = endpoints[ endpoint_names[ index ] ];
			code += `
// ${service_name}.${endpoint.name}
`;
		}
	}

	// Return the code.
	return code;
};

