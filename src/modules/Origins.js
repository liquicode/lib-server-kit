'use strict';


//=====================================================================
//=====================================================================
//
//		Origins
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
		_module.EachOrigin =
			function EachOrigin( ServiceName, Enumerator )
			{
				// Enumerate the services.
				let service_names = Object.keys( Server.Services );
				for ( let service_index = 0; service_index < service_names.length; service_index++ )
				{
					// Use a service.
					let service_name = service_names[ service_index ];
					if ( ServiceName && ( ServiceName !== service_name ) ) { continue; }
					let service = Server[ service_name ];
					// Enumerate the origins.
					let origin_count = 0;
					let origin_names = Object.keys( service.ServiceDefinition.Pages );
					for ( let origin_index = 0; origin_index < origin_names.length; origin_index++ )
					{
						// Use an origin.
						let origin_name = origin_names[ origin_index ];
						let origin = service.ServiceDefinition.Pages[ origin_name ];
						Enumerator( Server, service, origin );
					}
				}
				return;
			};


		//---------------------------------------------------------------------
		return _module;
	};

