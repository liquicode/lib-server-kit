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


		// //---------------------------------------------------------------------
		// // Create the default configuration.
		// service.GetDefaults =
		// 	function GetDefaults()
		// 	{
		// 		let config = LIB_MANAGED_STORAGE.DefaultConfiguration();
		// 		return config;
		// 	};


		// //---------------------------------------------------------------------
		// // Initialize this service.
		// service.InitializeService =
		// 	function InitializeService()
		// 	{
		// 		service.storage = LIB_MANAGED_STORAGE.NewManagedStorage( service.Settings );
		// 		return;
		// 	};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Service Definition
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		// Service Identity
		service.ServiceDefinition.Name = 'SystemUsers';
		service.ServiceDefinition.Title = 'System Users';

		//---------------------------------------------------------------------
		// Restrict the permissions for SystemUsers.
		service.ServiceDefinition.Endpoints.Count.allowed_roles = [ 'admin', 'super', 'user' ];
		service.ServiceDefinition.Endpoints.FindOne.allowed_roles = [ 'admin', 'super', 'user' ];
		service.ServiceDefinition.Endpoints.FindMany.allowed_roles = [ 'admin', 'super' ];
		service.ServiceDefinition.Endpoints.CreateOne.allowed_roles = [ 'admin', 'super' ];
		service.ServiceDefinition.Endpoints.WriteOne.allowed_roles = [ 'admin', 'super', 'user' ];
		service.ServiceDefinition.Endpoints.DeleteOne.allowed_roles = [ 'admin', 'super' ];
		service.ServiceDefinition.Endpoints.DeleteMany.allowed_roles = [ 'admin', 'super' ];
		service.ServiceDefinition.Endpoints.Share.allowed_roles = [ 'admin', 'super' ];
		service.ServiceDefinition.Endpoints.Unshare.allowed_roles = [ 'admin', 'super' ];


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Object Definition
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		// Object Identity
		service.ObjectDefinition.Name = 'SystemUser';
		service.ObjectDefinition.Title = 'System User';
		service.ObjectDefinition.Titles = 'System Users';

		//---------------------------------------------------------------------
		service.ObjectDefinition.Fields.UserID = {
			name: 'user_id',
			title: 'User Email',
			description: 'Email address of the user.',
			type: 'string',
		};

		//---------------------------------------------------------------------
		service.ObjectDefinition.Fields.UserRole = {
			name: 'user_role',
			title: 'User Role',
			description: 'The role of this user within the system.',
			type: 'string',
		};

		//---------------------------------------------------------------------
		service.ObjectDefinition.Fields.UserName = {
			name: 'user_name',
			title: 'User Name',
			description: 'Display name of the user.',
			type: 'string',
		};

		//---------------------------------------------------------------------
		service.ObjectDefinition.Fields.ImageUrl = {
			name: 'image_url',
			title: 'Image URL',
			description: 'URL of the image associated with this acoount.',
			type: 'image_url',
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
				async function create_user( Storage, ThisUserInfo )
				{
					let new_user = await Storage.CreateOne( LIB_USER_STORAGE.StorageAdministrator(), ThisUserInfo );
					// let count = await Storage.SetOwner( LIB_MANAGED_STORAGE.StorageAdministrator(), ThisUserInfo.user_id, new_user._m.id );
					// return await Storage.FindOne( LIB_MANAGED_STORAGE.StorageAdministrator(), new_user._m.id );
					let info = Storage.GetUserInfo( new_user );
					let count = await Storage.SetOwner( ThisUserInfo, info.id ); // Users own their accounts.
					return await Storage.FindOne( ThisUserInfo, info.id );
				}

				//---------------------------------------------------------------------
				try
				{
					// Count all users of the system.
					let count = await service.Storage.Count( LIB_USER_STORAGE.StorageAdministrator(), {} );
					if ( count === 0 )
					{
						// Create the first user as the admin user.
						Server.Log.warn( `SystemUsers is empty, creating the first SystemUser as the admin user.` );
						UserInfo.user_role = 'admin';
						Server.Log.debug( `Creating a new SystemUser: ${JSON.stringify( UserInfo )}` );
						api_response.object = await create_user( service.Storage, UserInfo );
					}
					else
					{
						// Find the user email amongst all users of the system.
						api_response.object = await service.Storage.FindOne( LIB_USER_STORAGE.StorageAdministrator(), { user_id: UserInfo.user_id } );
						if ( api_response.object === null )
						{
							Server.Log.debug( `Creating a new SystemUser: ${JSON.stringify( UserInfo )}` );
							api_response.object = await create_user( service.Storage, UserInfo );
						}
						else
						{
							Server.Log.debug( `Found an existing SystemUser: ${JSON.stringify( UserInfo )}` );
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
				return api_response;
			};


		//---------------------------------------------------------------------
		// Return the Service.
		//---------------------------------------------------------------------


		return service;
	};
