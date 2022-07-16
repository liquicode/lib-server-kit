'use strict';


app.controller(
	'Explorer_Controller',
	function ( $scope, $http, $window, $location, $cookies )
	{


		//---------------------------------------------------------------------
		var Page = {
			User: window.SERVER_DATA.User,
			Socket: null,
		};
		$scope.Page = Page;


		//---------------------------------------------------------------------
		let visbility_map = {};


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
				} );
		}


		//---------------------------------------------------------------------
		Page.ToggleVisible =
			function ToggleVisible( content_id )
			{
				visbility_map[ content_id ] = !visbility_map[ content_id ];
				return;
			};


		//---------------------------------------------------------------------
		Page.IsVisible =
			function IsVisible( content_id )
			{
				return !!visbility_map[ content_id ];
			};


		//---------------------------------------------------------------------
		Page.Invoke =
			function Invoke( Verb, ServiceName, EndpointName )
			{

				//TODO: Implement
				console.log( "Invoking [" + Verb + "] on " + ServiceName + "." + EndpointName );

				return;
			};


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );

