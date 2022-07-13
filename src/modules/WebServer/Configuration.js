'use strict';

const { Server } = require( 'socket.io' );


//=====================================================================
//=====================================================================
//
//		Web Server - Configuration
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
exports.GetDefaults =
	function GetDefaults()
	{
		let defaults = {

			HttpServer: {
				protocol: 'http',
				address: 'localhost',
				port: 80,
			},

			//---------------------------------------------------------------------
			// Express Transport: https://github.com/expressjs/express
			//---------------------------------------------------------------------

			Express: {
				enabled: false,
				server_path: '',					// Root path for this server.
				services_path: '',					// Path to services and functions. (e.g. 'api')
				report_routes: false,				// Reports all routes added on startup.

				//---------------------------------------------------------------------
				// Client Support
				//---------------------------------------------------------------------

				ClientSupport: {
					enabled: false,
					public_files: 'web/public',			// Local folder of public files.
					client_api_file: 'web/public/_express-api-client.js',
					Views: {
						view_engine: 'pug',				// Only 'pug' is supported.
						view_files: 'web/views',		// Local folder of view files.
						home_view: 'home',				// Name of default view to use for root route.
					},
				}, // ~ ClientSupport

				//---------------------------------------------------------------------
				// Swagger
				//---------------------------------------------------------------------

				Swagger: {
					enabled: false,
					swagger_ui_path: 'swagger',
					open_api_file: '',
				}, // ~ Swagger

				//---------------------------------------------------------------------
				// Data Handling
				//---------------------------------------------------------------------

				DataHandling: {

					JsonBodyParser: {
						enabled: true,
						Settings: {
							limit: '50mb',
						},
					},

					UrlEncodedParser: {
						enabled: true,
						Settings: {
							extended: true,
							limit: '50 MB',
						},
					},

					FileUpload: {
						enabled: true,
						Settings: {
							debug: false,
							limits: { fileSize: 500 * 1024 * 1024 /* 500 MB */ },
							abortOnLimit: true,
							responseOnLimit: 'Uploads cannot be larger than 500MB.',
							useTempFiles: false,
							tempFileDir: 'path-to-temp-folder',
						},
					},

				}, // ~ DataHandling

				//---------------------------------------------------------------------
				// Express Security
				//---------------------------------------------------------------------

				Security: {

					Cors: {
						enabled: true,
						Settings: {
							origin: '*',				// Allow all
							optionsSuccessStatus: 200,	// some legacy browsers (IE11, various SmartTVs) choke on 204
						},
					},

					// Helmet: {
					// 	enabled: true,
					// 	crossOriginResourcePolicy: {
					// 		// origin: '*',
					// 		policy: "cross-origin",
					// 	},
					// },

				}, // ~ Security

				//---------------------------------------------------------------------
				// Express Session
				//---------------------------------------------------------------------

				Session: {
					enabled: false,
					set_express_trust_proxy: false,
					Settings: { // https://github.com/expressjs/session
						secret: 'CHANGE THIS TO A RANDOM SECRET',
						name: 'connect.sid',
						proxy: false,				// Use true if your application is behind a proxy (like on Heroku) or if you're encountering the error message: "Unable to verify authorization request state"
						resave: false,
						rolling: false,
						saveUninitialized: true,
						cookie: {
							path: '/',
							httpOnly: true,
							secure: false,			// Use secure cookies in production (requires SSL/TLS)
							maxAge: null,
							domain: null,
							sameSite: false,
						},
					},
				}, // ~ Session

				//---------------------------------------------------------------------
				// Express Authentication
				//---------------------------------------------------------------------

				Authentication: {
					enabled: false,
					authentication_engine: 'Passport_Local',

					Pages: {
						login_url: 'auth/login',
						login_view: 'auth/login',
						logout_url: 'auth/logout',
						logout_view: 'auth/logout',
						signup_url: 'auth/signup',
						signup_view: 'auth/signup',
					},

					AnonymousUser: {
						user_id: 'anonymous@server',
						user_role: 'public',
						user_name: 'Anonymous',
						image_url: '',
					},

					//---------------------------------------------------------------------
					// Passport Authentication: https://www.passportjs.org/
					//---------------------------------------------------------------------

					//---------------------------------------------------------------------
					// Passport Authentication: email and password
					Passport_Local: { // https://github.com/jaredhanson/passport-local
						Users: [ { user_id: 'admin@server', password: 'password' } ],
						Settings: {
						},
					},

					//---------------------------------------------------------------------
					// Passport Authentication: Auth0
					Passport_Auth0: { // https://github.com/auth0/passport-auth0
						Settings: { // https://auth0.com/docs/quickstart/webapp/nodejs#configure-auth0
							domain: 'auth0-domain',
							client_id: 'auth0-client-id',
							client_secret: 'auth0-client-secret',
							callback_url: 'auth0-callback-url',
						},
					},

				}, // ~ Authentication

			}, // ~ Express

			//---------------------------------------------------------------------
			// Socket.IO Transport: https://github.com/socketio/socket.io
			//---------------------------------------------------------------------

			SocketIO: {
				enabled: false,

				ClientSupport: {
					enabled: false,
					socket_api_client: 'web/public/_socket-api-client.js',
				},

			}, // ~ SocketIO

		};
		return defaults;
	};



//---------------------------------------------------------------------
exports.AnalyzeSettings =
	function AnalyzeSettings( Server )
	{
		let WebServerSettings = Server.Config.Settings.WebServer;
		if ( WebServerSettings )
		{
			if ( WebServerSettings.Express
				&& WebServerSettings.Express.enabled )
			{
				if ( WebServerSettings.Express.Authentication
					&& WebServerSettings.Express.Authentication.enabled )
				{
					if ( !WebServerSettings.Express.Session
						|| !WebServerSettings.Express.Session.enabled )
					{
						Server.Log.warn( `The WebServer Session module must be enabled because Authentication depends on it.` );
					}

				}
			}
		}
		return;
	};
