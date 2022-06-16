'use strict';


//---------------------------------------------------------------------
const MODULE_BASE = require( '../base/ModuleBase.js' );
const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );


//---------------------------------------------------------------------
exports.Construct =
	function Construct_ConfigModule( Server )
	{
		let module = MODULE_BASE.NewModule();


		//---------------------------------------------------------------------
		// module.Defaults.AppInfo = {
		// 	name: Server.Package.name,
		// 	version: Server.Package.version,
		// 	description: Server.Package.description,
		// 	homepage: Server.Package.homepage,
		// 	environment: 'development',
		// };


		//---------------------------------------------------------------------
		module.ResetSettings =
			function ResetSettings()
			{
				module.Settings = Server.Utility.clone( module.Defaults );
				return;
			};


		//---------------------------------------------------------------------
		module.MergeSettings =
			function MergeSettings( Settings )
			{
				module.Settings = Server.Utility.merge_objects( module.Settings, Settings );
				return;
			};


		//---------------------------------------------------------------------
		module.LoadSettings =
			function LoadSettings( Filename )
			{
				if ( !LIB_FS.existsSync( Filename ) ) { return { error: `The file [${Filename}] does not exist.` }; }
				let content = LIB_FS.readFileSync( Filename, 'utf8' );
				module.Settings = JSON.parse( content );
				return;
			};


		//---------------------------------------------------------------------
		module.SaveSettings =
			function SaveSettings( Filename )
			{
				let content = JSON.stringify( module.Settings, null, '\t' );
				LIB_FS.writeFileSync( Filename, content );
				return;
			};


		//---------------------------------------------------------------------
		module.SaveDefaults =
			function SaveDefaults( Filename )
			{
				let content = JSON.stringify( module.Defaults, null, '\t' );
				LIB_FS.writeFileSync( Filename, content );
				return;
			};


		// //---------------------------------------------------------------------
		// module.FindConfigFile =
		// 	function FindConfigFile( Filename, Options = {} )
		// 	{
		// 		if ( !Server.Utility.value_exists( Filename ) )
		// 		{
		// 			// Set the options.
		// 			if ( !Server.Utility.value_exists( Options.file_extension ) ) { Options.file_extension = 'config.json'; }
		// 			if ( !Server.Utility.value_exists( Options.allow_user_path ) ) { Options.allow_user_path = true; }
		// 			if ( !Server.Utility.value_exists( Options.allow_application_path ) ) { Options.allow_application_path = true; }
		// 			if ( !Server.Utility.value_exists( Options.allow_workspace_path ) ) { Options.allow_workspace_path = false; }

		// 			// Get the list of filenames to search.
		// 			let filename = `${Server.Package.name}.${Options.file_extension}`;
		// 			let filenames = [];
		// 			if ( Options.allow_user_path )
		// 			{
		// 				// The user's cwd.
		// 				filenames.push( LIB_PATH.join( process.cwd(), filename ) );
		// 			}
		// 			if ( Options.allow_application_path )
		// 			{
		// 				// The application program folder.
		// 				filenames.push( LIB_PATH.join( LIB_PATH.resolve( __dirname + '/..' ), filename ) );
		// 			}
		// 			if ( Options.allow_workspace_path )
		// 			{
		// 				// The application user workspace folder.
		// 				let homepath = process.env[ 'HOME' ] || process.env[ 'HOMEPATH' ];
		// 				let workspace_path = LIB_PATH.join( homepath, '.' + Server.Package.name );
		// 				filenames.push( LIB_PATH.join( workspace_path, filename ) );
		// 			}

		// 			// Find the first filename that exists.
		// 			filename = filenames.find( filename => LIB_FS.existsSync( filename ) );
		// 			if ( !filename )
		// 			{
		// 				let message = `Unable to locate the configuration file [${Server.Package.name}.${Options.file_extension}].`;
		// 				filenames.forEach( filename => message += `\n  tried: ${filename}` );
		// 				// throw new Error( message );
		// 				return { error: message };
		// 			}

		// 			// Use this filename.
		// 			Filename = filename;
		// 		}

		// 		// Get the full pathname.
		// 		Filename = LIB_PATH.resolve( Filename );

		// 		// Load the config.
		// 		let config = null;
		// 		if ( !LIB_FS.existsSync( Filename ) )
		// 		{
		// 			throw new Error( `The file [${Filename}] does not exist.` );
		// 		}
		// 		let content = LIB_FS.readFileSync( Filename, 'utf8' );
		// 		config = JSON.parse( content );

		// 		// Return the config.
		// 		return {
		// 			ok: true,
		// 			filename: Filename,
		// 			config: config,
		// 		};
		// 	};


		// //---------------------------------------------------------------------
		// module.SaveConfigFile =
		// 	function SaveConfigFile( Filename, Config )
		// 	{
		// 		if ( !App.Utility.value_exists( Filename ) ) { throw new Error( 'The required parameter [Filename] is missing.' ); }
		// 		if ( !App.Utility.value_exists( Config ) ) { throw new Error( 'The required parameter [Config] is missing.' ); }
		// 		let content = JSON.stringify( Config, null, '\t' );
		// 		LIB_FS.writeFileSync( Filename, content );
		// 		return { ok: true };
		// 	};


		//---------------------------------------------------------------------
		return module;
	};
