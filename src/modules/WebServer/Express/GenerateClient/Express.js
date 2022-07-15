'use strict';


//=====================================================================
//=====================================================================
//
//		Generate Javascript Client API
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
exports.Generate =
	function Generate( Server, WebServer, WebServerSettings )
	{
		let code = '';
		let server_name = Server.Config.Settings.AppInfo.name;
		let service_names = Object.keys( Server.Services );
		let server_path = Server.WebServer.Express.ServerPath( WebServerSettings );
		let service_path = Server.WebServer.Express.ServicesPath( WebServerSettings );
		let timestamp = ( new Date() ).toISOString();
		let timestamp_local = ( new Date() ).toString();

		code += `'use strict';
//---------------------------------------------------------------------
// Express Api Client File for: ${server_name}
// Generated:  ${timestamp}
//   ${timestamp_local}
//---------------------------------------------------------------------

var ExpressApi = {};
var ExpressPages = {};

ExpressApi.ExpressMessage = function ( Method, Address, Payload, Callback )
{
	$.ajax( {
		url: Address,
		type: Method,
		data: Payload,
		success: function ( data, textStatus, jqXHR )
		{
			Callback( null, data );
		},
		error: function ( jqXHR, textStatus, errorThrown )
		{
			let message = '';
			if ( textStatus ) { message += '[status=' + textStatus + '] '; }
			if ( errorThrown ) { message += '[error=' + errorThrown + '] '; }
			Callback( message, null );
		},
	} );
};
`;

		// Generate the Service Clients.
		for ( let index = 0; index < service_names.length; index++ )
		{
			let service = Server.Services[ service_names[ index ] ];
			// code = Generate_ServiceHttpClient( Server, service, code, {} );
			let service_name = service.ServiceDefinition.name;
			code += `\n`;
			code += `ExpressApi.${service_name} = {};\n`;

			{ // Service API.
				code += `ExpressApi.${service_name}.API = {};\n`;
				let endpoints = service.ServiceDefinition.Endpoints;
				let endpoint_names = Object.keys( endpoints );
				for ( let index = 0; index < endpoint_names.length; index++ )
				{
					let endpoint = endpoints[ endpoint_names[ index ] ];
					let endpoint_name = endpoint.name;

					let parameters = ``;
					let payload = ``;
					for ( let parameter_index = 0; parameter_index < endpoint.parameters.length; parameter_index++ )
					{
						// Construct the parameters and payload.
						let parameter_name = endpoint.parameters[ parameter_index ].name;
						parameters += parameter_name + ', ';
						if ( payload ) { payload += ', '; };
						payload += `${parameter_name}:${parameter_name}`;
					}
					parameters += 'Callback';
					payload = `{${payload}}`;

					if ( endpoint.verbs.includes( 'get' ) )
					{
						code += `ExpressApi.${service_name}.get_${endpoint_name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { ExpressApi.ExpressMessage( 'get', '${service_path}${service_name}/${endpoint_name}', ${payload}, Callback ); }\n`;
					}
					else if ( endpoint.verbs.includes( 'put' ) )
					{
						code += `ExpressApi.${service_name}.put_${endpoint_name} = {};\n`;
					}
					else if ( endpoint.verbs.includes( 'post' ) )
					{
						code += `ExpressApi.${service_name}.post_${endpoint_name} = {};\n`;
					}
					else if ( endpoint.verbs.includes( 'delete' ) )
					{
						code += `ExpressApi.${service_name}.delete_${endpoint_name} = {};\n`;
					}

				}
			}

			{ // Service Pages.
				code += `ExpressPages.${service_name} = {};\n`;
				let endpoints = service.ServiceDefinition.Pages;
				let endpoint_names = Object.keys( endpoints );
				for ( let index = 0; index < endpoint_names.length; index++ )
				{
					let endpoint = endpoints[ endpoint_names[ index ] ];
					let endpoint_name = endpoint.name;
					code += `ExpressPages.${service_name}.${endpoint_name} = "${server_path}${service_name}/${endpoint_name}";\n`;
				}
			}

		}

		// Return the code.
		return code;
	};
