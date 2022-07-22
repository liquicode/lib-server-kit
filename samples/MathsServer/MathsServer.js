

const LIB_PATH = require( 'path' );

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
					// storage_engine: 'Memory_Storage',
					storage_engine: 'File_Storage',
					File_Storage: {
						Settings: {
							path: '~data/sessions',
						},
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
		ServerAccounts: {
			Storage: {
				JsonProvider: {
					enabled: true,
					collection_name: "ServerAccounts",
					// database_name: "~data",
					database_name: LIB_PATH.join( __dirname, '~data' ),
					clear_collection_on_start: false,
					flush_on_update: true,
					flush_every_ms: 0,
				},
			},
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

