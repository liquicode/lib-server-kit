'use strict';
//---------------------------------------------------------------------
// Socket Api Client File for: MathsServer
// Generated:  2022-07-10T09:58:11.883Z
//   Sun Jul 10 2022 05:58:11 GMT-0400 (Eastern Daylight Time)
//---------------------------------------------------------------------

var SocketApi = {};

SocketApi.SocketMessage =
	function SocketMessage( Socket, MessageName, Payload, Callback )
	{
		let message_id = uuidv4();
		let message = {
			id: uuidv4(),
			message_name: MessageName,
			User: Socket.__.User,
			Payload: Payload,
		};
		if ( Callback )
		{
			message.callback_name = `${MessageName}->${message.id}`;
			Socket.__.io.once( message.callback_name, Callback );
		}
		Socket.__.io.emit( MessageName, message );
		return;
	};

SocketApi.NewSocket =
	function NewSocket( User, Callback )
	{
		let socket = { __: { io: io(), User: User } };
		// socket.Authorize = function ( Callback ) { SocketApi.SocketMessage( socket, 'Authorize', {}, Callback ); };

		socket.SystemUsers = {};
		socket.SystemUsers.StorageCount = function ( Criteria, Callback ) { SocketApi.SocketMessage( socket, 'SystemUsers.StorageCount', [Criteria], Callback ); }
		socket.SystemUsers.StorageFindOne = function ( Criteria, Callback ) { SocketApi.SocketMessage( socket, 'SystemUsers.StorageFindOne', [Criteria], Callback ); }
		socket.SystemUsers.StorageFindMany = function ( Criteria, Callback ) { SocketApi.SocketMessage( socket, 'SystemUsers.StorageFindMany', [Criteria], Callback ); }
		socket.SystemUsers.StorageCreateOne = function ( Prototype, Callback ) { SocketApi.SocketMessage( socket, 'SystemUsers.StorageCreateOne', [Prototype], Callback ); }
		socket.SystemUsers.StorageWriteOne = function ( Criteria, DataObject, Callback ) { SocketApi.SocketMessage( socket, 'SystemUsers.StorageWriteOne', [Criteria, DataObject], Callback ); }
		socket.SystemUsers.StorageDeleteOne = function ( Criteria, Callback ) { SocketApi.SocketMessage( socket, 'SystemUsers.StorageDeleteOne', [Criteria], Callback ); }
		socket.SystemUsers.StorageDeleteMany = function ( Criteria, Callback ) { SocketApi.SocketMessage( socket, 'SystemUsers.StorageDeleteMany', [Criteria], Callback ); }

		socket.Maths = {};

		socket.__.io.on( 'connect',
			() => 
			{
				console.log( 'Socket connected.' );
				SocketApi.SocketMessage( socket, 'Authorize', {},
					( status ) =>
					{
						console.log( 'User authorization: ' + status );
						Callback( socket, status );
					} );
			} );
		socket.__.io.on( 'disconnect', 
			( reason, details ) =>
			{
				if( details ) { delete details.context; }
				console.log( 'Socket disconnected. Reason [' + reason + ']; Details [' + JSON.stringify( details ) + ']' );
			} );
		socket.__.io.on( 'connect_error',
			( error ) =>
			{
				console.log( 'Socket connection error: ' + error );
			} );

		socket.__.io.connect();

		return;
	};

