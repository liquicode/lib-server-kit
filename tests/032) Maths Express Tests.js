'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let application_name = 'TestServer';
let application_path = __dirname;

//---------------------------------------------------------------------
describe( `032) Maths Express Tests`,
	function ()
	{

		let Server = null;
		let server_address = null;
		let service_address = null;

		//---------------------------------------------------------------------
		before(
			async function ()
			{
				let server_options = {
					Settings: {
						WebServer: {
							Express: {
								enabled: true,
								// report_routes: true,
							},
						},
					},
				};
				Server = LIB_SERVER_KIT.NewServer( application_name, application_path, server_options );
				Server.Initialize();
				await Server.WebServer.StartWebServer();
				server_address = Server.WebServer.Express.ServerAddress();
				service_address = server_address + Server.WebServer.Express.ServicesPath();
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
				let response = await Server.Utility.async_request( 'get', `${service_address}Maths/Add`, { A: 3, B: 4 } );
				LIB_ASSERT.ok( response );
				LIB_ASSERT.ok( response.data );
				LIB_ASSERT.ok( response.data.ok );
				LIB_ASSERT.strictEqual( response.data.result, 7 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should subtract two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				let response = await Server.Utility.async_request( 'get', `${service_address}Maths/Subtract`, { A: 3, B: 4 } );
				LIB_ASSERT.ok( response );
				LIB_ASSERT.ok( response.data );
				LIB_ASSERT.ok( response.data.ok );
				LIB_ASSERT.strictEqual( response.data.result, -1 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should multiply two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				let response = await Server.Utility.async_request( 'get', `${service_address}Maths/Multiply`, { A: 3, B: 4 } );
				LIB_ASSERT.ok( response );
				LIB_ASSERT.ok( response.data );
				LIB_ASSERT.ok( response.data.ok );
				LIB_ASSERT.strictEqual( response.data.result, 12 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should divide two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				let response = await Server.Utility.async_request( 'get', `${service_address}Maths/Divide`, { A: 3, B: 4 } );
				LIB_ASSERT.ok( response );
				LIB_ASSERT.ok( response.data );
				LIB_ASSERT.ok( response.data.ok );
				LIB_ASSERT.strictEqual( response.data.result, 0.75 );
				return;
			} );


	} );
