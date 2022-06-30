'use strict';


//---------------------------------------------------------------------
const LIB_LOGGER = require( '@liquicode/lib-logger' );
const MODULE_BASE = require( '../base/ModuleBase.js' );

const MODULE_NOT_INITIALIZED_MESSAGE = `Module [Log] is not initialized. Call App.Initialize() first.`;


//---------------------------------------------------------------------
exports.Construct =
	function Construct_LogModule( Server )
	{
		let module = MODULE_BASE.NewModule();


		//---------------------------------------------------------------------
		module.GetDefaults =
			function GetDefaults() 
			{
				return {
					Console:
					{
						enabled: true,
						DeviceName: 'console',
						LogLevels: 'TDIWEF',
						OutputGroup: false,
						OutputDate: false,
						OutputTime: true,
						OutputMilliseconds: true,
						OutputTimezone: false,
						OutputSeverity: true,
						OutputSeverityWords: true,
					},
					Shell:
					{
						enabled: false,
						DeviceName: 'shell',
						LogLevels: 'TDIWEF',
						OutputGroup: false,
						OutputDate: false,
						OutputTime: true,
						OutputMilliseconds: true,
						OutputTimezone: false,
						OutputSeverity: true,
						OutputSeverityWords: true,
						Shell:
						{
							ColorizeEntireLine: true,
							TraceColors: { Forecolor: LIB_LOGGER.ShellForecolor.DarkGray, Effect: LIB_LOGGER.ShellEffect.Dim },
							DebugColors: { Forecolor: LIB_LOGGER.ShellForecolor.DarkGray, Effect: LIB_LOGGER.ShellEffect.Bold },
							InfoColors: { Forecolor: LIB_LOGGER.ShellForecolor.White, Effect: '' },
							WarnColors: { Forecolor: LIB_LOGGER.ShellForecolor.Yellow, Effect: '' },
							ErrorColors: { Forecolor: LIB_LOGGER.ShellForecolor.Red, Effect: '' },
							FatalColors: { Forecolor: LIB_LOGGER.ShellForecolor.Red, Effect: LIB_LOGGER.ShellEffect.Invert },
						},
					},
					File:
					{
						enabled: false,
						DeviceName: 'file',
						LogLevels: 'IWEF',
						OutputGroup: false,
						OutputDate: true,
						OutputTime: true,
						OutputMilliseconds: true,
						OutputTimezone: true,
						OutputSeverity: true,
						OutputSeverityWords: true,
						File:
						{
							log_path: '',
							log_filename: 'server',
							log_extension: 'log',
							use_hourly_logfiles: false,
							use_daily_logfiles: false,
						},
					},
				};
			};


		//---------------------------------------------------------------------
		// Maintain a global logger object.
		module.Logger = null;


		//---------------------------------------------------------------------
		// Aliases
		module.debug = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };
		module.trace = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };
		module.info = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };
		module.warn = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };
		module.error = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };
		module.fatal = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };


		//---------------------------------------------------------------------
		module.Initialize =
			function Initialize()
			{
				if ( !Server.Config.Settings.Log ) { throw new Error( `Invalid configuration, the [Log] section is missing.` ); }

				// Construct a new logger.
				module.Logger = LIB_LOGGER.NewLogger( Server.Config.Settings.AppInfo.name );

				// Add the log targets.
				if ( Server.Config.Settings.Log.Console && Server.Config.Settings.Log.Console.enabled )
				{
					let target = LIB_LOGGER.NewConsoleLogTarget( Server.Config.Settings.Log.Console.LogLevels );
					target.Config = Server.Config.Settings.Log.Console;
					module.Logger.AddLogTarget( target );
				}
				if ( Server.Config.Settings.Log.Shell && Server.Config.Settings.Log.Shell.enabled )
				{
					let target = LIB_LOGGER.NewShellLogTarget( Server.Config.Settings.Log.Shell.LogLevels );
					target.Config = Server.Config.Settings.Log.Shell;
					module.Logger.AddLogTarget( target );
				}
				if ( Server.Config.Settings.Log.File && Server.Config.Settings.Log.File.enabled )
				{
					let target = LIB_LOGGER.NewFileLogTarget( Server.Config.Settings.Log.File.LogLevels );
					target.Config = Server.Config.Settings.Log.File;
					module.Logger.AddLogTarget( target );
				}

				// Wire up the alias functions.
				module.debug = module.Logger.debug;
				module.trace = module.Logger.trace;
				module.info = module.Logger.info;
				module.warn = module.Logger.warn;
				module.error = module.Logger.error;
				module.fatal = module.Logger.fatal;

				// Return, ok.
				return { ok: true };
			};


		//---------------------------------------------------------------------
		return module;
	};
