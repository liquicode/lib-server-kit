'use strict';


//=====================================================================
//=====================================================================
//
//		Web Server
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const SRC_MODULE_BASE = require( '../base/ModuleBase.js' );

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_HTTP = require( 'http' );
const LIB_EXPRESS = require( 'express' );
const LIB_EXPRESS_SESSION = require( 'express-session' );
const LIB_CORS = require( 'cors' );
const LIB_EXPRESS_FILEUPLOAD = require( 'express-fileupload' );


//---------------------------------------------------------------------
exports.Construct =
	function Construct_WebServer( Server )
	{
		let module = SRC_MODULE_BASE.NewModule();

		module.ExpressRouter = null;	// Initialized during Initialize()
		module.HttpServer = null;		// Initialized during StartWebServer()


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Module Configuration
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		module.GetDefaults =
			function GetDefaults() 
			{
				return {
					// Listen
					address: 'localhost',
					port: 80,
					// Static website files
					website_files: 'web/files',
					website_views: 'web/views',
					website_api_client: 'web/files/_server-api.js',
					// Session
					session_enabled: false,
					session_key: 'CHANGE THIS TO A RANDOM SECRET',
					// Authentication urls
					home_url: '/home',
					login_url: '/auth/login',
					logout_url: '/auth/logout',
					signup_url: '/auth/signup',
					user_url: '/auth/user',
					// Authentication: Auth0
					passport_auth0: {
						enabled: false,
						domain: 'auth0-domain',
						client_id: 'auth0-client-id',
						client_secret: 'auth0-client-secret',
						callback_url: 'auth0-callback-url',
					},
					// Authentication: email and password
					passport_local: {
						enabled: false,
						users: [ { user_email: 'admin@internal', password: 'password' } ],
					},
					// Temp folder for file uploads.
					temp_path: '~temp',
				};
			};


		//---------------------------------------------------------------------
		module.Initialize =
			function Initialize()
			{
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Module Functions
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		module.RequiresLogin =
			function requires_login( request, response, next )
			{
				if ( request.user ) { return next(); }
				request.session.returnTo = request.originalUrl;
				response.redirect( `/${Server.Config.Settings.WebServer.login_url}` );
			};


		//---------------------------------------------------------------------
		module.NotRequiresLogin =
			function not_requires_login( request, response, next )
			{
				if ( request.user ) { return next(); }
				request.user = {
					user_id: 'anonymous@internal',
					user_role: 'public',
					user_name: 'Anonymous',
					image_url: '',
				};
				return next();
			};


		//---------------------------------------------------------------------
		module.ReportError =
			async function ReportError( error, response )
			{
				let error_text = '';
				if ( error && error.message )
				{
					error_text = error.message;
				}
				else
				{
					error_text = error.toString();
				}
				Server.Log.error( error_text );
				response.render( 'error', error_text );
				return;
			};


		//---------------------------------------------------------------------
		module.ReportApiError =
			async function ReportApiError( api_result, response )
			{
				let error_text = 'Error in [' + api_result.origin + ']: ' + api_result.error;
				Server.Log.error( error_text );
				// response.render( 'error', { error: error_text } );
				response.send( api_result );
				return;
			};


		//---------------------------------------------------------------------
		module.RequestProcessor =
			async function RequestProcessor( request, response, next, processor, do_render_error = false )
			{
				let error_text = null;
				let t0 = Date.now();
				try
				{
					await processor( request, response, next );
				}
				catch ( error ) 
				{
					error_text = error.message;
					if ( do_render_error )
					{
						response.render( 'error', { App: Server, User: request.user, Error: error } );
					}
					else
					{
						// response.send( { error: error_text } );
						response.send( { error: { error: error_text } } );
					}
				}
				finally
				{
					let log_text = '';
					if ( error_text ) { log_text = ' err'; }
					else { log_text = ' ok '; }
					let t1 = Date.now();
					log_text += ` | ` + `${t1 - t0}`.padStart( 8 ) + ` ms`;
					log_text += ' | ' + request.method.padEnd( 7 ) + request.url;
					if ( request.user )
					{
						log_text += ` (by: ${request.user.user_id})`;
					}
					Server.Log.info( log_text );;
					if ( error_text )
					{
						log_text += `*** Error! ***`;
						log_text += `\n${error_text}`;
						log_text += `\n${JSON.stringify( request.query )}`;
						Server.Log.error( log_text );
					}
				}
			};


		//---------------------------------------------------------------------
		module.StartWebServer =
			async function StartWebServer( Address = null, Port = null )
			{
				if ( module.HttpServer !== null ) { throw new Error( `WebServer is already running.` ); }
				const WebServerSettings = Server.Config.Settings.WebServer;

				//==========================================
				// Create an Express router.
				module.ExpressRouter = LIB_EXPRESS();


				//---------------------------------------------------------------------
				// Configure express cors.
				{
					// - Enable CORS (see: https://medium.com/@alexishevia/using-cors-in-express-cac7e29b005b)
					module.ExpressRouter.use( LIB_CORS( { origin: '*' } ) );
					Server.Log.trace( `WebServer - initialized CORS` );
				}


				//---------------------------------------------------------------------
				// Configure body parser.
				{
					// module.ExpressRouter.use( LIB_BODY_PARSER.json() );
					// module.ExpressRouter.use( LIB_BODY_PARSER.urlencoded( { extended: true } ) ); // for parsing application/x-www-form-urlencoded
					module.ExpressRouter.use( LIB_EXPRESS.json( { limit: '50mb' } ) );
					Server.Log.trace( `WebServer - initialized json body parser (limit: 50mb)` );

					module.ExpressRouter.use( LIB_EXPRESS.urlencoded( { extended: true, limit: '50 MB' } ) );
					Server.Log.trace( `WebServer - initialized urlencoded body parser (limit: 50 MB)` );
				}


				//---------------------------------------------------------------------
				// Configure file upload.
				{
					let options = {
						// debug: true,
						// File Size Limits
						limits: { fileSize: 500 * 1024 * 1024 /* 500 MB */ },
						abortOnLimit: true,
						responseOnLimit: 'Uploads cannot be larger than 500MB.',
					};
					if ( module.Settings.temp_path )
					{
						// Temp Files
						options.useTempFiles = true;
						options.tempFileDir = module.Settings.temp_path;
					}
					module.ExpressRouter.use( LIB_EXPRESS_FILEUPLOAD( options ) );
					Server.Log.trace( `WebServer - initialized file upload (limit: 500 MB)` );
				}


				//---------------------------------------------------------------------
				// Configure express session.
				// https://auth0.com/docs/quickstart/webapp/nodejs#configure-auth0
				if ( WebServerSettings.session_enabled )
				{
					let session =
					{
						secret: WebServerSettings.session_key,
						cookie: {},
						resave: false,
						saveUninitialized: true
					};
					if ( Server.Config.Settings.AppInfo.environment === 'production' )
					{
						// Use secure cookies in production (requires SSL/TLS)
						session.cookie.secure = true;
						// Uncomment the line below if your application is behind a proxy (like on Heroku)
						// or if you're encountering the error message:
						// "Unable to verify authorization request state"
						// session.proxy = true;
						session.proxy = true;
						module.ExpressRouter.set( 'trust proxy', 1 );
					}
					module.ExpressRouter.use( LIB_EXPRESS_SESSION( session ) );
					Server.Log.trace( `WebServer - initialized sessions` );
				}


				//---------------------------------------------------------------------
				// Configure passport.
				if ( WebServerSettings.passport_local &&
					WebServerSettings.passport_local.enabled )
				{
					require( './WebServer-Passport-Local.js' ).Use( Server, module.ExpressRouter );
					Server.Log.trace( `WebServer - initialized passport local` );
				}
				else if ( WebServerSettings.passport_auth0 &&
					WebServerSettings.passport_auth0.enabled )
				{
					require( './WebServer-Passport-Auth0.js' ).Use( Server, module.ExpressRouter );
					Server.Log.trace( `WebServer - initialized passport auth0` );
				}


				//---------------------------------------------------------------------
				// Make user object available within pug files.
				module.ExpressRouter.use(
					function ( request, response, next )
					{
						response.locals.User = request.user;
						next();
					}
				);


				//---------------------------------------------------------------------
				// Serve views.
				if ( WebServerSettings.website_views )
				{
					module.ExpressRouter.set( 'view engine', 'pug' );
					// module.ExpressRouter.set( 'views', 'src/web/views' );
					let path = Server.ResolveApplicationPath( WebServerSettings.website_views );
					module.ExpressRouter.set( 'views', path );
					Server.Log.trace( `WebServer - initialized pug views [${path}]` );
				}


				//---------------------------------------------------------------------
				// Serve a static folder.
				if ( WebServerSettings.website_files )
				{
					// module.ExpressRouter.use( '/', LIB_EXPRESS.static( 'src/web/files' ) );
					let path = Server.ResolveApplicationPath( WebServerSettings.website_files );
					module.ExpressRouter.use( '/', LIB_EXPRESS.static( path ) );
					Server.Log.trace( `WebServer - initialized static folder [${path}]` );
				}


				//---------------------------------------------------------------------
				// Top-level page endpoints.
				{
					let Urls = {
						root_url: `/`,
						home_url: `/${WebServerSettings.home_url}`,
						user_url: `/${WebServerSettings.user_url}`,
					};

					//---------------------------------------------------------------------
					// Default root route.
					module.ExpressRouter.get( Urls.root_url,
						Server.WebServer.NotRequiresLogin,
						// Server.WebServer.RequiresLogin,
						async function ( request, response, next ) 
						{
							await Server.WebServer.RequestProcessor( request, response, next,
								async function ( request, response, next )
								{
									// log_request( request );
									response.render(
										WebServerSettings.home_url,
										{ App: Server, User: request.user } );
									return;
								}
								, true );
						} );

					//---------------------------------------------------------------------
					// Default home route.
					module.ExpressRouter.get( Urls.home_url,
						Server.WebServer.NotRequiresLogin,
						async function ( request, response, next ) 
						{
							await Server.WebServer.RequestProcessor( request, response, next,
								async function ( request, response, next )
								{
									// log_request( request );
									response.render(
										WebServerSettings.home_url,
										{ App: Server, User: request.user } );
									return;
								}
								, true );
						} );

					//---------------------------------------------------------------------
					// Default user route.
					module.ExpressRouter.get( Urls.user_url,
						Server.WebServer.RequiresLogin,
						async function ( request, response, next ) 
						{
							await Server.WebServer.RequestProcessor( request, response, next,
								async function ( request, response, next )
								{
									response.render(
										WebServerSettings.user_url,
										{ App: Server, User: request.user } );
								}
								, true );
							return;
						} );

				}


				//=====================================================================
				//=====================================================================
				//
				//		Application Service Routes
				//
				//=====================================================================
				//=====================================================================


				require( './WebServer-Application-Services.js' ).Use( Server, module.ExpressRouter );


				//=====================================================================
				//=====================================================================
				//
				//		Start the Service
				//
				//=====================================================================
				//=====================================================================


				if ( WebServerSettings.website_api_client )
				{
					// Generate the api client for javascript.
					const SRC_GENERATE_SERVICE_CLIENT = require( '../processes/Generate_ServiceClient.js' );
					let code = SRC_GENERATE_SERVICE_CLIENT.Generate_HttpClient( Server );
					let filename = Server.ResolveApplicationPath( WebServerSettings.website_api_client );
					LIB_FS.writeFileSync( filename, code );
					Server.Log.trace( `WebServer - generated api client: [${filename}]` );
				}


				// Create the HTTP server.
				module.HttpServer = LIB_HTTP.createServer( module.ExpressRouter );
				Server.Log.trace( `WebServer - server initialized` );

				// Report the server routes.
				let stack = module.ExpressRouter._router.stack;
				stack.forEach(
					function ( r )
					{
						if ( r.route && r.route.path )
						{
							let verbs = [];
							if ( r.route.methods.get ) { verbs.push( 'GET ' ); }
							if ( r.route.methods.put ) { verbs.push( 'PUT ' ); }
							if ( r.route.methods.post ) { verbs.push( 'POST' ); }
							if ( r.route.methods.del ) { verbs.push( 'DEL ' ); }
							let text = verbs.join( '|' );
							text += ' ' + r.route.path;
							Server.Log.debug( 'Added route: ' + text );
						}
					} );

				// Begin accepting connections.
				let service_address = Address || module.Settings.address;
				let service_port = Port || module.Settings.port;
				await new Promise(
					function ( resolve, reject )
					{
						module.HttpServer.listen(
							service_port,
							service_address,
							function ( err ) 
							{
								if ( err ) { reject( err ); }
								else { resolve( true ); }
							} );
					} );
				let address = module.HttpServer.address();
				Server.Log.trace( `WebServer is listening at [${address.address}:${address.port}].` );

				// Return
				return { ok: true };
			};


		//---------------------------------------------------------------------
		module.StopWebServer =
			async function StopWebServer()
			{
				if ( module.HttpServer === null ) { return { ok: true }; }
				if ( module.HttpServer.listening ) 
				{
					await new Promise(
						function ( resolve, reject )
						{
							module.HttpServer.close(
								function ( err ) 
								{
									if ( err ) { reject( err ); }
									else { resolve( true ); }
								} );
						} );
				}
				module.HttpServer = null;
				Server.Log.trace( `WebServer has stopped listening.` );
				return { ok: true };
			};


		//---------------------------------------------------------------------
		return module;
	};


