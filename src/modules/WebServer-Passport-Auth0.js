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
		// const LIB_PASSPORT_BASIC = require( 'passport-http' );
		const LIB_PASSPORT_AUTH0 = require( 'passport-auth0' );


		//---------------------------------------------------------------------
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

		//---------------------------------------------------------------------
		// Construct the authentication strategy.
		let strategy = new LIB_PASSPORT_AUTH0(
			{
				domain: Server.Config.Settings.WebServer.auth0.domain,
				clientID: Server.Config.Settings.WebServer.auth0.client_id,
				clientSecret: Server.Config.Settings.WebServer.auth0.client_secret,
				callbackURL: Server.Config.Settings.WebServer.auth0.callback_url,
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
			} );

		//---------------------------------------------------------------------
		// Configure the router.
		LIB_PASSPORT.use( strategy );
		ExpressRouter.use( LIB_PASSPORT.initialize() );
		ExpressRouter.use( LIB_PASSPORT.session() );

		//---------------------------------------------------------------------
		ExpressRouter.get( '/login',
			LIB_PASSPORT.authenticate( 'auth0',
				{
					scope: 'openid email profile'
				} ),
			async function ( request, response ) 
			{
				response.redirect( '/' );
			} );

		//---------------------------------------------------------------------
		ExpressRouter.get( '/auth0_callback',
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
		ExpressRouter.get( '/logout',
			async function ( request, response ) 
			{
				request.logout();
				var returnTo = request.protocol + '://' + request.hostname;
				var port = request.socket.localPort;
				if ( port !== undefined && port !== 80 && port !== 443 )
				{
					returnTo += ':' + port;
				}
				var logoutURL = new LIB_URL.URL( `https://${Server.Config.Settings.WebServer.auth0.domain}/v2/logout` );
				var searchString = LIB_QUERYSTRING.stringify(
					{
						client_id: Server.Config.Settings.WebServer.auth0.client_id,
						returnTo: returnTo
					} );
				logoutURL.search = searchString;

				response.redirect( logoutURL );
			} );


		//---------------------------------------------------------------------
		return;
	};


