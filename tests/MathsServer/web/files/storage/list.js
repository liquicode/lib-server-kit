'use strict';


app.controller(
	'StorageList_Controller',
	function ( $scope, $http, $window, $location, $cookies )
	{


		//---------------------------------------------------------------------
		var Page = {
			Server: window.SERVER_DATA,
			User: window.SERVER_DATA.User,
			ItemDefinition: window.SERVER_DATA.ItemDefinition,
			ServiceDefinition: window.SERVER_DATA.ServiceDefinition,
			Parameters: window.SERVER_DATA.Parameters,
			Socket: null,
			Items: [],
		};
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
					Page.ListItems();
				} );
		}


		//---------------------------------------------------------------------
		Page.UserCanDo =
			function UserCanDo( FunctionName )
			{
				let auth = Page.Server.ServiceDefinition.Endpoints[ FunctionName ];
				if ( auth )
				{
					if ( !auth.requires_login ) { return true; }
					if ( auth.allowed_roles.includes( Page.User.user_role ) ) { return true; }
				}
				return false;
			};


		//---------------------------------------------------------------------
		Page.ShowCreateButton =
			function ShowCreateButton()
			{
				return Page.UserCanDo( 'CreateOne' );
			};


		//---------------------------------------------------------------------
		Page.ShowDeleteButton =
			function ShowDeleteButton()
			{
				return Page.UserCanDo( 'DeleteOne' );
			};


		//---------------------------------------------------------------------
		Page.ListItems =
			function ListItems()
			{
				if ( Page.Socket === null ) { return; }

				Page.Socket.SystemUsers.StorageFindMany( {},
					function ( ApiResult )
					{
						if ( ApiResult.error )
						{
							console.error( ApiResult.error );
						}
						else
						{
							Page.Items = ApiResult.result;
							// console.log( 'SystemUsers.FindMany() works! :D' );
							$scope.$apply();
						}
					} );

				return;
			};


		//---------------------------------------------------------------------
		Page.ItemCreateUrl =
			function ItemCreateUrl()
			{
				return `/ui/${Page.Server.ServiceDefinition.name}/Item?PageOp=Create`;
			};


		//---------------------------------------------------------------------
		Page.ItemViewUrl =
			function ItemViewUrl( object )
			{
				return `/ui/${Page.Server.ServiceDefinition.name}/Item?ItemID=${object.__info.id}&PageOp=Read`;
			};


		//---------------------------------------------------------------------
		Page.ItemEditUrl =
			function ItemEditUrl( object )
			{
				return `/ui/${Page.Server.ServiceDefinition.name}/Item?ItemID=${object.__info.id}&PageOp=Update`;
			};


		//---------------------------------------------------------------------
		Page.ItemDeleteUrl =
			function ItemDeleteUrl( object )
			{
				return `/ui/${Page.Server.ServiceDefinition.name}/Item?ItemID=${object.__info.id}&PageOp=Delete`;
			};


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );

