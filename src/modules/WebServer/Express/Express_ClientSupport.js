'use strict';


const LIB_FS = require( 'fs' );
const SRC_EXPRESS_API_CLIENT = require( './Generate/Express_ApiClient.js' );
const SRC_OPENAPI_DOCUMENT = require( './Generate/OpenApi_Document.js' );


//---------------------------------------------------------------------
exports.Express_ClientSupport_ViewEngine =
	function Express_ClientSupport_ViewEngine( CTX )
	{
		if ( CTX.WebServerSettings.Express.ClientSupport
			&& CTX.WebServerSettings.Express.ClientSupport.enabled
			&& CTX.WebServerSettings.Express.ClientSupport.Views
			&& CTX.WebServerSettings.Express.ClientSupport.Views.view_engine )
		{
			let engine = CTX.WebServerSettings.Express.ClientSupport.Views.view_engine;
			let path = CTX.Server.ResolveApplicationPath( CTX.WebServerSettings.Express.ClientSupport.Views.view_files );
			LIB_FS.mkdirSync( path, { recursive: true } );
			CTX.WebServer.Express.App.set( 'view engine', engine );
			CTX.WebServer.Express.App.set( 'views', path );
			CTX.Server.Log.trace( `WebServer.Express.ClientSupport using '${engine}' views from folder [${path}].` );
		}
	};

//---------------------------------------------------------------------
exports.Express_ClientSupport_ClientApiFile =
	function Express_ClientSupport_ClientApiFile( CTX )
	{
		if ( CTX.WebServerSettings.Express.ClientSupport
			&& CTX.WebServerSettings.Express.ClientSupport.enabled
			&& CTX.WebServerSettings.Express.ClientSupport.client_api_file )
		{
			let code = SRC_EXPRESS_API_CLIENT.Generate( CTX.Server, CTX.WebServer, CTX.WebServerSettings );
			let filename = CTX.Server.ResolveApplicationPath( CTX.WebServerSettings.Express.ClientSupport.client_api_file );
			LIB_FS.writeFileSync( filename, code );
			CTX.Server.Log.trace( `WebServer.Express.ClientSupport generated client file [${filename}].` );
		}
	};

//---------------------------------------------------------------------
exports.Express_ClientSupport_OpenApiFile =
	function Express_ClientSupport_OpenApiFile( CTX )
	{
		if ( CTX.WebServerSettings.Express.ClientSupport
			&& CTX.WebServerSettings.Express.ClientSupport.enabled
			&& CTX.WebServerSettings.Express.ClientSupport.open_api_file )
		{
			let code = SRC_OPENAPI_DOCUMENT.Generate( CTX.Server, CTX.WebServer );
			let filename = CTX.Server.ResolveApplicationPath( CTX.WebServerSettings.Express.ClientSupport.open_api_file );
			LIB_FS.writeFileSync( filename, code );
			CTX.Server.Log.trace( `WebServer.Express.ClientSupport generated open api file [${filename}].` );
		}
	};

//---------------------------------------------------------------------
exports.Express_ClientSupport_MountPublicFiles =
	function Express_ClientSupport_MountPublicFiles( CTX )
	{
		if ( CTX.WebServerSettings.Express.ClientSupport
			&& CTX.WebServerSettings.Express.ClientSupport.enabled
			&& CTX.WebServerSettings.Express.ClientSupport.public_files )
		{
			let url_path = CTX.WebServer.Express.ServerPath() + CTX.WebServerSettings.Express.ClientSupport.public_url;
			let folder_path = CTX.Server.ResolveApplicationPath( CTX.WebServerSettings.Express.ClientSupport.public_files );
			LIB_FS.mkdirSync( folder_path, { recursive: true } );
			CTX.WebServer.Express.App.use( url_path, CTX.LIB_EXPRESS.static( folder_path ) );
			CTX.Server.Log.trace( `WebServer.Express.ClientSupport mounted route [${url_path}] for public folder [${folder_path}].` );
		}
	};

//---------------------------------------------------------------------
exports.Express_ClientSupport_MountRootRoute =
	function Express_ClientSupport_MountRootRoute( CTX )
	{
		if ( CTX.WebServerSettings.Express.ClientSupport
			&& CTX.WebServerSettings.Express.ClientSupport.enabled
			&& CTX.WebServerSettings.Express.ClientSupport.Views
			&& CTX.WebServerSettings.Express.ClientSupport.Views.home_view )
		{
			let server_path = CTX.WebServer.Express.ServerPath();
			let home_view = CTX.WebServerSettings.Express.ClientSupport.Views.home_view;
			CTX.WebServer.Express.App.get( server_path,
				CTX.WebServer.Express.AuthenticationGate( false ),
				CTX.WebServer.Express.InvocationGate(
					null, null,
					async function ( request, response, next )
					{
						response.render( home_view, { Server: CTX.Server, User: request.user } );
						return "OK";
					}
				),
			);
			CTX.Server.Log.trace( `WebServer.Express.ClientSupport mounted route [${server_path}] for view [${home_view}].` );
		}
	};

//---------------------------------------------------------------------
exports.Express_ClientSupport_MountExplorerRoute =
	function Express_ClientSupport_MountExplorerRoute( CTX )
	{
		if ( CTX.WebServerSettings.Express.ClientSupport
			&& CTX.WebServerSettings.Express.ClientSupport.enabled
			&& CTX.WebServerSettings.Express.ClientSupport.Views
			&& CTX.WebServerSettings.Express.ClientSupport.Views.Explorer
			&& CTX.WebServerSettings.Express.ClientSupport.Views.Explorer.enabled )
		{
			let explorer_settings = CTX.WebServerSettings.Express.ClientSupport.Views.Explorer;
			let route = `${CTX.WebServer.Express.ServicesPath()}${explorer_settings.explorer_path}`;
			let explorer_view = explorer_settings.explorer_view;
			CTX.WebServer.Express.App.get( route,
				CTX.WebServer.Express.AuthenticationGate( explorer_settings.requires_login ),
				CTX.WebServer.Express.InvocationGate(
					null, null,
					async function ( request, response, next )
					{
						response.render( explorer_view, { Server: CTX.Server, User: request.user } );
						return "OK";
					}
				),
			);
			CTX.Server.Log.trace( `WebServer.Express.Explorer mounted route [${route}] to view [${explorer_view}].` );
		}
	};

