'use strict';
//---------------------------------------------------------------------
// Express Api Client File for: MathsServer
// Generated:  2022-07-20T11:26:17.686Z
//   Wed Jul 20 2022 07:26:17 GMT-0400 (Eastern Daylight Time)
//---------------------------------------------------------------------

var ExpressApi = {};    // Service Origins
var ExpressPages = {};  // Service Pages

//---------------------------------------------------------------------
function send_message( Method, Address, Payload, Callback )
{
	console.log( "ExpressApi Invoking [" + Method + "] on [" + Address + "] --> ", Payload );

	$.ajax(
		{
			url: Address,
			type: Method,
			data: Payload,
			success:
				function ( data, textStatus, jqXHR )
				{
					handle_message_success( data, Callback );
				},
			error:
				function ( jqXHR, textStatus, errorThrown )
				{
					let message = '';
					if ( textStatus ) { message += '[status=' + textStatus + ']'; }
					if ( errorThrown ) { message += ' [error=' + errorThrown + ']'; }
					message = 'Error [' + Method + '] on [' + Address + '] <-- ' + message;
					handle_message_error( message, Callback );
				},
		}
	);

	return;
};

//---------------------------------------------------------------------
function handle_message_success( ApiResult, Callback )
{
	if ( ApiResult.ok )
	{
		console.log( "ExpressApi Success [" + ApiResult.origin + "] <-- ", ApiResult.result );
	}
	else
	{
		console.log( "ExpressApi Failure [" + ApiResult.origin + "] <-- " + ApiResult.error );
	}
	Callback( null, ApiResult );
	return;
};

//---------------------------------------------------------------------
function handle_message_error( ErrorMessage, Callback )
{
	console.error( ErrorMessage );
	Callback( ErrorMessage, null );
	return;
};

//---------------------------------------------------------------------
function make_page_url( url, params_object )
{
	let search_params = new URLSearchParams( params_object );
	url += '?' + search_params.toString();
	return url;
}

//---------------------------------------------------------------------
// SystemUsers Origins
ExpressApi.SystemUsers = {};
ExpressApi.SystemUsers.get_StorageCount = function ( Criteria, Callback ) { send_message( 'get', '/SystemUsers/StorageCount', { Criteria: Criteria }, Callback ); };
ExpressApi.SystemUsers.post_StorageCount = function ( Criteria, Callback ) { send_message( 'post', '/SystemUsers/StorageCount', { Criteria: Criteria }, Callback ); };
ExpressApi.SystemUsers.get_StorageFindOne = function ( Criteria, Callback ) { send_message( 'get', '/SystemUsers/StorageFindOne', { Criteria: Criteria }, Callback ); };
ExpressApi.SystemUsers.post_StorageFindOne = function ( Criteria, Callback ) { send_message( 'post', '/SystemUsers/StorageFindOne', { Criteria: Criteria }, Callback ); };
ExpressApi.SystemUsers.get_StorageFindMany = function ( Criteria, Callback ) { send_message( 'get', '/SystemUsers/StorageFindMany', { Criteria: Criteria }, Callback ); };
ExpressApi.SystemUsers.post_StorageFindMany = function ( Criteria, Callback ) { send_message( 'post', '/SystemUsers/StorageFindMany', { Criteria: Criteria }, Callback ); };
ExpressApi.SystemUsers.get_StorageCreateOne = function ( Prototype, Callback ) { send_message( 'get', '/SystemUsers/StorageCreateOne', { Prototype: Prototype }, Callback ); };
ExpressApi.SystemUsers.post_StorageCreateOne = function ( Prototype, Callback ) { send_message( 'post', '/SystemUsers/StorageCreateOne', { Prototype: Prototype }, Callback ); };
ExpressApi.SystemUsers.get_StorageWriteOne = function ( Criteria, DataObject, Callback ) { send_message( 'get', '/SystemUsers/StorageWriteOne', { Criteria: Criteria, DataObject: DataObject }, Callback ); };
ExpressApi.SystemUsers.post_StorageWriteOne = function ( Criteria, DataObject, Callback ) { send_message( 'post', '/SystemUsers/StorageWriteOne', { Criteria: Criteria, DataObject: DataObject }, Callback ); };
ExpressApi.SystemUsers.get_StorageDeleteOne = function ( Criteria, Callback ) { send_message( 'get', '/SystemUsers/StorageDeleteOne', { Criteria: Criteria }, Callback ); };
ExpressApi.SystemUsers.post_StorageDeleteOne = function ( Criteria, Callback ) { send_message( 'post', '/SystemUsers/StorageDeleteOne', { Criteria: Criteria }, Callback ); };
ExpressApi.SystemUsers.get_StorageDeleteMany = function ( Criteria, Callback ) { send_message( 'get', '/SystemUsers/StorageDeleteMany', { Criteria: Criteria }, Callback ); };
ExpressApi.SystemUsers.post_StorageDeleteMany = function ( Criteria, Callback ) { send_message( 'post', '/SystemUsers/StorageDeleteMany', { Criteria: Criteria }, Callback ); };

//---------------------------------------------------------------------
// SystemUsers Pages
ExpressPages.SystemUsers = {};
ExpressPages.SystemUsers.visit_List = function ( Criteria ) { return make_page_url( '/SystemUsers/List', { Criteria: Criteria } ); };
ExpressPages.SystemUsers.visit_Item = function ( ItemID, PageOp ) { return make_page_url( '/SystemUsers/Item', { ItemID: ItemID, PageOp: PageOp } ); };
ExpressPages.SystemUsers.visit_Share = function ( ItemID ) { return make_page_url( '/SystemUsers/Share', { ItemID: ItemID } ); };

//---------------------------------------------------------------------
// Maths Origins
ExpressApi.Maths = {};
ExpressApi.Maths.get_Add = function ( A, B, Callback ) { send_message( 'get', '/Maths/Add', { A: A, B: B }, Callback ); };
ExpressApi.Maths.post_Add = function ( A, B, Callback ) { send_message( 'post', '/Maths/Add', { A: A, B: B }, Callback ); };
ExpressApi.Maths.get_Subtract = function ( A, B, Callback ) { send_message( 'get', '/Maths/Subtract', { A: A, B: B }, Callback ); };
ExpressApi.Maths.post_Subtract = function ( A, B, Callback ) { send_message( 'post', '/Maths/Subtract', { A: A, B: B }, Callback ); };
ExpressApi.Maths.get_Multiply = function ( A, B, Callback ) { send_message( 'get', '/Maths/Multiply', { A: A, B: B }, Callback ); };
ExpressApi.Maths.post_Multiply = function ( A, B, Callback ) { send_message( 'post', '/Maths/Multiply', { A: A, B: B }, Callback ); };
ExpressApi.Maths.get_Divide = function ( A, B, Callback ) { send_message( 'get', '/Maths/Divide', { A: A, B: B }, Callback ); };
ExpressApi.Maths.post_Divide = function ( A, B, Callback ) { send_message( 'post', '/Maths/Divide', { A: A, B: B }, Callback ); };

//---------------------------------------------------------------------
// Maths Pages
ExpressPages.Maths = {};
