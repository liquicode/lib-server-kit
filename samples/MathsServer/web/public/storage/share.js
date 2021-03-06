'use strict';


app.controller(
	'StorageItemShare_Controller',
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
			// ItemID: '',
			object_info_visible: false,
			Socket: SocketApi.NewSocket(),
			Item: null,
		};
		{
			// Parse Parameters
			Page.ItemID = Page.Parameters.ItemID;
		}
		$scope.Page = Page;


		//---------------------------------------------------------------------
		Page.ItemInfo =
			function ItemInfo()
			{
				if ( Page.Item === null ) { return ''; }
				return JSON.stringify( Page.Item.__, null, '    ' );
			};


		//---------------------------------------------------------------------
		Page.ReadItem =
			function ReadItem()
			{
				if ( Page.Socket && Page.ItemID )
				{
					Page.Socket[ Page.ServiceDefinition.name ].FindOne( Page.ItemID,
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
		// Initialize Controller
		Page.ReadItem();


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );

