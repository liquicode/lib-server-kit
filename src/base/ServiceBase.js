'use strict';


//---------------------------------------------------------------------
exports.NewService =
	function NewService( Server )
	{
		if ( !Server ) { throw Server.Utility.missing_parameter_error( 'Server' ); }


		//---------------------------------------------------------------------
		// The Service object.
		let service = Server.NewModule();


		//---------------------------------------------------------------------
		// *** Implemented by the service.
		service.InitializeService = function () { return; };


		//---------------------------------------------------------------------
		// *** Implemented by the service.
		// The ServiceDefinition describes the service and its origins.
		// ServiceDefinition contains all of the information necessary to perform the following:
		// - Origin Authorization: Each origin can be restricted to users of certain user_role.
		// - Service Interface Generation: Adapters can be developed to provide origin access to web-services, command-line, etc.
		// - User Interface Generation: User interfaces can display user-friendly titles and descriptions.
		service.ServiceDefinition = {
			name: 'UnnamedService',
			title: 'Unnamed Service',
			Origins: {
				// Count: {
				// 	name: 'Count',
				// 	description: 'Returns the number of objects matching the given Criteria.',
				// 	requires_login: true,
				// 	allowed_roles: [ 'admin', 'super', 'user' ],
				// 	verbs: [ 'get', 'post' ],
				// 	parameters: [
				// 		{
				// 			name: 'Criteria',
				// 			schema: { type: 'object' },
				// 			required: false,
				// 		},
				// 	],
				// 	invoke: async function ( User, Criteria ) { return await service.storage.Count( User, Criteria ); },
				// },
			},
			Pages: {
				// ShowThing: {
				// 	name: 'Show',
				// 	view: 'Show',
				// 	description: 'Shows detail for a service object.',
				// 	requires_login: true,
				// 	allowed_roles: [ 'admin', 'super', 'user' ],
				// 	invoke:
				// 		async function ( Server, request, response, next ) 
				// 		{
				// 			let thing = await service.GetThing( request.params );
				// 			response.render( '/show-thing', { Server: Server, User: request.user, Thing: thing } );
				// 		},
				// },
			},
		};


		//---------------------------------------------------------------------
		// *** Implemented by the service.
		// The ItemDefinition describes the service object and its fields.
		// ItemDefinition contains all of the information necessary to perform the following:
		// - Storage Consistency: Objects stored in persistent storage can be assured to have the same fields.
		// - User Interface Generation: User interfaces can display user-friendly titles and descriptions.
		service.ItemDefinition = {
			name: 'GenericObject',
			title: 'Generic Object',
			titles: 'Generic Objects',
			shareable: true,
			Fields: {
				// ObjectName: {
				// 	name: 'object_name',
				// 	title: 'Object Name',
				// 	description: 'A name for this object.',
				// 	schema: {
				// 		type: 'string',
				// 		format: 'text',
				// 	},
				// 	readonly: false,
				// },
			},
		};


		//---------------------------------------------------------------------
		// Creates a new object based upon the service's ItemDefinition.
		service.NewServiceObject =
			function ( Prototype ) 
			{
				let service_object = {};
				if ( Prototype ) { service_object = Server.Utility.clone( Prototype ); }
				let field_names = Object.keys( service.ItemDefinition.Fields );
				for ( let field_index = 0; field_index < field_names.length; field_index++ )
				{
					let field_name = field_names[ field_index ];
					let field = service.ItemDefinition.Fields[ field_name ];
					if ( typeof service_object[ field.name ] === 'undefined' )
					{
						service_object[ field.name ] = null;
						if ( field.schema )
						{
							if ( field.schema.type === 'boolean' ) { service_object[ field.name ] = false; }
							else if ( field.schema.type === 'integer' ) { service_object[ field.name ] = 0; }
							else if ( field.schema.type === 'number' ) { service_object[ field.name ] = 0.0; }
							else if ( field.schema.type === 'string' ) { service_object[ field.name ] = ''; }
							else if ( field.schema.type === 'array' ) { service_object[ field.name ] = []; }
							else if ( field.schema.type === 'object' ) { service_object[ field.name ] = {}; }
						}
					}
				}
				return service_object;
			};


		//---------------------------------------------------------------------
		// Return the Managed Service.
		//---------------------------------------------------------------------


		return service;
	};

