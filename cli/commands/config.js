"use strict";

//=====================================================================
//=====================================================================
//
//		config
//
//=====================================================================
//=====================================================================

exports.command = 'config <command>';
exports.desc = 'Get, set, and show application configuration values.';
exports.builder =
	function ( YARGS )
	{
		return YARGS.commandDir(
			'config',
			// {
			// 	recurse: false,
			// 	extensions: [ 'js' ],
			// 	visit: null,
			// 	include: null,
			// 	exclude: '^_$',
			// },
		);
	};
exports.handler =
	function ( argv )
	{
		return false;
	};
