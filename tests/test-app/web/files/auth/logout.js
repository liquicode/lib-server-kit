'use strict';


app.controller(
	'Logout_Controller',
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
			message: 'Waiting for Logout'
		};
		$scope.Page = Page;


		//---------------------------------------------------------------------
		Page.Logout =
			() =>
			{

				$.post( '/auth/logout', {} )
					.done(
						function ( api_result )
						{
							Page.message = "User Logged Out Successfully!";
							$window.location.href = '/';
							$scope.$apply();
							return;
						} )
					.fail(
						function ( xhr, status, error ) 
						{
							Page.message = "Error while Logging Out: " + error;
							$scope.$apply();
							return;
						} )
					;

				return;
			};


		// Exit Controller
		return;
	} );

