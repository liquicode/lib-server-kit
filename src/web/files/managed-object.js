'use strict';


app.controller(
	'ManagedObject_Controller',
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
			object: null,
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
		Page.IsReadOnly =
			function IsReadOnly()
			{
				if ( Page.Server.PageFunction === 'CreateOne' ) { return false; }
				if ( Page.Server.PageFunction === 'ReadOne' ) { return true; }
				if ( Page.Server.PageFunction === 'WriteOne' ) { return false; }
				if ( Page.Server.PageFunction === 'DeleteOne' ) { return true; }
				return false;
			};


		//---------------------------------------------------------------------
		Page.ReadObject =
			function ReadObject()
			{
				if ( Page.Server.ObjectID )
				{
					SERVER_API[ Page.Def.ServiceName ].ReadOne(
						Page.Server.ObjectID,
						function ( error, api_result )
						{
							if ( error )
							{
								alert( `Server Error: ${error}` );
							}
							else
							{
								Page.object = api_result.object;
								$scope.$apply();
							}
						} );
				}
				else
				{
					Page.object = {};
				}
				return;
			};


		//---------------------------------------------------------------------
		Page.CreateObject =
			function CreateObject()
			{
				SERVER_API[ Page.Def.ServiceName ].CreateOne(
					Page.object,
					function ( error, api_result )
					{
						if ( error )
						{
							alert( `Server Error: ${error}` );
						}
						else
						{
							Page.object = api_result.object;
							$scope.$apply();
							alert( Page.Def.ObjectTitle + ' was created' );
						}
					} );
				return;
			};


		//---------------------------------------------------------------------
		Page.WriteObject =
			function WriteObject()
			{
				SERVER_API[ Page.Def.ServiceName ].WriteOne(
					Page.object,
					function ( error, api_result )
					{
						if ( error )
						{
							alert( `Server Error: ${error}` );
						}
						else
						{
							// Page.object = api_result.object;
							// $scope.$apply();
							alert( Page.Def.ObjectTitle + ' was updated' );
						}
					} );
				return;
			};


		//---------------------------------------------------------------------
		Page.DeleteObject =
			function DeleteObject()
			{
				SERVER_API[ Page.Def.ServiceName ].DeleteOne(
					Page.Server.ObjectID,
					function ( error, api_result )
					{
						if ( error )
						{
							alert( `Server Error: ${error}` );
						}
						else
						{
							// Page.object = api_result.object;
							// $scope.$apply();
							alert( Page.Def.ObjectTitle + ' was deleted' );
						}
					} );
				return;
			};


		//=====================================================================
		//=====================================================================
		//
		//		Initialize
		//
		//=====================================================================
		//=====================================================================


		if ( Page.Server.PageFunction === 'CreateOne' ) 
		{
			if ( Page.Server.ObjectID === 'new' ) 
			{
				Page.Server.ObjectID = '';
			}
		}
		Page.ReadObject();


		// Exit Controller
		return;
	} );

