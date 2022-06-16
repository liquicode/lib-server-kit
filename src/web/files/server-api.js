'use strict';


//------------------------------------------
const API_SERVER_ADDRESS = 'http://localhost:4200';


//---------------------------------------------------------------------
var api_callback =
	function ( api_result, status, callback ) 
	{
		if ( api_result.error )
		{
			console.error( 'Error in [' + api_result.origin + ']: ' + api_result.error );
			if ( callback ) { callback( api_result.error, api_result ); }
		}
		else if ( status != 'success' )
		{
			let message = 'Server returned a status of: ' + status;
			console.error( message );
			if ( callback ) { callback( message, null ); }
		}
		else
		{
			if ( callback ) { callback( null, api_result ); }
		}
		return;
	};



//---------------------------------------------------------------------
// function managed_fetch_json( url, reject, resolve )
// {
// 	fetch( url )
// 		.then( function ( response )
// 		{
// 			if ( response.status !== 200 )
// 			{
// 				if ( reject ) { reject( 'HTTP Error: ' + response.status + ' (' + response.statusText + ')' ); }
// 				return;
// 			}
// 			response.json()
// 				.then( function ( data )
// 				{
// 					if ( resolve ) { resolve( data ); }
// 					return;
// 				} );
// 		} )
// 		.catch( function ( err )
// 		{
// 			if ( reject ) { reject( 'Error: ' + err.message ); }
// 			return;
// 		} );
// }



function get_managed_service( ServiceName )
{
	var service =
	{
		//---------------------------------------------------------------------
		ListAll: function ( callback )
		{
			$.get(
				'/api/' + ServiceName + '/ListAll',
				{},
				function ( api_result, status ) 
				{
					api_callback( api_result, status, callback );
				} );
		},

		//---------------------------------------------------------------------
		ListMine: function ( callback )
		{
			$.get(
				'/api/' + ServiceName + '/ListMine',
				{},
				function ( api_result, status ) 
				{
					api_callback( api_result, status, callback );
				} );
		},

		//---------------------------------------------------------------------
		CreateOne: function ( Prototype, callback )
		{
			$.post(
				'/api/' + ServiceName + '/CreateOne',
				{ Prototype: Prototype },
				function ( api_result, status ) 
				{
					api_callback( api_result, status, callback );
				} );
		},

		//---------------------------------------------------------------------
		ReadOne: function ( ManagedObjectID, callback )
		{
			$.get(
				'/api/' + ServiceName + '/ReadOne/' + ManagedObjectID,
				{},
				function ( api_result, status ) 
				{
					api_callback( api_result, status, callback );
				} );
		},

		//---------------------------------------------------------------------
		WriteOne: function ( ManagedObject, callback )
		{
			$.post(
				'/api/' + ServiceName + '/WriteOne',
				{ ManagedObject: ManagedObject },
				function ( api_result, status ) 
				{
					api_callback( api_result, status, callback );
				} );
		},

		//---------------------------------------------------------------------
		DeleteOne: function ( ManagedObjectID, callback )
		{
			$.post(
				'/api/' + ServiceName + '/DeleteOne/' + ManagedObjectID,
				{},
				function ( api_result, status ) 
				{
					api_callback( api_result, status, callback );
				} );
		},

		//---------------------------------------------------------------------
		DeleteMine: function ( callback )
		{
			$.post(
				'/api/' + ServiceName + '/DeleteMine',
				{},
				function ( api_result, status ) 
				{
					api_callback( api_result, status, callback );
				} );
		},

		//---------------------------------------------------------------------
		DeleteAll: function ( callback )
		{
			$.post(
				'/api/' + ServiceName + '/DeleteAll',
				{},
				function ( api_result, status ) 
				{
					api_callback( api_result, status, callback );
				} );
		},

	};

	//---------------------------------------------------------------------
	return service;
}


//---------------------------------------------------------------------
//---------------------------------------------------------------------
//
//	Server API
//
//---------------------------------------------------------------------
//---------------------------------------------------------------------


var SERVER_API =
{
	SystemUsers: get_managed_service( 'SystemUsers' ),
};


