

// const LIB_SERVER_KIT = require( '@liquicode/lib-server-kit' );
const LIB_SERVER_KIT = require( '../../src/lib-server-kit' );

let server_options = {
	WriteDefaults: true,
	WriteSettings: true,
	ConfigPath: 'config',
	ConfigObject: { Log: { Console: { enabled: true }, Shell: { enabled: false } } },
};
const Server = LIB_SERVER_KIT.NewServer( 'TestConfig', __dirname, server_options );

