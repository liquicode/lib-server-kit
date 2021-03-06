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
			Socket: SocketApi.NewSocket(),
			Items: [],
		};
		{
			// Parse Parameters
			Page.Criteria = Page.Parameters.Criteria;
		}
		$scope.Page = Page;


		//---------------------------------------------------------------------
		Page.UserCanDo =
			function UserCanDo( FunctionName )
			{
				let auth = Page.Server.ServiceDefinition.Origins[ FunctionName ];
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

				Page.Socket[ Page.ServiceDefinition.name ].StorageFindMany( {},
					function ( ApiResult )
					{
						if ( ApiResult.error )
						{
							console.error( ApiResult.error );
						}
						else
						{
							Page.Items = ApiResult.result;
							$scope.$apply();
						}
					} );

				return;
			};


		//---------------------------------------------------------------------
		Page.ItemCreateUrl =
			function ItemCreateUrl()
			{
				return `/${Page.Server.ServiceDefinition.name}/Item?PageOp=Create`;
			};


		//---------------------------------------------------------------------
		Page.ItemViewUrl =
			function ItemViewUrl( object )
			{
				return `/${Page.Server.ServiceDefinition.name}/Item?ItemID=${object.__.id}&PageOp=Read`;
			};


		//---------------------------------------------------------------------
		Page.ItemEditUrl =
			function ItemEditUrl( object )
			{
				return `/${Page.Server.ServiceDefinition.name}/Item?ItemID=${object.__.id}&PageOp=Update`;
			};


		//---------------------------------------------------------------------
		Page.ItemDeleteUrl =
			function ItemDeleteUrl( object )
			{
				return `/${Page.Server.ServiceDefinition.name}/Item?ItemID=${object.__.id}&PageOp=Delete`;
			};


		//---------------------------------------------------------------------
		// Start Controller
		Page.ListItems();


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );

