'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let application_name = 'TestServer';
let application_path = __dirname;
let Server = null;

let Bob = { user_id: 'bob', user_role: 'user' };


//---------------------------------------------------------------------
describe( `022) Maths Service Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		before(
			async function ()
			{
				Server = LIB_SERVER_KIT.NewServer( application_name, application_path );
				Server.Initialize();
				return;
			}
		);


		//---------------------------------------------------------------------
		after(
			async function ()
			{
				return;
			}
		);


		//---------------------------------------------------------------------
		it( `should add two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Maths.Add( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, 7 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should subtract two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Maths.Subtract( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, -1 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should multiply two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Maths.Multiply( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, 12 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should divide two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Maths.Divide( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, 0.75 );
				return;
			} );


	} );
