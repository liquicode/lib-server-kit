'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let application_name = 'TestServer';
let application_path = __dirname;

//---------------------------------------------------------------------
describe( `040) SocketIO Tests`,
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
							SocketIO: {
								enabled: true,
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
		it( `should authenticate via Express`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				let url = `${service_address}auth/login?username=admin@server&password=password`;
				let result = await Server.Utility.async_make_post_request( url );
				result = JSON.parse( result.toString() );
				LIB_ASSERT.ok( result );
				return;
			} );


	} );
