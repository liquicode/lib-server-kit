'use strict';
/*
	#@type		Module
	#@parent	
	#@name		WebServer
	#@desc		Functions to control the web server.

	The WebServer host a number of services found in the `services` folder.
*/


//=====================================================================
//=====================================================================
//
//		Web Server
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const MODULE_BASE = require( '../base/ModuleBase.js' );

// const LIB_PATH = require( 'path' );

const LIB_URL = require( 'url' );
const LIB_HTTP = require( 'http' );
const LIB_EXPRESS = require( 'express' );
const LIB_EXPRESS_SESSION = require( 'express-session' );
const LIB_CORS = require( 'cors' );
const LIB_QUERYSTRING = require( 'querystring' );
// const LIB_BODY_PARSER = require( 'body-parser' );
const LIB_EXPRESS_FILEUPLOAD = require( 'express-fileupload' );

const LIB_PASSPORT = require( 'passport' );
// const LIB_PASSPORT_BASIC = require( 'passport-http' );
const LIB_PASSPORT_AUTH0 = require( 'passport-auth0' );

// const LIB_UUID = require( 'uuid' );


//---------------------------------------------------------------------
exports.Construct =
	function Construct_WebServer( Server )
	{
		let module = MODULE_BASE.NewModule();

		module.http_server = null;


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
					address: 'localhost',
					port: 80,
					// users: [],				// Currently has no implementation/effect.
					session_key: 'CHANGE THIS TO A RANDOM SECRET',
					auth0: {
						// enabled: false,		// Currently has no implementation/effect.
						domain: 'auth0-domain',
						client_id: 'auth0-client-id',
						client_secret: 'auth0-client-secret',
						callback_url: 'auth0-callback-url',
					},
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
						log_text += ` (by: ${request.user._m.owner.email})`;
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
		module.RequiresLogin =
			function requires_login( request, response, next )
			{
				if ( request.user ) { return next(); }
				request.session.returnTo = request.originalUrl;
				response.redirect( '/login' );
			};


		//---------------------------------------------------------------------
		module.NotRequiresLogin =
			function not_requires_login( request, response, next )
			{
				request.user = {
					user_id: 'anonymous@internal',
					user_role: 'public',
					user_name: 'Anonymous',
					image_url: '',
				};
				return next();
			};


		//---------------------------------------------------------------------
		module.StartWebServer =
			async function StartWebServer( Address = null, Port = null )
			{
				if ( module.http_server !== null ) { throw new Error( `WebServer is already running.` ); }

				//==========================================
				// Create an Express router.
				let express_router = LIB_EXPRESS();


				//---------------------------------------------------------------------
				// Configure express cors.
				// - Enable CORS (see: https://medium.com/@alexishevia/using-cors-in-express-cac7e29b005b)
				express_router.use( LIB_CORS( { origin: '*' } ) );


				//---------------------------------------------------------------------
				// Configure body parser.
				// express_router.use( LIB_BODY_PARSER.json() );
				// express_router.use( LIB_BODY_PARSER.urlencoded( { extended: true } ) ); // for parsing application/x-www-form-urlencoded
				express_router.use( LIB_EXPRESS.json( { limit: '50mb' } ) );
				express_router.use( LIB_EXPRESS.urlencoded( { extended: true, limit: '50mb' } ) );
				{
					let options = {
						// debug: true,
						// File Size Limits
						limits: { fileSize: 500 * 1024 * 1024 /* 500 MB */ },
						abortOnLimit: true,
						responseOnLimit: 'Images cannot be larger than 500MB.',
					};
					if ( module.Settings.temp_path )
					{
						// Temp Files
						options.useTempFiles = true;
						options.tempFileDir = module.Settings.temp_path;
					}
					express_router.use( LIB_EXPRESS_FILEUPLOAD( options ) );
				}


				//---------------------------------------------------------------------
				// Configure express session.
				// https://auth0.com/docs/quickstart/webapp/nodejs#configure-auth0
				{
					let session =
					{
						secret: module.Settings.session_key,
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
						session.proxy = true;
						express_router.set( 'trust proxy', 1 );
					}
					express_router.use( LIB_EXPRESS_SESSION( session ) );
				}


				//---------------------------------------------------------------------
				// Configure passport.
				{
					// Implement the passport serialization functions.
					LIB_PASSPORT.serializeUser(
						function ( user, done )
						{
							done( null, user );
						} );

					LIB_PASSPORT.deserializeUser(
						function ( user, done )
						{
							done( null, user );
						} );

					// Construct the authentication strategy.
					let strategy = new LIB_PASSPORT_AUTH0(
						{
							domain: module.Settings.auth0.domain,
							clientID: module.Settings.auth0.client_id,
							clientSecret: module.Settings.auth0.client_secret,
							callbackURL: module.Settings.auth0.callback_url,
						},
						async function ( accessToken, refreshToken, extraParams, profile, done )
						{
							// accessToken is the token to call Auth0 API (not needed in the most cases).
							// extraParams.id_token has the JSON Web Token.
							// profile has all the information from the user.
							// done is the completion function.
							try
							{
								// Find or create this user.
								let user = Server.SystemUsers.NewServiceObject();
								user.user_id = profile.emails[ 0 ].value.toLowerCase().trim();
								user.user_role = 'user';
								user.user_name = profile.displayName;
								user.image_url = profile.picture;
								let api_result = await Server.SystemUsers.FindOrCreateUser( user );
								if ( api_result.error ) { throw new Error( api_result.error ); }
								return done( null, api_result.object );
							}
							catch ( error )
							{
								return done( error, null );
							}
						}
					);

					// Configure the router.
					LIB_PASSPORT.use( strategy );
					express_router.use( LIB_PASSPORT.initialize() );
					express_router.use( LIB_PASSPORT.session() );
				}
				// LIB_PASSPORT.use( passport_basic_strategy );
				// express_router.use( LIB_PASSPORT.initialize() );


				//=====================================================================
				//=====================================================================
				//
				//		Auth0 Authentication Service
				//
				//=====================================================================
				//=====================================================================


				{

					//---------------------------------------------------------------------
					express_router.get( '/login',
						LIB_PASSPORT.authenticate( 'auth0',
							{
								scope: 'openid email profile'
							} ),
						async function ( request, response ) 
						{
							response.redirect( '/' );
						} );

					//---------------------------------------------------------------------
					express_router.get( '/auth0_callback',
						async function ( request, response, next )
						{
							LIB_PASSPORT.authenticate( 'auth0',
								function ( error, user, info )
								{
									if ( error ) { return next( error ); }
									if ( !user ) { return response.redirect( '/login' ); }
									request.logIn( user,
										function ( error )
										{
											if ( error ) { return next( error ); }
											const returnTo = request.session.returnTo;
											delete request.session.returnTo;
											response.redirect( returnTo || '/' );
										} );
								} )( request, response, next );
						} );

					//---------------------------------------------------------------------
					express_router.get( '/logout',
						async function ( request, response ) 
						{
							request.logout();
							var returnTo = request.protocol + '://' + request.hostname;
							var port = request.socket.localPort;
							if ( port !== undefined && port !== 80 && port !== 443 )
							{
								returnTo += ':' + port;
							}
							var logoutURL = new LIB_URL.URL( `https://${module.Settings.auth0.domain}/v2/logout` );
							var searchString = LIB_QUERYSTRING.stringify(
								{
									client_id: module.Settings.auth0.client_id,
									returnTo: returnTo
								} );
							logoutURL.search = searchString;

							response.redirect( logoutURL );
						}
					);

					//---------------------------------------------------------------------
					// Make user object available within pug files.
					express_router.use(
						function ( request, response, next )
						{
							response.locals.user = request.user;
							next();
						}
					);

				}


				//=====================================================================
				//=====================================================================
				//
				//		API Services
				//
				//=====================================================================
				//=====================================================================


				//=====================================================================
				//=====================================================================
				//
				//		Services
				//
				//=====================================================================
				//=====================================================================

				{
					let ParentPath = '';


					//---------------------------------------------------------------------
					function log_request( request )
					{
						let log_text = ' --- uiservice --- | ' + request.method.padEnd( 7 ) + request.url;;
						if ( request.user )
						{
							log_text += ` (by: ${request.user._m.owner.email})`;
						}
						Server.Log.debug( log_text );;
						return;
					}


					//=====================================================================
					//=====================================================================
					//
					//		Top Level Routes
					//
					//=====================================================================
					//=====================================================================


					//---------------------------------------------------------------------
					// Default root route.
					express_router.get( `${ParentPath}/`,
						// App.WebServer.RequiresLogin,
						async function ( request, response, next ) 
						{
							await Server.WebServer.RequestProcessor( request, response, next,
								async function ( request, response, next )
								{
									log_request( request );
									response.render( 'home', { App: Server, User: request.user } );
									return;
								}
								, true );
						} );


					//---------------------------------------------------------------------
					// Default home route.
					express_router.get( `${ParentPath}/home`,
						// App.WebServer.RequiresLogin,
						async function ( request, response, next ) 
						{
							await Server.WebServer.RequestProcessor( request, response, next,
								async function ( request, response, next )
								{
									log_request( request );
									response.render( 'home', { App: Server, User: request.user } );
									return;
								}
								, true );
						} );


					//---------------------------------------------------------------------
					// Default user route.
					express_router.get( `${ParentPath}/user`,
						Server.WebServer.RequiresLogin,
						async function ( request, response, next ) 
						{
							await Server.WebServer.RequestProcessor( request, response, next,
								async function ( request, response, next )
								{
									log_request( request );
									// response.render( 'user', { App: App, User: request.user } );
									response.redirect( '/SystemUsers/ReadOne/' + request.user._m.id );
								}
								, true );
							return;
						} );


					//=====================================================================
					//=====================================================================
					//
					//		Application Service Routes
					//
					//=====================================================================
					//=====================================================================


					//---------------------------------------------------------------------
					function add_service_endpoints( Service, Router, ParentPath )
					{
						// Add endpoints for this service.
						let endpoint_names = Object.keys( Service.ServiceDefinition.Endpoints );
						for ( let endpoint_index = 0; endpoint_index < endpoint_names.length; endpoint_index++ )
						{
							let endpoint_name = endpoint_names[ endpoint_index ];
							let endpoint = Service.ServiceDefinition.Endpoints[ endpoint_name ];

							// This is the actual request handler that services this endpoint.
							async function request_handler( request, response, next ) 
							{
								// Get the endpoint parameters.
								let parameters = [];
								for ( let parameter_index = 0; parameter_index < endpoint.params; parameter_index++ )
								{
									let parameter_name = endpoint.params[ parameter_index ];
									let value = request.params[ parameter_name ];
									if ( typeof value === 'undefined' )
									{
										value = request.body[ parameter_name ];
									}
									if ( typeof value === 'undefined' )
									{
										value = null;
									}
									// let value = null;
									// let method = request.method.toLowerCase();
									// if ( method === 'get' )
									// {
									// 	value = request.params[ parameter_name ];
									// }
									// else if ( method === 'post' )
									// {
									// 	value = request.body[ parameter_name ];
									// }
									parameters.push( value );
								}

								// Invoke the endpoint function.
								try
								{
									let api_result = {
										ok: true,
										origin: `${Service.ServiceName}/${endpoint.name}`,
										result: await endpoint.invoke( request.user, ...parameters ),
									};
									response.send( api_result );
								}
								catch ( error )
								{
									let api_result = {
										ok: false,
										origin: `${Service.ServiceName}/${endpoint.name}`,
										error: error.message,
									};
									Server.WebServer.ReportApiError( api_result, response );
									return;
								}
								return;
							}

							// Add endpoints for each http verb.
							if ( endpoint.http_verbs.includes( 'get' ) )
							{
								Router.get( `${ParentPath}/${endpoint.name}`,
									( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
									request_handler );
							}
							if ( endpoint.http_verbs.includes( 'post' ) )
							{
								Router.post( `${ParentPath}/${endpoint.name}`,
									( endpoint.requires_login ? Server.WebServer.RequiresLogin : Server.WebServer.NotRequiresLogin ),
									request_handler );
							}

						}

						return;
					};


					//---------------------------------------------------------------------
					function add_managed_list_page( Service, FunctionRoute )
					{
						express_router.get( `${ParentPath}/${Service.ServiceName}/${FunctionRoute}`,
							( Service.ServiceDefinition.Endpoints[ FunctionRoute ].requires_login ? Server.WebServer.RequiresLogin : null ),
							async function ( request, response, next ) 
							{
								log_request( request );
								response.render(
									'managed-list',
									{
										Server: Server, User: request.user,
										ServiceDefinition: Service.ServiceDefinition,
										ObjectDefinition: Service.ObjectDefinition,
										FunctionRoute: FunctionRoute,
									} );
								return;
							} );
					}


					//---------------------------------------------------------------------
					function add_managed_object_page( Service, FunctionRoute )
					{
						express_router.get( `${ParentPath}/${Service.ServiceName}/${FunctionRoute}/:object_id`,
							( Service.ServiceDefinition.Endpoints[ FunctionRoute ].requires_login ? Server.WebServer.RequiresLogin : null ),
							async function ( request, response, next ) 
							{
								log_request( request );
								response.render(
									'managed-object',
									{
										Server: Server, User: request.user,
										ServiceDefinition: Service.ServiceDefinition,
										ObjectDefinition: Service.ObjectDefinition,
										FunctionRoute: FunctionRoute,
										ObjectID: request.params.object_id,
									} );
								return;
							} );
					}


					//---------------------------------------------------------------------
					// Add service endpoints.
					{
						let service_names = Object.keys( Server.Services );
						for ( let index = 0; index < service_names.length; index++ )
						{
							let service_name = service_names[ index ];
							let service = Server[ service_name ];

							// Add the service API
							add_service_endpoints( service, express_router, `/api/${service.ServiceDefinition.Name}` );

							// // Add the service UI
							// add_managed_list_page( service, 'ListAll' );		// /{{service_name}}/ListAll
							// add_managed_list_page( service, 'ListMine' );		// /{{service_name}}/ListMine
							// add_managed_object_page( service, 'CreateOne' );	// /{{service_name}}/CreateOne
							// add_managed_object_page( service, 'ReadOne' );		// /{{service_name}}/ReadOne
							// add_managed_object_page( service, 'WriteOne' );		// /{{service_name}}/WriteOne
							// add_managed_object_page( service, 'DeleteOne' );	// /{{service_name}}/DeleteOne
							// add_managed_list_page( service, 'DeleteMine' );		// /{{service_name}}/DeleteMine
							// add_managed_list_page( service, 'DeleteAll' );		// /{{service_name}}/DeleteAll

							// Report
							Server.Log.trace( `Added service routes for [${service_name}].` );
						}
					}

				}


				//=====================================================================
				//=====================================================================
				//
				//		Configure view engine
				//
				//=====================================================================
				//=====================================================================


				express_router.set( 'view engine', 'pug' );
				express_router.set( 'views', 'src/web/views' );

				// Web root.
				express_router.use( '/', LIB_EXPRESS.static( 'src/web/files' ) );


				//=====================================================================
				//=====================================================================
				//
				//		Start the Service
				//
				//=====================================================================
				//=====================================================================


				// Create the HTTP server.
				module.http_server = LIB_HTTP.createServer( express_router );

				// Report the server routes.
				let stack = express_router._router.stack;
				stack.forEach(
					function ( r )
					{
						if ( r.route && r.route.path )
						{
							let verbs = [];
							if ( r.route.methods.get ) { verbs.push( 'GET' ); }
							if ( r.route.methods.put ) { verbs.push( 'PUT' ); }
							if ( r.route.methods.post ) { verbs.push( 'POST' ); }
							if ( r.route.methods.del ) { verbs.push( 'DEL' ); }
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
						module.http_server.listen(
							service_port,
							service_address,
							function ( err ) 
							{
								if ( err ) { reject( err ); }
								else { resolve( true ); }
							} );
					} );
				let address = module.http_server.address();
				Server.Log.trace( `WebServer is listening at [${address.address}:${address.port}].` );

				// Return
				return { ok: true };
			};


		//---------------------------------------------------------------------
		module.StopWebServer =
			async function StopWebServer()
			{
				if ( module.http_server === null ) { return { ok: true }; }
				if ( module.http_server.listening ) 
				{
					await new Promise(
						function ( resolve, reject )
						{
							module.http_server.close(
								function ( err ) 
								{
									if ( err ) { reject( err ); }
									else { resolve( true ); }
								} );
						} );
				}
				module.http_server = null;
				Server.Log.trace( `WebServer has stopped listening.` );
				return { ok: true };
			};


		//---------------------------------------------------------------------
		return module;
	};


