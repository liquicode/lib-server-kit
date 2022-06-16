'use strict';

exports.Construct =
	function Construct_PackageModule( App )
	{
		let app_package = require( '../../../package.json' );
		return app_package;
	};
