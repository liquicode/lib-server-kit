'use strict';


//---------------------------------------------------------------------
const LIB_MANAGED_STORAGE = require( '@liquicode/lib-managed-storage' );


//---------------------------------------------------------------------
exports.NewStorageService =
	function NewStorageService( Server )
	{
		if ( !Server ) { throw Server.Utility.missing_parameter_error( 'App' ); }


		//---------------------------------------------------------------------
		// The Storage Service.
		let service = Server.NewService( Server );


		//---------------------------------------------------------------------
		// Storage object which holds a managed storage from LIB_MANAGED_STORAGE.
		service.storage = null;


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Service Configuration
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		// Create the default configuration.
		service.GetDefaults =
			function GetDefaults()
			{
				let config = LIB_MANAGED_STORAGE.DefaultConfiguration();
				return config;
			};


		//---------------------------------------------------------------------
		// Initialize trhe service.
		service.InitializeService =
			function InitializeService()
			{
				service.storage = LIB_MANAGED_STORAGE.NewManagedStorage( service.Settings );
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Storage Functions
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------

		//---------------------------------------------------------------------
		service.StorageCount = async function ( User, Criteria ) { return await service.storage.Count( User, Criteria ); };

		//---------------------------------------------------------------------
		service.StorageFindOne = async function ( User, Criteria ) { return await service.storage.FindOne( User, Criteria ); };

		//---------------------------------------------------------------------
		service.StorageFindMany = async function ( User, Criteria ) { return await service.storage.FindMany( User, Criteria ); };

		//---------------------------------------------------------------------
		service.StorageCreateOne =
			async function ( User, Prototype )
			{
				let data_object = service.NewServiceObject( Prototype );
				return await service.storage.CreateOne( User, data_object );
			};

		//---------------------------------------------------------------------
		service.StorageWriteOne = async function ( User, Criteria, DataObject ) { return await service.storage.WriteOne( User, Criteria, DataObject ); };

		//---------------------------------------------------------------------
		service.StorageDeleteOne = async function ( User, Criteria ) { return await service.storage.DeleteOne( User, Criteria ); };

		//---------------------------------------------------------------------
		service.StorageDeleteMany = async function ( User, Criteria ) { return await service.storage.DeleteMany( User, Criteria ); };

		//---------------------------------------------------------------------
		service.StorageShare = async function ( User, Criteria, Readers, Writers, MakePublic ) { return await service.storage.Share( User, Criteria, Readers, Writers, MakePublic ); };

		//---------------------------------------------------------------------
		service.StorageUnshare = async function ( User, Criteria, NotReaders, NotWriters, MakeUnpublic ) { return await service.storage.Unshare( User, Criteria, NotReaders, NotWriters, MakeUnpublic ); };

		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Service Definition
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		// Service Identity
		service.ServiceDefinition.Name = 'UnnamedStorage';
		service.ServiceDefinition.Title = 'Unnamed Storage';

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.Count = {
			name: 'Count',
			description: 'Returns the number of objects matching the given Criteria.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'Criteria' ],
			invoke: async function ( User, Criteria ) { return await service.StorageCount( User, Criteria ); },
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.FindOne = {
			name: 'FindOne',
			description: 'Returns the first object matching the given Criteria.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'Criteria' ],
			invoke: async function ( User, Criteria ) { return await service.StorageFindOne( User, Criteria ); },
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.FindMany = {
			name: 'FindMany',
			description: 'Returns an array of all objects matching the given Criteria.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'Criteria' ],
			invoke: async function ( User, Criteria ) { return await service.StorageFindMany( User, Criteria ); },
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.CreateOne = {
			name: 'CreateOne',
			description: 'Creates and stores a new object based upon the given Prototype; Returns the stored object.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'Prototype' ],
			invoke: async function ( User, Prototype ) { return await service.StorageCreateOne( User, Prototype ); },
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.WriteOne = {
			name: 'WriteOne',
			description: 'Overwrites values from DataObject to the first object matching the given Criteria; Returns the number of objects updated.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'Criteria', 'DataObject' ],
			invoke: async function ( User, Criteria, DataObject ) { return await service.StorageWriteOne( User, Criteria, DataObject ); },
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.DeleteOne = {
			name: 'DeleteOne',
			description: 'Deletes the first object matching the given Criteria; Returns the number of objects deleted.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'Criteria' ],
			invoke: async function ( User, Criteria ) { return await service.StorageDeleteOne( User, Criteria ); },
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.DeleteMany = {
			name: 'DeleteMany',
			description: 'Deletes all objects matching the given Criteria; Returns the number of objects deleted.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'Criteria' ],
			invoke: async function ( User, Criteria ) { return await service.StorageDeleteMany( User, Criteria ); },
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.Share = {
			name: 'Share',
			description: 'Shares all objects matching the given Criteria. Returns the number of objects shared.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'Criteria', 'Readers', 'Writers', 'MakePublic' ],
			invoke: async function ( User, Criteria, Readers, Writers, MakePublic ) { return await StorageShare( User, Criteria, Readers, Writers, MakePublic ); },
		};

		//---------------------------------------------------------------------
		service.ServiceDefinition.Endpoints.Unshare = {
			name: 'Unshare',
			description: 'Unshares all objects matching the given Criteria. Returns the number of objects unshared.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			http_verbs: [ 'get', 'post' ],
			parameters: [ 'Criteria', 'NotReaders', 'NotWriters', 'MakeUnpublic' ],
			invoke: async function ( User, Criteria, NotReaders, NotWriters, MakeUnpublic ) { return await service.StorageUnshare( User, Criteria, NotReaders, NotWriters, MakeUnpublic ); },
		};


		//---------------------------------------------------------------------
		// Return the Storage Service.
		//---------------------------------------------------------------------


		return service;
	};


