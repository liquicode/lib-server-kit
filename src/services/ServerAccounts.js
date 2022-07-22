'use strict';


//---------------------------------------------------------------------
const LIB_USER_STORAGE = require( '@liquicode/lib-user-storage' );

//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{
		if ( !Server ) { throw Server.Utility.missing_parameter_error( 'App' ); }

		// Create the storage service.
		let service = Server.NewStorageService( Server );


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Service Configuration
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		// Create the default configuration.
		service.GetDefaults =
			function GetDefaults()
			{
				let config = {
					Storage: service.GetStorageDefaults(),
				};
				return config;
			};


		//---------------------------------------------------------------------
		// Initialize this service.
		service.InitializeService =
			function InitializeService()
			{
				service.storage = service.InitializeStorage( service.Settings.Storage );
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Service Definition
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		// Service Identity
		service.ServiceDefinition.name = 'ServerAccounts';
		service.ServiceDefinition.title = 'Server Accounts';

		//---------------------------------------------------------------------
		// Restrict the permissions for ServerAccounts.
		service.ServiceDefinition.Origins.StorageCount.allowed_roles = [ 'admin', 'super', 'user' ];
		service.ServiceDefinition.Origins.StorageFindOne.allowed_roles = [ 'admin', 'super', 'user' ];
		service.ServiceDefinition.Origins.StorageFindMany.allowed_roles = [ 'admin', 'super' ];
		service.ServiceDefinition.Origins.StorageCreateOne.allowed_roles = [ 'admin', 'super' ];
		service.ServiceDefinition.Origins.StorageWriteOne.allowed_roles = [ 'admin', 'super', 'user' ];
		service.ServiceDefinition.Origins.StorageDeleteOne.allowed_roles = [ 'admin', 'super' ];
		service.ServiceDefinition.Origins.StorageDeleteMany.allowed_roles = [ 'admin', 'super' ];
		service.ServiceDefinition.Origins.StorageShare.allowed_roles = [ 'admin', 'super' ];
		service.ServiceDefinition.Origins.StorageUnshare.allowed_roles = [ 'admin', 'super' ];
		service.ServiceDefinition.Origins.StorageShare.verbs = [];		// Do not expose StorageShare
		service.ServiceDefinition.Origins.StorageUnshare.verbs = [];		// Do not expose StorageUnshare

		// service.ServiceDefinition.Pages.List = {
		// 	name: 'List',
		// 	view: 'storage/list',
		// 	description: 'Shows a list of service objects.',
		// 	requires_login: true,
		// 	allowed_roles: [ 'admin', 'super', 'user' ],
		// 	invoke:
		// 		async function ( Server, request, response, next ) 
		// 		{
		// 			let list = await service.FindMany( request.user, request.params );
		// 			response.render( 'storage/list', { Server: Server, User: request.user, List: list } );
		// 		},
		// };


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Object Definition
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		// Object Identity
		service.ItemDefinition.name = 'ServerAccount';
		service.ItemDefinition.title = 'Server Account';
		service.ItemDefinition.titles = 'Server Accounts';
		service.ItemDefinition.shareable = false;

		//---------------------------------------------------------------------
		service.ItemDefinition.Fields.UserID = {
			name: 'user_id',
			title: 'User Email',
			description: 'Email address of the user.',
			schema: {
				type: 'string',
				format: 'email',
			},
			readonly: true,
		};

		//---------------------------------------------------------------------
		service.ItemDefinition.Fields.UserRole = {
			name: 'user_role',
			title: 'User Role',
			description: 'The role of this user within the system.',
			schema: {
				type: 'string',
				format: 'text',
			},
			readonly: true,
		};

		//---------------------------------------------------------------------
		service.ItemDefinition.Fields.UserName = {
			name: 'user_name',
			title: 'User Name',
			description: 'Display name of the user.',
			schema: {
				type: 'string',
				format: 'text',
			},
			readonly: false,
		};

		//---------------------------------------------------------------------
		service.ItemDefinition.Fields.ImageUrl = {
			name: 'image_url',
			title: 'Image URL',
			description: 'URL of the image associated with this acoount.',
			schema: {
				type: 'string',
				format: 'image_url',
			},
			readonly: false,
		};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Internal Functions
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		// FindOrCreateUser
		//---------------------------------------------------------------------

		service.FindOrCreateUser =
			async function FindOrCreateUser( UserInfo )
			{
				let api_response = {
					ok: true,
					error: '',
					object: null,
				};

				//---------------------------------------------------------------------
				// Validate inputs.
				try
				{
					if ( Server.Utility.value_missing_null_empty( service.Storage ) ) { throw new Error( `Service has not been initialized.` ); }
					if ( Server.Utility.value_missing_null_empty( UserInfo ) ) { throw new Error( `Missing Parameter: UserInfo` ); }
					if ( Server.Utility.value_missing_null_empty( UserInfo.user_id ) ) { throw new Error( `Missing Parameter: UserInfo.user_email` ); }
					if ( Server.Utility.value_missing_null_empty( UserInfo.user_role ) ) { throw new Error( `Missing Parameter: UserInfo.user_role` ); }
				}
				catch ( error )
				{
					api_response.ok = false;
					api_response.error = error.message;
					return api_response;
				}

				//---------------------------------------------------------------------
				// Create a user object that is owned by that user.
				async function create_user( ThisUserInfo )
				{
					let user_prototype = service.NewServiceItem( ThisUserInfo );
					let new_user = await service.Storage.CreateOne( LIB_USER_STORAGE.StorageAdministrator(), user_prototype );
					let info = service.Storage.GetStorageInfo( new_user );
					let count = await service.Storage.SetOwner( LIB_USER_STORAGE.StorageAdministrator(), ThisUserInfo.user_id, info.id ); // Users own their accounts.
					if ( !count ) { Server.Log.warn( `Unable to set ownership of the new user object.` ); }
					new_user = await service.Storage.FindOne( ThisUserInfo, info.id );
					if ( !new_user ) { Server.Log.warn( `Unable to retrieve the new user object.` ); }
					return new_user;
				}

				//---------------------------------------------------------------------
				let found_user = null;
				try
				{
					// Count all users of the system.
					let count = await service.Storage.Count( LIB_USER_STORAGE.StorageAdministrator(), {} );
					if ( count === 0 )
					{
						// Create the first user as the admin user.
						Server.Log.warn( `ServerAccounts is empty, creating the first SystemUser as the admin user.` );
						UserInfo.user_role = 'admin';
						found_user = await create_user( UserInfo );
						Server.Log.debug( `Created a new admin SystemUser: (${found_user.user_id})` );
					}
					else
					{
						// Find the user email amongst all users of the system.
						found_user = await service.Storage.FindOne( LIB_USER_STORAGE.StorageAdministrator(), { user_id: UserInfo.user_id } );
						if ( found_user === null )
						{
							found_user = await create_user( UserInfo );
							Server.Log.debug( `Created a new SystemUser: (${found_user.user_id})` );
						}
						else
						{
							Server.Log.debug( `Found an existing SystemUser: (${found_user.user_id})` );
						}
					}
				}
				catch ( error )
				{
					api_response.ok = false;
					api_response.error = error.message;
					return api_response;
				}

				//---------------------------------------------------------------------
				Server.Log.info( `Accepted SystemUser: ${JSON.stringify( service.Storage.GetStorageData( found_user ) )}` );
				api_response.object = found_user;
				return api_response;
			};


		//---------------------------------------------------------------------
		// Return the Service.
		//---------------------------------------------------------------------


		return service;
	};
