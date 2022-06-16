'use strict';


//---------------------------------------------------------------------
exports.NewService =
	function NewService( Server )
	{
		if ( !Server ) { throw Server.Utility.missing_parameter_error( 'App' ); }


		//---------------------------------------------------------------------
		// The Service object.
		let service = Server.NewModule();


		//---------------------------------------------------------------------
		// *** Implemented by the service.
		service.InitializeService = function () { return; };


		//---------------------------------------------------------------------
		// *** Implemented by the service.
		// The ServiceDefinition describes the service and its endpoints.
		// ServiceDefinition contains all of the information necessary to perform the following:
		// - Endpoint Authorization: Each endpoint can be restricted to users of certain user_role.
		// - Service Interface Generation: Adapters can be developed to provide endpoint access to web-services, command-line, etc.
		// - User Interface Generation: User interfaces can display user-friendly titles and descriptions.
		service.ServiceDefinition = {
			Name: 'UnnamedService',
			Title: 'Unnamed Service',
			Endpoints: {
				// Count: {
				// 	name: 'Count',
				//  description: 'Returns the number of objects matching the given Criteria.',
				// 	requires_login: true,
				// 	allowed_roles: [ 'admin', 'super', 'user' ],
				// 	http_verbs: [ 'get', 'post' ],
				// 	parameters: [ 'Criteria' ],
				// 	invoke: async function ( User, Criteria ) { return await service.storage.Count( User, Criteria ); },
				// },
			},
		};


		//---------------------------------------------------------------------
		// *** Implemented by the service.
		// The ObjectDefinition describes the service object and its fields.
		// ObjectDefinition contains all of the information necessary to perform the following:
		// - Storage Consistency: Objects stored in persistent storage can be assured to have the same fields.
		// - User Interface Generation: User interfaces can display user-friendly titles and descriptions.
		service.ObjectDefinition = {
			Name: 'GenericObject',
			Title: 'Generic Object',
			Titles: 'Generic Objects',
			Fields: {
				// ObjectName: {
				// 	name: 'object_name',
				// 	title: 'Object Name',
				// 	description: 'A name for this object.',
				// 	type: 'string',
				// },
			},
		};


		//---------------------------------------------------------------------
		// Creates a new object based upon the service's ObjectDefinition.
		service.NewServiceObject =
			function () 
			{
				let service_object = {};
				let field_names = Object.keys( service.ObjectDefinition.Fields );
				for ( let field_index = 0; field_index < field_names.length; field_index++ )
				{
					let field_name = field_names[ field_index ];
					let field = service.ObjectDefinition.Fields[ field_name ];
					service_object[ field.name ] = null;
					if ( field.type === 'string' ) { service_object[ field.name ] = ''; }
					else if ( field.type === 'number' ) { service_object[ field.name ] = 0; }
					else if ( field.type === 'array' ) { service_object[ field.name ] = []; }
					else if ( field.type === 'object' ) { service_object[ field.name ] = {}; }
					else if ( field.type === 'date' ) { service_object[ field.name ] = ''; }
					else if ( field.type === 'url' ) { service_object[ field.name ] = ''; }
					else if ( field.type === 'image_url' ) { service_object[ field.name ] = ''; }
				}
				return service_object;
			};


		// //---------------------------------------------------------------------
		// // Called by WebServer
		// service.AddServiceEndpoints =
		// 	function AddServiceEndpoints( Router, ParentPath )
		// 	{
		// 		// Add endpoints for a service.
		// 		let endpoint_names = Object.keys( service.ServiceEndpoints );
		// 		for ( let endpoint_index = 0; endpoint_index < endpoint_names.length; endpoint_index++ )
		// 		{
		// 			let endpoint_name = endpoint_names[ endpoint_index ];
		// 			let endpoint = service.ServiceEndpoints[ endpoint_name ];

		// 			// This is the actual request handler that services this endpoint.
		// 			async function request_handler( request, response, next ) 
		// 			{
		// 				let method = request.method.toLowerCase();
		// 				// Get the request parameters.
		// 				let parameters = [];
		// 				for ( let parameter_index = 0; parameter_index < endpoint.params; parameter_index++ )
		// 				{
		// 					let parameter_name = endpoint.params[ parameter_index ];
		// 					let value = request.params[ parameter_name ];
		// 					if ( typeof value === 'undefined' )
		// 					{
		// 						value = request.body[ parameter_name ];
		// 					}
		// 					if ( typeof value === 'undefined' )
		// 					{
		// 						value = null;
		// 					}
		// 					// let value = null;
		// 					// if ( method === 'get' )
		// 					// {
		// 					// 	value = request.params[ parameter_name ];
		// 					// }
		// 					// else if ( method === 'post' )
		// 					// {
		// 					// 	value = request.body[ parameter_name ];
		// 					// }
		// 					parameters.push( value );
		// 				}
		// 				// Invoke the requested function.
		// 				try
		// 				{
		// 					let api_result = {
		// 						ok: true,
		// 						origin: `${service.ServiceName}/${endpoint.name}`,
		// 						result: await endpoint.invoke( request.user, ...parameters ),
		// 					};
		// 					response.send( api_result );
		// 				}
		// 				catch ( error )
		// 				{
		// 					let api_result = {
		// 						ok: false,
		// 						origin: `${service.ServiceName}/${endpoint.name}`,
		// 						error: error.message,
		// 					};
		// 					App.WebServer.ReportApiError( api_result, response );
		// 					return;
		// 				}
		// 				return;
		// 			}

		// 			// Configure endpoints for each http verb.
		// 			if ( endpoint.http_verbs.includes( 'get' ) )
		// 			{
		// 				Router.get( `${ParentPath}/${endpoint.name}`,
		// 					( endpoint.requires_login ? App.WebServer.RequiresLogin : null ),
		// 					request_handler );
		// 			}
		// 			if ( endpoint.http_verbs.includes( 'post' ) )
		// 			{
		// 				Router.post( `${ParentPath}/${endpoint.name}`,
		// 					( endpoint.requires_login ? App.WebServer.RequiresLogin : null ),
		// 					request_handler );
		// 			}

		// 		}

		// 		return;
		// 	};


		//---------------------------------------------------------------------
		// Return the Managed Service.
		//---------------------------------------------------------------------


		return service;
	};

