'use strict';


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{
		if ( !Server ) { throw Server.Utility.missing_parameter_error( 'Server' ); }

		// Create the storage service.
		let service = Server.NewService( Server );


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Service Configuration
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		// Create the default configuration.
		service.GetDefaults = function GetDefaults() { return {}; };


		//---------------------------------------------------------------------
		// Initialize this service.
		service.InitializeService = function InitializeService() { return; };


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Service Definition
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		// Service Identity
		service.ServiceDefinition.name = 'Maths';
		service.ServiceDefinition.title = 'Maths';

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.Add = {
			name: 'Add',
			description: 'Returns the sum of two numbers. (A + B)',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'get', 'post' ],
			parameters: [
				{
					name: 'A',
					description: 'The first value in the operation.',
					schema: { type: 'number' },
					example: 3.14,
				},
				{
					name: 'B',
					description: 'The second value in the operation.',
					schema: { type: 'number' },
					example: 2.718,
				},
			],
			invoke: async function ( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A + B );
			},
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.Subtract = {
			name: 'Subtract',
			description: 'Returns the difference of two numbers. (A - B)',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'get', 'post' ],
			parameters: [
				{
					name: 'A',
					description: 'The first value in the operation.',
					schema: { type: 'number' },
					example: 3.14,
				},
				{
					name: 'B',
					description: 'The second value in the operation.',
					schema: { type: 'number' },
					example: 2.718,
				},
			],
			invoke: async function ( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A - B );
			},
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.Multiply = {
			name: 'Multiply',
			description: 'Returns the product of two numbers. (A * B)',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'get', 'post' ],
			parameters: [
				{
					name: 'A',
					description: 'The first value in the operation.',
					schema: { type: 'number' },
					example: 3.14,
				},
				{
					name: 'B',
					description: 'The second value in the operation.',
					schema: { type: 'number' },
					example: 2.718,
				},
			],
			invoke: async function ( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A * B );
			},
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.Divide = {
			name: 'Divide',
			description: 'Returns the ratio of two numbers. (A / B)',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'get', 'post' ],
			parameters: [
				{
					name: 'A',
					description: 'The first value in the operation.',
					schema: { type: 'number' },
					example: 3.14,
				},
				{
					name: 'B',
					description: 'The second value in the operation.',
					schema: { type: 'number' },
					example: 2.718,
				},
			],
			invoke: async function ( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A / B );
			},
		};


		return service;
	};

