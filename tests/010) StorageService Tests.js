'use strict';


const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let application_name = 'MathsServer';
let application_path = LIB_PATH.resolve( __dirname, 'MathsServer' );
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
				Server = LIB_SERVER_KIT.NewServer( application_name, application_path );
				let settings = { Log: { Console: { enabled: true }, Shell: { enabled: false } } };
				Server.Initialize( settings );
				return;
			}
		);


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
				Name: 'TestObject',
				Title: 'Test Object',
				Titles: 'Test Objects',
				Fields: {
					Name: {
						name: 'name',
						title: 'Name',
						description: 'A silly name.',
						type: 'string',
					},
					Number: {
						name: 'number',
						title: 'Number',
						description: 'A silly number.',
						type: 'number',
					},
				},
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
				let managed_object = await storage.StorageCreateOne( OwnerUser, {} );
				LIB_ASSERT.ok( managed_object );
				LIB_ASSERT.ok( managed_object.__info.id );
				LIB_ASSERT.strictEqual( managed_object.__info.owner_id, OwnerUser.user_id );
				LIB_ASSERT.strictEqual( managed_object.name, "" );
				LIB_ASSERT.strictEqual( managed_object.number, 0 );

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
				let managed_object = await storage.StorageCreateOne( OwnerUser, test_object );
				LIB_ASSERT.ok( managed_object );
				LIB_ASSERT.ok( managed_object.__info.id );
				LIB_ASSERT.strictEqual( managed_object.__info.owner_id, OwnerUser.user_id );
				LIB_ASSERT.strictEqual( managed_object.name, "Test Name" );
				LIB_ASSERT.strictEqual( managed_object.number, 3.14 );

				// Delete the object.
				let count = await storage.StorageDeleteOne( OwnerUser, managed_object.__info.id );
				LIB_ASSERT.strictEqual( count, 1 );

				// Count all objects.
				count = await storage.StorageCount( OwnerUser );
				LIB_ASSERT.strictEqual( count, 0 );

				return;
			} );


	} );
