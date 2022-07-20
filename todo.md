
# TODO

- Server
	- Update lib-json to support hjson. Go full lib-json.
		- allow js syntax for user input

- Services
	- **COMPLETED** Rename `Endpoints` to `Origins`
	- Create an `Origins` namespace to implement functions.
	- Rename `SystemUsers` to `ServerAccounts`
	- Develop: `Authentication` service module.
		- Exports authentication pages: signup, login, logout
		- Uses the `ServerAccounts` service to perform the signup and login functions.
		- User authentication is still performed by Passport
			- Can passport be abstracted enough to support other protocols?

- Express
	- **COMPLETED** Develop `Express.AuthorizationGate` middleware to check user roles
	- **COMPLETED** Convert `WebServer.RequestProcessor` to `Express.RequestProcessor`
		- reimplement as middleware?
	- **COMPLETED** Fix: All Origin calls are being stringified.
	- **COMPLETED** Fix: Origin socket call logs do not show the result. Because we are getting the result of the middleware and not the call itself.
	- **COMPLETED** Fix: When an error occurs during an Express origin call, an eror string is returned rather than an ApiResult.

	- Session
		- Implement persistence strategies for sessions
			- filesystem
			- sqlite
			- mongodb
			- mysql

	- ClientSupport
		- Implement more view engines. (jade, ejs)

	- Explorer
		- Select user to Invoke as
		- **COMPLETED** Make 'Response' box resizable.
		- **COMPLETED** Fix: The client-api implementation uses $.ajax which drops any empty array or object parameters.
			The implication is that not all parameters are guaranteed to be transmitted to the server.
			- Use [axios](https://github.com/axios/axios)

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

