'use strict';


app.controller(
	'Login_Controller',
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
			// user_email: '',
			// password: '',
			user_email: "admin@server",
			password: "password",
			message: 'Waiting for Login'
		};
		$scope.Page = Page;


		//---------------------------------------------------------------------
		Page.Login =
			() =>
			{

				$.post(
					'/auth/login',
					{
						username: Page.user_email,
						password: Page.password,
					} )
					.done(
						function ( result )
						{
							Page.message = "User Logged In Successfully!";
							if ( result )
							{
								$window.location.href = result;
							}
							else
							{
								$window.location.href = '/';
							}
							$scope.$apply();
							return;
						} )
					.fail(
						function ( xhr, status, error ) 
						{
							Page.message = "Error while Logging In: " + error;
							$scope.$apply();
							return;
						} )
					;

				return;
			};

		// Exit Controller
		return;
	} );

