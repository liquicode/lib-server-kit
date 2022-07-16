'use strict';
//---------------------------------------------------------------------
// Express Api Client File for: MathsServer
// Generated:  2022-07-16T04:38:33.429Z
//   Sat Jul 16 2022 00:38:33 GMT-0400 (Eastern Daylight Time)
//---------------------------------------------------------------------

var ExpressApi = {};
var ExpressPages = {};

ExpressApi.ExpressMessage = function ( Method, Address, Payload, Callback )
{
	$.ajax( {
		url: Address,
		type: Method,
		data: Payload,
		success: function ( data, textStatus, jqXHR )
		{
			Callback( null, data );
		},
		error: function ( jqXHR, textStatus, errorThrown )
		{
			let message = '';
			if ( textStatus ) { message += '[status=' + textStatus + '] '; }
			if ( errorThrown ) { message += '[error=' + errorThrown + '] '; }
			Callback( message, null );
		},
	} );
};

ExpressApi.SystemUsers = {};
ExpressApi.SystemUsers.API = {};
ExpressApi.SystemUsers.get_StorageCount = function ( Criteria, Callback ) { ExpressApi.ExpressMessage( 'get', '/SystemUsers/StorageCount', {Criteria:Criteria}, Callback ); }
ExpressApi.SystemUsers.get_StorageFindOne = function ( Criteria, Callback ) { ExpressApi.ExpressMessage( 'get', '/SystemUsers/StorageFindOne', {Criteria:Criteria}, Callback ); }
ExpressApi.SystemUsers.get_StorageFindMany = function ( Criteria, Callback ) { ExpressApi.ExpressMessage( 'get', '/SystemUsers/StorageFindMany', {Criteria:Criteria}, Callback ); }
ExpressApi.SystemUsers.get_StorageCreateOne = function ( Prototype, Callback ) { ExpressApi.ExpressMessage( 'get', '/SystemUsers/StorageCreateOne', {Prototype:Prototype}, Callback ); }
ExpressApi.SystemUsers.get_StorageWriteOne = function ( Criteria, DataObject, Callback ) { ExpressApi.ExpressMessage( 'get', '/SystemUsers/StorageWriteOne', {Criteria:Criteria, DataObject:DataObject}, Callback ); }
ExpressApi.SystemUsers.get_StorageDeleteOne = function ( Criteria, Callback ) { ExpressApi.ExpressMessage( 'get', '/SystemUsers/StorageDeleteOne', {Criteria:Criteria}, Callback ); }
ExpressApi.SystemUsers.get_StorageDeleteMany = function ( Criteria, Callback ) { ExpressApi.ExpressMessage( 'get', '/SystemUsers/StorageDeleteMany', {Criteria:Criteria}, Callback ); }
ExpressPages.SystemUsers = {};
ExpressPages.SystemUsers.List = "/SystemUsers/List";
ExpressPages.SystemUsers.Item = "/SystemUsers/Item";
ExpressPages.SystemUsers.Share = "/SystemUsers/Share";

ExpressApi.Maths = {};
ExpressApi.Maths.API = {};
ExpressApi.Maths.get_Add = function ( A, B, Callback ) { ExpressApi.ExpressMessage( 'get', '/Maths/Add', {A:A, B:B}, Callback ); }
ExpressApi.Maths.get_Subtract = function ( A, B, Callback ) { ExpressApi.ExpressMessage( 'get', '/Maths/Subtract', {A:A, B:B}, Callback ); }
ExpressApi.Maths.get_Multiply = function ( A, B, Callback ) { ExpressApi.ExpressMessage( 'get', '/Maths/Multiply', {A:A, B:B}, Callback ); }
ExpressApi.Maths.get_Divide = function ( A, B, Callback ) { ExpressApi.ExpressMessage( 'get', '/Maths/Divide', {A:A, B:B}, Callback ); }
ExpressPages.Maths = {};
