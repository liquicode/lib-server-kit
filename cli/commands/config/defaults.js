"use strict";

//=====================================================================
//=====================================================================
//
//		config defaults
//
//=====================================================================
//=====================================================================


exports.command = 'defaults';
exports.describe = 'Shows the configuration defaults.';
exports.builder =
	function ( YARGS ) 
	{
		return;
	};
exports.handler =
	async function ( argv )
	{
		await argv.App.command_processor(
			'CONFIG-DEFAULTS', argv,
			async function ( App )
			{
				console.log( JSON.stringify( App.Config.Defaults, null, '    ' ) );
				return { process_exit_code: 0 };
			} );
	};
