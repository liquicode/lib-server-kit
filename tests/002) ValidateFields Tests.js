'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '../src/lib-server-kit.js' ) );
let application_name = 'TestServer';
let application_path = __dirname;
let Server = null;

//---------------------------------------------------------------------
describe( `002) ValidateFields Tests`,
	function ()
	{
		let FIELDS_NAME_TYPE = [
			{ name: 'boolean', schema: { type: 'boolean' } },
			{ name: 'integer', schema: { type: 'integer' } },
			{ name: 'number', schema: { type: 'number' } },
			{ name: 'string', schema: { type: 'string' } },
			{ name: 'array', schema: { type: 'array' } },
			{ name: 'object', schema: { type: 'object' } },
		];

		let FIELDS_NAME_TYPE_DEFAULT = [
			{ name: 'boolean', schema: { type: 'boolean' }, default: true },
			{ name: 'integer', schema: { type: 'integer' }, default: 0 },
			{ name: 'number', schema: { type: 'number' }, default: 0.0 },
			{ name: 'string', schema: { type: 'string' }, default: '' },
			{ name: 'array', schema: { type: 'array' }, default: [] },
			{ name: 'object', schema: { type: 'object' }, default: {} },
		];

		let FIELDS_NAME_TYPE_REQUIRED = [
			{ name: 'boolean', schema: { type: 'boolean' }, required: true },
			{ name: 'integer', schema: { type: 'integer' }, required: true },
			{ name: 'number', schema: { type: 'number' }, required: true },
			{ name: 'string', schema: { type: 'string' }, required: true },
			{ name: 'array', schema: { type: 'array' }, required: true },
			{ name: 'object', schema: { type: 'object' }, required: true },
		];

		let FIELDS_NAME_TYPE_DEFAULT_REQUIRED = [
			{ name: 'boolean', schema: { type: 'boolean' }, default: true, required: true },
			{ name: 'integer', schema: { type: 'integer' }, default: 0, required: true },
			{ name: 'number', schema: { type: 'number' }, default: 0.0, required: true },
			{ name: 'string', schema: { type: 'string' }, default: '', required: true },
			{ name: 'array', schema: { type: 'array' }, default: [], required: true },
			{ name: 'object', schema: { type: 'object' }, default: {}, required: true },
		];


		//---------------------------------------------------------------------
		before(
			function ()
			{
				Server = LIB_SERVER_KIT.NewServer( application_name, application_path );
				Server.Initialize();
				return;
			}
		);


		//---------------------------------------------------------------------
		it( `should be initialized`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Config.Settings );
				LIB_ASSERT.ok( Server.Config.Settings.AppInfo );
				LIB_ASSERT.ok( Server.Config.Settings.AppInfo.name === application_name );
			}
		);


		//---------------------------------------------------------------------
		describe( `Validation Tests`,
			function ()
			{


				//---------------------------------------------------------------------
				it( `should validate successfully an empty object with no defaults or required fields`,
					async function ()
					{
						let field_values = {};
						let validation_error = Server.ValidateFields( FIELDS_NAME_TYPE, field_values, false, false );
						LIB_ASSERT.ok( validation_error === '' ); // No validation errors.
						LIB_ASSERT.ok( typeof field_values.boolean === 'undefined' );
						LIB_ASSERT.ok( typeof field_values.integer === 'undefined' );
						LIB_ASSERT.ok( typeof field_values.number === 'undefined' );
						LIB_ASSERT.ok( typeof field_values.string === 'undefined' );
						LIB_ASSERT.ok( typeof field_values.array === 'undefined' );
						LIB_ASSERT.ok( typeof field_values.object === 'undefined' );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should generate validation errors for missing fields that are required`,
					async function ()
					{
						let field_values = {};
						let validation_error = Server.ValidateFields( FIELDS_NAME_TYPE_REQUIRED, field_values, false, false );
						LIB_ASSERT.ok( validation_error !== '' ); // Validation errors exist!
						let errors = validation_error.split( '; ' );
						LIB_ASSERT.ok( errors.length === 7 );
						LIB_ASSERT.ok( errors[ 0 ] === '[boolean] is required' );
						LIB_ASSERT.ok( errors[ 1 ] === '[integer] is required' );
						LIB_ASSERT.ok( errors[ 2 ] === '[number] is required' );
						LIB_ASSERT.ok( errors[ 3 ] === '[string] is required' );
						LIB_ASSERT.ok( errors[ 4 ] === '[array] is required' );
						LIB_ASSERT.ok( errors[ 5 ] === '[object] is required' );
						LIB_ASSERT.ok( errors[ 6 ] === '' ); // Always has an empty trailing entry.
						return;
					} );


			} );


		//---------------------------------------------------------------------
		describe( `ConvertValues Tests`,
			function ()
			{


				//---------------------------------------------------------------------
				it( `should set nulls for an empty object`,
					async function ()
					{
						let field_values = {};
						let validation_error = Server.ValidateFields( FIELDS_NAME_TYPE, field_values, true, false );
						LIB_ASSERT.ok( validation_error === '' ); // No validation errors.
						LIB_ASSERT.ok( field_values.boolean === null );
						LIB_ASSERT.ok( field_values.integer === null );
						LIB_ASSERT.ok( field_values.number === null );
						LIB_ASSERT.ok( field_values.string === null );
						LIB_ASSERT.ok( field_values.array === null );
						LIB_ASSERT.ok( field_values.object === null );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should set defaults for an empty object`,
					async function ()
					{
						let field_values = {};
						let validation_error = Server.ValidateFields( FIELDS_NAME_TYPE_DEFAULT, field_values, true, false );
						LIB_ASSERT.ok( validation_error === '' ); // No validation errors.
						LIB_ASSERT.ok( field_values.boolean === true );
						LIB_ASSERT.ok( field_values.integer === 0 );
						LIB_ASSERT.ok( field_values.number === 0.0 );
						LIB_ASSERT.ok( field_values.string === '' );
						LIB_ASSERT.ok( Array.isArray( field_values.array ) );
						LIB_ASSERT.ok( field_values.array.length === 0 );
						LIB_ASSERT.ok( typeof field_values.object === 'object' );
						LIB_ASSERT.ok( Object.keys( field_values.object ).length === 0 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should intialize an empty object with default values even when no fields are required`,
					async function ()
					{
						let field_values = {};
						let validation_error = Server.ValidateFields( FIELDS_NAME_TYPE_DEFAULT, field_values, true, false );
						LIB_ASSERT.ok( validation_error === '' ); // No validation errors.
						LIB_ASSERT.ok( field_values.boolean === true );
						LIB_ASSERT.ok( field_values.integer === 0 );
						LIB_ASSERT.ok( field_values.number === 0.0 );
						LIB_ASSERT.ok( field_values.string === '' );
						LIB_ASSERT.ok( Array.isArray( field_values.array ) );
						LIB_ASSERT.ok( field_values.array.length === 0 );
						LIB_ASSERT.ok( typeof field_values.object === 'object' );
						LIB_ASSERT.ok( Object.keys( field_values.object ).length === 0 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should intialize an empty object with default values when fields are required, but also generate validation errors`,
					async function ()
					{
						let field_values = {};
						let validation_error = Server.ValidateFields( FIELDS_NAME_TYPE_DEFAULT_REQUIRED, field_values, true, false );
						LIB_ASSERT.ok( validation_error !== '' ); // Validation errors exist!
						let errors = validation_error.split( '; ' );
						LIB_ASSERT.ok( errors.length === 7 );
						LIB_ASSERT.ok( errors[ 0 ] === '[boolean] is required' );
						LIB_ASSERT.ok( errors[ 1 ] === '[integer] is required' );
						LIB_ASSERT.ok( errors[ 2 ] === '[number] is required' );
						LIB_ASSERT.ok( errors[ 3 ] === '[string] is required' );
						LIB_ASSERT.ok( errors[ 4 ] === '[array] is required' );
						LIB_ASSERT.ok( errors[ 5 ] === '[object] is required' );
						LIB_ASSERT.ok( errors[ 6 ] === '' ); // Always has an empty trailing entry.
						LIB_ASSERT.ok( field_values.boolean === true );
						LIB_ASSERT.ok( field_values.integer === 0 );
						LIB_ASSERT.ok( field_values.number === 0.0 );
						LIB_ASSERT.ok( field_values.string === '' );
						LIB_ASSERT.ok( Array.isArray( field_values.array ) );
						LIB_ASSERT.ok( field_values.array.length === 0 );
						LIB_ASSERT.ok( typeof field_values.object === 'object' );
						LIB_ASSERT.ok( Object.keys( field_values.object ).length === 0 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should convert from string values`,
					async function ()
					{
						let field_values = {
							boolean: 'true',
							integer: '0',
							number: '0.0',
							string: 'x',
							array: '[ 3.14 ]',
							object: '{ "foo": "bar" }',
						};
						let validation_error = Server.ValidateFields( FIELDS_NAME_TYPE_DEFAULT_REQUIRED, field_values, true, false );
						LIB_ASSERT.ok( validation_error === '' ); // No validation errors.
						LIB_ASSERT.ok( field_values.boolean === true );
						LIB_ASSERT.ok( field_values.integer === 0 );
						LIB_ASSERT.ok( field_values.number === 0.0 );
						LIB_ASSERT.ok( field_values.string === 'x' );
						LIB_ASSERT.ok( Array.isArray( field_values.array ) );
						LIB_ASSERT.ok( field_values.array.length === 1 );
						LIB_ASSERT.ok( field_values.array[ 0 ] === 3.14 );
						LIB_ASSERT.ok( typeof field_values.object === 'object' );
						LIB_ASSERT.ok( Object.keys( field_values.object ).length === 1 );
						LIB_ASSERT.ok( field_values.object.foo === 'bar' );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should not convert from null values`,
					async function ()
					{
						let field_values = {
							boolean: null,
							integer: null,
							number: null,
							string: null,
							array: null,
							object: null,
						};
						let validation_error = Server.ValidateFields( FIELDS_NAME_TYPE_DEFAULT_REQUIRED, field_values, true, false );
						LIB_ASSERT.ok( validation_error === '' ); // No validation errors.
						LIB_ASSERT.ok( field_values.boolean === null );
						LIB_ASSERT.ok( field_values.integer === null );
						LIB_ASSERT.ok( field_values.number === null );
						LIB_ASSERT.ok( field_values.string === null );
						LIB_ASSERT.ok( field_values.array === null );
						LIB_ASSERT.ok( field_values.object === null );
						return;
					} );


			} );


	} );
