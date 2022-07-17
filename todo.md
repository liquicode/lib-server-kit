
# TODO

- Server
	- Update lib-json to support hjson. Go full lib-json.

- Services
	- Rename `Endpoints` to `Functions`
	- Create a `Functions` namespace for function implementations.
	- Rename `SystemUsers` to `ServerAccounts`
	- Develop: `Authentication` Service
		- Exports authentication pages: signup, login, logout
		- Uses the `SystemAccounts` service to perform the signup and login functions.
		- User authentication is still performed by Passport

- Express
	- Develop `Express.AuthorizationGate` middleware to check user roles
	- Convert `WebServer.RequestProcessor` to `Express.RequestProcessor`
		- reimplement as middleware?

	- Session
		- Implement persistence strategies for sessions
			- filesystem
			- sqlite
			- mongodb
			- mysql

	- Explorer
		- Select user to Invoke as

	- Swagger *** Remove It! ***
		- authorization
		- parameter data types
		- service item definitions
		- Add Module: `Express.ClientSupport.Swagger`
			- [https://swagger.io/](https://swagger.io/)
			- [https://blog.logrocket.com/documenting-your-express-api-with-swagger/](https://blog.logrocket.com/documenting-your-express-api-with-swagger/)

- SocketIO
	- Socket Security: Is there anything that can help secure socket.io communication?
		- [https://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io](https://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io)
		- [https://github.com/oskosk/express-socket.io-session](https://github.com/oskosk/express-socket.io-session)
		- [https://github.com/peerigon/socket.io-session-middleware](https://github.com/peerigon/socket.io-session-middleware)

