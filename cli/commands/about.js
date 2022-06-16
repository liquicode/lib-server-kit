'use strict';


//=====================================================================
//=====================================================================
//
//		about
//
//=====================================================================
//=====================================================================


exports.command = 'about';
exports.describe = 'About this application.';
exports.builder =
	function ( YARGS ) 
	{
		return;
	};
exports.handler =
	async function ( argv )
	{
		await argv.App.command_processor(
			'ABOUT', argv,
			async function ( App )
			{
				console.log( `  Application: ${App.Package.name}` );
				console.log( `      Version: ${App.Package.version}` );
				console.log( `  Description: ${App.Package.description}` );
				console.log( `     Homepage: ${App.Package.homepage}` );
				// console.log( `Configuration: ${App.Config.Filename}` );
				return { process_exit_code: 0 };
			} );
	};
