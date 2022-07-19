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
		function get_express_request_parameters( request, origin )
		{
			let parameters = [];
			for ( let parameter_index = 0; parameter_index < origin.parameters.length; parameter_index++ )
			{
				let parameter = origin.parameters[ parameter_index ];
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
						Server.Log.warn( `Undefined value for required parameter [${parameter.name}] in origin [${origin.name}].` );
					}
				}
				parameters.push( value );
			}
			return parameters;
		}


		//---------------------------------------------------------------------
		function add_service_origins( Service, ParentPath )
		{

			//---------------------------------------------------------------------
			// Add origins for this service.
			let origin_count = 0;
			let origin_names = Object.keys( Service.ServiceDefinition.Origins );
			for ( let origin_index = 0; origin_index < origin_names.length; origin_index++ )
			{
				let origin_key = origin_names[ origin_index ];
				let origin = Service.ServiceDefinition.Origins[ origin_key ];

				//---------------------------------------------------------------------
				// This is the actual request handler that services this origin.
				async function express_origin_handler( request, response, next ) 
				{
					// Get the origin parameters.
					let parameters = get_express_request_parameters( request, origin );

					// Invoke the origin function.
					// Wrap return values in a api_result object.
					let api_result = {
						ok: true,
						origin: `${Service.ServiceDefinition.name}/${origin.name}`,
					};
					try
					{
						api_result.result = await origin.invoke( request.user, ...parameters );
					}
					catch ( error )
					{
						api_result.ok = false;
						api_result.error = error.message;
						// Server.Log.error( `Error in [${api_result.origin}]: ${api_result.error}` );
					}
					finally
					{
						response.send( api_result );
					}
					// Return the api_result back to InvocationGate.
					return api_result;
				}

				//---------------------------------------------------------------------
				// Add routes for each http verb.
				if ( origin.verbs.includes( 'get' ) )
				{
					WebServer.Express.App.get( `${ParentPath}/${origin.name}`,
						WebServer.Express.AuthenticationGate( origin.requires_login ),
						WebServer.Express.AuthorizationGate( origin.allowed_roles ),
						WebServer.Express.InvocationGate( express_origin_handler ),
					);
					origin_count++;
				}
				if ( origin.verbs.includes( 'post' ) )
				{
					WebServer.Express.App.post( `${ParentPath}/${origin.name}`,
						WebServer.Express.AuthenticationGate( origin.requires_login ),
						WebServer.Express.AuthorizationGate( origin.allowed_roles ),
						WebServer.Express.InvocationGate( express_origin_handler ),
					);
					origin_count++;
				}
				if ( origin.verbs.includes( 'put' ) )
				{
					WebServer.Express.App.put( `${ParentPath}/${origin.name}`,
						WebServer.Express.AuthenticationGate( origin.requires_login ),
						WebServer.Express.AuthorizationGate( origin.allowed_roles ),
						WebServer.Express.InvocationGate( express_origin_handler ),
					);
					origin_count++;
				}
				if ( origin.verbs.includes( 'delete' ) )
				{
					WebServer.Express.App.delete( `${ParentPath}/${origin.name}`,
						WebServer.Express.AuthenticationGate( origin.requires_login ),
						WebServer.Express.AuthorizationGate( origin.allowed_roles ),
						WebServer.Express.InvocationGate( express_origin_handler ),
					);
					origin_count++;
				}

			}

			return origin_count;
		};


		//---------------------------------------------------------------------
		function add_service_pages( Service, ParentPath )
		{
			// Add origins for this service.
			let origin_count = 0;
			let origin_names = Object.keys( Service.ServiceDefinition.Pages );
			for ( let origin_index = 0; origin_index < origin_names.length; origin_index++ )
			{
				let origin_key = origin_names[ origin_index ];
				let origin = Service.ServiceDefinition.Pages[ origin_key ];

				//---------------------------------------------------------------------
				// This is the actual request handler that services this origin.
				async function express_page_handler( request, response, next ) 
				{
					// Get the origin parameters.
					let parameters = get_express_request_parameters( request, origin );

					// Render the origin page.
					// Wrap return values in a api_result object.
					let api_result = {
						ok: true,
						origin: `${Service.ServiceDefinition.name}/${origin.name}`,
					};
					try
					{
						response.render( origin.view, {
							Server: Server,
							User: request.user,
							ItemDefinition: Service.ItemDefinition,
							ServiceDefinition: Service.ServiceDefinition,
							Parameters: parameters,
						} );
						api_result.result = "OK";
					}
					catch ( error )
					{
						api_result.ok = false;
						api_result.error = error.message;
						// Server.Log.error( `Error in [${api_result.origin}]: ${api_result.error}` );
						response.send( api_result ); // Returning an error object to a page request!
					}
					// Return 'undefined' back to InvocationGate to avoid propagating the api_result.
					return;
				}

				//---------------------------------------------------------------------
				// Add route for http get.
				WebServer.Express.App.get( `${ParentPath}/${origin.name}`,
					WebServer.Express.AuthenticationGate( origin.requires_login ),
					WebServer.Express.AuthorizationGate( origin.allowed_roles ),
					WebServer.Express.InvocationGate( express_page_handler ),
				);
				origin_count++;

			}

			return origin_count;
		};


		//---------------------------------------------------------------------
		// Add service origins.
		let service_names = Object.keys( Server.Services );
		for ( let index = 0; index < service_names.length; index++ )
		{
			let service_name = service_names[ index ];
			let service = Server[ service_name ];

			let server_path = WebServer.Express.ServerPath();
			let services_path = WebServer.Express.ServicesPath();

			// Add the service API
			let origin_count = add_service_origins( service, `${services_path}${service.ServiceDefinition.name}` );
			Server.Log.trace( `Added ${origin_count} express routes for [${services_path}${service.ServiceDefinition.name}] functions.` );

			// Add the service pages
			let page_count = add_service_pages( service, `${server_path}${service.ServiceDefinition.name}` );
			Server.Log.trace( `Added ${page_count} express routes for [${server_path}${service.ServiceDefinition.name}] pages.` );
		}


		//---------------------------------------------------------------------
		return;
	};

