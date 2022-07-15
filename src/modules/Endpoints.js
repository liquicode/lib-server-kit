'use strict';


//=====================================================================
//=====================================================================
//
//		Endpoints
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const SRC_MODULE_BASE = require( '../base/ModuleBase.js' );

//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{
		let _module = SRC_MODULE_BASE.NewModule();


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Module Configuration
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		_module.GetDefaults =
			function GetDefaults() 
			{
				let defaults = {};
				return defaults;
			};


		//---------------------------------------------------------------------
		_module.Initialize =
			function Initialize()
			{
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Module Functions
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		_module.EachEndpoint =
			function EachEndpoint( ServiceName, Enumerator )
			{
				// Enumerate the services.
				let service_names = Object.keys( Server.Services );
				for ( let service_index = 0; service_index < service_names.length; service_index++ )
				{
					// Use a service.
					let service_name = service_names[ service_index ];
					if ( ServiceName && ( ServiceName !== service_name ) ) { continue; }
					let service = Server[ service_name ];
					// Enumerate the endpoints.
					let endpoint_count = 0;
					let endpoint_names = Object.keys( service.ServiceDefinition.Pages );
					for ( let endpoint_index = 0; endpoint_index < endpoint_names.length; endpoint_index++ )
					{
						// Use an endpoint.
						let endpoint_name = endpoint_names[ endpoint_index ];
						let endpoint = service.ServiceDefinition.Pages[ endpoint_name ];
						Enumerator( Server, service, endpoint );
					}
				}
				return;
			};


		//---------------------------------------------------------------------
		return _module;
	};

