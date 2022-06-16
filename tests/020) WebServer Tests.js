'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let Server = null;

//---------------------------------------------------------------------
describe( `020) WebServer Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		before(
			async function()
			{
				Server = LIB_SERVER_KIT.NewServer( LIB_PATH.resolve( __dirname, 'test-app' ) );
				let settings = { Log: { Console: { enabled: true }, Shell: { enabled: false } } };
				Server.Initialize( settings );
				return;
			}
		)


		//---------------------------------------------------------------------
		it( `should start the web server`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				await Server.WebServer.StartWebServer();
				return;
			} );


		//---------------------------------------------------------------------
		it( `should stop the web server`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				await Server.WebServer.StopWebServer();
				return;
			} );


	} );
