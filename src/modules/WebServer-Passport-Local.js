'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Passport - Local
//
//=====================================================================
//=====================================================================


exports.Use =
	function Use( Server, ExpressRouter )
	{
		// const LIB_URL = require( 'url' );
		// const LIB_QUERYSTRING = require( 'querystring' );
		const LIB_PASSPORT = require( 'passport' );
		const LIB_PASSPORT_LOCAL = require( 'passport-local' );

		const WebServerSettings = Server.Config.Settings.WebServer;

		//---------------------------------------------------------------------
		/* Configure session management.
		 *
		 * When a login session is established, information about the user will be
		 * stored in the session.  This information is supplied by the `serializeUser`
		 * function, which is yielding the user ID and username.
		 *
		 * As the user interacts with the app, subsequent requests will be authenticated
		 * by verifying the session.  The same user information that was serialized at
		 * session establishment will be restored when the session is authenticated by
		 * the `deserializeUser` function.
		 */


		//---------------------------------------------------------------------
		LIB_PASSPORT.serializeUser(
			function ( user, done )
			{
				process.nextTick(
					function ()
					{
						return done( null, user );
					} );
			} );


		//---------------------------------------------------------------------
		LIB_PASSPORT.deserializeUser(
			function ( user, done )
			{
				process.nextTick(
					function ()
					{
						return done( null, user );
					} );
			} );


		//---------------------------------------------------------------------
		/* Configure password authentication strategy.
		 *
		 * The `LocalStrategy` authenticates users by verifying a user_email and password.
		 * The strategy parses the user_email and password from the request and calls the
		 * `verify` function.
		 *
		 * The `verify` function does a simple lookup to authenticate the credentials.
		 */
		let strategy = new LIB_PASSPORT_LOCAL(
			async function ( username, password, done )
			{
				try
				{
					username = username.toLowerCase().trim();

					// Authenticate the user.
					let authenticated = false;
					let users = WebServerSettings.Passport.Local.users;
					for ( let user_index = 0; user_index < users.length; user_index++ )
					{
						if ( username === users[ user_index ].user_email.toLowerCase().trim() )
						{
							if ( password === users[ user_index ].password )
							{
								authenticated = true;
							}
							break;
						}
					}

					// if ( !authenticated ) { throw new Error( `Unable to authenticate the provided credentials.` ); }
					if ( !authenticated ) { return done( null, false, { message: 'Incorrect username or password.' } ); }

					// Find or create this user in the system.
					let user = Server.SystemUsers.NewServiceObject();
					user.user_id = username;
					user.user_name = username;
					user.user_role = 'user';
					user.image_url = '';
					let api_result = await Server.SystemUsers.FindOrCreateUser( user );
					if ( !api_result.ok ) { throw new Error( api_result.error ); }
					return done( null, api_result.object );
				}
				catch ( error )
				{
					return done( error, null );
				}
			} );


		//---------------------------------------------------------------------
		// Configure the router.
		LIB_PASSPORT.use( strategy );
		ExpressRouter.use( LIB_PASSPORT.initialize() );
		ExpressRouter.use( LIB_PASSPORT.session() );
		ExpressRouter.use( LIB_PASSPORT.authenticate( 'session' ) );


		{
			let Urls = {
				home_url: `/${WebServerSettings.Urls.home_url}`,
				signup_url: `/${WebServerSettings.Urls.signup_url}`,
				login_url: `/${WebServerSettings.Urls.login_url}`,
				logout_url: `/${WebServerSettings.Urls.logout_url}`,
			};

			
			//---------------------------------------------------------------------
			// SignUp
			ExpressRouter.get( Urls.signup_url,
				Server.WebServer.NotRequiresLogin,
				async function ( request, response, next )
				{
					await Server.WebServer.RequestProcessor( request, response, next,
						async function ( request, response, next )
						{
							response.render(
								WebServerSettings.Urls.signup_url,
								{ App: Server, User: request.user } );
							return;
						}
						, true );
				}
			);
			ExpressRouter.post( Urls.signup_url,
				Server.WebServer.NotRequiresLogin,
				async function ( request, response, next )
				{
					// response.redirect( Urls.home_url );
					response.send( 'Not implemented.' );
				}
			);


			//---------------------------------------------------------------------
			// Login
			ExpressRouter.get( Urls.login_url,
				Server.WebServer.NotRequiresLogin,
				async function ( request, response, next ) 
				{
					await Server.WebServer.RequestProcessor( request, response, next,
						async function ( request, response, next )
						{
							response.render(
								WebServerSettings.Urls.login_url,
								{ App: Server, User: request.user } );
							return;
						}
						, true );
				}
			);
			ExpressRouter.post( Urls.login_url,
				Server.WebServer.NotRequiresLogin,
				LIB_PASSPORT.authenticate( 'local',
					{
						// If this setting is not provided then the client receives a 'Not Found' message.
						successReturnToOrRedirect: Urls.home_url,
						// failureRedirect: Urls.login_url,
						// failureMessage: true
					} )
			);


			//---------------------------------------------------------------------
			// LogOut
			ExpressRouter.get( Urls.logout_url,
				Server.WebServer.NotRequiresLogin,
				async function ( request, response, next ) 
				{
					await Server.WebServer.RequestProcessor( request, response, next,
						async function ( request, response, next )
						{
							response.render(
								WebServerSettings.Urls.logout_url,
								{ App: Server, User: request.user } );
							return;
						}
						, true );
				}
			);
			ExpressRouter.post( Urls.logout_url,
				Server.WebServer.RequiresLogin,
				async function ( request, response, next )
				{
					request.logout();
					// response.redirect( Urls.home_url );
					response.send( 'OK' );
				}
			);

		}

		//---------------------------------------------------------------------
		return;
	};


