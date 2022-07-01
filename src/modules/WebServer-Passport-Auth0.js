'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Passport - Auth0
//
//=====================================================================
//=====================================================================


exports.Use =
	function Use( Server, ExpressRouter )
	{
		const LIB_URL = require( 'url' );
		const LIB_QUERYSTRING = require( 'querystring' );
		const LIB_PASSPORT = require( 'passport' );
		const LIB_PASSPORT_AUTH0 = require( 'passport-auth0' );

		const WebServerSettings = Server.Config.Settings.WebServer;

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
				domain: WebServerSettings.passport_auth0.domain,
				clientID: WebServerSettings.passport_auth0.client_id,
				clientSecret: WebServerSettings.passport_auth0.client_secret,
				callbackURL: WebServerSettings.passport_auth0.callback_url,
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
					user.user_name = profile.displayName;
					user.user_role = 'user';
					user.image_url = profile.picture;
					let api_result = await Server.SystemUsers.FindOrCreateUser( user );
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
		ExpressRouter.use( LIB_PASSPORT.initialize() );
		ExpressRouter.use( LIB_PASSPORT.session() );
		ExpressRouter.use( LIB_PASSPORT.authenticate( 'session' ) );


		{
			let ParentPath = '/';
			let Urls = {
				home_url: `${ParentPath}${WebServerSettings.home_url}`,
				signup_url: `${ParentPath}${WebServerSettings.signup_url}`,
				login_url: `${ParentPath}${WebServerSettings.login_url}`,
				logout_url: `${ParentPath}${WebServerSettings.logout_url}`,
			};


			//---------------------------------------------------------------------
			ExpressRouter.get( '/auth0_callback',
				async function ( request, response, next )
				{
					LIB_PASSPORT.authenticate( 'auth0',
						function ( error, user, info )
						{
							if ( error ) { return next( error ); }
							if ( !user ) { return response.redirect( Urls.login_url ); }
							request.logIn( user,
								function ( error )
								{
									if ( error ) { return next( error ); }
									const returnTo = request.session.returnTo;
									delete request.session.returnTo;
									response.redirect( returnTo || Urls.home_url );
								} );
						} )( request, response, next );
				} );


			//---------------------------------------------------------------------
			ExpressRouter.get( Urls.signup_url,
				Server.WebServer.NotRequiresLogin,
				async function ( request, response, next )
				{
					// response.redirect( Urls.home_url );
					response.send( 'Not implemented.' );
				}
			);


			//---------------------------------------------------------------------
			ExpressRouter.get( Urls.login_url,
				Server.WebServer.NotRequiresLogin,
				LIB_PASSPORT.authenticate( 'auth0',
					{
						scope: 'openid email profile'
					} ),
				async function ( request, response ) 
				{
					response.redirect( Urls.home_url );
				}
			);


			//---------------------------------------------------------------------
			ExpressRouter.get( Urls.logout_url,
				Server.WebServer.RequiresLogin,
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
					let url = new LIB_URL.URL( `https://${WebServerSettings.passport_auth0.domain}/v2/logout` );
					url.search = LIB_QUERYSTRING.stringify(
						{
							client_id: WebServerSettings.passport_auth0.client_id,
							returnTo: get_server_address( request ) + Urls.home_url,
						} );
					response.redirect( url );

				}
			);

		}


		//---------------------------------------------------------------------
		return;
	};


