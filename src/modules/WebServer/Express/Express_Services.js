'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Express Application Services (Functions and Pages)
//
//=====================================================================
//=====================================================================


exports.Express_Services =
	function Express_Services( CTX )
	{


		//=====================================================================
		//=====================================================================
		//
		//		Initialize
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// Add service origins.
		let service_names = Object.keys( CTX.Server.Services );
		for ( let index = 0; index < service_names.length; index++ )
		{
			let service_name = service_names[ index ];
			let service = CTX.Server[ service_name ];

			let server_path = CTX.WebServer.Express.ServerPath();
			let services_path = CTX.WebServer.Express.ServicesPath();

			// Add the service origins
			let origin_count = add_service_origins( service, `${services_path}${service.ServiceDefinition.name}` );
			CTX.Server.Log.trace( `Added ${origin_count} Origins for service [${services_path}${service.ServiceDefinition.name}].` );

			// Add the service pages
			let page_count = add_service_pages( service, `${server_path}${service.ServiceDefinition.name}` );
			CTX.Server.Log.trace( `Added ${page_count} Pages for service [${server_path}${service.ServiceDefinition.name}].` );
		}


		//=====================================================================
		//=====================================================================
		//
		//		Service Origins
		//
		//=====================================================================
		//=====================================================================


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
					// let parameters = get_express_request_parameters( request, origin );
					let parameters = request.origin_parameters;

					// Invoke the origin function.
					// Wrap return values in a api_result object.
					let api_result = {
						ok: true,
						origin: `${Service.ServiceDefinition.name}/${origin.name}`,
					};
					try
					{
						// Convert parameters to an array of values.
						let parameter_values = [];
						for ( let parameter_index = 0; parameter_index < origin.parameters.length; parameter_index++ )
						{
							let parameter = origin.parameters[ parameter_index ];
							parameter_values.push( parameters[ parameter.name ] );
						}
						// Invoke the origin function. (finally!)
						api_result.result = await origin.invoke( request.user, ...parameter_values );
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
					CTX.WebServer.Express.App.get( `${ParentPath}/${origin.name}`,
						CTX.WebServer.Express.AuthenticationGate( origin.requires_login ),
						CTX.WebServer.Express.AuthorizationGate( origin.allowed_roles ),
						CTX.WebServer.Express.InvocationGate( Service, origin, express_origin_handler ),
					);
					origin_count++;
				}
				if ( origin.verbs.includes( 'post' ) )
				{
					CTX.WebServer.Express.App.post( `${ParentPath}/${origin.name}`,
						CTX.WebServer.Express.AuthenticationGate( origin.requires_login ),
						CTX.WebServer.Express.AuthorizationGate( origin.allowed_roles ),
						CTX.WebServer.Express.InvocationGate( Service, origin, express_origin_handler ),
					);
					origin_count++;
				}
				if ( origin.verbs.includes( 'put' ) )
				{
					CTX.WebServer.Express.App.put( `${ParentPath}/${origin.name}`,
						CTX.WebServer.Express.AuthenticationGate( origin.requires_login ),
						CTX.WebServer.Express.AuthorizationGate( origin.allowed_roles ),
						CTX.WebServer.Express.InvocationGate( Service, origin, express_origin_handler ),
					);
					origin_count++;
				}
				if ( origin.verbs.includes( 'delete' ) )
				{
					CTX.WebServer.Express.App.delete( `${ParentPath}/${origin.name}`,
						CTX.WebServer.Express.AuthenticationGate( origin.requires_login ),
						CTX.WebServer.Express.AuthorizationGate( origin.allowed_roles ),
						CTX.WebServer.Express.InvocationGate( Service, origin, express_origin_handler ),
					);
					origin_count++;
				}

			}

			return origin_count;
		};


		//=====================================================================
		//=====================================================================
		//
		//		Service Pages
		//
		//=====================================================================
		//=====================================================================


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
					// let parameters = get_express_request_parameters( request, origin );
					let parameters = request.origin_parameters;

					// Render the origin page.
					// Wrap return values in a api_result object.
					let api_result = {
						ok: true,
						origin: `${Service.ServiceDefinition.name}/${origin.name}`,
					};
					try
					{
						response.render( origin.view, {
							Server: CTX.Server,
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
						response.send( api_result ); // Returning an error object to a page request! Should we redirect to a special error page?
					}
					// Return 'undefined' back to InvocationGate to avoid propagating the api_result.
					return;
				}

				//---------------------------------------------------------------------
				// Add route for http get.
				CTX.WebServer.Express.App.get( `${ParentPath}/${origin.name}`,
					CTX.WebServer.Express.AuthenticationGate( origin.requires_login ),
					CTX.WebServer.Express.AuthorizationGate( origin.allowed_roles ),
					CTX.WebServer.Express.InvocationGate( Service, origin, express_page_handler ),
				);
				origin_count++;

			}

			return origin_count;
		};


		//---------------------------------------------------------------------
		return;
	};

