'use strict';
//---------------------------------------------------------------------
// Socket Api Client File for: MathsServer
// Generated:  2022-07-07T08:05:03.867Z
//   Thu Jul 07 2022 04:05:03 GMT-0400 (Eastern Daylight Time)
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
		socket.SystemUsers.StorageShare = function ( Criteria, Readers, Writers, MakePublic, Callback ) { SocketApi.SocketMessage( socket, 'SystemUsers.StorageShare', [Criteria, Readers, Writers, MakePublic], Callback ); }
		socket.SystemUsers.StorageUnshare = function ( Criteria, NotReaders, NotWriters, MakeUnpublic, Callback ) { SocketApi.SocketMessage( socket, 'SystemUsers.StorageUnshare', [Criteria, NotReaders, NotWriters, MakeUnpublic], Callback ); }

		socket.Maths = {};
		socket.Maths.Add = function ( A, B, Callback ) { SocketApi.SocketMessage( socket, 'Maths.Add', [A, B], Callback ); }
		socket.Maths.Subtract = function ( A, B, Callback ) { SocketApi.SocketMessage( socket, 'Maths.Subtract', [A, B], Callback ); }
		socket.Maths.Multiply = function ( A, B, Callback ) { SocketApi.SocketMessage( socket, 'Maths.Multiply', [A, B], Callback ); }
		socket.Maths.Divide = function ( A, B, Callback ) { SocketApi.SocketMessage( socket, 'Maths.Divide', [A, B], Callback ); }

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
				console.log( 'Socket connection error. Error [' + error + ']' );
			} );

		socket.__.io.connect();

		return;
	};

