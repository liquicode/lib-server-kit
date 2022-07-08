# lib-server-kit
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
- Control initialization flow via callbacks.


TODO
---------------------------------------------------------------------

- Service Pages
	- Define pages within services that are exposed as http endpoints.
	- Reimplement the auth pages from `StartWebServer` as service pages.

- Persistent Sessions
	- implement one or more persistence strategies (e.g. files, sqlite, etc.) for sessions.

- Socket Security: Is there anything that can help secure socket.io communication?

- What to do about `_http-api-client.js`?

- Switch configuration management to [merge-config](https://www.npmjs.com/package/merge-config)?
	- Supports yaml as well as json and hjson.
	- hjson allows relaxed syntax and comments in json source.
