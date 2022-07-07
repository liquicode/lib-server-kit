'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );


//---------------------------------------------------------------------
exports.NewServer =
	function ( ApplicationName, ApplicationPath, WriteDefaults = false )
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
				server.Config.Defaults[ service_name ] = service.GetDefaults();
			}
		};

		server.Services = {};
		load_services( LIB_PATH.join( __dirname, 'services' ) );	// Load server-kit Services
		load_services( ResolveApplicationPath( 'services' ) );		// Load Application Services
		server.Config.Defaults.Log = server.Log.GetDefaults();

		// Initialize Config Module.
		server.Config.ResetSettings();

		// Load the application's config file.
		let defaults_filename = ResolveApplicationPath( `${ApplicationName}.defaults.json` );
		let settings_filename = ResolveApplicationPath( `${ApplicationName}.settings.json` );
		if ( WriteDefaults )
		{
			server.Config.SaveDefaults( defaults_filename );
		}
		if ( LIB_FS.existsSync( settings_filename ) ) 
		{
			let content = LIB_FS.readFileSync( settings_filename, 'utf8' );
			let config = JSON.parse( content );
			server.Config.MergeSettings( config );
		}


		//---------------------------------------------------------------------
		// Initialize
		//---------------------------------------------------------------------


		server.Initialize =
			function Intialize( SettingsFilenameOrObject )
			{
				let log_trace = [];
				// log_trace.push( `Initialized module [Package].` );
				if ( WriteDefaults )
				{
					log_trace.push( `Wrote configuration defaults to file [${defaults_filename}].` );
				}
				if ( LIB_FS.existsSync( settings_filename ) ) 
				{
					log_trace.push( `Merged configuration settings from file [${settings_filename}].` );
				}
				log_trace.push( `Initialized module [Config].` );

				// Customize the configuration with the supplied settings.
				if ( typeof SettingsFilenameOrObject === 'undefined' ) { }
				else if ( typeof SettingsFilenameOrObject === 'string' )
				{
					// Load configuration settings from a specific application defined file.
					let content = null;
					let filename = SettingsFilenameOrObject;
					if ( LIB_FS.existsSync( filename ) )
					{
						// Read realtive to cwd.
						content = LIB_FS.readFileSync( filename, 'utf8' );
					}
					else if ( LIB_FS.existsSync( ResolveApplicationPath( filename ) ) )
					{
						// Read realtive to ApplicationPath.
						filename = ResolveApplicationPath( filename );
						content = LIB_FS.readFileSync( filename, 'utf8' );
					}
					if ( content )
					{
						let config = JSON.parse( content );
						server.Config.MergeSettings( config );
						log_trace.push( `Merged configuration from settings file [${filename}].` );
					}
					else
					{
						log_trace.push( `Warning: Unable to find settings file [${SettingsFilenameOrObject}].` );
					}
				}
				else if ( typeof SettingsFilenameOrObject === 'object' )
				{
					// Load settings directly from the given object.
					server.Config.MergeSettings( SettingsFilenameOrObject );
					log_trace.push( `Merged configuration from settings object: ${JSON.stringify( SettingsFilenameOrObject )}` );
				}
				else
				{
					throw new Error( `The parameter [Settings] was supplied but contains an invalid value: [${SettingsFilenameOrObject}].` );
				}

				// Set the runtime environment.
				if ( server.Config.Settings.AppInfo.environment )
				{
					process.env.NODE_ENV = server.Config.Settings.AppInfo.environment;
					log_trace.push( `Runtime environment set to: ${process.env.NODE_ENV}` );
				}

				// Initialize Log Module.
				server.Log.SetSettings( server.Config.Settings.Log );
				server.Log.Initialize();
				log_trace.forEach( item => server.Log.trace( item ) ); // Display accumulated trace messages.
				server.Log.trace( `Initialized module [Log].` );

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
