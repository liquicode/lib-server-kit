'use strict';


app.controller(
	'ManagedList_Controller',
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
			object_info_visible: false,
			objects: [],
		};
		$scope.Page = Page;


		//---------------------------------------------------------------------
		Page.Def = Page.Server.ObjectDefinition;


		//---------------------------------------------------------------------
		Page.UserCanDo =
			function UserCanDo( FunctionName )
			{
				var auth = Page.Server.ServiceEndpoints[ FunctionName ];
				if ( !auth.requires_login ) { return true; }
				if ( auth.allowed_roles.includes( Page.Server.User.role ) ) { return true; }
				return false;
			};


		//---------------------------------------------------------------------
		Page.ShowCreateButton =
			function ShowCreateButton()
			{
				if ( Page.Server.PageFunction === 'ListAll' )
				{
					return Page.UserCanDo( 'CreateOne' );
				}
				else if ( Page.Server.PageFunction === 'ListMine' )
				{
					return Page.UserCanDo( 'CreateOne' );
				}
				return false;
			};


		//---------------------------------------------------------------------
		Page.ShowDeleteButton =
			function ShowDeleteButton()
			{
				if ( Page.Server.PageFunction === 'DeleteMine' )
				{
					return Page.UserCanDo( 'DeleteMine' );
				}
				else if ( Page.Server.PageFunction === 'DeleteAll' )
				{
					return Page.UserCanDo( 'DeleteAll' );
				}
				return false;
			};


		//---------------------------------------------------------------------
		Page.ListObjects =
			function ListObjects()
			{
				if ( Page.Server.PageFunction == 'ListAll' )
				{
					SERVER_API[ Page.Def.ServiceName ].ListAll(
						function ( error, api_result )
						{
							if ( error )
							{
								alert( `Server Error: ${error}` );
							}
							else
							{
								Page.objects = api_result.objects;
								$scope.$apply();
							}
						} );
				}
				else if ( Page.Server.PageFunction == 'ListMine' )
				{
					SERVER_API[ Page.Def.ServiceName ].ListMine(
						function ( error, api_result )
						{
							if ( error )
							{
								alert( `Server Error: ${error}` );
							}
							else
							{
								Page.objects = api_result.objects;
								$scope.$apply();
							}
						} );
				}
				if ( Page.Server.PageFunction == 'DeleteMine' )
				{
					SERVER_API[ Page.Def.ServiceName ].DeleteMine(
						function ( error, api_result )
						{
							if ( error )
							{
								alert( `Server Error: ${error}` );
							}
							else
							{
								Page.objects = api_result.objects;
								$scope.$apply();
							}
						} );
				}
				else if ( Page.Server.PageFunction == 'DeleteAll' )
				{
					SERVER_API[ Page.Def.ServiceName ].DeleteAll(
						function ( error, api_result )
						{
							if ( error )
							{
								alert( `Server Error: ${error}` );
							}
							else
							{
								Page.objects = api_result.objects;
								$scope.$apply();
							}
						} );
				}
				return;
			};


		//---------------------------------------------------------------------
		Page.ObjectCreateUrl =
			function ObjectCreateUrl()
			{
				return '/' + Page.Def.ServiceName + '/CreateOne/new';
			};


		//---------------------------------------------------------------------
		Page.ObjectViewUrl =
			function ObjectViewUrl( object )
			{
				return '/' + Page.Def.ServiceName + '/ReadOne/' + object._m.id;
			};


		//---------------------------------------------------------------------
		Page.ObjectEditUrl =
			function ObjectEditUrl( object )
			{
				return '/' + Page.Def.ServiceName + '/WriteOne/' + object._m.id;
			};


		//---------------------------------------------------------------------
		Page.ObjectDeleteUrl =
			function ObjectDeleteUrl( object )
			{
				return '/' + Page.Def.ServiceName + '/DeleteOne/' + object._m.id;
			};


		//=====================================================================
		//=====================================================================
		//
		//		Initialize
		//
		//=====================================================================
		//=====================================================================


		Page.ListObjects();


		// Exit Controller
		return;
	} );

