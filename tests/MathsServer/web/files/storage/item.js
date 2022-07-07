'use strict';


app.controller(
	'StorageItem_Controller',
	function ( $scope, $http, $window, $location, $cookies )
	{


		//=====================================================================
		//=====================================================================
		// 
		// 		Page
		// 
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		var Page = {
			Server: window.SERVER_DATA,
			User: window.SERVER_DATA.User,
			ItemDefinition: window.SERVER_DATA.ItemDefinition,
			ServiceDefinition: window.SERVER_DATA.ServiceDefinition,
			Parameters: window.SERVER_DATA.Parameters,
			ItemID: '',
			PageOp: '',
			object_info_visible: false,
			Socket: null,
			Item: null,
		};
		{
			// Parse Parameters
			let params = Page.Parameters.split( ',' );
			Page.ItemID = params[ 0 ];
			Page.PageOp = params[ 1 ];
		}
		$scope.Page = Page;


		//---------------------------------------------------------------------
		if ( Page.User )
		{
			SocketApi.NewSocket( Page.User,
				( Socket, Status ) =>
				{
					if ( Status !== 'OK' )
					{
						console.error( 'Socket connection failed.' );
						return;
					}
					Page.Socket = Socket;
					if ( [ 'Create' ].includes( Page.PageOp ) )
					{
						Page.Item = {};
					}
					else if ( [ 'Read', 'Update', 'Delete' ].includes( Page.PageOp ) )
					{
						Page.ReadItem();
					}
				} );
		}


		//---------------------------------------------------------------------
		Page.ItemInfo =
			function ItemInfo()
			{
				if ( Page.Item === null ) { return ''; }
				return JSON.stringify( Page.Item.__info, null, '    ' );
			};


		//---------------------------------------------------------------------
		Page.IsFieldEditable =
			function IsFieldEditable( Field )
			{
				if ( Page.PageOp === 'Create' )
				{
					return true;
				}
				else if ( Page.PageOp === 'Read' ) 
				{
					return false;
				}
				else if ( Page.PageOp === 'Update' ) 
				{
					if ( Field.readonly ) { return false; }
					return true;
				}
				else if ( Page.PageOp === 'Delete' ) 
				{
					return false;
				}
				return false;
			};


		// //---------------------------------------------------------------------
		// Page.UserCanDo =
		// 	function UserCanDo( FunctionName )
		// 	{
		// 		let auth = Page.Server.ServiceDefinition.Endpoints[ FunctionName ];
		// 		if ( auth )
		// 		{
		// 			if ( !auth.requires_login ) { return true; }
		// 			if ( auth.allowed_roles.includes( Page.User.user_role ) ) { return true; }
		// 		}
		// 		return false;
		// 	};


		// //---------------------------------------------------------------------
		// Page.IsReadOnly =
		// 	function IsReadOnly()
		// 	{
		// 		if ( Page.PageOp === 'Create' ) { return false; }
		// 		if ( Page.PageOp === 'Read' ) { return true; }
		// 		if ( Page.PageOp === 'Update' ) { return false; }
		// 		if ( Page.PageOp === 'Delete' ) { return true; }
		// 		return false;
		// 	};


		//---------------------------------------------------------------------
		Page.CreateItem =
			function CreateItem()
			{
				if ( Page.Socket )
				{
					Page.Socket[ Page.ServiceDefinition.Name ].CreateOne( Page.Item,
						( api_result ) =>
						{
							if ( api_result.error )
							{
								alert( `Error during CreateOne: ${api_result.error}` );
								return;
							}
							Page.Item = api_result.result;
							Page.ItemID = Page.Item.__info.id;
							$scope.$apply();
						} );
				}
				else
				{
					Page.Item = {};
				}
				return;
			};


		//---------------------------------------------------------------------
		Page.ReadItem =
			function ReadItem()
			{
				if ( Page.Socket && Page.ItemID )
				{
					Page.Socket[ Page.ServiceDefinition.Name ].FindOne( Page.ItemID,
						( api_result ) =>
						{
							if ( api_result.error )
							{
								alert( `Error during FindOne: ${api_result.error}` );
								return;
							}
							Page.Item = api_result.result;
							$scope.$apply();
						} );
				}
				else
				{
					Page.Item = {};
				}
				return;
			};


		//---------------------------------------------------------------------
		Page.WriteItem =
			function WriteItem()
			{
				if ( Page.Socket && Page.ItemID )
				{
					Page.Socket[ Page.ServiceDefinition.Name ].WriteOne( Page.ItemID, Page.Item,
						( api_result ) =>
						{
							if ( api_result.error )
							{
								alert( `Error during WriteOne: ${api_result.error}` );
								return;
							}
							// $scope.$apply();
						} );
				}
				return;
			};


		//---------------------------------------------------------------------
		Page.DeleteItem =
			function DeleteItem()
			{
				if ( Page.Socket && Page.ItemID )
				{
					Page.Socket[ Page.ServiceDefinition.Name ].DeleteOne( Page.ItemID,
						( api_result ) =>
						{
							if ( api_result.error )
							{
								console.error( `Error during DeleteOne: ${api_result.error}` );
								return;
							}
							Page.PageOp = 'Read';
							$scope.$apply();
						} );
				}
				return;
			};


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );
