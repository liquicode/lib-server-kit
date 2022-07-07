'use strict';


app.controller(
	'Home_Controller',
	function ( $scope, $http, $window, $location, $cookies )
	{


		//---------------------------------------------------------------------
		var Page = {
			Server: window.SERVER_DATA,
			User: window.SERVER_DATA.User,
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
						// console.error( 'Socket connection failed.' );
						return;
					}
					Page.Socket = Socket;
				} );
		}


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );
