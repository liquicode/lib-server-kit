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
				let origins = service.ServiceDefinition.Origins;
				let origin_names = Object.keys( origins );
				for ( let index = 0; index < origin_names.length; index++ )
				{
					let origin = origins[ origin_names[ index ] ];
					let origin_name = origin.name;
					let swagger_path = {};

					if ( origin.verbs.includes( 'get' ) )
					{
						swagger_path.get = create_swagger_origin( origin, 'query' );
					}
					if ( origin.verbs.includes( 'put' ) )
					{
						swagger_path.put = create_swagger_origin( origin, 'body' );
					}
					if ( origin.verbs.includes( 'post' ) )
					{
						swagger_path.post = create_swagger_origin( origin, 'body' );
					}
					if ( origin.verbs.includes( 'delete' ) )
					{
						swagger_path.delete = create_swagger_origin( origin, 'query' );
					}

					if ( swagger_path.get || swagger_path.put || swagger_path.post || swagger_path.delete )
					{
						let origin_url_path = `/${service_name}/${origin_name}`;
						swagger_doc.paths[ origin_url_path ] = swagger_path;
					}

				}
			}

		}

		return swagger_doc;
	};


//---------------------------------------------------------------------
function create_swagger_origin( Origin, ParametersIn )
{
	let swagger_origin = {
		summary: Origin.description,
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
	for ( let parameter_index = 0; parameter_index < Origin.parameters.length; parameter_index++ )
	{
		let parameter = Origin.parameters[ parameter_index ];
		let swagger_parameter = JSON.parse( JSON.stringify( parameter ) );
		swagger_parameter.in = ParametersIn;
		swagger_origin.parameters.push( swagger_parameter );
	}
	return swagger_origin;
}

