'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let application_name = 'TestServer';
let application_path = __dirname;
let Server = null;

//---------------------------------------------------------------------
describe( `001) Core Framework Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		before(
			function ()
			{
				Server = LIB_SERVER_KIT.NewServer( application_name, application_path );
				Server.Initialize();
				return;
			}
		);


		//---------------------------------------------------------------------
		it( `should load configuration`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Config.Settings );
				LIB_ASSERT.ok( Server.Config.Settings.AppInfo );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should be able to log a message`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Log );
				Server.Log.info( `Hello World from ${Server.Config.Settings.AppInfo.name}` );
				return;
			} );


	} );
