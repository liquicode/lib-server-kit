'use strict';


//---------------------------------------------------------------------
const LIB_MANAGED_STORAGE = require( '@liquicode/lib-managed-storage' );


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{
		if ( !Server ) { throw Server.Utility.missing_parameter_error( 'App' ); }

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
		service.ServiceDefinition.Name = 'Maths';
		service.ServiceDefinition.Title = 'Maths';

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.Add = {
			name: 'Add',
			description: 'Returns the sum of two numbers.',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'A', 'B' ],
			invoke: async function ( User, A, B ) { return ( A + B ); },
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.Subtract = {
			name: 'Subtract',
			description: 'Returns the difference of two numbers.',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'A', 'B' ],
			invoke: async function ( User, A, B ) { return ( A - B ); },
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.Multiply = {
			name: 'Multiply',
			description: 'Returns the product of two numbers.',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'A', 'B' ],
			invoke: async function ( User, A, B ) { return ( A * B ); },
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.Divide = {
			name: 'Divide',
			description: 'Returns the ratio of two numbers.',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'A', 'B' ],
			invoke: async function ( User, A, B ) { return ( A / B ); },
		};


		return service;
	};

