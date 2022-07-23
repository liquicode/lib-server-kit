'use strict';


const LIB_FS = require( 'fs' );
const LIB_MEMORYSTORE = require( 'memorystore' );
const LIB_SESSION_FILE_STORE = require( 'session-file-store' );


//---------------------------------------------------------------------
exports.Express_Session =
	function Express_Session( CTX )
	{
		if ( CTX.WebServerSettings.Express.Session
			&& CTX.WebServerSettings.Express.Session.enabled )
		{
			let session_settings = JSON.parse( JSON.stringify( CTX.WebServerSettings.Express.Session.Settings ) );

			if ( CTX.WebServerSettings.Express.Session.storage_engine )
			{
				switch ( CTX.WebServerSettings.Express.Session.storage_engine )
				{
					case 'Memory_Storage':
						let memory_store = LIB_MEMORYSTORE( CTX.LIB_EXPRESS_SESSION );
						session_settings.store = new memory_store( WebServerSettings.Express.Session.Memory_Storage );
						CTX.Server.Log.trace( `WebServer.Express.Session.Memory_Storage is being used.` );
						break;
					case 'File_Storage':
						let file_storage_settings = JSON.parse( JSON.stringify( CTX.WebServerSettings.Express.Session.File_Storage.Settings ) );
						file_storage_settings.path = CTX.Server.ResolveApplicationPath( file_storage_settings.path );
						LIB_FS.mkdirSync( file_storage_settings.path, { recursive: true } );
						let file_store = LIB_SESSION_FILE_STORE( CTX.LIB_EXPRESS_SESSION );
						session_settings.store = new file_store( file_storage_settings );
						CTX.Server.Log.trace( `WebServer.Express.Session.File_Storage is using path [${file_storage_settings.path}].` );
						break;
					case 'BetterSqlite3_Storage':
						CTX.Server.Log.warn( `WebServer.Express.Session.BetterSqlite3_Storage is not implemented!` );
						// Server.Log.trace( `WebServer.Express.Session.BetterSqlite3_Storage is being used.` );
						break;
					case '':
					case 'Native_Storage':
						CTX.Server.Log.trace( `WebServer.Express.Session.Native_Storage is being used.` );
						break;
				}
			}

			CTX.WebServer.Express.Session = CTX.LIB_EXPRESS_SESSION( session_settings );

			if ( CTX.WebServerSettings.Express.Session.set_express_trust_proxy )
			{
				CTX.WebServer.Express.App.set( 'trust proxy', 1 );
			}

			CTX.WebServer.Express.App.use( CTX.WebServer.Express.Session );
			CTX.Server.Log.trace( `WebServer.Express.Session is initialized.` );
		}
	};
