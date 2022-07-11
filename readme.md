# lib-server-kit
***(v0.0.3)***
## A toolkit for developing functional node servers.

```
*** WARNING ***
This project is currently under heavy development.
Anything and everything may change at any time.
Thank you for your interest, please come again later. :)
```


Features
---------------------------------------------------------------------

- Verbose activity logs.
- Implement new storage based service with configuration settings.
- Implement more complex services by adding code.
- Use MongoDB-like query criteria to access and manipulate storages.
- Has storage providers for MongoDB as well as in memory json arrays.
- Flexible hierarchical configuration system.
- All service functions are callable via http get and post calls.
- All service functions are callable via web-socket calls.
- All service functions are callable via command line.
- A unified user interface (pages and code) is available for all storage services.
- Control server initialization flow via callbacks.


Getting Started
---------------------------------------------------------------------

Install via NPM:
```bash
npm install @liquicode/lib-server-kit
```

```javascript
// Include the library in your source code
const LIB_SERVER_KIT = require( '@liquicode/lib-server-kit' );

// Create a new server
let server = LIB_SERVER_KIT.NewServer( 'FirstServer', __dirname );

// Initialize the server
server.Initialize();
// Services are loaded and now ready for use.

// Start the web server
await server.WebServer.StartWebServer();
// Services can now be called on configured transports (e.g. Express, socket.io).

// Stop the web server
await server.WebServer.StopWebServer();
```


Project Links
---------------------------------------------------------------------

- [Library Source Code](https://github.com/liquicode/lib-server-kit)
- [Library Docs Site](http://lib-server-kit.liquicode.com)
- [Library NPM Page](https://www.npmjs.com/package/@liquicode/lib-server-kit)

