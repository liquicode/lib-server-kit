'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Express Application Services (Functions and Pages)
//
//=====================================================================
//=====================================================================


exports.Use =
	function Use( Server, WebServer, WebServerSettings )
	{


		//---------------------------------------------------------------------
		function get_express_request_parameters( request, endpoint )
		{
			let parameters = [];
			for ( let parameter_index = 0; parameter_index < endpoint.parameters.length; parameter_index++ )
			{
				let parameter = endpoint.parameters[ parameter_index ];
				let value = request.params[ parameter.name ];
				if ( typeof value === 'undefined' )
				{
					value = request.query[ parameter.name ];
				}
				if ( typeof value === 'undefined' )
				{
					value = request.body[ parameter.name ];
				}
				if ( typeof value === 'undefined' )
				{
					value = null;
					if ( parameter.required )
					{
						Server.Log.warn( `Undefined value for required parameter [${parameter.name}] in endpoint [${endpoint.name}].` );
					}
				}
				parameters.push( value );
			}
			return parameters;
		}


		//---------------------------------------------------------------------
		function add_express_service_endpoints( Service, ParentPath )
		{

			//---------------------------------------------------------------------
			// Add endpoints for this service.
			let endpoint_count = 0;
			let endpoint_names = Object.keys( Service.ServiceDefinition.Endpoints );
			for ( let endpoint_index = 0; endpoint_index < endpoint_names.length; endpoint_index++ )
			{
				let endpoint_name = endpoint_names[ endpoint_index ];
				let endpoint = Service.ServiceDefinition.Endpoints[ endpoint_name ];

				//---------------------------------------------------------------------
				// This is the actual request handler that services this endpoint.
				async function express_request_handler( request, response, next ) 
				{
					// Get the endpoint parameters.
					let parameters = get_express_request_parameters( request, endpoint );

					//TODO: Validate user_role.

					// Invoke the endpoint function.
					// Wrap return values in a api_result object.
					try
					{
						let api_result = {
							ok: true,
							origin: `${Service.ServiceDefinition.name}/${endpoint_name}`,
							result: await endpoint.invoke( request.user, ...parameters ),
						};
						response.send( api_result );
					}
					catch ( error )
					{
						let api_result = {
							ok: false,
							origin: `${Service.ServiceDefinition.name}/${endpoint_name}`,
							error: error.message,
						};
						Server.WebServer.ReportApiError( api_result, response );
						return;
					}
					return;
				}

				//---------------------------------------------------------------------
				// Add routes for each http verb.
				if ( endpoint.verbs.includes( 'get' ) )
				{
					WebServer.Express.App.get( `${ParentPath}/${endpoint_name}`,
						WebServer.Express.AuthenticationGate( endpoint.requires_login ),
						express_request_handler );
					endpoint_count++;
				}
				if ( endpoint.verbs.includes( 'post' ) )
				{
					WebServer.Express.App.post( `${ParentPath}/${endpoint_name}`,
						WebServer.Express.AuthenticationGate( endpoint.requires_login ),
						express_request_handler );
					endpoint_count++;
				}
				if ( endpoint.verbs.includes( 'put' ) )
				{
					WebServer.Express.App.put( `${ParentPath}/${endpoint_name}`,
						WebServer.Express.AuthenticationGate( endpoint.requires_login ),
						express_request_handler );
					endpoint_count++;
				}
				if ( endpoint.verbs.includes( 'delete' ) )
				{
					WebServer.Express.App.delete( `${ParentPath}/${endpoint_name}`,
						WebServer.Express.AuthenticationGate( endpoint.requires_login ),
						express_request_handler );
					endpoint_count++;
				}

			}

			return endpoint_count;
		};


		//---------------------------------------------------------------------
		function add_express_page_endpoints( Service, ParentPath )
		{
			// Add endpoints for this service.
			let endpoint_count = 0;
			let endpoint_names = Object.keys( Service.ServiceDefinition.Pages );
			for ( let endpoint_index = 0; endpoint_index < endpoint_names.length; endpoint_index++ )
			{
				let endpoint_name = endpoint_names[ endpoint_index ];
				let endpoint = Service.ServiceDefinition.Pages[ endpoint_name ];

				//---------------------------------------------------------------------
				// This is the actual request handler that services this endpoint.
				async function express_page_handler( request, response, next ) 
				{
					// Get the endpoint parameters.
					let parameters = get_express_request_parameters( request, endpoint );

					// Render the endpoint page.
					try
					{
						response.render( endpoint.view, {
							Server: Server,
							User: request.user,
							ItemDefinition: Service.ItemDefinition,
							ServiceDefinition: Service.ServiceDefinition,
							Parameters: parameters,
						} );
					}
					catch ( error )
					{
						let api_result = {
							ok: false,
							origin: `${Service.ServiceDefinition.name}/${endpoint_name}`,
							error: error.message,
						};
						Server.WebServer.ReportApiError( api_result, response );
						return;
					}
					return;
				}

				//---------------------------------------------------------------------
				// Add route for http get.
				WebServer.Express.App.get( `${ParentPath}/${endpoint_name}`,
					WebServer.Express.AuthenticationGate( endpoint.requires_login ),
					express_page_handler );
				endpoint_count++;

			}

			return endpoint_count;
		};


		//---------------------------------------------------------------------
		// Add service endpoints.
		let service_names = Object.keys( Server.Services );
		for ( let index = 0; index < service_names.length; index++ )
		{
			let service_name = service_names[ index ];
			let service = Server[ service_name ];

			let server_path = WebServer.Express.ServerPath();
			let services_path = WebServer.Express.ServicesPath();

			// Add the service API
			let endpoint_count = add_express_service_endpoints( service, `${services_path}${service.ServiceDefinition.name}` );
			Server.Log.trace( `Added ${endpoint_count} express routes for [${services_path}${service.ServiceDefinition.name}] functions.` );

			// Add the service pages
			let page_count = add_express_page_endpoints( service, `${server_path}${service.ServiceDefinition.name}` );
			Server.Log.trace( `Added ${page_count} express routes for [${server_path}${service.ServiceDefinition.name}] pages.` );
		}


		// Server.Endpoints.EachEndpoint( '',
		// 	( Server, Service, Endpoint ) =>
		// 	{
		// 	} );


		// //---------------------------------------------------------------------
		// function add_managed_list_page( Service, FunctionRoute )
		// {
		// 	express_router.get( `${ParentPath}/${Service.ServiceName}/${FunctionRoute}`,
		// 		( Service.ServiceDefinition.Endpoints[ FunctionRoute ].requires_login ? Server.WebServer.RequiresLogin : null ),
		// 		async function ( request, response, next ) 
		// 		{
		// 			log_request( request );
		// 			response.render(
		// 				'managed-list',
		// 				{
		// 					Server: Server, User: request.user,
		// 					ServiceDefinition: Service.ServiceDefinition,
		// 					ItemDefinition: Service.ItemDefinition,
		// 					FunctionRoute: FunctionRoute,
		// 				} );
		// 			return;
		// 		} );
		// }


		// //---------------------------------------------------------------------
		// function add_managed_object_page( Service, FunctionRoute )
		// {
		// 	express_router.get( `${ParentPath}/${Service.ServiceName}/${FunctionRoute}/:object_id`,
		// 		( Service.ServiceDefinition.Endpoints[ FunctionRoute ].requires_login ? Server.WebServer.RequiresLogin : null ),
		// 		async function ( request, response, next ) 
		// 		{
		// 			log_request( request );
		// 			response.render(
		// 				'managed-object',
		// 				{
		// 					Server: Server, User: request.user,
		// 					ServiceDefinition: Service.ServiceDefinition,
		// 					ItemDefinition: Service.ItemDefinition,
		// 					FunctionRoute: FunctionRoute,
		// 					ObjectID: request.params.object_id,
		// 				} );
		// 			return;
		// 		} );
		// }


		//---------------------------------------------------------------------
		return;
	};

