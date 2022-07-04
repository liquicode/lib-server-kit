'use strict';


app.controller(
	'Home_Controller',
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
		};
		$scope.Page = Page;


		//=====================================================================
		//=====================================================================
		//
		//		Initialize
		//
		//=====================================================================
		//=====================================================================


		// function SocketMessage( Socket, MessageName, User, Payload, Callback )
		// {
		// 	let message_id = uuidv4();
		// 	let message = {
		// 		id: uuidv4(),
		// 		message_name: MessageName,
		// 		User: User,
		// 		Payload: Payload,
		// 	};
		// 	if ( Callback )
		// 	{
		// 		message.callback_name = `${MessageName}->${message.id}`;
		// 		Socket.io.once( message.callback_name, Callback );
		// 	}
		// 	Socket.io.emit( MessageName, message );
		// 	return;
		// };


		// function NewSocket( User )
		// {
		// 	let socket = {};
		// 	socket.io = io();
		// 	socket.User = User;
		// 	socket.Endpoints = {
		// 		authorize: function ( Callback ) { SocketMessage( socket, 'authorize', socket.User, {}, Callback ); },
		// 	};
		// 	return socket;
		// }


		if ( Page.Server.User )
		{
			var socket = SocketApi.NewSocket( Page.Server.User );
			socket.Authorize(
				function ( Message )
				{
					console.log( 'Authorize User: ' + Message );
					if ( Message === 'Fail' ) { return; }
					socket.SystemUsers.Count( {},
						function ( ApiResult )
						{
							if ( ApiResult.error )
							{
								console.error( ApiResult.error );
							}
							else if ( ApiResult.result === 1 )
							{
								console.log( 'SystemUsers.Count() works! :D' );
							}
							else
							{
								console.error( 'SystemUsers.Count() doesnt work :/' );
								console.error( ApiResult.result );
							}
						} );
				} );
		}

		// Exit Controller
		return;
	} );
