

// const LIB_SERVER_KIT = require( '@liquicode/lib-server-kit' );
const LIB_SERVER_KIT = require( '../../src/lib-server-kit' );

let server_options = {
	WriteDefaults: true,
	WriteSettings: true,
	ConfigPath: '',
	ConfigObject: { Log: { Console: { enabled: true }, Shell: { enabled: false } } },
};
const Server = LIB_SERVER_KIT.NewServer( 'MathsServer', __dirname, server_options );

Server.Initialize();

let callbacks = {
	PreInitialize: function ( Server, Router ) { Server.Log.info( `WebServer PreInitialize ---------------------------------------------------------------------` ); },
	PreStartup: function ( Server, Router ) { Server.Log.info( `WebServer PreStartup ---------------------------------------------------------------------` ); },
};

Server.WebServer.StartWebServer( callbacks );

