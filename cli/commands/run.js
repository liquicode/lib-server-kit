"use strict";


//=====================================================================
//=====================================================================
//
//		run [address] [port]
//
//=====================================================================
//=====================================================================


exports.command = 'run [address] [port]';
exports.describe = 'Run the web service.';
exports.builder =
	function ( YARGS ) 
	{
		YARGS.option(
			'address',
			{
				alias: 'a',
				type: 'string',
				describe: 'The address to run the service on. Default is: 0.0.0.0',
				required: false,
			} );
		YARGS.option(
			'port',
			{
				alias: 'p',
				type: 'number',
				describe: 'The port to run the service on. Default is: 4200',
				required: false,
			} );
		return;
	};
exports.handler =
	async function ( argv )
	{
		await argv.App.command_processor(
			'RUN', argv,
			async function ( App )
			{
				await App.WebServer.StartWebServer( App.Arguments.address, App.Arguments.port );
				return; // Return an 'undefined' to prevent the call to proccess.exit()
			} );
	};
