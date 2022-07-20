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

		let client_style_code = '';
		if ( WebServerSettings.Express.ClientSupport.client_api_style === 'ajax' )
		{
			client_style_code = client_style_ajax();
		}
		else if ( WebServerSettings.Express.ClientSupport.client_api_style === 'fetch' )
		{
			client_style_code = client_style_fetch();
		}
		else
		{
			let message = `The configuration setting Express.ClientSupport.client_api_style [${WebServerSettings.Express.ClientSupport.client_api_style}] is not an accepted value.`;
			Server.Log.error( message );
			client_style_code = `console.error( '${message}' );`;
		}

		code += `'use strict';
//---------------------------------------------------------------------
// Express Api Client File for: ${server_name}
// Generated:  ${timestamp}
//   ${timestamp_local}
//---------------------------------------------------------------------

var ExpressApi = {};    // Service Origins
var ExpressPages = {};  // Service Pages

//---------------------------------------------------------------------
function send_message( Method, Address, Payload, Callback )
{
	console.log( "ExpressApi Invoking [" + Method + "] on [" + Address + "] --> ", Payload );
${client_style_code}
	return;
};

//---------------------------------------------------------------------
function handle_message_success( ApiResult, Callback )
{
	if ( ApiResult.ok )
	{
		console.log( "ExpressApi Success [" + ApiResult.origin + "] <-- ", ApiResult.result );
	}
	else
	{
		console.log( "ExpressApi Failure [" + ApiResult.origin + "] <-- " + ApiResult.error );
	}
	Callback( null, ApiResult );
	return;
};

//---------------------------------------------------------------------
function handle_message_error( ErrorMessage, Callback )
{
	console.error( ErrorMessage );
	Callback( ErrorMessage, null );
	return;
};

//---------------------------------------------------------------------
function make_page_url( url, params_object )
{
	let search_params = new URLSearchParams( params_object );
	url += '?' + search_params.toString();
	return url;
}
`;

		// Generate the Service Clients.
		for ( let index = 0; index < service_names.length; index++ )
		{
			let service = Server.Services[ service_names[ index ] ];
			// code = Generate_ServiceHttpClient( Server, service, code, {} );
			let service_name = service.ServiceDefinition.name;
			code += `\n`;
			code += `//---------------------------------------------------------------------\n`;
			code += `// ${service_name} Origins\n`;
			code += `ExpressApi.${service_name} = {};\n`;

			{ // Service API.
				let origins = service.ServiceDefinition.Origins;
				let origin_keys = Object.keys( origins );
				for ( let index = 0; index < origin_keys.length; index++ )
				{
					let origin = origins[ origin_keys[ index ] ];

					// Get the parameter info.
					let parameters = ``;
					let payload = ``;
					for ( let parameter_index = 0; parameter_index < origin.parameters.length; parameter_index++ )
					{
						// Construct the parameters and payload.
						let parameter_name = origin.parameters[ parameter_index ].name;
						parameters += parameter_name + ', ';
						if ( payload ) { payload += ', '; };
						payload += `${parameter_name}: ${parameter_name}`;
					}
					parameters += 'Callback';
					payload = `{ ${payload} }`;

					// Generate client functions for each verb.
					if ( origin.verbs.includes( 'get' ) )
					{
						code += `ExpressApi.${service_name}.get_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { send_message( 'get', '${service_path}${service_name}/${origin.name}', ${payload}, Callback ); };\n`;
					}
					if ( origin.verbs.includes( 'put' ) )
					{
						code += `ExpressApi.${service_name}.put_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { send_message( 'put', '${service_path}${service_name}/${origin.name}', ${payload}, Callback ); };\n`;
					}
					if ( origin.verbs.includes( 'post' ) )
					{
						code += `ExpressApi.${service_name}.post_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { send_message( 'post', '${service_path}${service_name}/${origin.name}', ${payload}, Callback ); };\n`;
					}
					if ( origin.verbs.includes( 'delete' ) )
					{
						code += `ExpressApi.${service_name}.delete_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { send_message( 'delete', '${service_path}${service_name}/${origin.name}', ${payload}, Callback ); };\n`;
					}

				}
			}

			{ // Service Pages.
				code += `\n`;
				code += `//---------------------------------------------------------------------\n`;
				code += `// ${service_name} Pages\n`;
				code += `ExpressPages.${service_name} = {};\n`;
				let origins = service.ServiceDefinition.Pages;
				let origin_keys = Object.keys( origins );
				for ( let index = 0; index < origin_keys.length; index++ )
				{
					let origin = origins[ origin_keys[ index ] ];

					// Get the parameter info.
					let parameters = ``;
					let payload = ``;
					for ( let parameter_index = 0; parameter_index < origin.parameters.length; parameter_index++ )
					{
						// Construct the parameters and payload.
						let parameter_name = origin.parameters[ parameter_index ].name;
						if ( parameters ) { parameters += ', '; };
						parameters += parameter_name;
						if ( payload ) { payload += ', '; };
						payload += `${parameter_name}: ${parameter_name}`;
					}
					payload = `{ ${payload} }`;

					// Generate client function.
					// code += `ExpressPages.visit_${service_name}.${origin_name} = "${server_path}${service_name}/${origin.name}";\n`;
					code += `ExpressPages.${service_name}.visit_${origin.name}`;
					code += ` = function ( ${parameters} )`;
					code += ` { return make_page_url( '${server_path}${service_name}/${origin.name}', ${payload} ); };\n`;

				}
			}

		}

		// Return the code.
		return code;
	};


//---------------------------------------------------------------------
function client_style_ajax()
{
	return `
	$.ajax(
		{
			url: Address,
			type: Method,
			data: Payload,
			success:
				function ( data, textStatus, jqXHR )
				{
					handle_message_success( data, Callback );
				},
			error:
				function ( jqXHR, textStatus, errorThrown )
				{
					let message = '';
					if ( textStatus ) { message += '[status=' + textStatus + ']'; }
					if ( errorThrown ) { message += ' [error=' + errorThrown + ']'; }
					message = 'Error [' + Method + '] on [' + Address + '] <-- ' + message;
					handle_message_error( message, Callback );
				},
		}
	);
`;
}


//---------------------------------------------------------------------
function client_style_fetch()
{
	return `
	let url = '';
	let options = { method: Method };
	if ( [ 'get', 'head' ].includes( Method ) )
	{
		url = make_page_url( Address, Payload );
	}
	else
	{
		url = Address;
		let form_data = new FormData();
		Object.keys( Payload ).forEach( key => form_data.append( key, Payload[ key ] ) );
		options.body = form_data;
	}
	fetch( url, options )
		.then(
			function ( Response )
			{
				Response.json()
					.then(
						function ( ApiResult )
						{
							handle_message_success( ApiResult, Callback );
						}
					);
			}
		)
		.catch(
			function ( Error )
			{
				handle_message_error( Error.message, Callback );
			}
		);
`;
}


