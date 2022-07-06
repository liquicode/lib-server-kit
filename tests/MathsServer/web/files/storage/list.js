'use strict';


app.controller(
	'StorageList_Controller',
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
			Socket: null,
			object_info_visible: false,
			objects: [],
		};
		$scope.Page = Page;


		//---------------------------------------------------------------------
		if ( Page.Server.User )
		{
			SocketApi.NewSocket( Page.Server.User,
				( Socket, Status ) =>
				{
					if ( Status !== 'OK' )
					{
						// console.error( 'Socket connection failed.' );
						return;
					}
					Page.Socket = Socket;
					Page.ListObjects();
				} );
		}


		//---------------------------------------------------------------------
		// Page.Def = Page.Server.ObjectDefinition;


		//---------------------------------------------------------------------
		Page.UserCanDo =
			function UserCanDo( FunctionName )
			{
				let auth = Page.Server.ServiceDefinition.Endpoints[ FunctionName ];
				if ( auth )
				{
					if ( !auth.requires_login ) { return true; }
					if ( auth.allowed_roles.includes( Page.Server.User.user_role ) ) { return true; }
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
		Page.ListObjects =
			function ListObjects()
			{
				if ( Page.Socket === null ) { return; }

				Page.Socket.SystemUsers.FindMany( {},
					function ( ApiResult )
					{
						if ( ApiResult.error )
						{
							console.error( ApiResult.error );
						}
						else
						{
							Page.objects = ApiResult.result;
							// console.log( 'SystemUsers.FindMany() works! :D' );
							$scope.$apply();
						}
					} );

				// if ( Page.Server.PageFunction == 'ListAll' )
				// {
				// 	SERVER_API[ Page.Def.ServiceName ].ListAll(
				// 		function ( error, api_result )
				// 		{
				// 			if ( error )
				// 			{
				// 				alert( `Server Error: ${error}` );
				// 			}
				// 			else
				// 			{
				// 				Page.objects = api_result.objects;
				// 				$scope.$apply();
				// 			}
				// 		} );
				// }
				// else if ( Page.Server.PageFunction == 'ListMine' )
				// {
				// 	SERVER_API[ Page.Def.ServiceName ].ListMine(
				// 		function ( error, api_result )
				// 		{
				// 			if ( error )
				// 			{
				// 				alert( `Server Error: ${error}` );
				// 			}
				// 			else
				// 			{
				// 				Page.objects = api_result.objects;
				// 				$scope.$apply();
				// 			}
				// 		} );
				// }
				// if ( Page.Server.PageFunction == 'DeleteMine' )
				// {
				// 	SERVER_API[ Page.Def.ServiceName ].DeleteMine(
				// 		function ( error, api_result )
				// 		{
				// 			if ( error )
				// 			{
				// 				alert( `Server Error: ${error}` );
				// 			}
				// 			else
				// 			{
				// 				Page.objects = api_result.objects;
				// 				$scope.$apply();
				// 			}
				// 		} );
				// }
				// else if ( Page.Server.PageFunction == 'DeleteAll' )
				// {
				// 	SERVER_API[ Page.Def.ServiceName ].DeleteAll(
				// 		function ( error, api_result )
				// 		{
				// 			if ( error )
				// 			{
				// 				alert( `Server Error: ${error}` );
				// 			}
				// 			else
				// 			{
				// 				Page.objects = api_result.objects;
				// 				$scope.$apply();
				// 			}
				// 		} );
				// }
				return;
			};


		//---------------------------------------------------------------------
		// Page.SafeUrl =
		// 	function SafeUrl( Url )
		// 	{
		// 		if ( !Url ) { return ''; }
		// 		return Url;
		// 	};


		//---------------------------------------------------------------------
		Page.ObjectCreateUrl =
			function ObjectCreateUrl()
			{
				return '/' + Page.Server.ServiceDefinition.Name + '/CreateOne/new';
			};


		//---------------------------------------------------------------------
		Page.ObjectViewUrl =
			function ObjectViewUrl( object )
			{
				return '/' + Page.Server.ServiceDefinition.Name + '/FindOne/' + object.__info.id;
			};


		//---------------------------------------------------------------------
		Page.ObjectEditUrl =
			function ObjectEditUrl( object )
			{
				return '/' + Page.Server.ServiceDefinition.Name + '/WriteOne/' + object.__info.id;
			};


		//---------------------------------------------------------------------
		Page.ObjectDeleteUrl =
			function ObjectDeleteUrl( object )
			{
				return '/' + Page.Server.ServiceDefinition.Name + '/DeleteOne/' + object.__info.id;
			};


		//=====================================================================
		//=====================================================================
		//
		//		Initialize
		//
		//=====================================================================
		//=====================================================================


		// Exit Controller
		return;
	} );

