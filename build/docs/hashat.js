"use strict";


const LIB_PATH = require( 'path' );
const LIB_FS = require( 'fs' );


const HASHAT_SYMBOL = '#@';
// const HASHAT_ARRAY_ELEMENT_INDICATOR = '-';

const HASHAT_TAG_TYPE = `${HASHAT_SYMBOL}type`;
const HASHAT_TAG_NAME = `${HASHAT_SYMBOL}name`;
const HASHAT_TAG_PARENT = `${HASHAT_SYMBOL}parent`;


//=====================================================================
//=====================================================================
//
//		FUNCTIONS
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
function process_exit( status, error )
{
	if ( error ) { console.error( error ); };
	process.exit( status );
}


//---------------------------------------------------------------------
// Get all files in a path, recursively.
function get_file_list( Path )
{
	let files_found = [];
	let filenames = LIB_FS.readdirSync( Path );
	filenames.forEach(
		filename =>
		{
			let filepath = LIB_PATH.join( Path, filename );
			if ( LIB_FS.statSync( filepath ).isDirectory() )
			{
				files_found.push( ...get_file_list( filepath ) );
			}
			else
			{
				files_found.push( filepath );
			}
		} );
	return files_found;
}


//---------------------------------------------------------------------
// Get the next word in a string if text.
function is_whitespace( ch ) { return ( '\t\n\r\v'.indexOf( ch ) >= 0 ); }
function get_next_word( Text, Index = 0 )
{
	let word = '';
	while ( is_whitespace( Text.substr( Index, 1 ) ) )
	{
		Index++;
		if ( Index >= Text.length ) { return word; }
	}
	while ( !is_whitespace( Text.substr( Index, 1 ) ) )
	{
		word += Text.substr( Index, 1 );
		Index++;
		if ( Index >= Text.length ) { return word; }
	}
	return word;
}


//---------------------------------------------------------------------
// Find the object with this name.
function find_hashat_object( Name )
{
	function _find_hashat_object( Parent, Name )
	{
		// if ( ( Parent.__type === 'object' ) && ( Parent.__name === Name ) ) { return Parent; }
		if ( Parent.__name === Name ) { return Parent; }
		let keys = Object.keys( Parent );
		for ( let key_index = 0; key_index < keys.length; key_index++ )
		{
			let key = keys[ key_index ];
			if ( !key.startsWith( HASHAT_SYMBOL ) && ( typeof ( Parent[ key ] ) === 'object' ) )
			{
				let v = _find_hashat_object( Parent[ key ], Name );
				if ( v ) { return v; }
			}
		}
		return null;
	}
	return _find_hashat_object( HASHAT, Name );
}


//=====================================================================
//=====================================================================
//
//		MAIN EXECUTION
//
//=====================================================================
//=====================================================================


var HASHAT = {}; // The hashat document object.


//---------------------------------------------------------------------
// Load the package file and project path.
var PACKAGE = null;
var PROJECT_PATH = null;
if ( process.argv.length > 2 )
{
	try
	{
		let path = process.argv[ 2 ];
		path = LIB_PATH.resolve( path );
		if ( path.endsWith( 'package.json' ) ) // User specified an exact filename.
		{
			PACKAGE = require( path );
		}
		else if ( LIB_FS.existsSync( path ) ) // User specified a path.
		{
			path = LIB_PATH.join( path, 'package.json' );
			PACKAGE = require( path );
		}
		PROJECT_PATH = path.substr( 0, path.length - 12 );
	}
	catch ( error ) { process_exit( -1, error.message ); }
}
if ( !PACKAGE )
{
	try
	{
		let path = process.cwd();
		path = LIB_PATH.join( path, 'package.json' );
		PACKAGE = require( path );
		PROJECT_PATH = path.substr( 0, path.length - 12 );
	}
	catch ( error ) { process_exit( -1, error.message ); }
}


//---------------------------------------------------------------------
// Load the ancillary files from the project path.
var README = null;
{
	let path = LIB_PATH.join( PROJECT_PATH, 'readme.md' );
	if ( LIB_FS.existsSync( path ) )
	{
		README = LIB_FS.readFileSync( path, 'utf-8' );
	}
}

//---------------------------------------------------------------------
// Get the application path.
var APP_PATH = null;
if ( PACKAGE.main )
{
	let path = LIB_PATH.join( PROJECT_PATH, PACKAGE.main );
	if ( !LIB_FS.existsSync( path ) ) { process_exit( -1, `The file specified in the project's package.main does not exist [${path}].` ); }
	APP_PATH = LIB_PATH.dirname( path );
}
else { process_exit( -1, `The project's entry for package.main is missing.` ); }


//---------------------------------------------------------------------
// Initialization Report
{
	console.log( `hashat is initialized.` );
	console.log( `  - project path     : ${PROJECT_PATH}` );
	console.log( `  - application path : ${APP_PATH}` );
}


//---------------------------------------------------------------------
function read_hashats_in_file( filename )
{
	let hashats = [];
	console.log( `Reading file [${filename.substr( APP_PATH.length )}]` );
	let text = LIB_FS.readFileSync( filename, 'utf-8' );
	let block_index = 0;
	while ( block_index < text.length )
	{
		// Get the next comment block.
		let block_start = text.indexOf( '/*', block_index );
		if ( block_start < 0 ) { break; }
		let block_end = text.indexOf( '*/', block_start );
		if ( block_end < 0 ) { block_end = text.length; }
		let block = text.substr( block_start + 2, ( block_end - block_start - 2 ) );
		block_index = block_end + 1;

		// Process this comment block.
		let hashat_index = 0;
		let hashat = {};
		while ( hashat_index < block.length )
		{
			// Get the hashat tag.
			let hashat_start = block.indexOf( HASHAT_SYMBOL, hashat_index );
			if ( hashat_start < 0 ) { break; }
			let hashat_end = block.indexOf( HASHAT_SYMBOL, hashat_start + HASHAT_SYMBOL.length );
			if ( hashat_end < 0 ) { hashat_end = block.length; }
			let hashat_tag = block.substr( hashat_start + HASHAT_SYMBOL.length, ( hashat_end - hashat_start - HASHAT_SYMBOL.length ) );
			hashat_index = hashat_start + HASHAT_SYMBOL.length; // Not a bug.

			// Parse the hashat tag and value.
			hashat_tag = hashat_tag.trim();
			let tag_name = `${HASHAT_SYMBOL}${get_next_word( hashat_tag )}`;
			let tag_value = hashat_tag.substr( tag_name.length - 2 );
			tag_value = tag_value.trim();

			// Add the tag and value to the hashat.
			hashat[ tag_name ] = tag_value;
		}

		// Store the hashat.
		if ( Object.keys( hashat ).length ) 
		{
			let valid = true;
			if ( typeof hashat[ HASHAT_TAG_TYPE ] !== 'string' ) { valid = false; }
			if ( typeof hashat[ HASHAT_TAG_NAME ] !== 'string' ) { valid = false; }
			if ( valid )
			{
				console.log( `\t${hashat[ HASHAT_TAG_NAME ]}` );
				hashats.push( hashat );
			}
			else
			{
				console.warn( `Invalid hashat found:`, hashat );
			}
		}

	}
	return hashats;
}


//---------------------------------------------------------------------
function find_hashat( name )
{
	function _find_hashat( parent, name )
	{
		if ( typeof parent[ name ] !== 'undefined' ) { return parent[ name ]; }
		let keys = Object.keys( parent );
		for ( let index = 0; index < keys.length; index++ )
		{
			let key = keys[ index ];
			if ( !key.startsWith( HASHAT_SYMBOL ) )
			{
				let item = parent[ key ];
				if ( ( typeof item === 'object' ) && ( item[ HASHAT_TAG_TYPE ] === 'Module' ) )
				{
					let v = _find_hashat( item, name );
					if ( v ) { return v; }
				}
			}
		}
		return null;
	}
	if ( !name ) { return HASHAT; }
	return _find_hashat( HASHAT, name );
}


//---------------------------------------------------------------------
function post_process_hashat( hashat )
{
	let keys = Object.keys( hashat );
	for ( let key_index = 0; key_index < keys.length; key_index++ )
	{
		// Get the value.
		let key = keys[ key_index ];
		let value = hashat[ key ];

		if ( key.startsWith( HASHAT_SYMBOL ) )
		{
			// Always trim the value.
			value = value.trim();

			// Check for multiline and trim each line.
			if ( value.indexOf( '\n' ) >= 0 )
			{
				let lines = value.split( '\n' );
				for ( let line_index = 0; line_index < lines.length; line_index++ )
				{
					lines[ line_index ] = lines[ line_index ].trim();
				}
				value = lines.join( '\n' );
			}

			// // Check for array notation.
			// if ( value.startsWith( HASHAT_ARRAY_ELEMENT_INDICATOR ) )
			// {
			// 	let values = value.split( `\n` );
			// 	let new_values = [];
			// 	for ( let value_index = 0; value_index < values.length; value_index++ )
			// 	{
			// 		if ( values[ value_index ].startsWith( HASHAT_ARRAY_ELEMENT_INDICATOR ) )
			// 		{
			// 			// Remove array element indicator and any leading whitespace.
			// 			let new_value = values[ value_index ].substr( HASHAT_ARRAY_ELEMENT_INDICATOR.length ).trim();
			// 			new_values.push( new_value );
			// 		}
			// 		else
			// 		{
			// 			// Concat with previous value.
			// 			let new_value = values[ value_index ].trim();
			// 			new_values[ new_values.length - 1 ] = new_values[ new_values.length - 1 ] + ' ' + new_value;
			// 		}
			// 	}
			// 	// Update value with the array.
			// 	value = new_values;
			// }

			// Replace the value.
			hashat[ key ] = value;
		}
	}
	return hashat;
}


//---------------------------------------------------------------------
// Load the docs.
{
	let objects = [];
	let members = [];

	// Read the source files.
	let filenames = get_file_list( APP_PATH );
	for ( let filename_index = 0; filename_index < filenames.length; filename_index++ )
	{
		let filename = filenames[ filename_index ];
		let items = read_hashats_in_file( filename );
		for ( let index = 0; index < items.length; index++ )
		{
			if ( 'Module|Object'.indexOf( items[ index ][ HASHAT_TAG_TYPE ] ) >= 0 )
			{ objects.push( items[ index ] ); }
			else
			{ members.push( items[ index ] ); }
		}
	}

	// Sort the objects by parent and name.
	objects.sort(
		function ( a, b )
		{
			let a_parent = '' + a[ HASHAT_TAG_PARENT ];
			let b_parent = '' + b[ HASHAT_TAG_PARENT ];
			let a_name = '' + a[ HASHAT_TAG_NAME ];
			let b_name = '' + b[ HASHAT_TAG_NAME ];
			let c = a_parent.localeCompare( b_parent );
			if ( c === 0 ) { c = a_name.localeCompare( b_name ); }
			return c;
		} );

	// Build the HASHAT object.
	for ( let index = 0; index < objects.length; index++ )
	{
		let hashat = objects[ index ];

		// Post process the hashat.
		post_process_hashat( hashat );

		// Locate the parent.
		let parent = find_hashat( hashat[ HASHAT_TAG_PARENT ] );
		if ( !parent )
		{
			// Construct a (top-level) placeholder parent.
			parent = {};
			parent[ HASHAT_TAG_TYPE ] = 'Module';
			parent[ HASHAT_TAG_NAME ] = hashat[ HASHAT_TAG_PARENT ];
			parent[ HASHAT_TAG_PARENT ] = '';
			HASHAT[ parent[ HASHAT_TAG_NAME ] ] = parent;
		}

		// Assign to the parent.
		parent[ hashat[ HASHAT_TAG_NAME ] ] = hashat;
	}

	// Add the members (in the order they were found in)
	for ( let index = 0; index < members.length; index++ )
	{
		let hashat = members[ index ];
		let parent = find_hashat( hashat[ HASHAT_TAG_PARENT ] );
		if ( !parent )
		{
			parent = {};
			parent[ HASHAT_TAG_TYPE ] = 'Module';
			parent[ HASHAT_TAG_NAME ] = hashat[ HASHAT_TAG_PARENT ];
			parent[ HASHAT_TAG_PARENT ] = '';
			HASHAT[ parent[ HASHAT_TAG_NAME ] ] = parent;
		}
		parent[ hashat[ HASHAT_TAG_NAME ] ] = hashat;
	}

}

//---------------------------------------------------------------------
// Save the docs.
{
	HASHAT[ `${HASHAT_SYMBOL}package.json` ] = PACKAGE;
	HASHAT[ `${HASHAT_SYMBOL}readme.md` ] = README;
	let filename = LIB_PATH.join( PROJECT_PATH, 'hashat.json' );
	console.log( `Saving hashat file[ ${filename}]` );
	LIB_FS.writeFileSync( filename, JSON.stringify( HASHAT, null, '\t' ) );
}

//---------------------------------------------------------------------
// Finish.
console.log( `hashat is done.` );
process.exit( 0 );;;
