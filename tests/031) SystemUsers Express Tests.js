'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );


//---------------------------------------------------------------------
describe( `031) ServerAccounts Express Tests`,
	function ()
	{
		const application_name = 'TestServer';
		const application_path = __dirname;

		let Server = null;
		let server_address = null;
		let service_address = null;
		let login_url = null;

		const Admin = { user_id: 'admin', user_role: 'admin' };
		const Super = { user_id: 'super', user_role: 'super' };
		const User = { user_id: 'user', user_role: 'user' };


		let ServicesClient = null;


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
				// Authenticate as admin.
				try
				{
					let response = await Server.Utility.async_request(
						'post', login_url, {
						username: 'admin@server',
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
		it( `should create admin-owned users`,
			async function ()
			{
				LIB_ASSERT.ok( ServicesClient );
				LIB_ASSERT.ok( await ServicesClient.ServerAccounts.StorageCount( Admin ) === 0 );

				// Create users directly into the storage by calling CreateOne.
				// CreateOne will create the object bu assign ownership to the calling user.

				// Create an Admin user.
				let _admin = await ServicesClient.ServerAccounts.StorageCreateOne( Admin, Admin );
				LIB_ASSERT.ok( _admin );										// User was created
				LIB_ASSERT.ok( _admin.user_id === Admin.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _admin.user_role === Admin.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _admin.__.owner_id === Admin.user_id );			// User is owned by the Admin
				LIB_ASSERT.ok( await Server.ServerAccounts.StorageCount( Admin ) === 1 );

				// Create a Super user.
				let _super = await ServicesClient.ServerAccounts.StorageCreateOne( Admin, Super );
				LIB_ASSERT.ok( _super );										// User was created
				LIB_ASSERT.ok( _super.user_id === Super.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _super.user_role === Super.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _super.__.owner_id === Admin.user_id );			// User is owned by the Admin
				LIB_ASSERT.ok( await ServicesClient.ServerAccounts.StorageCount( Admin ) === 2 );

				// Create a normal user.
				let _user = await ServicesClient.ServerAccounts.StorageCreateOne( Admin, User );
				LIB_ASSERT.ok( _user );											// User was created
				LIB_ASSERT.ok( _user.user_id === User.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _user.user_role === User.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _user.__.owner_id === Admin.user_id );			// User is owned by the Admin
				LIB_ASSERT.ok( await ServicesClient.ServerAccounts.StorageCount( Admin ) === 3 );

				// Delete all of the users.
				LIB_ASSERT.ok( await ServicesClient.ServerAccounts.StorageDeleteMany( Admin ) === 3 );
				LIB_ASSERT.ok( await ServicesClient.ServerAccounts.StorageCount( Admin ) === 0 );

				return;
			} );


		//---------------------------------------------------------------------
		it( `should create self-owned users`,
			async function ()
			{
				LIB_ASSERT.ok( ServicesClient );
				LIB_ASSERT.ok( await ServicesClient.ServerAccounts.StorageCount( Admin ) === 0 );

				// Perform a signup operation by calling FindOrCreateUser.
				// FindOrCreateUser will create a user if it doesnt already exist
				// and will assign ownership to that new user.
				// Note that this function does not take a User object as its first parameter
				// and does not do any permissions checking.
				// As such, this function is only used internally and is not exported as part of a service.

				let api_result = null;

				// Create an Admin user.
				api_result = await ServicesClient.ServerAccounts.FindOrCreateUser( Admin );
				LIB_ASSERT.ok( api_result );
				LIB_ASSERT.ok( api_result.ok );
				LIB_ASSERT.ok( !api_result.error );
				let _admin = api_result.object;
				LIB_ASSERT.ok( _admin );										// User was created
				LIB_ASSERT.ok( _admin.user_id === Admin.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _admin.user_role === Admin.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _admin.__.owner_id === Admin.user_id );			// User is owned by the Admin
				LIB_ASSERT.ok( await ServicesClient.ServerAccounts.StorageCount( Admin ) === 1 );

				// Create a Super user.
				api_result = await ServicesClient.ServerAccounts.FindOrCreateUser( Super );
				LIB_ASSERT.ok( api_result );
				LIB_ASSERT.ok( api_result.ok );
				LIB_ASSERT.ok( !api_result.error );
				let _super = api_result.object;
				LIB_ASSERT.ok( _super );										// User was created
				LIB_ASSERT.ok( _super.user_id === Super.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _super.user_role === Super.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _super.__.owner_id === Super.user_id );			// User is owned by the user
				LIB_ASSERT.ok( await ServicesClient.ServerAccounts.StorageCount( Admin ) === 2 );

				// Create a normal user.
				api_result = await ServicesClient.ServerAccounts.FindOrCreateUser( User );
				LIB_ASSERT.ok( api_result );
				LIB_ASSERT.ok( api_result.ok );
				LIB_ASSERT.ok( !api_result.error );
				let _user = api_result.object;
				LIB_ASSERT.ok( _user );											// User was created
				LIB_ASSERT.ok( _user.user_id === User.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _user.user_role === User.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _user.__.owner_id === User.user_id );			// User is owned by the user
				LIB_ASSERT.ok( await ServicesClient.ServerAccounts.StorageCount( Admin ) === 3 );

				// Delete all of the users.
				LIB_ASSERT.ok( await ServicesClient.ServerAccounts.StorageDeleteMany( Admin ) === 3 );
				LIB_ASSERT.ok( await ServicesClient.ServerAccounts.StorageCount( Admin ) === 0 );

				return;
			} );


	} );
