'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Passport - Local
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
// const LIB_URL = require( 'url' );
// const LIB_QUERYSTRING = require( 'querystring' );
const LIB_PASSPORT = require( 'passport' );
const LIB_PASSPORT_LOCAL = require( 'passport-local' );


//---------------------------------------------------------------------
exports.Use =
	function Use( Server, WebServer, WebServerSettings )
	{

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
			let users = WebServerSettings.Express.Authentication.Passport_Local.Users;
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
			let api_result = await Server.ServerAccounts.FindOrCreateUser( user );
			if ( !api_result.ok ) { throw new Error( api_result.error ); }

			// Return the authenticated user.
			return api_result.object;
		}


		//---------------------------------------------------------------------
		async function SignupUser( username, password )
		{
			username = username.toLowerCase().trim();
			let users = WebServerSettings.Express.Authentication.Passport_Local.Users;

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
		WebServer.Express.App.use( LIB_PASSPORT.initialize() );
		WebServer.Express.App.use( LIB_PASSPORT.session() );
		WebServer.Express.App.use( LIB_PASSPORT.authenticate( 'session' ) );


		{
			let server_path = WebServer.Express.ServerPath( WebServerSettings );

			let urls = {
				home: `${server_path}`,
				login: `${server_path}${WebServerSettings.Express.Authentication.Pages.login_url}`,
				logout: `${server_path}${WebServerSettings.Express.Authentication.Pages.logout_url}`,
				signup: `${server_path}${WebServerSettings.Express.Authentication.Pages.signup_url}`,
			};

			let views = {
				home: WebServerSettings.Express.ClientSupport.Views.home_view,
				login: WebServerSettings.Express.Authentication.Pages.login_view,
				logout: WebServerSettings.Express.Authentication.Pages.logout_view,
				signup: WebServerSettings.Express.Authentication.Pages.signup_view,
			};


			//---------------------------------------------------------------------
			// Login
			WebServer.Express.App.get( urls.login,
				WebServer.Express.AuthenticationGate( false ),
				WebServer.Express.InvocationGate(
					null, null,
					async function ( request, response, next )
					{
						response.render( views.login, { Server: Server, User: request.user } );
						return;
					}
				),
			);
			WebServer.Express.App.post( urls.login,
				WebServer.Express.AuthenticationGate( false ),
				LIB_PASSPORT.authenticate( 'local', { failureRedirect: urls.login_url } ),
				async function ( request, response, next ) 
				{
					// Determine the url to redirect to after a successful login.
					let requested_url = urls.home;
					if ( request.session
						&& request.session.redirect_url_after_login ) 
					{
						requested_url = request.session.redirect_url_after_login;
					}
					if ( !requested_url ) { requested_url = '/'; }
					// Send the next url.
					response.send( requested_url );
					return;
				}
			);


			//---------------------------------------------------------------------
			// LogOut
			WebServer.Express.App.get( urls.logout,
				WebServer.Express.AuthenticationGate( true ),
				WebServer.Express.InvocationGate(
					null, null,
					async function ( request, response, next )
					{
						response.render( views.logout, { Server: Server, User: request.user } );
						return;
					}
				),
			);
			WebServer.Express.App.post( urls.logout,
				WebServer.Express.AuthenticationGate( true ),
				async function ( request, response, next )
				{
					request.logout();
					// response.redirect( Urls.home_url );
					response.send( 'OK' );
				}
			);


			//---------------------------------------------------------------------
			// SignUp
			WebServer.Express.App.get( urls.signup,
				WebServer.Express.AuthenticationGate( false ),
				WebServer.Express.InvocationGate(
					null, null,
					async function ( request, response, next )
					{
						response.render( views.signup, { Server: Server, User: request.user } );
						return;
					}
				),
			);
			WebServer.Express.App.post( urls.signup,
				WebServer.Express.AuthenticationGate( false ),
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
						let requested_url = urls.home_url;
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


		}

		//---------------------------------------------------------------------
		return;
	};


