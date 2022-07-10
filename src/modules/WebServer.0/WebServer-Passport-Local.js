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
		async function AuthenticateUser( username, password )
		{
			username = username.toLowerCase().trim();

			// Authenticate the user.
			let authenticated = false;
			let users = WebServerSettings.Passport.Local.Users;
			for ( let user_index = 0; user_index < users.length; user_index++ )
			{
				if ( username === users[ user_index ].user_id.toLowerCase().trim() )
				{
					if ( password === users[ user_index ].password )
					{
						authenticated = true;
					}
					break;
				}
			}
			if ( !authenticated ) { return null; }

			// Find or create this user in the system.
			let user = {
				user_id: username,
				user_name: username,
				user_role: 'user',
			};
			let api_result = await Server.SystemUsers.FindOrCreateUser( user );
			if ( !api_result.ok ) { throw new Error( api_result.error ); }

			// Return the authenticated user.
			return api_result.object;
		}


		//---------------------------------------------------------------------
		async function SignupUser( username, password )
		{
			username = username.toLowerCase().trim();
			let users = WebServerSettings.Passport.Local.Users;

			// Check if user already exists.
			for ( let user_index = 0; user_index < users.length; user_index++ )
			{
				if ( username === users[ user_index ].user_id.toLowerCase().trim() )
				{
					throw new Error( `The user [${username}] already exists.` );
				}
			}

			// Add the user.
			users.push( {
				user_id: username,
				password: password,
			} );

			// Authenticate the user.
			let user = await AuthenticateUser( username, password );
			return user;
		}


		//---------------------------------------------------------------------
		/* Configure password authentication strategy.
		 *
		 * The `LocalStrategy` authenticates users by verifying a user_id and password.
		 * The strategy parses the user_id and password from the request and calls the
		 * `verify` function.
		 *
		 * The `verify` function does a simple lookup to authenticate the credentials.
		 */
		let strategy = new LIB_PASSPORT_LOCAL(
			async function ( username, password, done )
			{
				try
				{
					let user = await AuthenticateUser( username, password );
					if ( !user ) { return done( null, false, { message: 'Incorrect username or password.' } ); }
					return done( null, user );
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
								{ Server: Server, User: request.user } );
							return;
						}
						, true );
				}
			);
			ExpressRouter.post( Urls.signup_url,
				Server.WebServer.NotRequiresLogin,
				async function ( request, response, next )
				{
					try
					{
						// Signup the user.
						let username = request.body.username;
						let password = request.body.password;
						let user = await SignupUser( username, password );
						if ( user === false ) { throw new Error( `Unable to authenticate [${username}].` ); }
						Server.Log.debug( `Signed up a new user: ${JSON.stringify( user )}` );

						request.session.passport = {};
						request.session.passport.user = user;

						// Determine the url to redirect to after a successful signup.
						let requested_url = Urls.home_url;
						if ( request.session.returnTo ) { requested_url = request.session.returnTo; }
						if ( !requested_url ) { requested_url = '/'; }

						// Send the next url.
						response.send( requested_url );
						return;
					}
					catch ( error )
					{
						Server.Log.error( `Error during signup: ${error.message}` );
						return next( error );
						// response.send( error );
					}
				},
				// LIB_PASSPORT.authenticate( 'local', { failureRedirect: Urls.signup_url } ),
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
								{ Server: Server, User: request.user } );
							return;
						}
						, true );
				}
			);
			ExpressRouter.post( Urls.login_url,
				Server.WebServer.NotRequiresLogin,
				LIB_PASSPORT.authenticate( 'local', { failureRedirect: Urls.login_url } ),
				async function ( request, response, next ) 
				{
					// Determine the url to redirect to after a successful login.
					let requested_url = Urls.home_url;
					if ( request.session.returnTo ) { requested_url = request.session.returnTo; }
					if ( !requested_url ) { requested_url = '/'; }
					// Send the next url.
					response.send( requested_url );
					return;
				}
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
								{ Server: Server, User: request.user } );
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


