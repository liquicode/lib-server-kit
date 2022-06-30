'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Application Services (API)
//
//=====================================================================
//=====================================================================


exports.Use =
	function Use( Server, ExpressRouter )
	{


		//---------------------------------------------------------------------
		function add_service_endpoints( Service, Router, ParentPath )
		{
			// Add endpoints for this service.
			let endpoint_names = Object.keys( Service.ServiceDefinition.Endpoints );
			for ( let endpoint_index = 0; endpoint_index < endpoint_names.length; endpoint_index++ )
			{
				let endpoint_name = endpoint_names[ endpoint_index ];
				let endpoint = Service.ServiceDefinition.Endpoints[ endpoint_name ];

				// This is the actual request handler that services this endpoint.
				async function request_handler( request, response, next ) 
				{
					// Get the endpoint parameters.
					let parameters = [];
					for ( let parameter_index = 0; parameter_index < endpoint.parameters.length; parameter_index++ )
					{
						let parameter_name = endpoint.parameters[ parameter_index ];
						let value = request.params[ parameter_name ];
						if ( typeof value === 'undefined' )
						{
							value = request.query[ parameter_name ];
						}
						if ( typeof value === 'undefined' )
						{
							value = request.body[ parameter_name ];
						}
						if ( typeof value === 'undefined' )
						{
							value = null;
						}
						// let value = null;
						// let method = request.method.toLowerCase();
						// if ( method === 'get' )
						// {
						// 	value = request.params[ parameter_name ];
						// }
						// else if ( method === 'post' )
						// {
						// 	value = request.body[ parameter_name ];
						// }
						parameters.push( value );
					}

					// Invoke the endpoint function.
					try
					{
						let api_result = {
							ok: true,
							origin: `${Service.ServiceDefinition.Name}/${endpoint.name}`,
							result: await endpoint.invoke( request.user, ...parameters ),
						};
						response.send( api_result );
					}
					catch ( error )
					{
						let api_result = {
							ok: false,
							origin: `${Service.ServiceDefinition.Name}/${endpoint.name}`,
							error: error.message,
						};
						Server.WebServer.ReportApiError( api_result, response );
						return;
					}
					return;
				}

				// Add endpoints for each http verb.
				if ( endpoint.http_verbs.includes( 'get' ) )
				{
					Router.get( `${ParentPath}/${endpoint.name}`,
						( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
						request_handler );
				}
				if ( endpoint.http_verbs.includes( 'post' ) )
				{
					Router.post( `${ParentPath}/${endpoint.name}`,
						( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
						request_handler );
				}

			}

			return;
		};


		//---------------------------------------------------------------------
		function add_managed_list_page( Service, FunctionRoute )
		{
			express_router.get( `${ParentPath}/${Service.ServiceName}/${FunctionRoute}`,
				( Service.ServiceDefinition.Endpoints[ FunctionRoute ].requires_login ? Server.WebServer.RequiresLogin : null ),
				async function ( request, response, next ) 
				{
					log_request( request );
					response.render(
						'managed-list',
						{
							Server: Server, User: request.user,
							ServiceDefinition: Service.ServiceDefinition,
							ObjectDefinition: Service.ObjectDefinition,
							FunctionRoute: FunctionRoute,
						} );
					return;
				} );
		}


		//---------------------------------------------------------------------
		function add_managed_object_page( Service, FunctionRoute )
		{
			express_router.get( `${ParentPath}/${Service.ServiceName}/${FunctionRoute}/:object_id`,
				( Service.ServiceDefinition.Endpoints[ FunctionRoute ].requires_login ? Server.WebServer.RequiresLogin : null ),
				async function ( request, response, next ) 
				{
					log_request( request );
					response.render(
						'managed-object',
						{
							Server: Server, User: request.user,
							ServiceDefinition: Service.ServiceDefinition,
							ObjectDefinition: Service.ObjectDefinition,
							FunctionRoute: FunctionRoute,
							ObjectID: request.params.object_id,
						} );
					return;
				} );
		}


		//---------------------------------------------------------------------
		// Add service endpoints.
		let service_names = Object.keys( Server.Services );
		for ( let index = 0; index < service_names.length; index++ )
		{
			let service_name = service_names[ index ];
			let service = Server[ service_name ];

			// Add the service API
			add_service_endpoints( service, ExpressRouter, `/api/${service.ServiceDefinition.Name}` );

			// // Add the service UI
			// add_managed_list_page( service, 'ListAll' );		// /{{service_name}}/ListAll
			// add_managed_list_page( service, 'ListMine' );		// /{{service_name}}/ListMine
			// add_managed_object_page( service, 'CreateOne' );	// /{{service_name}}/CreateOne
			// add_managed_object_page( service, 'ReadOne' );		// /{{service_name}}/ReadOne
			// add_managed_object_page( service, 'WriteOne' );		// /{{service_name}}/WriteOne
			// add_managed_object_page( service, 'DeleteOne' );	// /{{service_name}}/DeleteOne
			// add_managed_list_page( service, 'DeleteMine' );		// /{{service_name}}/DeleteMine
			// add_managed_list_page( service, 'DeleteAll' );		// /{{service_name}}/DeleteAll

			// Report
			Server.Log.trace( `Added service routes for [${service_name}].` );
		}


		//---------------------------------------------------------------------
		return;
	};

