'use strict';

const { string } = require( 'yargs' );


//=====================================================================
//=====================================================================
//
//		Generate Swagger OpenAPI Definition Document
//		[https://swagger.io/docs/specification/]
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
exports.Generate =
	function Generate( Server, WebServer, WebServerSettings )
	{
		let server_settings = Server.Config.Settings;
		let service_names = Object.keys( Server.Services );

		// Build the base document.
		let swagger_doc = {
			openapi: '3.0.0',
			info: {
				title: `${server_settings.AppInfo.name} Server API`,
				description: server_settings.AppInfo.description,
				version: server_settings.AppInfo.version,
			},
			servers: [
				{
					url: `${WebServer.Express.ServerAddress()}${WebServer.Express.ServicesPath()}`,
					description: `${server_settings.AppInfo.environment} server`,
				},
			],
			components: {
				schemas: {
					ApiResult: {
						type: 'object',
						properties: {
							ok: { type: 'boolean' },
							origin: { type: 'string' },
							error: { type: 'string' },
							result: {},
						},
						example: {
							ok: true,
							origin: 'service/call',
							error: null,
							result: { foo: 'bar' },
						},
					},
				},
			},
			paths: {},
		};

		// Add service routes/paths.
		for ( let index = 0; index < service_names.length; index++ )
		{
			let service = Server.Services[ service_names[ index ] ];
			let service_name = service.ServiceDefinition.name;

			{ // Service API.
				let endpoints = service.ServiceDefinition.Endpoints;
				let endpoint_names = Object.keys( endpoints );
				for ( let index = 0; index < endpoint_names.length; index++ )
				{
					let endpoint = endpoints[ endpoint_names[ index ] ];
					let endpoint_name = endpoint.name;
					let swagger_path = {};

					if ( endpoint.verbs.includes( 'get' ) )
					{
						swagger_path.get = {
							summary: endpoint.description,
							parameters: [],
							responses: {
								'200': {
									description: 'ApiResult',
									content: {
										'application/json': {
											schema: { $ref: '#/components/schemas/ApiResult' },
										}
									}
								},
								'500': {
									description: 'Server Error',
									content: {
										'text/html': {
											schema: { type: 'string' },
										}
									}
								},
							},
						};
						for ( let parameter_index = 0; parameter_index < endpoint.parameters.length; parameter_index++ )
						{
							let parameter = endpoint.parameters[ parameter_index ];
							let swagger_parameter = JSON.parse( JSON.stringify( parameter ) );
							swagger_parameter.in = `query`;
							// let parameter_name = endpoint.parameters[ parameter_index ].name;
							// let swagger_parameter = {
							// 	name: parameter_name,
							// 	in: 'query',
							// 	required: true,
							// 	// schema: {
							// 	// 	type: 'string',
							// 	// },
							// };
							swagger_path.get.parameters.push( swagger_parameter );
						}
					}
					else if ( endpoint.verbs.includes( 'put' ) )
					{
						//TODO:
					}
					else if ( endpoint.verbs.includes( 'post' ) )
					{
						//TODO:
					}
					else if ( endpoint.verbs.includes( 'delete' ) )
					{
						//TODO:
					}

					if ( swagger_path.get || swagger_path.put || swagger_path.post || swagger_path.delete )
					{
						let endpoint_url_path = `/${service_name}/${endpoint_name}`;
						swagger_doc.paths[ endpoint_url_path ] = swagger_path;
					}

				}
			}

		}

		return swagger_doc;
	};


