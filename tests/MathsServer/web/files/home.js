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
			SocketApi.NewSocket( Page.Server.User,
				( Socket, Status ) =>
				{
					if ( Status !== 'OK' )
					{
						// console.error( 'Socket connection failed.' );
						return;
					}
					Page.Socket = Socket;
					Page.Socket.SystemUsers.FindMany( {},
						function ( ApiResult )
						{
							if ( ApiResult.error )
							{
								console.error( ApiResult.error );
							}
							else if ( ApiResult.result.length > 0 )
							{
								console.log( 'SystemUsers.FindMany() works! :D' );
							}
							else
							{
								console.error( 'SystemUsers.FindMany() doesnt work :/' );
								console.error( ApiResult.result );
							}
						} );
				} );
		}

		// Exit Controller
		return;
	} );
