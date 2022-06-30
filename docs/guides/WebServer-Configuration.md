# 	 WebServer Configuration

The `Webserver` module starts up and opens a network listen port when `WebServer.StartWebServer()` is called.


Default Configuration
---------------------------------------------------------------------

The default configuration looks like the following and, if used, will cause the `WebServer` to run with no user authentication.
All service calls will be made with an internal anonymouse user account having the `public` role.
Any attempt to `post` to the `login`, `logout`, or `signup` urls will result in a "404 Not Found" message.

```javascript
WebServer = {
	// Listen
	address: 'localhost',
	port: 80,
	// Session
	session_enabled: false,
	session_key: 'CHANGE THIS TO A RANDOM SECRET',
	// Authentication urls
	home_url: '/home',
	login_url: '/login',
	logout_url: '/logout',
	signup_url: '/signup',
	// Authentication: simple email and password
	passport_local: {
		enabled: false,
		users: [ /* { user_email: 'admin@internal', password: 'password' }, */ ],
	},
	// Authentication: Auth0
	passport_auth0: {
		enabled: false,
		domain: 'auth0-domain',
		client_id: 'auth0-client-id',
		client_secret: 'auth0-client-secret',
		callback_url: 'auth0-callback-url',
	},
	// Temp folder for file uploads.
	temp_path: '~temp',
};
```

