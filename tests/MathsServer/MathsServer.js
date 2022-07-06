

// const LIB_SERVER_KIT = require( '@liquicode/lib-server-kit' );
const LIB_SERVER_KIT = require( '../../src/lib-server-kit' );
const Server = LIB_SERVER_KIT.NewServer( 'MathsServer', __dirname, true );
Server.Initialize( { Log: { Console: { enabled: true }, Shell: { enabled: false } } } );

let callbacks = {
	PreInitialize: function ( Server, Router ) { Server.Log.info( `WebServer PreInitialize ---------------------------------------------------------------------` ); },
	PreStartup: function ( Server, Router ) { Server.Log.info( `WebServer PreStartup ---------------------------------------------------------------------` ); },
};

Server.WebServer.StartWebServer( callbacks );

