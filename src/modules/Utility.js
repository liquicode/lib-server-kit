"use strict";


//=====================================================================
//=====================================================================
//
//		lib-utility
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const LIB_FS = require( 'fs' );
const LIB_HTTP = require( 'http' );
const LIB_HTTPS = require( 'https' );
const LIB_CRYPTO = require( 'crypto' );
const LIB_JSON = require( '@liquicode/lib-json' );


//=====================================================================
//=====================================================================
//
//		Module Exports
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
exports.clone = clone;
exports.sleep = sleep;
exports.random = random;
exports.unique_id = unique_id;
exports.read_json_file = read_json_file;
exports.write_json_file = write_json_file;
exports.json_parse = json_parse;
exports.json_stringify = json_stringify;
exports.replace_all = replace_all;
exports.is_undefined = is_undefined;
exports.assign_if_defined = assign_if_defined;
exports.value_missing_null_empty = value_missing_null_empty;
exports.value_exists = value_exists;
exports.missing_parameter_error = missing_parameter_error;
exports.merge_objects = merge_objects;
exports.format_timestamp = format_timestamp;
exports.string_compare = string_compare;
exports.zulu_timestamp = zulu_timestamp;
exports.async_make_get_request = async_make_get_request;
exports.async_download_file = async_download_file;
exports.get_safe_filename = get_safe_filename;


//---------------------------------------------------------------------
function clone( Value )
{
	return JSON.parse( JSON.stringify( Value ) );
};


//---------------------------------------------------------------------
async function sleep( Milliseconds )
{
	return new Promise( resolve => setTimeout( resolve, Milliseconds ) );
};


//---------------------------------------------------------------------
function random( Min, Max )
{
	let range = ( Max - Min ) + 1;
	return Math.floor( ( Math.random() * range ) + Min );
};


//---------------------------------------------------------------------
function unique_id( Size = 12 )
{
	let alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890';
	let alphabet_1st = 'abcdefghijklmnopqrstuvwxyz';
	let result = '';
	for ( let index = 0; index < Size; index++ )
	{
		// ALERT: LIB_CRYPTO.randomInt requires Node v14.10.0, v12.19.0
		if ( index === 0 )
		{
			// Make sure the 1st character of the ID is non-numeric.
			result += alphabet_1st[ LIB_CRYPTO.randomInt( 0, alphabet_1st.length - 1 ) ];
		}
		else
		{
			// Use the entire alphabet for the rest of the ID.
			result += alphabet[ LIB_CRYPTO.randomInt( 0, alphabet.length - 1 ) ];
		}
	}
	return result;
};


//---------------------------------------------------------------------
function read_json_file( Filename )
{
	let json = LIB_FS.readFileSync( Filename, 'utf8' );
	let value = LIB_JSON.Parse( json );
	return value;
};


//---------------------------------------------------------------------
function write_json_file( Filename, Json )
{
	let value = JSON.stringify( Json );
	let json = LIB_FS.writeFileSync( Filename, value );
	return;
};


//---------------------------------------------------------------------
function json_parse( StringValue )
{
	//TODO: Use LIB_FS_EXTRA.readJsonSync from a temp file instead.
	// let value = JSON.parse( StringValue );
	let value = LIB_JSON.Parse( StringValue );
	return value;
};


//---------------------------------------------------------------------
function json_stringify( JsonValue, PrettyPrint = 0 )
{
	let text = '';
	if ( PrettyPrint === 0 )
	{
		text = JSON.stringify( JsonValue );
	}
	else if ( PrettyPrint === 1 )
	{
		text = JSON.stringify( JsonValue, null, '  ' );
	}
	else if ( PrettyPrint === 2 )
	{
		text = LIB_JSON.Stringify( JsonValue, LIB_JSON.StringifyOptionsStandard() );
	}
	else if ( PrettyPrint === 3 )
	{
		text = LIB_JSON.Stringify( JsonValue, LIB_JSON.StringifyOptionsVeryPretty() );
	}
	else if ( PrettyPrint === 4 )
	{
		text = LIB_JSON.Tablify( JsonValue );
	}
	return text;
};


//---------------------------------------------------------------------
function replace_all( Text, Search, Replace )
{
	while ( Text.indexOf( Search ) >= 0 )
	{
		Text = Text.replace( Search, Replace );
	}
	return Text;
};


//---------------------------------------------------------------------
function is_undefined( Value )
{
	return ( typeof Value === 'undefined' );
};


//---------------------------------------------------------------------
function assign_if_defined( Value, Default )
{
	if ( typeof Value === 'undefined' ) { return Default; }
	return Value;
};


//---------------------------------------------------------------------
function value_missing_null_empty( Value )
{
	if ( Value === null ) { return true; }
	switch ( typeof Value )
	{
		case 'undefined':
			return true;
		case 'string':
			if ( Value.length === 0 ) { return true; }
		case 'object':
			if ( Value === null ) { return true; }
			if ( Object.keys( Value ).length === 0 ) { return true; }
			break;
	}
	return false;
};


//---------------------------------------------------------------------
function value_exists( Value )
{
	return !value_missing_null_empty( Value );
};


//---------------------------------------------------------------------
function missing_parameter_error( Name )
{
	return new Error( `Required parameter is missing: ${Name}` );
};


//---------------------------------------------------------------------
function merge_objects( ObjectA, ObjectB )
{
	let C = JSON.parse( JSON.stringify( ObjectA ) );

	function update_children( ParentA, ParentB )
	{
		Object.keys( ParentB ).forEach(
			key =>
			{
				let value = ParentB[ key ];
				if ( typeof ParentA[ key ] === 'undefined' )
				{
					ParentA[ key ] = JSON.parse( JSON.stringify( value ) );
				}
				else
				{
					if ( typeof value === 'object' )
					{
						// Merge objects.
						update_children( ParentA[ key ], value );
					}
					else
					{
						// Overwrite values.
						ParentA[ key ] = JSON.parse( JSON.stringify( value ) );
					}
				}
			} );
	}

	update_children( C, ObjectB );
	return C;
};


//---------------------------------------------------------------------
function format_timestamp( timestamp )
{
	try
	{
		let d = new Date( timestamp );
		if ( d.toString() === 'Invalid Date' ) { return ''; }
		let options =
		{
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour12: true,
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'America/New_York',
			timeZoneName: 'short',
		};
		let s = d.toLocaleString( 'en-US', options );
		return s;
	}
	catch ( error ) 
	{
		console.error( error.message, error );
	}
	return '';
};


//---------------------------------------------------------------------
function string_compare( a, b, case_sensitive = true )
{
	try
	{
		if ( typeof a !== 'string' ) { return -1; }
		if ( typeof b !== 'string' ) { return 1; }
		if ( !case_sensitive )
		{
			a = a.toLowerCase();
			b = b.toLowerCase();
		}
		return a.localeCompare( b );
	}
	catch ( error ) 
	{
		console.error( error.message, error );
		return null;
	}
};


//---------------------------------------------------------------------
function zulu_timestamp()
{
	return ( new Date() ).toISOString();
};


//---------------------------------------------------------------------
async function async_make_get_request( url )
{
	let http_engine = null;
	if ( url.toLowerCase().startsWith( 'http:' ) ) { http_engine = LIB_HTTP; }
	else if ( url.toLowerCase().startsWith( 'https:' ) ) { http_engine = LIB_HTTPS; }
	else { throw new Error( `Unsupported protocol. Must be http or https.` ); }

	return new Promise(
		( resolve, reject ) =>
		{
			try
			{
				http_engine.get(
					url,
					function ( response ) 
					{
						response.on( 'data', data =>
						{
							resolve( data );
						} );
					} );
			}
			catch ( error )
			{
				reject( error );
			}
		} );
}


//---------------------------------------------------------------------
async function async_download_file( url, filename )
{
	let http_engine = null;
	if ( url.toLowerCase().startsWith( 'http:' ) ) { http_engine = LIB_HTTP; }
	else if ( url.toLowerCase().startsWith( 'https:' ) ) { http_engine = LIB_HTTPS; }
	else { throw new Error( `Unsupported protocol. Must be http or https.` ); }

	return new Promise(
		( resolve, reject ) =>
		{
			try
			{
				http_engine.get(
					url,
					function ( response ) 
					{
						const file_stream = LIB_FS.createWriteStream( filename );
						response.pipe( file_stream );
						file_stream.on(
							'finish',
							function ()
							{
								file_stream.close();
								resolve( true );
							} );
					} );
			}
			catch ( error )
			{
				reject( error );
			}
		} );
}


//---------------------------------------------------------------------
function get_safe_filename( filename, fill_char = '-' )
{
	// System characters.
	filename = filename.replace( '.', fill_char );
	filename = filename.replace( '\\', fill_char );
	filename = filename.replace( '/', fill_char );
	filename = filename.replace( ':', fill_char );
	// Shift + number
	filename = filename.replace( '!', fill_char );
	filename = filename.replace( '@', fill_char );
	filename = filename.replace( '#', fill_char );
	filename = filename.replace( '$', fill_char );
	filename = filename.replace( '%', fill_char );
	filename = filename.replace( '^', fill_char );
	filename = filename.replace( '&', fill_char );
	filename = filename.replace( '*', fill_char );
	// Other restricted characters.
	filename = filename.replace( '+', fill_char );
	filename = filename.replace( '{', fill_char );
	filename = filename.replace( '}', fill_char );
	filename = filename.replace( '<', fill_char );
	filename = filename.replace( '>', fill_char );
	filename = filename.replace( '?', fill_char );
	filename = filename.replace( "'", fill_char );
	filename = filename.replace( '`', fill_char );
	filename = filename.replace( '|', fill_char );
	filename = filename.replace( '=', fill_char );
	// Return the sanitized filename.
	return filename;
}

