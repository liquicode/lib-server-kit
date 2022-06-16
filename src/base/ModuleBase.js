'use strict';

exports.NewModule =
	function NewModule()
	{
		let module = {};
		module.Defaults = {};
		module.Settings = {};
		module.GetDefaults = function () { return JSON.parse( JSON.stringify( module.Defaults ) ); };
		module.GetSettings = function () { return JSON.parse( JSON.stringify( module.Settings ) ); };
		module.SetSettings = function ( Settings ) { module.Settings = JSON.parse( JSON.stringify( Settings ) ); };
		return module;
	};