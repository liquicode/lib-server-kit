'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );
const LIB_AXIOS = require( 'axios' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let application_name = 'TestServer';
let application_path = __dirname;

//---------------------------------------------------------------------
describe( `030) Express Tests`,
	function ()
	{

		let Server = null;
		let server_address = null;
		let service_address = null;
		let login_url = null;

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
								Session: {
									enabled: true,
								},
								Authentication: {
									enabled: true,
								},
							},
						},
					},
				};
				Server = LIB_SERVER_KIT.NewServer( application_name, application_path, server_options );
				Server.Initialize();
				await Server.WebServer.StartWebServer();
				server_address = Server.WebServer.Express.ServerAddress();
				service_address = server_address + Server.WebServer.Express.ServicesPath();
				login_url = `${service_address}${Server.Config.Settings.WebServer.Express.Authentication.Pages.login_url}`;
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
		it( `should not authenticate invalid credentials (bad username)`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				try
				{
					let response = await Server.Utility.async_request(
						'post', login_url,
						{
							username: 'admin@wrong-system',
							password: 'password',
						} );
					LIB_ASSERT.fail( `it authenticated invalid credentials` );
				}
				catch ( error )
				{
					LIB_ASSERT.ok( error );
					LIB_ASSERT.ok( error.response );
					LIB_ASSERT.ok( error.response.status === 401 );
					LIB_ASSERT.ok( error.response.statusText === 'Unauthorized' );
				}
				return;
			} );


		//---------------------------------------------------------------------
		it( `should not authenticate invalid credentials (bad password)`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				try
				{
					let response = await Server.Utility.async_request(
						'post', login_url,
						{
							username: 'admin@system',
							password: 'wrong-password',
						} );
					LIB_ASSERT.fail( `it authenticated invalid credentials` );
				}
				catch ( error )
				{
					LIB_ASSERT.ok( error );
					LIB_ASSERT.ok( error.response );
					LIB_ASSERT.ok( error.response.status === 401 );
					LIB_ASSERT.ok( error.response.statusText === 'Unauthorized' );
				}
				return;
			} );


		//---------------------------------------------------------------------
		it( `should authenticate valid credentials`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				try
				{
					let response = await Server.Utility.async_request(
						'post', login_url,
						{
							username: 'admin@system',
							password: 'password',
						} );
					LIB_ASSERT.ok( response );
					LIB_ASSERT.ok( response.status === 200 );
					LIB_ASSERT.ok( response.statusText === 'OK' );
				}
				catch ( error )
				{
					LIB_ASSERT.fail( error.message );
				}
				return;
			} );


	} );
