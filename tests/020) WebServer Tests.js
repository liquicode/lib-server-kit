'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let application_name = 'TestServer';
let application_path = __dirname;
let Server = null;
let Admin = { user_id: 'admin', user_role: 'admin' };


//---------------------------------------------------------------------
describe( `020) WebServer Tests`,
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
		it( `should have loaded the ServerAccounts service`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Services );
				LIB_ASSERT.ok( Object.keys( Server.Services ).length );
				LIB_ASSERT.ok( Server.ServerAccounts );
				LIB_ASSERT.ok( Server.ServerAccounts.ServiceDefinition );
				LIB_ASSERT.ok( Server.ServerAccounts.ServiceDefinition.name === 'ServerAccounts' );
				LIB_ASSERT.ok( Server.ServerAccounts.ServiceDefinition.Origins );
				LIB_ASSERT.ok( Server.ServerAccounts.ServiceDefinition.Pages );
				LIB_ASSERT.ok( Server.ServerAccounts.ItemDefinition );
				LIB_ASSERT.ok( Server.ServerAccounts.ItemDefinition.name === 'SystemUser' );
				LIB_ASSERT.ok( Server.ServerAccounts.ItemDefinition.Fields );
				LIB_ASSERT.ok( await Server.ServerAccounts.StorageCount( Admin ) === 0 );
				let user = await Server.ServerAccounts.StorageCreateOne( Admin, Admin );
				LIB_ASSERT.ok( user );
				LIB_ASSERT.ok( user.user_id === Admin.user_id );
				LIB_ASSERT.ok( user.user_role === Admin.user_role );
				LIB_ASSERT.ok( user.user_name === '' );
				LIB_ASSERT.ok( await Server.ServerAccounts.StorageCount( Admin ) === 1 );
				LIB_ASSERT.ok( await Server.ServerAccounts.StorageDeleteOne( Admin, { user_id: Admin.user_id } ) === 1 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should have loaded the Maths service`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Services );
				LIB_ASSERT.ok( Object.keys( Server.Services ).length );
				LIB_ASSERT.ok( Server.Maths );
				LIB_ASSERT.ok( Server.Maths.ServiceDefinition );
				LIB_ASSERT.ok( Server.Maths.ServiceDefinition.name === 'Maths' );
				LIB_ASSERT.ok( Server.Maths.ServiceDefinition.Origins );
				LIB_ASSERT.ok( Server.Maths.ServiceDefinition.Pages );
				LIB_ASSERT.ok( Server.Maths.ItemDefinition );
				LIB_ASSERT.ok( Server.Maths.ItemDefinition.name === 'GenericObject' );
				LIB_ASSERT.ok( Server.Maths.ItemDefinition.Fields );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should start the web server`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				await Server.WebServer.StartWebServer();
				LIB_ASSERT.ok( Server.WebServer.HttpServer );
				LIB_ASSERT.ok( Server.WebServer.HttpServer.listening );
				LIB_ASSERT.ok( !Server.WebServer.Express );
				LIB_ASSERT.ok( !Server.WebServer.SocketIO );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should stop the web server`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.WebServer );
				await Server.WebServer.StopWebServer();
				LIB_ASSERT.ok( !Server.WebServer.HttpServer );
				LIB_ASSERT.ok( !Server.WebServer.Express );
				LIB_ASSERT.ok( !Server.WebServer.SocketIO );
				return;
			} );


	} );
