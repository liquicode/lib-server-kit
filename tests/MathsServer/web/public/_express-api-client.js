'use strict';
//---------------------------------------------------------------------
// Express Api Client File for: MathsServer
// Generated:  2022-07-10T09:58:11.875Z
//   Sun Jul 10 2022 05:58:11 GMT-0400 (Eastern Daylight Time)
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
ExpressApi.SystemUsers.get_StorageCount = function ( Criteria, Callback ) { ExpressApi.ExpressMessage( 'get', '/api/SystemUsers/StorageCount', {Criteria:Criteria}, Callback ); }
ExpressApi.SystemUsers.get_StorageFindOne = function ( Criteria, Callback ) { ExpressApi.ExpressMessage( 'get', '/api/SystemUsers/StorageFindOne', {Criteria:Criteria}, Callback ); }
ExpressApi.SystemUsers.get_StorageFindMany = function ( Criteria, Callback ) { ExpressApi.ExpressMessage( 'get', '/api/SystemUsers/StorageFindMany', {Criteria:Criteria}, Callback ); }
ExpressApi.SystemUsers.get_StorageCreateOne = function ( Prototype, Callback ) { ExpressApi.ExpressMessage( 'get', '/api/SystemUsers/StorageCreateOne', {Prototype:Prototype}, Callback ); }
ExpressApi.SystemUsers.get_StorageWriteOne = function ( Criteria, DataObject, Callback ) { ExpressApi.ExpressMessage( 'get', '/api/SystemUsers/StorageWriteOne', {Criteria:Criteria, DataObject:DataObject}, Callback ); }
ExpressApi.SystemUsers.get_StorageDeleteOne = function ( Criteria, Callback ) { ExpressApi.ExpressMessage( 'get', '/api/SystemUsers/StorageDeleteOne', {Criteria:Criteria}, Callback ); }
ExpressApi.SystemUsers.get_StorageDeleteMany = function ( Criteria, Callback ) { ExpressApi.ExpressMessage( 'get', '/api/SystemUsers/StorageDeleteMany', {Criteria:Criteria}, Callback ); }
ExpressPages.SystemUsers = {};
ExpressPages.SystemUsers.List = "/SystemUsers/List";
ExpressPages.SystemUsers.Item = "/SystemUsers/Item";
ExpressPages.SystemUsers.Share = "/SystemUsers/Share";

ExpressApi.Maths = {};
ExpressApi.Maths.API = {};
ExpressApi.Maths.get_Add = function ( A, B, Callback ) { ExpressApi.ExpressMessage( 'get', '/api/Maths/Add', {A:A, B:B}, Callback ); }
ExpressApi.Maths.get_Subtract = function ( A, B, Callback ) { ExpressApi.ExpressMessage( 'get', '/api/Maths/Subtract', {A:A, B:B}, Callback ); }
ExpressApi.Maths.get_Multiply = function ( A, B, Callback ) { ExpressApi.ExpressMessage( 'get', '/api/Maths/Multiply', {A:A, B:B}, Callback ); }
ExpressApi.Maths.get_Divide = function ( A, B, Callback ) { ExpressApi.ExpressMessage( 'get', '/api/Maths/Divide', {A:A, B:B}, Callback ); }
ExpressPages.Maths = {};
