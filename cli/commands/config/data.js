"use strict";

//=====================================================================
//=====================================================================
//
//		config data
//
//=====================================================================
//=====================================================================


exports.command = 'data';
exports.describe = 'Shows the configuration data.';
exports.builder =
	function ( YARGS ) 
	{
		return;
	};
exports.handler =
	async function ( argv )
	{
		await argv.App.command_processor(
			'CONFIG-DATA', argv,
			async function ( App )
			{
				console.log( JSON.stringify( App.Config.Settings, null, '    ' ) );
				return { process_exit_code: 0 };
			} );
	};
