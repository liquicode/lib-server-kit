

// const LIB_SERVER_KIT = require( '@liquicode/lib-server-kit' );
const LIB_SERVER_KIT = require( '../../src/lib-server-kit' );
let timestamp = new Date();

let server_options = {
	write_defaults: true,	// Writes 'TestConfig.defaults.json'.
	write_settings: true,	// Writes 'TestConfig.settings.json'.
	config_path: 'config',	// Merges, alphabetically, all json/yaml files in path. (can be a filename)
	Settings: {			// Merge an explicit object with the configuration. This is applied last.
		AppInfo: {
			timestamp: timestamp.toString(),
			timestampz: timestamp.toISOString(),
		},
		WebServer: {
			Express: {
				ClientSupport: {
					// server_url: 'test-app',
					services_url: 'api',
				},
			},
		},
		// Log: {
		// 	Console: { enabled: false },
		// 	Shell: { enabled: true },
		// },
	},
};

const Server = LIB_SERVER_KIT.NewServer( 'TestConfig', __dirname, server_options );

console.log( 'Initializing Server ...' );
Server.Initialize();

( async () =>
{
	console.log( 'Starting WebServer ...' );
	await Server.WebServer.StartWebServer();

	console.log( 'Stopping WebServer ...' );
	await Server.WebServer.StopWebServer();

	process.exit( 0 );
} )();
