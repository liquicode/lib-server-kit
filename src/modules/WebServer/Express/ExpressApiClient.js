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
	console.log( "ExpressApi Invoking [" + Method + "] on [" + Address + "] --> ", Payload );
	$.ajax( {
		url: Address,
		type: Method,
		data: Payload,
		success: function ( data, textStatus, jqXHR )
		{
			let api_result = data;
			if ( api_result.ok )
			{
				console.log( "ExpressApi Success [" + api_result.origin + "] <-- ", api_result.result );
			}
			else
			{
				console.log( "ExpressApi Failure [" + api_result.origin + "] <-- " + api_result.error );
			}
			Callback( null, api_result );
		},
		error: function ( jqXHR, textStatus, errorThrown )
		{
			let message = '';
			if ( textStatus ) { message += '[status=' + textStatus + '] '; }
			if ( errorThrown ) { message += '[error=' + errorThrown + '] '; }
			console.error( "Error [" + Method + "] on [" + Address + "] <-- " + message );
			Callback( message, null );
		},
	} );
	return;
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
				let origins = service.ServiceDefinition.Origins;
				let origin_names = Object.keys( origins );
				for ( let index = 0; index < origin_names.length; index++ )
				{
					let origin = origins[ origin_names[ index ] ];
					let origin_name = origin.name;

					let parameters = ``;
					let payload = ``;
					for ( let parameter_index = 0; parameter_index < origin.parameters.length; parameter_index++ )
					{
						// Construct the parameters and payload.
						let parameter_name = origin.parameters[ parameter_index ].name;
						parameters += parameter_name + ', ';
						if ( payload ) { payload += ', '; };
						payload += `${parameter_name}:${parameter_name}`;
					}
					parameters += 'Callback';
					payload = `{${payload}}`;

					if ( origin.verbs.includes( 'get' ) )
					{
						code += `ExpressApi.${service_name}.get_${origin_name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { ExpressApi.ExpressMessage( 'get', '${service_path}${service_name}/${origin_name}', ${payload}, Callback ); }\n`;
					}
					if ( origin.verbs.includes( 'put' ) )
					{
						code += `ExpressApi.${service_name}.put_${origin_name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { ExpressApi.ExpressMessage( 'put', '${service_path}${service_name}/${origin_name}', ${payload}, Callback ); }\n`;
					}
					if ( origin.verbs.includes( 'post' ) )
					{
						code += `ExpressApi.${service_name}.post_${origin_name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { ExpressApi.ExpressMessage( 'post', '${service_path}${service_name}/${origin_name}', ${payload}, Callback ); }\n`;
					}
					if ( origin.verbs.includes( 'delete' ) )
					{
						code += `ExpressApi.${service_name}.delete_${origin_name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { ExpressApi.ExpressMessage( 'delete', '${service_path}${service_name}/${origin_name}', ${payload}, Callback ); }\n`;
					}

				}
			}

			{ // Service Pages.
				code += `ExpressPages.${service_name} = {};\n`;
				let origins = service.ServiceDefinition.Pages;
				let origin_names = Object.keys( origins );
				for ( let index = 0; index < origin_names.length; index++ )
				{
					let origin = origins[ origin_names[ index ] ];
					let origin_name = origin.name;
					code += `ExpressPages.${service_name}.${origin_name} = "${server_path}${service_name}/${origin_name}";\n`;
				}
			}

		}

		// Return the code.
		return code;
	};
