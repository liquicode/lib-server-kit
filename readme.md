# lib-server-kit
***(v0.0.3)***
<!-- ## A toolkit for developing functional node servers. -->
## A Different Kind of Web Framework

```
*** WARNING ***
This project is currently under heavy development.
Anything and everything may change at any time.
Thank you for your interest, please come again later. :)
```

Overview
---------------------------------------------------------------------

Many web frameworks require you to start with a massive amount of pre-generated and boiler-plate code. 
Server Kit takes a "Your Code First" approach and puts your application code in charge, rather than the other way around.

You want to build a web application or an api. 
You don't want to spend your time figuring out how your application idea is going to fit into someone else's code.
You want to spend your time developing your idea and configuring Server Kit to help make that happen.
All Server Kit functionality is enabled through configuration settings found in files and/or in code.


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


Main Concepts
---------------------------------------------------------------------

- ### Server Kit

`Server Kit` is a library.
You configure it, you start the server, and then mostly forget about it.
Your focus is on building application services and, optionally, client ui pages.
`Server Kit` manages the details of loading your custom application services and handling any incoming requests for them.
All you have to do is implement and describe the actual functions you want your service to have.
These functions can do anything you want: interact with databases, call external services, etc.
When implementing a service function, you will have direct access to other application services and their functions as well.

- ### Server Configuration

All functionality in a `Server Kit` server is controlled through configuration settings.
When `Server Kit` employes an external library to perform some function, you will typically have its configuration options available to you as well.
As you can imagine, there are a lot of settings and it can be a challenge to manage all of them.
`Server Kit` allows you to store configuration settings within files that can be managed separately.
You might have one set of files for your development environment and another set for production environments.
You can also supply configuration settings when creating a new server in your code.
`Server Kit` ships with sensible defaults for all settings so you only have to supply settings for what you want to change.
Most of `Server Kit` functionality works right out of the box in a way that you would expect it to.

- ### Application Services

Application functionality is described by and implemeted within a `ApplicationService` object.
Every `ApplicationService` has several parts to it: a `ServiceDefinition` object, an `ItemDefinition` object, and a `NewServiceItem()` function.
`ServiceDefinition` stores information about the functions in your service and how to call them.
`ItemDefinition` describes the type of data that this service works with.
And the `NewServiceItem()` function uses `ItemDefinition` to create a new instance of a service item for you.

- ### Storage Services

`StorageService` is a special type of `ApplicationService` that comes with a number of built-in functions used for reading and writing service items to a database.
These functions automatically apply user ownership, user roles, and sharing permissions to all data in storage.
There is no need to introduce complex user logic into your queries, its already done for you.

- ### User Authentication and Authorization

Every application user has a `user_id` (typically their email address) and a `user_role`.
There four predefined roles: `admin`, `super`, `user`, and `anon`.
Users having the `admin` or `super` roles are able to "see" all data within a `StorageService`, not just their own data.
A `user` can only work with data that they created (they own it) and data that has been shared to them.

Each `Origin` and `Page` defined by a service can specify which roles are allowed to call these functions.

Note: There is always a valid `User` object available to your server and client side code.
If an application user is not logged in (or authnetication is not enabled) then a special anonymous account is used.
This anonymous account has `user_role = 'anon'`.

- ### Service Origins and Pages

An `ApplicationService` implements application functionality and exposes it as a function called an `Origin`.
An `Origin` combines a function implementation with all of the information needed to call that function.
It contains schema information for each of the function parameters, the user roles which are allowed to call the function, as well as other descriptive information.
There are no restrictions to your code within an `Origin`, it can do whatever it needs to fulfill its task.
Each `Origin` function always takes a `User` object as its first paramter, which always tells you who is logged in.

`Pages` are a type of `Origin` with a few differences.
A `Page` creates a web page and serves it rather than calling a function like an `Origin` does.
A `Page` can also accept parameters that are passed on to view engine (e.g. pug), but does not return a value.
The last difference is that a `Page` will only respond to an http `get` request.
A service `Origin` can respond to any type of http request (get, put, post, delete) and to web-socket calls.

- ### Server Transports

One of the main goals of `Server Kit` is to make it easy to write application code and have it be usable by remote clients.
`Server Kit` uses two transports to achieve this: http requests and web-socket calls.
When defining an `Origin` for your service, you can specify which transports your function will be available on.
Note that a service `Page` will always use only the http transport.

`Server Kit` uses http cookies to perform user authentication and session management.
If you want to have these features, then the http transport must be enabled.
Session data is shared between the http and web-socket transports such that, once a user is authenticated via http
that user will be authorized to make subsequent http calls as well as web-socket calls.

- ### Client Side Support

Making it easy to develop the server side of your application isn't the only thing that `Server Kit` can do for you.
During startup, a server can also generate client side files containing functions analogous to service functions.
Making server calls is as easy as calling a typical function.
A client api file can be generated for each of the available transports.

- ### Kinda Swaggerish

If you are familiar with the [Swagger](https://swagger.io/) tools, you might see some similarities when defining item and function parameter schemas.
A design decision was made to not go [Full Swagger](https://swagger.io/specification/) by requiring very strict and detailed schema for all functions and data.
`Server Kit` offers a comparable, yet more relaxed, approach and even provides a similar UI to explore and test services as [Swagger UI](https://swagger.io/tools/swagger-ui/) does.
However, if you do ultimately want to fully incorporate Swagger into your application, `Server Kit` can generate a starter file
for you, containing definitions from all of your services.


Features Overview
---------------------------------------------------------------------

Server Functionality
- Start and stop the entire server process with function calls
- Control server initialization flow via callbacks
- Load and initialize ExpressJS
- Loading and initialize ExpressJS middleware
- Connect Http endpoints to your application's functions (get, put, post, delete)
- Connect SocketIO events to your application's functions
- Authentication integration with PassportJS
- User Authorization on a per-function basis
- Support for peristent sessions (memory, file, database)
- Support for different view engines (pug, jade, ejs)
- Access to user info and application variables within view templates
- ... every aspect is controlled by configuration settings
- ... all with copious and verbose logging (also configurable)

Application Development
- Predefined user roles `admin`, `super`, `public`, and `anon`
- A `StorageService` base class to handle the CRUD for user data
	- Every data item is owned by a user so its like each user has their own database
	- Users can share data items they own with other users
	- Use MongoDB-like query criteria to access and manipulate data
	- Multiple storage providers available for memory, file, and MongoDB storage
- Flexible and hierarchical configuration system
	- Store your configuration settings in files and/or code
	- All configuration settings have sensible defaults, change only what you need
- Develop a `Service` to expose functions to your client
	- Service functions are callable via http calls
	- Service functions are callable via web-socket calls
	- Function definitions and paramters are fully configurable
	- Web pages look like functions that can be rendered with parameters sent from the client
- 100% client framewaork agnostic; you build your web pages however you want
- Automatic generation of client API files for Http and Socket calls
- Starter samples for each supported view engine
	- Login and Signup pages
	- Generic List and Item pages to perform all CRUD for a `StorageService`
	- An API Explorer to inspect and test all of your service functions


Project Links
---------------------------------------------------------------------

- [Library Source Code](https://github.com/liquicode/lib-server-kit)
- [Library Docs Site](http://lib-server-kit.liquicode.com)
- [Library NPM Page](https://www.npmjs.com/package/@liquicode/lib-server-kit)


Dependencies
---------------------------------------------------------------------


Notices
---------------------------------------------------------------------

- This project is currently under heavy development.
	Anything and everything may change at any time.


