'use strict';


const LIB_CORS = require( 'cors' );
// const LIB_HELMET = require( 'helmet' );


//---------------------------------------------------------------------
exports.Express_Security_Cors =
	function Express_Security_Cors( CTX )
	{
		if ( CTX.WebServerSettings.Express.Security.Cors
			&& CTX.WebServerSettings.Express.Security.Cors.enabled )
		{
			// - Enable CORS (see: https://medium.com/@alexishevia/using-cors-in-express-cac7e29b005b)
			// WebServer.Express.App.use( LIB_CORS( { origin: '*' } ) );
			CTX.WebServer.Express.App.use(
				LIB_CORS(
					CTX.WebServerSettings.Express.Security.Cors.Settings ) );
			CTX.Server.Log.trace( `WebServer.Express.Security.Cors is initialized.` );
		}
	};

	// if ( WebServerSettings.Helmet && WebServerSettings.Helmet.enabled )
	// {
	// 	WebServer.Express.App.use( LIB_HELMET( WebServerSettings.Helmet ) );
	// 	Server.Log.trace( `WebServer - initialized Helmet` );
	// }

