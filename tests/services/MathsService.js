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
		//	Service Functions
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		service.Add =
			async function Add( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A + B );
			};


		//---------------------------------------------------------------------
		service.Subtract =
			async function Subtract( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A - B );
			};


		//---------------------------------------------------------------------
		service.Multiply =
			async function Multiply( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A * B );
			};


		//---------------------------------------------------------------------
		service.Divide =
			async function Divide( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A / B );
			};


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
		service.ServiceDefinition.Origins.Add = {
			name: 'Add',
			description: 'Returns the sum of two numbers.',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'get', 'post' ],
			parameters: [ 'A', 'B' ],
			invoke: service.Add,
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.Subtract = {
			name: 'Subtract',
			description: 'Returns the difference of two numbers.',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'get', 'post' ],
			parameters: [ 'A', 'B' ],
			invoke: service.Subtract,
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.Multiply = {
			name: 'Multiply',
			description: 'Returns the product of two numbers.',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'get', 'post' ],
			parameters: [ 'A', 'B' ],
			invoke: service.Multiply,
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.Divide = {
			name: 'Divide',
			description: 'Returns the ratio of two numbers.',
			requires_login: false,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'get', 'post' ],
			parameters: [ 'A', 'B' ],
			invoke: service.Divide,
		};


		return service;
	};

