'use strict';


//---------------------------------------------------------------------
const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );


//---------------------------------------------------------------------
const SRC_MODULE_BASE = require( LIB_PATH.join( __dirname, 'base', 'ModuleBase.js' ) );
const SRC_SERVICE_BASE = require( LIB_PATH.join( __dirname, 'base', 'ServiceBase.js' ) );
const SRC_STORAGE_SERVICE = require( LIB_PATH.join( __dirname, 'base', 'StorageService.js' ) );

const MODULES_PATH = LIB_PATH.join( __dirname, 'modules' );
const SRC_UTILTIY_MODULE = require( LIB_PATH.join( MODULES_PATH, 'Utility.js' ) );
const SRC_CONFIG_MODULE = require( LIB_PATH.join( MODULES_PATH, 'Config.js' ) );
const SRC_LOG_MODULE = require( LIB_PATH.join( MODULES_PATH, 'Log.js' ) );
const SRC_ENDPOINTS_MODULE = require( LIB_PATH.join( MODULES_PATH, 'Origins.js' ) );
const SRC_WEBSERVER_MODULE = require( LIB_PATH.join( MODULES_PATH, 'WebServer.js' ) );


//---------------------------------------------------------------------
exports.NewServer =
	function ( ApplicationName, ApplicationPath,
		ServerOptions = {
			write_defaults: false,		// Writes '<ApplicationPath>/<ApplicationName>.defaults.json'.
			write_settings: false,		// Writes '<ApplicationPath>/<ApplicationName>.settings.json'.
			config_path: '',			// Merges, alphabetically, all json/yaml files in path. (can be a filename)
			Settings: null,				// Merge an explicit object with the configuration. This is applied last.
		} )
	{
		if ( !LIB_FS.existsSync( ApplicationPath ) ) { throw new Error( `The application path does not exist [${ApplicationPath}].` ); }
		ApplicationName = ApplicationName ? ApplicationName : 'unnamed';

		let server = {};


		//---------------------------------------------------------------------
		// Load Base Modules
		//---------------------------------------------------------------------


		// Expose some construction functions.
		{
			server.NewModule = SRC_MODULE_BASE.NewModule;
			server.NewService = SRC_SERVICE_BASE.NewService;
			server.NewStorageService = SRC_STORAGE_SERVICE.NewStorageService;
		}


		//---------------------------------------------------------------------
		// ResolveApplicationPath
		//	- Returns the full local file path for the given application path.
		//---------------------------------------------------------------------

		server.ResolveApplicationPath =
			function ResolveApplicationPath( Path )
			{
				return LIB_PATH.resolve( ApplicationPath, Path );
			};


		//---------------------------------------------------------------------
		// ValidateFields
		//	- Validates and (optionally) converts field values based upong their definition.
		//---------------------------------------------------------------------

		server.ValidateFields =
			function ValidateFields( FieldDefinitions, FieldValues, ConvertValues, ThrowError )
			{
				let error_message = '';
				for ( let field_index = 0; field_index < FieldDefinitions.length; field_index++ )
				{
					let field = FieldDefinitions[ field_index ];
					let value = FieldValues[ field.name ];
					// Validate the parameter.
					if ( typeof value === 'undefined' )
					{
						// Set the default value
						if ( typeof field.default === 'undefined' )
						{
							value = null;
						}
						else
						{
							value = JSON.parse( JSON.stringify( field.default ) );
						}
						// Validate that this parameter is not required.
						if ( field.required )
						{
							error_message += `[${field.name}] is required; `;
						}
					}
					else if ( field.schema && field.schema.type )
					{
						try
						{
							if ( value === null )
							{
								//NOTE: Do not perform any conversion. Null is a valid value for all schema types.
							}
							else
							{
								switch ( field.schema.type )
								{
									case 'boolean':
										value = Boolean( value );
										break;
									case 'integer':
										value = parseInt( value );
										break;
									case 'number':
										value = parseFloat( value );
										break;
									case 'string':
										value = '' + value;
										break;
									case 'array':
										if ( typeof value === 'string' )
										{
											if ( value.trim().startsWith( '[' ) )
											{
												value = JSON.parse( value );
											}
											else if ( value === 'null' )
											{
												value = null;
											}
											else
											{
												value = [ value ];
											}
										}
										break;
									case 'object':
										if ( typeof value === 'string' )
										{
											if ( value.trim().startsWith( '{' ) )
											{
												value = JSON.parse( value );
											}
											else if ( value === 'null' )
											{
												value = null;
											}
										}
										break;
									default:
										error_message += `[${field.name}] has unknown schema type [${field.schema.type}]; `;
										break;
								}
							}
						}
						catch ( error )
						{
							error_message += `[${field.name}] ${error.message}; `;
						}
					}
					// Update the Parameters object with the converted value.
					if ( ConvertValues ) { FieldValues[ field.name ] = value; }
				}
				if ( ThrowError && error_message ) { throw new Error( error_message ); }
				return error_message;
			};


		//---------------------------------------------------------------------
		// Load Modules
		//---------------------------------------------------------------------


		// Load the internal utility functions.
		server.Utility = SRC_UTILTIY_MODULE;

		// Load the configuration module.
		server.Config = SRC_CONFIG_MODULE.Construct( server );
		server.Config.Defaults.AppInfo = {
			// name: server.Package.name,
			// version: server.Package.version,
			// description: server.Package.description,
			// homepage: server.Package.homepage,
			name: ApplicationName,
			version: '',
			description: '',
			homepage: '',
			environment: 'development',
		};

		// Load the logging module.
		server.Log = SRC_LOG_MODULE.Construct( server );
		// NOTE: Delay insertion of the Defaults block until after the services are loaded.

		// Load the Origins module.
		server.Origins = SRC_ENDPOINTS_MODULE.Construct( server );
		server.Config.Defaults.Origins = server.Origins.GetDefaults();

		// Load the WebServer module.
		server.WebServer = SRC_WEBSERVER_MODULE.Construct( server );
		server.Config.Defaults.WebServer = server.WebServer.GetDefaults();


		//---------------------------------------------------------------------
		// Load Services
		//---------------------------------------------------------------------


		function load_services( ServicesPath )
		{
			if ( !LIB_FS.existsSync( ServicesPath ) ) { return; }
			let filenames = LIB_FS.readdirSync( ServicesPath );
			for ( let index = 0; index < filenames.length; index++ )
			{
				// Get the found filename.
				let filename = filenames[ index ];
				let file_ext = LIB_PATH.extname( filename );
				if ( file_ext !== '.js' ) { continue; }
				// Load the service.
				let service = require( LIB_PATH.join( ServicesPath, filename ) ).Construct( server );
				let service_name = service.ServiceDefinition.name;
				server[ service_name ] = service;
				server.Services[ service_name ] = service;
				// Register the service module configuration.
				server.Config.Defaults[ service_name ] = service.GetDefaults();
			}
		};


		server.Services = {};
		// Load server-kit Services
		load_services( LIB_PATH.join( __dirname, 'services' ) );
		// Load Application Services
		load_services( server.ResolveApplicationPath( 'services' ) );

		// Register the Log module configuration.
		server.Config.Defaults.Log = server.Log.GetDefaults();


		//---------------------------------------------------------------------
		// Initialize Config Module
		//---------------------------------------------------------------------


		let defaults_filename = server.ResolveApplicationPath( `${ApplicationName}.defaults.json` );
		let settings_filename = server.ResolveApplicationPath( `${ApplicationName}.settings.json` );
		server.Config.ResetSettings();

		// Write the application's Defaults file.
		if ( ServerOptions.write_defaults )
		{
			server.Config.SaveDefaults( defaults_filename );
		}

		// Build the application's config.
		if ( ServerOptions.config_path )
		{
			let path = server.ResolveApplicationPath( ServerOptions.config_path );
			if ( LIB_FS.existsSync( path ) )
			{
				server.Config.MergePath( path );
			}
		}
		if ( ServerOptions.Settings )
		{
			server.Config.MergeSettings( ServerOptions.Settings );
		}

		// Write the application's Settings file.
		if ( ServerOptions.write_settings )
		{
			server.Config.SaveSettings( settings_filename );
		}


		//---------------------------------------------------------------------
		// Initialize
		//---------------------------------------------------------------------


		server.Initialize =
			function Intialize()
			{

				// Initialize Log Module.
				server.Log.SetSettings( server.Config.Settings.Log );
				server.Log.Initialize();
				server.Log.trace( `Initialized module [Log].` );

				// Report config initialization.
				if ( ServerOptions.write_defaults )
				{
					server.Log.trace( `Wrote configuration defaults to file [${defaults_filename}].` );
				}
				if ( ServerOptions.write_settings ) 
				{
					server.Log.trace( `Wrote configuration settings to file [${settings_filename}].` );
					server.Log.warn( `WARNING!`
						+ ` The settings file [${settings_filename}] contains all of your server's private settings and keys.`
						+ ` This is available to help document and debug your server's configuration.`
						+ ` DO NOT include this file in backups or in source code repositories.` );
				}

				// Set the runtime environment.
				if ( server.Config.Settings.AppInfo.environment )
				{
					process.env.NODE_ENV = server.Config.Settings.AppInfo.environment;
					server.Log.trace( `Runtime environment set to: ${process.env.NODE_ENV}` );
				}

				// Origins
				server.Origins.SetSettings( server.Config.Settings.Origins );
				server.Origins.Initialize();
				server.Log.trace( `Initialized module [Origins].` );

				// WebServer
				server.WebServer.SetSettings( server.Config.Settings.WebServer );
				server.WebServer.Initialize();
				server.Log.trace( `Initialized module [WebServer].` );

				// Configure Services
				{
					let service_names = Object.keys( server.Services );
					for ( let index = 0; index < service_names.length; index++ )
					{
						let service_name = service_names[ index ];
						server[ service_name ].SetSettings( server.Config.Settings[ service_name ] );
					}
				}

				// Initialize Services
				{
					let service_names = Object.keys( server.Services );
					for ( let index = 0; index < service_names.length; index++ )
					{
						let service_name = service_names[ index ];
						server[ service_name ].InitializeService();
						server.Log.trace( `Initialized service [${service_name}].` );
					}
				}

				return { ok: true };
			};


		return server;
	};
