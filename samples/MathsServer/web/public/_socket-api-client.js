'use strict';
//---------------------------------------------------------------------
// Socket Api Client File for: MathsServer
// Generated:  2022-07-23T09:02:10.734Z
//   Sat Jul 23 2022 05:02:10 GMT-0400 (Eastern Daylight Time)
//---------------------------------------------------------------------

var SocketApi = {};

SocketApi.SocketMessage =
	function SocketMessage( Socket, MessageName, Payload, Callback )
	{
		console.log( "SocketApi Invoking [" + MessageName + "] --> ", Payload );
		let message_id = uuidv4();
		let message = {
			id: uuidv4(),
			message_name: MessageName,
			Payload: Payload,
		};
		// Setup the callback.
		message.callback_name = MessageName + '->' + message.id;
		function socket_proxy_callback( api_result )
		{
			if ( api_result.ok )
			{
				console.log( "SocketApi Success [" + api_result.origin + "] <-- ", api_result.result );
			}
			else
			{
				console.log( "SocketApi Failure [" + api_result.origin + "] <-- " + api_result.error );
			}
			if ( Callback )
			{
				Callback( api_result );
			}
			return;
		}
		Socket.__.io.once( message.callback_name, socket_proxy_callback );
		// Send the message.
		Socket.__.io.emit( MessageName, message );
		return;
	};

SocketApi.NewSocket =
	function NewSocket( ConnectCallback )
	{
		let socket = { __: { io: io() } };

		socket.ServerAccounts = {};
		socket.ServerAccounts.NewServiceItem = function ( Prototype, Callback ) { SocketApi.SocketMessage( socket, 'ServerAccounts.NewServiceItem', { Prototype: Prototype }, Callback ); }
		socket.ServerAccounts.StorageCount = function ( Criteria, Callback ) { SocketApi.SocketMessage( socket, 'ServerAccounts.StorageCount', { Criteria: Criteria }, Callback ); }
		socket.ServerAccounts.StorageFindOne = function ( Criteria, Callback ) { SocketApi.SocketMessage( socket, 'ServerAccounts.StorageFindOne', { Criteria: Criteria }, Callback ); }
		socket.ServerAccounts.StorageFindMany = function ( Criteria, Callback ) { SocketApi.SocketMessage( socket, 'ServerAccounts.StorageFindMany', { Criteria: Criteria }, Callback ); }
		socket.ServerAccounts.StorageCreateOne = function ( Prototype, Callback ) { SocketApi.SocketMessage( socket, 'ServerAccounts.StorageCreateOne', { Prototype: Prototype }, Callback ); }
		socket.ServerAccounts.StorageWriteOne = function ( Criteria, DataObject, Callback ) { SocketApi.SocketMessage( socket, 'ServerAccounts.StorageWriteOne', { Criteria: Criteria, DataObject: DataObject }, Callback ); }
		socket.ServerAccounts.StorageDeleteOne = function ( Criteria, Callback ) { SocketApi.SocketMessage( socket, 'ServerAccounts.StorageDeleteOne', { Criteria: Criteria }, Callback ); }
		socket.ServerAccounts.StorageDeleteMany = function ( Criteria, Callback ) { SocketApi.SocketMessage( socket, 'ServerAccounts.StorageDeleteMany', { Criteria: Criteria }, Callback ); }

		socket.Maths = {};
		socket.Maths.NewServiceItem = function ( Prototype, Callback ) { SocketApi.SocketMessage( socket, 'Maths.NewServiceItem', { Prototype: Prototype }, Callback ); }
		socket.Maths.Add = function ( A, B, Callback ) { SocketApi.SocketMessage( socket, 'Maths.Add', { A: A, B: B }, Callback ); }
		socket.Maths.Subtract = function ( A, B, Callback ) { SocketApi.SocketMessage( socket, 'Maths.Subtract', { A: A, B: B }, Callback ); }
		socket.Maths.Multiply = function ( A, B, Callback ) { SocketApi.SocketMessage( socket, 'Maths.Multiply', { A: A, B: B }, Callback ); }
		socket.Maths.Divide = function ( A, B, Callback ) { SocketApi.SocketMessage( socket, 'Maths.Divide', { A: A, B: B }, Callback ); }

		socket.__.io.on( 'connect',
			() => 
			{
				console.log( 'Socket connected.' );
				if( ConnectCallback ) { ConnectCallback( socket ); }
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

		return socket;
	};

