'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Swagger
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

const LIB_SWAGGER_UI_EXPRESS = require( 'swagger-ui-express' );


//---------------------------------------------------------------------
exports.Use =
	function Use( Server, WebServer, WebServerSettings )
	{
		if ( !WebServerSettings.Express.Swagger
			|| !WebServerSettings.Express.Swagger.enabled )
		{
			return;
		}

		//---------------------------------------------------------------------
		function generate_openapi_document()
		{
			let server_settings = Server.Config.Settings;
			let doc = {
				openapi: '3.0.0',
				info: {
					title: `${server_settings.AppInfo.name} Server API`,
					description: server_settings.AppInfo.description,
					version: server_settings.AppInfo.version,
				},
				servers: [
					{
						url: `${WebServer.Express.ServerAddress()}${WebServer.Express.ServicesPath()}`,
						description: 'Path for the server api.',
					},
				],
				paths: [
				],
			};
			return doc;
		}
		let swagger_doc = generate_openapi_document();


		//---------------------------------------------------------------------
		// Generate the opan api file.
		if ( WebServerSettings.Express.Swagger.open_api_file )
		{
			let path = Server.ResolveApplicationPath( WebServerSettings.Express.Swagger.open_api_file );
			LIB_FS.writeFileSync( path, JSON.stringify( swagger_doc, null, '    ' ) );
			Server.Log.trace( `WebServer.Express.Swagger generated open api file [${path}].` );
		}


		//---------------------------------------------------------------------
		// Mount the swagger ui path..
		if ( WebServerSettings.Express.Swagger.swagger_ui_path )
		{
			let route = `${WebServer.Express.ServicesPath()}${WebServerSettings.Express.Swagger.swagger_ui_path}`;
			WebServer.Express.App.use( route, LIB_SWAGGER_UI_EXPRESS.serve, LIB_SWAGGER_UI_EXPRESS.setup( swagger_doc ) );
			Server.Log.trace( `WebServer.Express.Swagger mounted route [${route}].` );
		}


		//---------------------------------------------------------------------
		return;
	};

