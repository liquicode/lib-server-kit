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
// const LIB_HELMET = require( 'helmet' );
const LIB_EXPRESS_FILEUPLOAD = require( 'express-fileupload' );
const LIB_SOCKET_IO = require( 'socket.io' );


//---------------------------------------------------------------------
exports.Construct =
	function Construct_WebServer( Server )
	{
		let _module = SRC_MODULE_BASE.NewModule();

		_module.ExpressRouter = null;	// Initialized during Initialize()
		_module.HttpServer = null;		// Initialized during StartWebServer()
		_module.SocketServer = null;	// Initialized during StartWebServer()


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//	Module Configuration
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		_module.GetDefaults =
			function GetDefaults() 
			{
				return {
					// WebServer Settings
					address: 'localhost',
					port: 80,
					temp_path: '~temp', // Temp folder for file uploads.
					report_routes: false,
					JsonBodyParser: {
						enabled: true,
						limit: '50mb',
					},
					UrlEncodedParser: {
						enabled: true,
						extended: true,
						limit: '50 MB',
					},
					FileUpload: {
						enabled: true,
						debug: false,
						limits: { fileSize: 500 * 1024 * 1024 /* 500 MB */ },
						abortOnLimit: true,
						responseOnLimit: 'Uploads cannot be larger than 500MB.',
						useTempFiles: false,
						tempFileDir: 'path-to-temp-folder',
					},
					ClientFiles: {
						enabled: true,
						public_files: 'web/files',
						view_files: 'web/views',
						http_api_client: 'web/files/_http-api-client.js',
					},
					Cors: {
						enabled: true,
						origin: '*',
						optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
					},
					Session: {
						enabled: true,
						secret: 'CHANGE THIS TO A RANDOM SECRET',
						cookie: {},
						resave: false,
						saveUninitialized: true
					},
					Urls: {
						home_url: 'home',
						login_url: 'auth/login',
						logout_url: 'auth/logout',
						signup_url: 'auth/signup',
						user_url: 'auth/user',
					},
					Passport: {
						// Authentication: email and password
						Local: {
							enabled: false,
							Users: [ { user_id: 'admin@internal', password: 'password' } ],
						},
						// Authentication: Auth0
						Auth0: {
							enabled: false,
							domain: 'auth0-domain',
							client_id: 'auth0-client-id',
							client_secret: 'auth0-client-secret',
							callback_url: 'auth0-callback-url',
						},
					},
					SocketServer: {
						enabled: false,
						// port: 3000,
						socket_api_client: 'web/files/_socket-api-client.js',
					},
					// Helmet: {
					// 	enabled: true,
					// 	crossOriginResourcePolicy: {
					// 		// origin: '*',
					// 		policy: "cross-origin",
					// 	},
					// },
				};
			};


		//---------------------------------------------------------------------
		_module.Initialize =
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
		_module.RequiresLogin =
			function requires_login( request, response, next )
			{
				if ( request.user ) { return next(); }
				request.session.returnTo = request.originalUrl;
				response.redirect( `/${Server.Config.Settings.WebServer.Urls.login_url}` );
			};


		//---------------------------------------------------------------------
		_module.NotRequiresLogin =
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
		_module.ReportError =
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
		_module.ReportApiError =
			async function ReportApiError( api_result, response )
			{
				let error_text = 'Error in [' + api_result.origin + ']: ' + api_result.error;
				Server.Log.error( error_text );
				// response.render( 'error', { error: error_text } );
				response.send( api_result );
				return;
			};


		//---------------------------------------------------------------------
		_module.RequestProcessor =
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
						response.render( 'error', { Server: Server, User: request.user, Error: error } );
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


		//=====================================================================
		//=====================================================================
		//
		//		StartWebServer
		//			- Callbacks: an optional object containing callback functions.
		//				- PreInitialize( Server, Router ) : Called after Router is created but before any initialization.
		//				- PreStartup( Server, Router ) : Called after all Router initialization but before starup.
		//
		//=====================================================================
		//=====================================================================


		_module.StartWebServer =
			async function StartWebServer( Callbacks = null )
			{
				if ( _module.HttpServer !== null ) { throw new Error( `WebServer is already running. Call the StopWebServer() function.` ); }
				if ( _module.SocketServer !== null ) { throw new Error( `SocketServer is already running. Call the StopWebServer() function.` ); }
				const WebServerSettings = Server.Config.Settings.WebServer;


				//==========================================
				// Create an Express router.
				_module.ExpressRouter = LIB_EXPRESS();


				//=====================================================================
				//=====================================================================
				//
				//		Callback: PreInitialize
				//
				//=====================================================================
				//=====================================================================


				if ( Callbacks && Callbacks.PreInitialize ) { await Callbacks.PreInitialize( Server, _module.ExpressRouter ); }


				//=====================================================================
				//=====================================================================
				//
				//		Security
				//
				//=====================================================================
				//=====================================================================


				//---------------------------------------------------------------------
				if ( WebServerSettings.Cors && WebServerSettings.Cors.enabled )
				{
					// - Enable CORS (see: https://medium.com/@alexishevia/using-cors-in-express-cac7e29b005b)
					// _module.ExpressRouter.use( LIB_CORS( { origin: '*' } ) );
					_module.ExpressRouter.use( LIB_CORS( WebServerSettings.Cors ) );
					Server.Log.trace( `WebServer - initialized Cors` );
				}
				// if ( WebServerSettings.Helmet && WebServerSettings.Helmet.enabled )
				// {
				// 	_module.ExpressRouter.use( LIB_HELMET( WebServerSettings.Helmet ) );
				// 	Server.Log.trace( `WebServer - initialized Helmet` );
				// }


				//=====================================================================
				//=====================================================================
				//
				//		Params Parser
				//
				//=====================================================================
				//=====================================================================


				//---------------------------------------------------------------------
				if ( WebServerSettings.JsonBodyParser && WebServerSettings.JsonBodyParser.enabled )
				{
					_module.ExpressRouter.use( LIB_EXPRESS.json( WebServerSettings.JsonBodyParser ) );
					Server.Log.trace( `WebServer - initialized JsonBodyParser` );
				}


				//---------------------------------------------------------------------
				if ( WebServerSettings.UrlEncodedParser && WebServerSettings.UrlEncodedParser.enabled )
				{
					_module.ExpressRouter.use( LIB_EXPRESS.urlencoded( WebServerSettings.UrlEncodedParser ) );
					Server.Log.trace( `WebServer - initialized UrlEncodedParser` );
				}


				//=====================================================================
				//=====================================================================
				//
				//		File Upload
				//
				//=====================================================================
				//=====================================================================


				//---------------------------------------------------------------------
				if ( WebServerSettings.FileUpload && WebServerSettings.FileUpload.enabled )
				{
					_module.ExpressRouter.use( LIB_EXPRESS_FILEUPLOAD( WebServerSettings.FileUpload ) );
					Server.Log.trace( `WebServer - initialized FileUpload` );
				}


				//=====================================================================
				//=====================================================================
				//
				//		Session
				//
				//=====================================================================
				//=====================================================================


				//---------------------------------------------------------------------
				// Configure express session.
				// https://auth0.com/docs/quickstart/webapp/nodejs#configure-auth0
				if ( WebServerSettings.Session && WebServerSettings.Session.enabled )
				{
					// let session = Server.Utility.clone( WebServerSettings.Session );
					let session = JSON.parse( JSON.stringify( WebServerSettings.Session ) );
					if ( Server.Config.Settings.AppInfo.environment === 'production' )
					{
						// Use secure cookies in production (requires SSL/TLS)
						session.cookie.secure = true;
						// Uncomment the line below if your application is behind a proxy (like on Heroku)
						// or if you're encountering the error message:
						// "Unable to verify authorization request state"
						// session.proxy = true;
						session.proxy = true;
						_module.ExpressRouter.set( 'trust proxy', 1 );
					}
					_module.ExpressRouter.use( LIB_EXPRESS_SESSION( session ) );
					Server.Log.trace( `WebServer - initialized Session handler` );
				}


				//=====================================================================
				//=====================================================================
				//
				//		Passport
				//
				//=====================================================================
				//=====================================================================


				//---------------------------------------------------------------------
				// Configure passport.
				if ( WebServerSettings.Passport &&
					WebServerSettings.Passport.Local &&
					WebServerSettings.Passport.Local.enabled )
				{
					require( './WebServer-Passport-Local.js' ).Use( Server, _module.ExpressRouter );
					Server.Log.trace( `WebServer - initialized Passport with Local` );
				}
				else if ( WebServerSettings.Passport &&
					WebServerSettings.Passport.Auth0 &&
					WebServerSettings.Passport.Auth0.enabled )
				{
					require( './WebServer-Passport-Auth0.js' ).Use( Server, _module.ExpressRouter );
					Server.Log.trace( `WebServer - initialized Passport with Auth0` );
				}


				//=====================================================================
				//=====================================================================
				//
				//		Client Files
				//
				//=====================================================================
				//=====================================================================


				// //---------------------------------------------------------------------
				// // Make user object available within pug files.
				// _module.ExpressRouter.use(
				// 	function ( request, response, next )
				// 	{
				// 		response.locals.User = request.user;
				// 		next();
				// 	}
				// );


				if ( WebServerSettings.ClientFiles && WebServerSettings.ClientFiles.enabled )
				{

					//---------------------------------------------------------------------
					// Serve a static folder.
					if ( WebServerSettings.ClientFiles.public_files )
					{
						let path = Server.ResolveApplicationPath( WebServerSettings.ClientFiles.public_files );
						_module.ExpressRouter.use( '/', LIB_EXPRESS.static( path ) );
						Server.Log.trace( `WebServer - initialized Static Folder [${path}]` );
					}


					//---------------------------------------------------------------------
					// Serve views.
					if ( WebServerSettings.ClientFiles.view_files )
					{
						_module.ExpressRouter.set( 'view engine', 'pug' );
						let path = Server.ResolveApplicationPath( WebServerSettings.ClientFiles.view_files );
						_module.ExpressRouter.set( 'views', path );
						Server.Log.trace( `WebServer - initialized Pug Views [${path}]` );
					}

					if ( WebServerSettings.ClientFiles.http_api_client )
					{
						// Generate the api client for javascript.
						const SRC_GENERATE_HTTP_API_CLIENT = require( '../processes/Generate_HttpApiClient.js' );
						let code = SRC_GENERATE_HTTP_API_CLIENT.Generate_HttpApiClient( Server );
						let filename = Server.ResolveApplicationPath( WebServerSettings.ClientFiles.http_api_client );
						LIB_FS.writeFileSync( filename, code );
						Server.Log.trace( `WebServer - generated Http Api Client: [${filename}]` );
					}

				}

				//---------------------------------------------------------------------
				// Top-level page endpoints.
				{
					let Urls = {
						root_url: `/`,
						home_url: `/${WebServerSettings.Urls.home_url}`,
						user_url: `/${WebServerSettings.Urls.user_url}`,
					};

					//---------------------------------------------------------------------
					// Default root route.
					_module.ExpressRouter.get( Urls.root_url,
						Server.WebServer.NotRequiresLogin,
						// Server.WebServer.RequiresLogin,
						async function ( request, response, next ) 
						{
							await Server.WebServer.RequestProcessor( request, response, next,
								async function ( request, response, next )
								{
									// log_request( request );
									response.render(
										WebServerSettings.Urls.home_url,
										{ Server: Server, User: request.user } );
									return;
								}
								, true );
						} );

					//---------------------------------------------------------------------
					// Default home route.
					_module.ExpressRouter.get( Urls.home_url,
						Server.WebServer.NotRequiresLogin,
						async function ( request, response, next ) 
						{
							await Server.WebServer.RequestProcessor( request, response, next,
								async function ( request, response, next )
								{
									// log_request( request );
									response.render(
										WebServerSettings.Urls.home_url,
										{ Server: Server, User: request.user } );
									return;
								}
								, true );
						} );

					//---------------------------------------------------------------------
					// Default user route.
					_module.ExpressRouter.get( Urls.user_url,
						Server.WebServer.RequiresLogin,
						async function ( request, response, next ) 
						{
							await Server.WebServer.RequestProcessor( request, response, next,
								async function ( request, response, next )
								{
									response.render(
										WebServerSettings.Urls.user_url,
										{ Server: Server, User: request.user } );
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


				require( './WebServer-Application-Services.js' ).Use( Server, _module.ExpressRouter );


				//=====================================================================
				//=====================================================================
				//
				//		Socket Server
				//
				//=====================================================================
				//=====================================================================


				//==========================================
				// Create a Socket Server.
				if ( WebServerSettings.SocketServer && WebServerSettings.SocketServer.enabled )
				{
					_module.SocketServer = LIB_SOCKET_IO();
					require( './WebServer-Socket-Server.js' ).Use( Server, _module.SocketServer );
					Server.Log.trace( `WebServer - initialized Socket Server` );
					if ( WebServerSettings.SocketServer.socket_api_client )
					{
						// Generate the api client for javascript.
						const SRC_GENERATE_SOCKET_API_CLIENT = require( '../processes/Generate_SocketApiClient.js' );
						let code = SRC_GENERATE_SOCKET_API_CLIENT.Generate_SocketApiClient( Server );
						let filename = Server.ResolveApplicationPath( WebServerSettings.SocketServer.socket_api_client );
						LIB_FS.writeFileSync( filename, code );
						Server.Log.trace( `WebServer - generated Socket Api Client: [${filename}]` );
					}
				}


				//=====================================================================
				//=====================================================================
				//
				//		Report Routes
				//
				//=====================================================================
				//=====================================================================


				if ( WebServerSettings.report_routes )
				{
					let stack = _module.ExpressRouter._router.stack;
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
				}


				//=====================================================================
				//=====================================================================
				//
				//		Create the HTTP Server
				//
				//=====================================================================
				//=====================================================================


				_module.HttpServer = LIB_HTTP.createServer( _module.ExpressRouter );
				Server.Log.trace( `WebServer - server initialization complete.` );


				//=====================================================================
				//=====================================================================
				//
				//		Callback: PreStartup
				//
				//=====================================================================
				//=====================================================================


				if ( Callbacks && Callbacks.PreInitialize ) { await Callbacks.PreStartup( Server, _module.ExpressRouter ); }


				//=====================================================================
				//=====================================================================
				//
				//		Start the Web Server
				//
				//=====================================================================
				//=====================================================================


				// Begin accepting connections.
				await new Promise(
					function ( resolve, reject )
					{
						_module.HttpServer.listen(
							WebServerSettings.port,
							WebServerSettings.address,
							function ( err ) 
							{
								if ( err ) { reject( err ); }
								else { resolve( true ); }
							} );
					} );
				let address = _module.HttpServer.address();
				Server.Log.trace( `WebServer is listening at [${address.address}:${address.port}].` );

				// Start the Socket Server.
				if ( _module.SocketServer )
				{
					// _module.SocketServer.Listen();
					_module.SocketServer.attach( _module.HttpServer );
					Server.Log.trace( `SocketServer has attached to the WebServer.` );
				}

				// Return
				return { ok: true };
			};


		//---------------------------------------------------------------------
		_module.StopWebServer =
			async function StopWebServer()
			{
				if ( _module.HttpServer ) 
				{
					if ( _module.HttpServer.listening ) 
					{
						await new Promise(
							function ( resolve, reject )
							{
								_module.HttpServer.close(
									function ( err ) 
									{
										if ( err ) { reject( err ); }
										else { resolve( true ); }
									} );
							} );
					}
					_module.HttpServer = null;
					_module.ExpressRouter = null;
					Server.Log.trace( `WebServer has stopped.` );
				}
				if ( _module.SocketServer )
				{
					_module.SocketServer.close();
					_module.SocketServer = null;
					Server.Log.trace( `SocketServer has stopped.` );
				}
				return { ok: true };
			};


		//---------------------------------------------------------------------
		return _module;
	};


