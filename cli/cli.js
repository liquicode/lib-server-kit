'use strict';


//---------------------------------------------------------------------
var App = require( '../src/App.js' ).App;
App.Initialize(); // Default initialization.


//---------------------------------------------------------------------
App.command_processor =
	async function command_processor( CommandName, Args, CommandFunction )
	{
		// Get the command-line arguments.
		App.Arguments = Args;

		// Construct a settings object to merge with `Config.Settings`.
		let settings = {};

		// Check to load settings from a config file.
		if ( App.Utility.value_exists( App.Arguments[ 'config-file' ] ) )
		{
			let filename = App.Arguments[ 'config-file' ];
			if ( LIB_FS.existsSync( filename ) )
			{
				let content = LIB_FS.readFileSync( filename, 'utf8' );
				settings = JSON.parse( content );
			}
		}

		// Apply command line options.
		if ( App.Utility.value_exists( App.Arguments[ 'log-levels' ] ) ) 
		{
			let value = App.Arguments[ 'log-levels' ];
			// Set log levels for all log targets.
			settings.Log = settings.Log || {};
			settings.Log.Console = settings.Log.Console || {};
			settings.Log.Console.LogLevels = value;
			settings.Log.Shell = settings.Log.Shell || {};
			settings.Log.Shell.LogLevels = value;
			settings.Log.File = settings.Log.File || {};
			settings.Log.File.LogLevels = value;
		}
		if ( App.Utility.value_exists( App.Arguments[ 'log-console' ] ) )
		{
			let value = App.Arguments[ 'log-console' ];
			// Enable the console log target.
			settings.Log = settings.Log || {};
			settings.Log.Console = settings.Log.Console || {};
			settings.Log.Console.enabled = value;
			settings.Log.Shell = settings.Log.Shell || {};
			settings.Log.Shell.enabled = !value;
		}
		if ( App.Utility.value_exists( App.Arguments[ 'log-shell' ] ) )
		{
			let value = App.Arguments[ 'log-shell' ];
			// Enable the shell log target.
			settings.Log = settings.Log || {};
			settings.Log.Console = settings.Log.Console || {};
			settings.Log.Console.enabled = !value;
			settings.Log.Shell = settings.Log.Shell || {};
			settings.Log.Shell.enabled = value;
		}
		if ( App.Utility.value_exists( App.Arguments[ 'log-file' ] ) )
		{
			let value = App.Arguments[ 'log-file' ];
			// Enable the file log target.
			settings.Log = settings.Log || {};
			settings.Log.File = settings.Log.File || {};
			settings.Log.File.enabled = value;
		}

		// Apply the settings.
		if ( App.Utility.value_exists( settings ) ) 
		{
			App.Initialize( settings );
		}

		// Execute the command.
		try
		{
			App.Log.trace( `Entering command [${CommandName}].` );
			// let start_mem = process.memoryUsage();
			let start_time = Date.now();
			let result = await CommandFunction( App );
			let stop_time = Date.now();
			// let stop_mem = process.memoryUsage();
			App.Log.trace( `Exiting command [${CommandName}] after [${stop_time - start_time}] ms.` );
			if ( typeof result === 'undefined' ) { return; }  // Keep the process running.
			if ( result === true ) { process.exit( 0 ); }     // Return success.
			if ( result === false ) { process.exit( -1 ); }   // Return failure.
			if ( typeof result.process_exit_code !== 'undefined' )
			{
				process.exit( result.process_exit_code );     // Return specific error code.
			}
		}
		catch ( error )
		{
			console.error( error.message );
			App.Log.error( error.message );
			App.Log.error( error.stack );
			if ( !App.Log.Logger.LogTargets.length ) { console.error( error.message, error ); }
			process.exit( -1 );
		}

		return;
	};


//---------------------------------------------------------------------
//		Command Line Options
//---------------------------------------------------------------------

try
{
	const YARGS = require( 'yargs' );
	// YARGS

	// Global context
	YARGS.config( { App: App } );

	// App Info
	// YARGS.scriptName( App.Package.name );
	YARGS.scriptName( 'cli' );
	YARGS.version( 'version', 'Show version information.', App.Package.version );

	// Help
	YARGS.help( 'help', 'Get usage and help information.' );
	YARGS.alias( 'h', 'help' );
	YARGS.usage( '$0 <command> [arguments] [options]' );
	YARGS.epilogue( `For more information, find our manual at ${App.Package.homepage}` );
	YARGS.showHelpOnFail( true, 'Specify --help for available options.' );

	// Screen Formatting
	YARGS.wrap( Math.min( 120, YARGS.terminalWidth() ) );

	// Global Options
	YARGS.option(
		'config-file',
		{
			alias: 'c',
			type: 'string',
			description: 'The application configuration file to use.'
		}
	);
	YARGS.option(
		'log-levels',
		{
			alias: 'l',
			type: 'string',
			description: 'The log levels to enable for all logs. (EX: "TDIWEF")'
		}
	);
	YARGS.option(
		'log-console',
		{
			type: 'boolean',
			description: 'Send log output to the console.'
		}
	);
	YARGS.option(
		'log-shell',
		{
			type: 'boolean',
			description: 'Send log output to the shell terminal.'
		}
	);
	YARGS.option(
		'log-file',
		{
			type: 'boolean',
			description: 'Send log output to the log file.'
		}
	);

	// Commands
	YARGS.commandDir(
		'commands',
		{
			recurse: false,
			extensions: [ 'js' ],
			visit: null,
			include: null,
			exclude: '^_$',
		}
	);
	YARGS.command(
		{
			command: '*',
			handler()
			{
				console.log( '**  Use the --help option to view help and usage information.' );
				// YARGS.showHelp( 'log' );
			}
		}
	);
	YARGS.demandCommand( 1, 'A command is required.' );
	YARGS.recommendCommands();

	// YARGS.strict();

	// Execute
	// YARGS.parse();
	// YARGS.showCompletionScript();

	YARGS.argv;
}
catch ( error )
{
	console.error( 'ERROR: ' + error.message );
	console.error( error );
	process.exit( 1 );
}
