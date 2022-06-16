'use strict';


const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let Server = null;

const SRC_STORAGE_SERVICE = require( LIB_PATH.resolve( __dirname, '../src/base/StorageService.js' ) );

const OwnerUser =
{
	name: "Test Framework",
	user_id: "test@internal",
	user_role: "user",
};


//---------------------------------------------------------------------
describe( `010) StorageService Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		before(
			function ()
			{
				Server = LIB_SERVER_KIT.NewServer( LIB_PATH.resolve( __dirname, 'test-app' ) );
				let settings = { Log: { Console: { enabled: true }, Shell: { enabled: false } } };
				Server.Initialize( settings );
				return;
			}
		)


		//---------------------------------------------------------------------
		function create_test_storage()
		{

			// Create the storage.
			let storage = SRC_STORAGE_SERVICE.NewStorageService( Server );
			LIB_ASSERT.ok( storage );

			// Initialize the storage
			let storage_config = {
				throw_permission_errors: false,
				mongo_provider: {
					enabled: false,
				},
				json_provider: {
					enabled: true,
					collection_name: "StorageService-Tests",
					database_name: LIB_PATH.resolve( __dirname, "~temp" ),
					clear_collection_on_start: true,
					flush_on_update: true,
					flush_every_ms: 0,
				}
			};
			storage.SetSettings( storage_config );

			// Create an object definition.
			storage.ObjectDefinition = {
				ServiceTitle: 'Test Objects',
				ServiceName: 'TestObjects',
				ObjectTitle: 'Test Object',
				ObjectName: 'TestObject',
				Fields: [
					{
						title: 'Name',
						description: 'A silly name.',
						member: 'name',
						type: 'string',
					},
					{
						title: 'Number',
						description: 'A silly number.',
						member: 'number',
						type: 'number',
					},
				],
			};

			// Return the storage.
			storage.InitializeService();
			return storage;
		}


		//---------------------------------------------------------------------
		it( `should initialize storage`,
			async function ()
			{
				let storage = create_test_storage();
				LIB_ASSERT.ok( storage );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should create an empty object`,
			async function ()
			{
				// Create a storage.
				let storage = create_test_storage();
				LIB_ASSERT.ok( storage );

				// Create an empty object.
				let managed_object = await storage.ServiceDefinition.Endpoints.CreateOne.invoke( OwnerUser, {} );
				LIB_ASSERT.ok( managed_object );
				LIB_ASSERT.ok( managed_object._m.id );
				LIB_ASSERT.strictEqual( managed_object._m.owner_id, OwnerUser.user_id );
				LIB_ASSERT.strictEqual( managed_object._o.name, "" );
				LIB_ASSERT.strictEqual( managed_object._o.number, 0 );

				return;
			} );


		//---------------------------------------------------------------------
		it( `should create and delete an object`,
			async function ()
			{
				// Create a storage.
				let storage = create_test_storage();
				LIB_ASSERT.ok( storage );

				// Create a test object.
				let test_object = { name: "Test Name", number: 3.14 };
				let managed_object = await storage.ServiceDefinition.Endpoints.CreateOne.invoke( OwnerUser, test_object );
				LIB_ASSERT.ok( managed_object );
				LIB_ASSERT.ok( managed_object._m.id );
				LIB_ASSERT.strictEqual( managed_object._m.owner_id, OwnerUser.user_id );
				LIB_ASSERT.strictEqual( managed_object._o.name, "Test Name" );
				LIB_ASSERT.strictEqual( managed_object._o.number, 3.14 );

				// Delete the object.
				let count = await storage.ServiceDefinition.Endpoints.DeleteOne.invoke( OwnerUser, managed_object._m.id );
				LIB_ASSERT.strictEqual( count, 1 );

				// Count all objects.
				count = await storage.ServiceDefinition.Endpoints.Count.invoke( OwnerUser );
				LIB_ASSERT.strictEqual( count, 0 );

				return;
			} );


	} );
