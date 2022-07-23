'use strict';


//---------------------------------------------------------------------
const LIB_USER_STORAGE = require( '@liquicode/lib-user-storage' );


//---------------------------------------------------------------------
exports.NewStorageService =
	function NewStorageService( Server )
	{
		if ( !Server ) { throw Server.Utility.missing_parameter_error( 'App' ); }


		//---------------------------------------------------------------------
		// The Storage Service.
		let service = Server.NewService( Server );


		//---------------------------------------------------------------------
		// Storage object which holds a managed storage from LIB_USER_STORAGE.
		service.Storage = null;


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
				return service.GetStorageDefaults();
			};


		//---------------------------------------------------------------------
		// Initialize the service.
		service.InitializeService =
			function InitializeService()
			{
				service.InitializeStorage();
				return;
			};


		//---------------------------------------------------------------------
		// Create the storage default configuration.
		service.GetStorageDefaults =
			function GetStorageDefaults()
			{
				return LIB_USER_STORAGE.DefaultConfiguration();
			};


		//---------------------------------------------------------------------
		// Initialize the storage.
		service.InitializeStorage =
			function InitializeStorage( Settings )
			{
				service.Storage = LIB_USER_STORAGE.NewUserStorage( Settings );
				return;
			};



		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Service Functions
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------

		//---------------------------------------------------------------------
		service.StorageCount =
			async function ( User, Criteria )
			{
				return await service.Storage.Count( User, Criteria );
			};

		//---------------------------------------------------------------------
		service.StorageFindOne =
			async function ( User, Criteria )
			{
				return await service.Storage.FindOne( User, Criteria );
			};

		//---------------------------------------------------------------------
		service.StorageFindMany =
			async function ( User, Criteria ) 
			{
				return await service.Storage.FindMany( User, Criteria );
			};

		//---------------------------------------------------------------------
		service.StorageCreateOne =
			async function ( User, Prototype )
			{
				let data_object = service.NewServiceItem( Prototype );
				return await service.Storage.CreateOne( User, data_object );
			};

		//---------------------------------------------------------------------
		service.StorageWriteOne =
			async function ( User, Criteria, DataObject ) 
			{
				return await service.Storage.WriteOne( User, Criteria, DataObject );
			};

		//---------------------------------------------------------------------
		service.StorageDeleteOne =
			async function ( User, Criteria )
			{
				return await service.Storage.DeleteOne( User, Criteria );
			};

		//---------------------------------------------------------------------
		service.StorageDeleteMany =
			async function ( User, Criteria )
			{
				return await service.Storage.DeleteMany( User, Criteria );
			};

		//---------------------------------------------------------------------
		service.StorageShare =
			async function ( User, Criteria, Readers, Writers, MakePublic )
			{
				return await service.Storage.Share( User, Criteria, Readers, Writers, MakePublic );
			};

		//---------------------------------------------------------------------
		service.StorageUnshare =
			async function ( User, Criteria, NotReaders, NotWriters, MakeUnpublic ) 
			{
				return await service.Storage.Unshare( User, Criteria, NotReaders, NotWriters, MakeUnpublic );
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
		service.ServiceDefinition.name = 'UnnamedStorage';
		service.ServiceDefinition.title = 'Unnamed Storage';


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Service Origins
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.StorageCount = {
			name: 'StorageCount',
			description: 'Returns the number of objects matching the given Criteria.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'call', 'get', 'post' ],
			parameters: [
				{
					name: 'Criteria',
					description: 'Criteria of objects to count.',
					schema: { type: 'object' },
					example: { foo: 'bar' },
				},
			],
			invoke: service.StorageCount,
		};


		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.StorageFindOne = {
			name: 'StorageFindOne',
			description: 'Returns the first object matching the given Criteria.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'call', 'get', 'post' ],
			parameters: [
				{
					name: 'Criteria',
					description: 'Criteria of objects to find.',
					schema: { type: 'object' },
					example: { foo: 'bar' },
				},
			],
			invoke: service.StorageFindOne,
		};


		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.StorageFindMany = {
			name: 'StorageFindMany',
			description: 'Returns an array of all objects matching the given Criteria.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'call', 'get', 'post' ],
			parameters: [
				{
					name: 'Criteria',
					description: 'Criteria of objects to find.',
					schema: { type: 'object' },
					example: { foo: 'bar' },
				},
			],
			invoke: service.StorageFindMany,
		};


		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.StorageCreateOne = {
			name: 'StorageCreateOne',
			description: 'Creates and stores a new object based upon the given Prototype; Returns the stored object.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'call', 'get', 'post' ],
			parameters: [
				{
					name: 'Prototype',
					description: 'The prototype (initial values) of the object to create.',
					schema: { type: 'object' },
					example: { foo: 'bar' },
				},
			],
			invoke: service.StorageCreateOne,
		};


		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.StorageWriteOne = {
			name: 'StorageWriteOne',
			description: 'Overwrites values from DataObject to the first object matching the given Criteria; Returns the number of objects updated.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'call', 'get', 'post' ],
			parameters: [
				{
					name: 'Criteria',
					description: 'Criteria of objects to update.',
					schema: { type: 'object' },
					example: { foo: 'bar' },
				},
				{
					name: 'DataObject',
					description: 'Object containing update values.',
					schema: { type: 'object' },
					example: { foo: 'bar' },
				},
			],
			invoke: service.StorageWriteOne,
		};


		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.StorageDeleteOne = {
			name: 'StorageDeleteOne',
			description: 'Deletes the first object matching the given Criteria; Returns the number of objects deleted.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'call', 'get', 'post' ],
			parameters: [
				{
					name: 'Criteria',
					description: 'Criteria of objects to delete.',
					schema: { type: 'object' },
					example: { foo: 'bar' },
				},
			],
			invoke: service.StorageDeleteOne,
		};


		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.StorageDeleteMany = {
			name: 'StorageDeleteMany',
			description: 'Deletes all objects matching the given Criteria; Returns the number of objects deleted.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'call', 'get', 'post' ],
			parameters: [
				{
					name: 'Criteria',
					description: 'Criteria of objects to delete.',
					schema: { type: 'object' },
					example: { foo: 'bar' },
				},
			],
			invoke: service.StorageDeleteMany,
		};


		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.StorageShare = {
			name: 'StorageShare',
			description: 'Shares all objects matching the given Criteria. Returns the number of objects shared.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'call', 'get', 'post' ],
			parameters: [
				{
					name: 'Criteria',
					description: 'Criteria of objects to share.',
					schema: { type: 'object' },
					example: { foo: 'bar' },
				},
				{
					name: 'Readers',
					description: 'Array of user_id to be added to the objects readers list.',
					schema: { type: 'array' },
					example: [ 'user1', 'user2' ],
				},
				{
					name: 'Writers',
					description: 'Array of user_id to be added to the objects writers list.',
					schema: { type: 'array' },
					example: [ 'user1', 'user2' ],
				},
				{
					name: 'MakePublic',
					description: 'Mark found objects as public.',
					schema: { type: 'boolean' },
					example: true,
				},
			],
			invoke: service.StorageShare,
		};


		//---------------------------------------------------------------------
		service.ServiceDefinition.Origins.StorageUnshare = {
			name: 'StorageUnshare',
			description: 'Unshares all objects matching the given Criteria. Returns the number of objects unshared.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			verbs: [ 'call', 'get', 'post' ],
			parameters: [
				{
					name: 'Criteria',
					description: 'Criteria of objects to unshare.',
					schema: { type: 'object' },
					example: { foo: 'bar' },
				},
				{
					name: 'Readers',
					description: 'Array of user_id to be removed from the objects readers list.',
					schema: { type: 'array' },
					example: [ 'user1', 'user2' ],
				},
				{
					name: 'Writers',
					description: 'Array of user_id to be removed from the objects writers list.',
					schema: { type: 'array' },
					example: [ 'user1', 'user2' ],
				},
				{
					name: 'MakePublic',
					description: 'Mark found objects as not public (i.e. private).',
					schema: { type: 'boolean' },
					example: true,
				},
			],
			invoke: service.StorageUnshare,
		};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Service Pages
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		service.ServiceDefinition.Pages.List = {
			name: 'List',
			description: 'Lists all objects matching the given Criteria.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			parameters: [
				{
					name: 'Criteria',
					description: 'Criteria of objects to list.',
					schema: { type: 'object' },
					example: { foo: 'bar' },
					required: false,
				},
			],
			view: 'storage/list',
		};


		//---------------------------------------------------------------------
		service.ServiceDefinition.Pages.Item = {
			name: 'Item',
			description: 'Shows item detail and management functions.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			parameters: [
				{
					name: 'ItemID',
					description: 'ItemID of object to work with.',
					schema: { type: 'string' },
					example: 'b88d6048-725f-4f21-a8b0-e6de2de262e0',
					required: true,
				},
				{
					name: 'PageOp',
					description: 'Page operation: Create, Read, Update, or Delete',
					schema: { type: 'string' },
					example: 'Read',
					required: false,
				},
			],
			view: 'storage/item',
		};


		//---------------------------------------------------------------------
		service.ServiceDefinition.Pages.Share = {
			name: 'Share',
			description: 'Manage item sharing options.',
			requires_login: true,
			allowed_roles: [ 'admin', 'super', 'user' ],
			parameters: [
				{
					name: 'ItemID',
					description: 'ItemID of object to work with.',
					schema: { type: 'string' },
					example: 'b88d6048-725f-4f21-a8b0-e6de2de262e0',
					required: true,
				},
			],
			view: 'storage/share',
		};


		//---------------------------------------------------------------------
		// Return the Storage Service.
		//---------------------------------------------------------------------


		return service;
	};


