'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Passport - Auth0
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const LIB_URL = require( 'url' );
const LIB_QUERYSTRING = require( 'querystring' );
const LIB_PASSPORT = require( 'passport' );
const LIB_PASSPORT_AUTH0 = require( 'passport-auth0' );


//---------------------------------------------------------------------
exports.Use =
	function Use( Server, WebServer, WebServerSettings )
	{

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
		// Construct the authentication strategy.
		let strategy = new LIB_PASSPORT_AUTH0(
			{
				domain: WebServerSettings.Passport.Auth0.domain,
				clientID: WebServerSettings.Passport.Auth0.client_id,
				clientSecret: WebServerSettings.Passport.Auth0.client_secret,
				callbackURL: WebServerSettings.Passport.Auth0.callback_url,
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
					let user = Server.ServerAccounts.NewServiceItem();
					user.user_id = profile.emails[ 0 ].value.toLowerCase().trim();
					user.user_name = profile.displayName;
					user.user_role = 'user';
					user.image_url = profile.picture;
					let api_result = await Server.ServerAccounts.FindOrCreateUser( user );
					if ( api_result.error ) { throw new Error( api_result.error ); }
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
		WebServer.Express.App.use( LIB_PASSPORT.initialize() );
		WebServer.Express.App.use( LIB_PASSPORT.session() );
		WebServer.Express.App.use( LIB_PASSPORT.authenticate( 'session' ) );


		{
			let server_path = WebServer.ExpressServerPath( WebServerSettings );

			let urls = {
				home: `${server_path}`,
				login: `${server_path}${WebServerSettings.Express.Authentication.Pages.login_url}`,
				logout: `${server_path}${WebServerSettings.Express.Authentication.Pages.logout_url}`,
				signup: `${server_path}${WebServerSettings.Express.Authentication.Pages.signup_url}`,
			};

			//---------------------------------------------------------------------
			WebServer.Express.App.get( '/auth0_callback',
				async function ( request, response, next )
				{
					LIB_PASSPORT.authenticate( 'auth0',
						function ( error, user, info )
						{
							if ( error ) { return next( error ); }
							if ( !user ) { return response.redirect( urls.login ); }
							request.logIn( user,
								function ( error )
								{
									if ( error ) { return next( error ); }
									const returnTo = request.session.returnTo;
									delete request.session.returnTo;
									response.redirect( returnTo || urls.home );
								} );
						} )( request, response, next );
				} );


			//---------------------------------------------------------------------
			WebServer.Express.App.get( urls.signup,
				WebServer.Express.AuthenticationGate( false ),
				async function ( request, response, next )
				{
					// response.redirect( Urls.home_url );
					response.send( 'Not implemented.' );
				}
			);


			//---------------------------------------------------------------------
			WebServer.Express.App.get( urls.login,
				WebServer.Express.AuthenticationGate( false ),
				LIB_PASSPORT.authenticate( 'auth0',
					{
						scope: 'openid email profile'
					} ),
				async function ( request, response ) 
				{
					response.redirect( urls.home );
				}
			);


			//---------------------------------------------------------------------
			WebServer.Express.App.get( urls.logout,
				WebServer.Express.AuthenticationGate( true ),
				async function ( request, response, next )
				{
					function get_server_address( request )
					{
						let url = request.protocol + '://' + request.hostname;
						let port = request.socket.localPort;
						if ( port !== undefined && port !== 80 && port !== 443 )
						{
							url += ':' + port;
						}
						return url;
					}

					request.logout();
					let url = new LIB_URL.URL( `https://${WebServerSettings.Express.Authentication.Passport_Auth0.Settings.domain}/v2/logout` );
					url.search = LIB_QUERYSTRING.stringify(
						{
							client_id: WebServerSettings.Express.Authentication.Passport_Auth0.Settings.client_id,
							returnTo: get_server_address( request ) + urls.home,
						} );
					response.redirect( url );

				}
			);

		}


		//---------------------------------------------------------------------
		return;
	};


