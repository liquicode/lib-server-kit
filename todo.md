
# TODO

- Server
	- Update lib-json to support hjson. Go full lib-json
		- allow js-style syntax for user input
	- Rename: `ModuleBase` to `ServerModule`
	- Rename: `ServiceBase` to `ApplicationService`
	- Add: `AmqpTransport`

- Services
	- **COMPLETED** Rename `Endpoints` to `Origins`
	- Create an `Origins` namespace to implement functions
	- **COMPLETED** Rename `SystemUsers` to `ServerAccounts`
	- Develop: `Authentication` application service
		- Exports authentication pages: signup, login, logout
		- Uses the `ServerAccounts` service to perform the signup and login functions
		- User authentication is still performed by Passport
			- Can passport be abstracted enough to support other protocols?
	- Reconcile: `Service.ItemDefinition.Fields` is a map, yet `Origin.parameters` and `Page.parameters` are arrays
	- Develop: `ApiExplorer` service. Add Explorer page.
	- Add `default` field to `ItemDefinition` and to origin parameters.
		- Function `Server.VerifyFields` will apply defaults to missing fields.

- WebServer
	- **COMPLETED** Move `AnonymousUser` to the top, underneath `WebServer`
	- **COMPLETED** Convert all configuration/initialization bits into functions that can be called in any order

- Express
	- **COMPLETED** Develop `Express.AuthorizationGate` middleware to check user roles
	- **COMPLETED** Convert `WebServer.RequestProcessor` to `Express.InvocationGate`
	- **COMPLETED** Fix: All Origin calls are being stringified
	- **COMPLETED** Fix: Origin socket call logs do not show the result. Because we are getting the result of the middleware and not the call itself
	- **COMPLETED** Fix: When an error occurs during an Express origin call, an eror string is returned rather than an ApiResult
	- Come up with a way for admin users and super users to impersonate another user

	- Session
		- Implement persistence strategies for sessions
			- **COMPLETED** [memorystore](https://www.npmjs.com/package/memorystore)
			- **COMPLETED** [session-file-store](https://www.npmjs.com/package/session-file-store)
			- [better-sqlite3-session-store](https://www.npmjs.com/package/better-sqlite3-session-store)
			- [connect-mongo](https://www.npmjs.com/package/connect-mongo)
			- [connect-session-sequelize](https://www.npmjs.com/package/connect-session-sequelize)

	- ClientSupport
		- Implement more view engines. (jade, ejs)

	- Explorer
		- Select user to Invoke As
		- **COMPLETED** Make 'Response' box resizable
		- **COMPLETED** Fix: The client-api implementation uses $.ajax which drops any empty array or object parameters

	- Remove: Swagger *** Remove It! ***
		- authorization
		- parameter data types
		- service item definitions
		- Add Module: `Express.ClientSupport.Swagger`
			- [https://swagger.io/](https://swagger.io/)
			- [https://blog.logrocket.com/documenting-your-express-api-with-swagger/](https://blog.logrocket.com/documenting-your-express-api-with-swagger/)

- SocketIO
	- **COMPLETED** Develop middlewares
	- **COMPLETED** Socket Security: Is there anything that can help secure socket.io communication?
		- [https://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io](https://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io)
		- [https://github.com/oskosk/express-socket.io-session](https://github.com/oskosk/express-socket.io-session)
		- [https://github.com/peerigon/socket.io-session-middleware](https://github.com/peerigon/socket.io-session-middleware)
			- Only works with socket.io v1.0

