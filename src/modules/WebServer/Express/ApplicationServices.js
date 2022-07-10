'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Express Application Services (Functions and Pages)
//
//=====================================================================
//=====================================================================


exports.Use =
	function Use( Server, WebServer, ExpressTransport, WebServerSettings )
	{


		//---------------------------------------------------------------------
		function get_request_parameters( request, endpoint )
		{
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
				parameters.push( value );
			}
			return parameters;
		}


		//---------------------------------------------------------------------
		function add_http_service_endpoints( Service, ParentPath )
		{
			// Add endpoints for this service.
			let endpoint_count = 0;
			let endpoint_names = Object.keys( Service.ServiceDefinition.Endpoints );
			for ( let endpoint_index = 0; endpoint_index < endpoint_names.length; endpoint_index++ )
			{
				let endpoint_name = endpoint_names[ endpoint_index ];
				let endpoint = Service.ServiceDefinition.Endpoints[ endpoint_name ];

				// This is the actual request handler that services this endpoint.
				async function http_service_handler( request, response, next ) 
				{
					// Get the endpoint parameters.
					let parameters = get_request_parameters( request, endpoint );

					// Invoke the endpoint function.
					// Wrap return values in a api_result object.
					try
					{
						let api_result = {
							ok: true,
							origin: `${Service.ServiceDefinition.name}/${endpoint.name}`,
							result: await endpoint.invoke( request.user, ...parameters ),
						};
						response.send( api_result );
					}
					catch ( error )
					{
						let api_result = {
							ok: false,
							origin: `${Service.ServiceDefinition.name}/${endpoint.name}`,
							error: error.message,
						};
						Server.WebServer.ReportApiError( api_result, response );
						return;
					}
					return;
				}

				// Add endpoints for each http verb.
				if ( endpoint.verbs.includes( 'get' ) )
				{
					ExpressTransport.get( `${ParentPath}/${endpoint.name}`,
						// ( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
						WebServer.AuthenticationGate( WebServerSettings, endpoint.requires_login ),
						http_service_handler );
					endpoint_count++;
				}
				if ( endpoint.verbs.includes( 'post' ) )
				{
					ExpressTransport.post( `${ParentPath}/${endpoint.name}`,
						// ( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
						WebServer.AuthenticationGate( WebServerSettings, endpoint.requires_login ),
						http_service_handler );
					endpoint_count++;
				}
				if ( endpoint.verbs.includes( 'put' ) )
				{
					ExpressTransport.put( `${ParentPath}/${endpoint.name}`,
						// ( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
						WebServer.AuthenticationGate( WebServerSettings, endpoint.requires_login ),
						http_service_handler );
					endpoint_count++;
				}
				if ( endpoint.verbs.includes( 'delete' ) )
				{
					ExpressTransport.delete( `${ParentPath}/${endpoint.name}`,
						// ( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
						WebServer.AuthenticationGate( WebServerSettings, endpoint.requires_login ),
						http_service_handler );
					endpoint_count++;
				}

			}

			return endpoint_count;
		};


		//---------------------------------------------------------------------
		function add_http_page_endpoints( Service, ParentPath )
		{
			// Add endpoints for this service.
			let endpoint_count = 0;
			let endpoint_names = Object.keys( Service.ServiceDefinition.Pages );
			for ( let endpoint_index = 0; endpoint_index < endpoint_names.length; endpoint_index++ )
			{
				let endpoint_name = endpoint_names[ endpoint_index ];
				let endpoint = Service.ServiceDefinition.Pages[ endpoint_name ];

				// This is the actual request handler that services this endpoint.
				async function http_page_handler( request, response, next ) 
				{
					// Get the endpoint parameters.
					let parameters = get_request_parameters( request, endpoint );

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
							origin: `${Service.ServiceDefinition.name}/${endpoint.name}`,
							error: error.message,
						};
						Server.WebServer.ReportApiError( api_result, response );
						return;
					}
					return;
				}

				// Add endpoints for each http verb.
				if ( endpoint.verbs.includes( 'get' ) )
				{
					ExpressTransport.get( `${ParentPath}/${endpoint.name}`,
						// ( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
						WebServer.AuthenticationGate( WebServerSettings, endpoint.requires_login ),
						http_page_handler );
					endpoint_count++;
				}
				if ( endpoint.verbs.includes( 'post' ) )
				{
					ExpressTransport.post( `${ParentPath}/${endpoint.name}`,
						// ( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
						WebServer.AuthenticationGate( WebServerSettings, endpoint.requires_login ),
						http_page_handler );
					endpoint_count++;
				}
				if ( endpoint.verbs.includes( 'put' ) )
				{
					ExpressTransport.put( `${ParentPath}/${endpoint.name}`,
						// ( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
						WebServer.AuthenticationGate( WebServerSettings, endpoint.requires_login ),
						http_page_handler );
					endpoint_count++;
				}
				if ( endpoint.verbs.includes( 'delete' ) )
				{
					ExpressTransport.delete( `${ParentPath}/${endpoint.name}`,
						// ( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
						WebServer.AuthenticationGate( WebServerSettings, endpoint.requires_login ),
						http_page_handler );
					endpoint_count++;
				}

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

			// Add the service API
			let endpoint_count = add_http_service_endpoints( service, `/api/${service.ServiceDefinition.name}` );
			Server.Log.trace( `Added ${endpoint_count} http routes for [/api/${service.ServiceDefinition.name}] functions.` );

			// Add the service pages
			let page_count = add_http_page_endpoints( service, `/ui/${service.ServiceDefinition.name}` );
			Server.Log.trace( `Added ${page_count} http routes for [/ui/${service.ServiceDefinition.name}] pages.` );
		}


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

