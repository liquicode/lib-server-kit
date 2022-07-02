'use strict';
//---------------------------------------------------------------------
// Server Client File for: MathsServer
// Generated:  2022-07-02T10:12:44.906Z
//   Sat Jul 02 2022 06:12:44 GMT-0400 (Eastern Daylight Time)
//---------------------------------------------------------------------

var Server = {};

Server.SocketMessage =
	function SocketMessage( Socket, MessageName, User, Payload, Callback )
	{
		let message_id = uuidv4();
		let message = {
			id: uuidv4(),
			message_name: MessageName,
			User: User,
			Payload: Payload,
		};
		if ( Callback )
		{
			message.callback_name = `${MessageName}->${message.id}`;
			Socket.io.once( message.callback_name, Callback );
		}
		Socket.io.emit( MessageName, message );
		return;
	};

Server.NewSocket =
	function NewSocket( User )
	{
		let socket = {};
		socket.io = io();
		socket.User = User;
		socket.Services = {};
		socket.Services.authorize = function ( Callback ) { Server.SocketMessage( socket, 'authorize', socket.User, {}, Callback ); };
		socket.Services.SystemUsers = {};
		socket.Services.SystemUsers.Count = function ( Criteria, Callback ) { Server.SocketMessage( socket, 'SystemUsers.Count', socket.User, [Criteria], Callback ); }
		socket.Services.SystemUsers.FindOne = function ( Criteria, Callback ) { Server.SocketMessage( socket, 'SystemUsers.FindOne', socket.User, [Criteria], Callback ); }
		socket.Services.SystemUsers.FindMany = function ( Criteria, Callback ) { Server.SocketMessage( socket, 'SystemUsers.FindMany', socket.User, [Criteria], Callback ); }
		socket.Services.SystemUsers.CreateOne = function ( Prototype, Callback ) { Server.SocketMessage( socket, 'SystemUsers.CreateOne', socket.User, [Prototype], Callback ); }
		socket.Services.SystemUsers.WriteOne = function ( Criteria, DataObject, Callback ) { Server.SocketMessage( socket, 'SystemUsers.WriteOne', socket.User, [Criteria, DataObject], Callback ); }
		socket.Services.SystemUsers.DeleteOne = function ( Criteria, Callback ) { Server.SocketMessage( socket, 'SystemUsers.DeleteOne', socket.User, [Criteria], Callback ); }
		socket.Services.SystemUsers.DeleteMany = function ( Criteria, Callback ) { Server.SocketMessage( socket, 'SystemUsers.DeleteMany', socket.User, [Criteria], Callback ); }
		socket.Services.SystemUsers.Share = function ( Criteria, Readers, Writers, MakePublic, Callback ) { Server.SocketMessage( socket, 'SystemUsers.Share', socket.User, [Criteria, Readers, Writers, MakePublic], Callback ); }
		socket.Services.SystemUsers.Unshare = function ( Criteria, NotReaders, NotWriters, MakeUnpublic, Callback ) { Server.SocketMessage( socket, 'SystemUsers.Unshare', socket.User, [Criteria, NotReaders, NotWriters, MakeUnpublic], Callback ); }
		socket.Services.Maths = {};
		socket.Services.Maths.Add = function ( A, B, Callback ) { Server.SocketMessage( socket, 'Maths.Add', socket.User, [A, B], Callback ); }
		socket.Services.Maths.Subtract = function ( A, B, Callback ) { Server.SocketMessage( socket, 'Maths.Subtract', socket.User, [A, B], Callback ); }
		socket.Services.Maths.Multiply = function ( A, B, Callback ) { Server.SocketMessage( socket, 'Maths.Multiply', socket.User, [A, B], Callback ); }
		socket.Services.Maths.Divide = function ( A, B, Callback ) { Server.SocketMessage( socket, 'Maths.Divide', socket.User, [A, B], Callback ); }

		return socket;
	};


// SystemUsers Service Client
Server.SystemUsers =
{
	API: {},
	Pages: {},
};

// SystemUsers.Count

// SystemUsers.FindOne

// SystemUsers.FindMany

// SystemUsers.CreateOne

// SystemUsers.WriteOne

// SystemUsers.DeleteOne

// SystemUsers.DeleteMany

// SystemUsers.Share

// SystemUsers.Unshare

// Maths Service Client
Server.Maths =
{
	API: {},
	Pages: {},
};

// Maths.Add

// Maths.Subtract

// Maths.Multiply

// Maths.Divide
