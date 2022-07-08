'use strict';


app.controller(
	'Signup_Controller',
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
			user_email: '',
			password: '',
			message: 'Waiting for Signup'
		};
		$scope.Page = Page;


		//---------------------------------------------------------------------
		Page.Signup =
			() =>
			{
				if ( !Page.user_email ) { Page.message = 'Email is required.'; }
				else if ( !Page.password ) { Page.message = 'Password is required.'; }
				else
				{
					$.post(
						'/auth/signup',
						{
							username: Page.user_email,
							password: Page.password,
						} )
						.done(
							function ( result )
							{
								Page.message = "User Signed Up Successfully!";
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
								Page.message = "Error while Signing Up: " + error;
								$scope.$apply();
								return;
							} );
				}
				return;
			};

		// Exit Controller
		return;
	} );

