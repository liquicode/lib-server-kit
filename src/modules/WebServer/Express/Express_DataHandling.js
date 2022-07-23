'use strict';


const LIB_EXPRESS_FILEUPLOAD = require( 'express-fileupload' );


//---------------------------------------------------------------------
exports.Express_DataHandling_JsonBodyParser =
	function Express_DataHandling_JsonBodyParser( CTX )
	{
		if ( CTX.WebServerSettings.Express.DataHandling.JsonBodyParser
			&& CTX.WebServerSettings.Express.DataHandling.JsonBodyParser.enabled )
		{
			CTX.WebServer.Express.App.use(
				CTX.LIB_EXPRESS.json(
					CTX.WebServerSettings.Express.DataHandling.JsonBodyParser.Settings ) );
			CTX.Server.Log.trace( `WebServer.Express.DataHandling.JsonBodyParser is initialized.` );
		}
	};

//---------------------------------------------------------------------
exports.Express_DataHandling_UrlEncodedParser =
	function Express_DataHandling_UrlEncodedParser( CTX )
	{
		if ( CTX.WebServerSettings.Express.DataHandling.UrlEncodedParser
			&& CTX.WebServerSettings.Express.DataHandling.UrlEncodedParser.enabled )
		{
			CTX.WebServer.Express.App.use(
				CTX.LIB_EXPRESS.urlencoded(
					CTX.WebServerSettings.Express.DataHandling.UrlEncodedParser.Settings ) );
			CTX.Server.Log.trace( `WebServer.Express.DataHandling.UrlEncodedParser is initialized.` );
		}
	};

//---------------------------------------------------------------------
exports.Express_DataHandling_FileUpload =
	function Express_DataHandling_FileUpload( CTX )
	{
		if ( CTX.WebServerSettings.Express.DataHandling.FileUpload
			&& CTX.WebServerSettings.Express.DataHandling.FileUpload.enabled )
		{
			CTX.WebServer.Express.App.use(
				LIB_EXPRESS_FILEUPLOAD(
					CTX.WebServerSettings.Express.DataHandling.FileUpload.Settings ) );
			CTX.Server.Log.trace( `WebServer.Express.DataHandling.FileUpload is initialized.` );
		}
	};


