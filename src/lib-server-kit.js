'use strict';


//---------------------------------------------------------------------
const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );


//---------------------------------------------------------------------
exports.NewServer =
	function ( ApplicationName, ApplicationPath,
		ServerOptions = {
			write_defaults: false,	// Writes '<ApplicationPath>/<ApplicationName>.defaults.json'.
			write_settings: false,	// Writes '<ApplicationPath>/<ApplicationName>.settings.json'.
			config_path: '',			// Merges, alphabetically, all json/yaml files in path. (can be a filename)
			ConfigObject: null,		// Merge an explicit object with the configuration. This is applied last.
		} )
	{
		if ( !LIB_FS.existsSync( ApplicationPath ) ) { throw new Error( `The application path does not exist [${ApplicationPath}].` ); }

		let server = {};


		//---------------------------------------------------------------------
		// Load Base Modules
		//---------------------------------------------------------------------


		// Expose some construction functions.
		{
			server.NewModule = require( LIB_PATH.join( __dirname, 'base', 'ModuleBase.js' ) ).NewModule;
			server.NewService = require( LIB_PATH.join( __dirname, 'base', 'ServiceBase.js' ) ).NewService;
			server.NewStorageService = require( LIB_PATH.join( __dirname, 'base', 'StorageService.js' ) ).NewStorageService;
		}


		//---------------------------------------------------------------------
		// ResolveApplicationPath
		//---------------------------------------------------------------------

		function ResolveApplicationPath( Path )
		{
			return LIB_PATH.resolve( ApplicationPath, Path );
		};
		server.ResolveApplicationPath = ResolveApplicationPath;


		//---------------------------------------------------------------------
		// Load Modules
		//---------------------------------------------------------------------


		let modules_path = LIB_PATH.join( __dirname, 'modules' );

		// // Load the application's package.json file.
		// {
		// 	let filename = LIB_PATH.join( ApplicationPath, 'package.json' );
		// 	if ( !LIB_FS.existsSync( filename ) ) { throw new Error( `A [package.json] file was not found in the application path [${ApplicationPath}].` ); }
		// 	server.Package = require( filename );
		// }

		// Load the internal utility functions.
		server.Utility = require( LIB_PATH.join( modules_path, 'Utility.js' ) );

		// Load the configuration module.
		server.Config = require( LIB_PATH.join( modules_path, 'Config.js' ) ).Construct( server );
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
		server.Log = require( LIB_PATH.join( modules_path, 'Log.js' ) ).Construct( server );
		// NOTE: Delay insertion of the Defaults block until after the services.

		// Load the WebServer module.
		server.WebServer = require( LIB_PATH.join( modules_path, 'WebServer.js' ) ).Construct( server );
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
		load_services( ResolveApplicationPath( 'services' ) );

		// Register the Log module configuration.
		server.Config.Defaults.Log = server.Log.GetDefaults();


		//---------------------------------------------------------------------
		// Initialize Config Module
		//---------------------------------------------------------------------


		let defaults_filename = ResolveApplicationPath( `${ApplicationName}.defaults.json` );
		let settings_filename = ResolveApplicationPath( `${ApplicationName}.settings.json` );
		server.Config.ResetSettings();

		// Write the application's Defaults file.
		if ( ServerOptions.write_defaults )
		{
			server.Config.SaveDefaults( defaults_filename );
		}

		// Build the application's config.
		if ( ServerOptions.config_path )
		{
			let path = ResolveApplicationPath( ServerOptions.config_path );
			if ( LIB_FS.existsSync( path ) )
			{
				server.Config.MergePath( path );
			}
		}
		if ( ServerOptions.ConfigObject )
		{
			server.Config.MergeSettings( ServerOptions.ConfigObject );
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
