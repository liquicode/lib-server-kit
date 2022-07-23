'use strict';
//---------------------------------------------------------------------
// Express Api Client File for: MathsServer
// Generated:  2022-07-23T09:02:10.675Z
//   Sat Jul 23 2022 05:02:10 GMT-0400 (Eastern Daylight Time)
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
// ServerAccounts Origins
ExpressApi.ServerAccounts = {};
ExpressApi.ServerAccounts.get_NewServiceItem = function ( Prototype, Callback ) { send_message( 'get', '/ServerAccounts/NewServiceItem', { Prototype: Prototype }, Callback ); };
ExpressApi.ServerAccounts.post_NewServiceItem = function ( Prototype, Callback ) { send_message( 'post', '/ServerAccounts/NewServiceItem', { Prototype: Prototype }, Callback ); };
ExpressApi.ServerAccounts.get_StorageCount = function ( Criteria, Callback ) { send_message( 'get', '/ServerAccounts/StorageCount', { Criteria: Criteria }, Callback ); };
ExpressApi.ServerAccounts.post_StorageCount = function ( Criteria, Callback ) { send_message( 'post', '/ServerAccounts/StorageCount', { Criteria: Criteria }, Callback ); };
ExpressApi.ServerAccounts.get_StorageFindOne = function ( Criteria, Callback ) { send_message( 'get', '/ServerAccounts/StorageFindOne', { Criteria: Criteria }, Callback ); };
ExpressApi.ServerAccounts.post_StorageFindOne = function ( Criteria, Callback ) { send_message( 'post', '/ServerAccounts/StorageFindOne', { Criteria: Criteria }, Callback ); };
ExpressApi.ServerAccounts.get_StorageFindMany = function ( Criteria, Callback ) { send_message( 'get', '/ServerAccounts/StorageFindMany', { Criteria: Criteria }, Callback ); };
ExpressApi.ServerAccounts.post_StorageFindMany = function ( Criteria, Callback ) { send_message( 'post', '/ServerAccounts/StorageFindMany', { Criteria: Criteria }, Callback ); };
ExpressApi.ServerAccounts.get_StorageCreateOne = function ( Prototype, Callback ) { send_message( 'get', '/ServerAccounts/StorageCreateOne', { Prototype: Prototype }, Callback ); };
ExpressApi.ServerAccounts.post_StorageCreateOne = function ( Prototype, Callback ) { send_message( 'post', '/ServerAccounts/StorageCreateOne', { Prototype: Prototype }, Callback ); };
ExpressApi.ServerAccounts.get_StorageWriteOne = function ( Criteria, DataObject, Callback ) { send_message( 'get', '/ServerAccounts/StorageWriteOne', { Criteria: Criteria, DataObject: DataObject }, Callback ); };
ExpressApi.ServerAccounts.post_StorageWriteOne = function ( Criteria, DataObject, Callback ) { send_message( 'post', '/ServerAccounts/StorageWriteOne', { Criteria: Criteria, DataObject: DataObject }, Callback ); };
ExpressApi.ServerAccounts.get_StorageDeleteOne = function ( Criteria, Callback ) { send_message( 'get', '/ServerAccounts/StorageDeleteOne', { Criteria: Criteria }, Callback ); };
ExpressApi.ServerAccounts.post_StorageDeleteOne = function ( Criteria, Callback ) { send_message( 'post', '/ServerAccounts/StorageDeleteOne', { Criteria: Criteria }, Callback ); };
ExpressApi.ServerAccounts.get_StorageDeleteMany = function ( Criteria, Callback ) { send_message( 'get', '/ServerAccounts/StorageDeleteMany', { Criteria: Criteria }, Callback ); };
ExpressApi.ServerAccounts.post_StorageDeleteMany = function ( Criteria, Callback ) { send_message( 'post', '/ServerAccounts/StorageDeleteMany', { Criteria: Criteria }, Callback ); };

//---------------------------------------------------------------------
// ServerAccounts Pages
ExpressPages.ServerAccounts = {};
ExpressPages.ServerAccounts.visit_Explore = function (  ) { return make_page_url( '/ServerAccounts/Explore', {  } ); };
ExpressPages.ServerAccounts.visit_List = function ( Criteria ) { return make_page_url( '/ServerAccounts/List', { Criteria: Criteria } ); };
ExpressPages.ServerAccounts.visit_Item = function ( ItemID, PageOp ) { return make_page_url( '/ServerAccounts/Item', { ItemID: ItemID, PageOp: PageOp } ); };
ExpressPages.ServerAccounts.visit_Share = function ( ItemID ) { return make_page_url( '/ServerAccounts/Share', { ItemID: ItemID } ); };

//---------------------------------------------------------------------
// Maths Origins
ExpressApi.Maths = {};
ExpressApi.Maths.get_NewServiceItem = function ( Prototype, Callback ) { send_message( 'get', '/Maths/NewServiceItem', { Prototype: Prototype }, Callback ); };
ExpressApi.Maths.post_NewServiceItem = function ( Prototype, Callback ) { send_message( 'post', '/Maths/NewServiceItem', { Prototype: Prototype }, Callback ); };
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
ExpressPages.Maths.visit_Explore = function (  ) { return make_page_url( '/Maths/Explore', {  } ); };
