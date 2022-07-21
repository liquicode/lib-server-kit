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

			AnonymousUser: {
				user_id: 'anonymous@server',
				user_role: 'public',
				user_name: 'Anonymous',
				image_url: '',
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
					public_url: 'public',				// Url path of the public files.
					client_api_file: 'web/public/_express-api-client.js',
					client_api_style: 'ajax',			// fetch or ajax
					Views: {
						view_engine: 'pug',				// Only 'pug' is supported.
						view_files: 'web/views',		// Local folder of view files.
						home_view: 'home',				// Name of default view to use for root route.
					},
				}, // ~ ClientSupport

				//---------------------------------------------------------------------
				// Explorer
				//---------------------------------------------------------------------

				Explorer: {
					enabled: false,
					explorer_path: 'Explorer',
					explorer_view: 'explorer/explorer',
					requires_login: false,
				}, // ~ Explorer

				// Swagger: {
				// 	enabled: false,
				// 	swagger_ui_path: 'swagger',
				// 	open_api_file: '',
				// }, // ~ Swagger

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
					storage_engine: '',
					Settings: { // https://github.com/expressjs/session
						secret: 'CHANGE THIS TO A RANDOM SECRET',
						name: 'connect.sid',			// The name of the session ID cookie to set in the response (and read from in the request).
						proxy: false,					// Trust the reverse proxy when setting secure cookies (via the "X-Forwarded-Proto" header). Use true if your application is behind a proxy or if you're encountering the error message: "Unable to verify authorization request state"
						resave: false,					// Forces the session to be saved back to the session store, even if the session was never modified during the request.
						rolling: false,					// Force the session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown.
						saveUninitialized: true,		// Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified.
						cookie: {
							path: '/',					// Specifies the value for the Path Set-Cookie. By default, this is set to '/', which is the root path of the domain.
							httpOnly: true,				// Specifies the boolean value for the HttpOnly Set-Cookie attribute. When truthy, the HttpOnly attribute is set, otherwise it is not. By default, the HttpOnly attribute is set. Note be careful when setting this to true, as compliant clients will not allow client-side JavaScript to see the cookie in document.cookie.
							secure: false,				// Use secure cookies in production (requires SSL/TLS)
							maxAge: null,				// Specifies the number (in milliseconds) to use when calculating the Expires Set-Cookie attribute.
							domain: null,				// Specifies the value for the Domain Set-Cookie attribute. By default, no domain is set, and most clients will consider the cookie to apply to only the current domain.
							sameSite: false,			// Specifies the boolean or string to be the value for the SameSite Set-Cookie attribute. By default, this is false.
						},
					},
					Native_Storage: { /* No Settings */ },
					Memory_Storage: {
						Settings: { // https://www.npmjs.com/package/memorystore
							checkPeriod: 3600 * 1000,	// Define how long MemoryStore will check for expired. The period is in ms.
						},
					},
					File_Storage: {
						Settings: { // https://www.npmjs.com/package/session-file-store
							path: 'sessions',			// The directory where the session files will be stored. Defaults to ./sessions
							fileExtension: '.json',		// File extension of saved files. Defaults to '.json'
							secret: null,				// Enables transparent encryption support conforming to OWASP's Session Management best practices.
							ttl: 3600,					// Session time to live in seconds. Defaults to 3600
							retries: 5,					// The number of retries to get session data from a session file. Defaults to 5
							factor: 1,					// The exponential factor to use for retry. Defaults to 1
							minTimeout: 50,				// The number of milliseconds before starting the first retry. Defaults to 50
							maxTimeout: 100,			// The maximum number of milliseconds between two retries. Defaults to 100
							reapInterval: 3600,			// Interval to clear expired sessions in seconds or -1 if do not need. Defaults to 1 hour
						},
					},
					// BetterSqlite3_Storage: {
					// 	Settings: {
					// 	},
					// },
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

					//---------------------------------------------------------------------
					// Passport Authentication: https://www.passportjs.org/
					//---------------------------------------------------------------------

					//---------------------------------------------------------------------
					// Passport Authentication: email and password
					Passport_Local: {
						Users: [
							{ user_id: 'admin@server', user_role: 'admin', password: 'password' },
							{ user_id: 'super@server', user_role: 'super', password: 'password' },
							{ user_id: 'user@server', user_role: 'user', password: 'password' }
						],
						Settings: { // https://github.com/jaredhanson/passport-local
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
				trace_connections: false,		// Log connection/disconnection events.

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
