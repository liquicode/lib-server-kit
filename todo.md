
# TODO

- Authentication Service
	- Exports authentication pages: signup, login, logout
	- Uses the SystemUsers service to perform the signup and login functions.

- Persistent Sessions
	- implement persistence strategies for sessions.
		- filesystem
		- sqlite
		- mongodb
		- mysql

- Add Module: `Express.ClientSupport.Swagger`
	- [https://swagger.io/](https://swagger.io/)
	- [https://blog.logrocket.com/documenting-your-express-api-with-swagger/](https://blog.logrocket.com/documenting-your-express-api-with-swagger/)

- Socket Security: Is there anything that can help secure socket.io communication?
	- [https://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io](https://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io)
	- [https://github.com/oskosk/express-socket.io-session](https://github.com/oskosk/express-socket.io-session)
	- [https://github.com/peerigon/socket.io-session-middleware](https://github.com/peerigon/socket.io-session-middleware)

- Update lib-json to support hjson. Go full lib-json.
