'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let application_name = 'TestServer';
let application_path = __dirname;

//---------------------------------------------------------------------
describe( `021) Maths WebService Tests`,
	function ()
	{

		let Server = null;
		let service_address = null;

		//---------------------------------------------------------------------
		before(
			async function ()
			{
				let server_options = {
					ConfigObject: {
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
				service_address = Server.WebServer.Express.ServerAddress();
				service_address += Server.WebServer.Express.ServicesPath();
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
				let url = `${service_address}Maths/Add?A=3&B=4`;
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
				let url = `${service_address}Maths/Subtract?A=3&B=4`;
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
				let url = `${service_address}Maths/Multiply?A=3&B=4`;
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
				let url = `${service_address}Maths/Divide?A=3&B=4`;
				let result = await Server.Utility.async_make_get_request( url );
				result = JSON.parse( result.toString() );
				LIB_ASSERT.ok( result.ok );
				LIB_ASSERT.strictEqual( result.result, 0.75 );
				return;
			} );


	} );
