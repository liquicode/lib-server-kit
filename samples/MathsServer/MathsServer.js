

// const LIB_SERVER_KIT = require( '@liquicode/lib-server-kit' );
const LIB_SERVER_KIT = require( '../../src/lib-server-kit' );

let server_options = {
	write_defaults: true,	// Writes 'TestConfig.defaults.json'.
	write_settings: true,	// Writes 'TestConfig.settings.json'.
	// config_path: 'config',	// Merges, alphabetically, all json/yaml files in path. (can be a filename)
	Settings:
	{
		AppInfo: {
			name: 'MathsServer',
			description: 'Maths Server: For making maths.',
			environment: 'development',
		},
		WebServer: {
			HttpServer: {
				port: 4200
			},
			Express: {
				enabled: true,
				report_routes: true,
				ClientSupport: {
					enabled: true,
				},
				Explorer: {
					enabled: true,
				},
				Session: {
					enabled: true,
					Settings: {
						secret: 'fgHrHtvtnRB3mwVSRoFtuy9ZQPRW3N9X',
						name: 'MathsServer.sid',
					},
				},
				Authentication: {
					enabled: true,
				},
			},
			SocketIO: {
				enabled: true,
			}
		},
		Log: {
			Console: {
				enabled: true
			},
			Shell: {
				enabled: false
			},
		},
	},
};
const Server = LIB_SERVER_KIT.NewServer( 'MathsServer', __dirname, server_options );

Server.Initialize();

let callbacks = {
	PreInitialize: function ( Server, Router ) { Server.Log.info( `WebServer PreInitialize ---------------------------------------------------------------------` ); },
	PreStartup: function ( Server, Router ) { Server.Log.info( `WebServer PreStartup ---------------------------------------------------------------------` ); },
};

Server.WebServer.StartWebServer( callbacks );

