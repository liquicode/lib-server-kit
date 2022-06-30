'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let application_name = 'MathsServer';
let application_path = LIB_PATH.resolve( __dirname, 'test-app' );
let Server = null;

//---------------------------------------------------------------------
describe( `021) Maths WebService Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		before(
			async function ()
			{
				Server = LIB_SERVER_KIT.NewServer( application_name, application_path );
				let settings = { Log: { Console: { enabled: true }, Shell: { enabled: false } } };
				Server.Initialize( settings );
				await Server.WebServer.StartWebServer();
				return;
			}
		);


		//---------------------------------------------------------------------
		after(
			async function ()
			{
				if ( !Server ) { return; }
				if ( !Server.WebServer ) { return; }
				if ( !Server.WebServer.HttpServer.listening ) { return; }
				await Server.WebServer.StopWebServer();
				return;
			}
		);


		//---------------------------------------------------------------------
		it( `should add two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				let address = Server.WebServer.HttpServer.address();
				let url = `http://${address.address}:${address.port}/api/Maths/Add?A=3&B=4`;
				let result = await Server.Utility.async_make_get_request( url );
				result = JSON.parse( result.toString() );
				LIB_ASSERT.ok( result.ok );
				LIB_ASSERT.strictEqual( result.result, 7 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should subtract two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				let address = Server.WebServer.HttpServer.address();
				let url = `http://${address.address}:${address.port}/api/Maths/Subtract?A=3&B=4`;
				let result = await Server.Utility.async_make_get_request( url );
				result = JSON.parse( result.toString() );
				LIB_ASSERT.ok( result.ok );
				LIB_ASSERT.strictEqual( result.result, -1 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should multiply two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				let address = Server.WebServer.HttpServer.address();
				let url = `http://${address.address}:${address.port}/api/Maths/Multiply?A=3&B=4`;
				let result = await Server.Utility.async_make_get_request( url );
				result = JSON.parse( result.toString() );
				LIB_ASSERT.ok( result.ok );
				LIB_ASSERT.strictEqual( result.result, 12 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should divide two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				let address = Server.WebServer.HttpServer.address();
				let url = `http://${address.address}:${address.port}/api/Maths/Divide?A=3&B=4`;
				let result = await Server.Utility.async_make_get_request( url );
				result = JSON.parse( result.toString() );
				LIB_ASSERT.ok( result.ok );
				LIB_ASSERT.strictEqual( result.result, 0.75 );
				return;
			} );


	} );
