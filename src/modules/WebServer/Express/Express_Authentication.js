'use strict';


const SRC_AUTHENTICATION_PASSPORT_LOCAL = require( './Authentication/Passport_Local.js' );
const SRC_AUTHENTICATION_PASSPORT_AUTH0 = require( './Authentication/Passport_Auth0.js' );


//---------------------------------------------------------------------
exports.Express_Authentication =
function Express_Authentication( CTX )
{
	if ( CTX.WebServerSettings.Express.Authentication
		&& CTX.WebServerSettings.Express.Authentication.enabled )
	{
		switch ( CTX.WebServerSettings.Express.Authentication.authentication_engine )
		{
			case 'Passport_Local':
				SRC_AUTHENTICATION_PASSPORT_LOCAL.Use( CTX.Server, CTX.WebServer, CTX.WebServerSettings );
				CTX.Server.Log.trace( `WebServer.Express.Authentication is using [Passport_Local].` );
				break;
			case 'Passport_Auth0':
				SRC_AUTHENTICATION_PASSPORT_AUTH0.Use( CTX.Server, CTX.WebServer, CTX.WebServerSettings );
				CTX.Server.Log.trace( `WebServer.Express.Authentication is using [Passport_Auth0].` );
				break;
			default:
				throw new Error( CTX.Server.Utility.invalid_parameter_value_message(
					'Express.Authentication.authentication_engine',
					CTX.WebServerSettings.Express.Authentication.authentication_engine,
					`Must be either 'Passport_Local' or 'Passport_Auth0'.` ) );
				break;
		}
		CTX.Server.Log.trace( `WebServer.Express.Authentication is initialized.` );
	}
}
