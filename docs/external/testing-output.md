# Testing Output


```


  001) Core Framework Tests
| 05:30:27 | 0457 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:30:27 | 0457 | T | Initialized module [Config].
| 05:30:27 | 0457 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:30:27 | 0457 | T | Runtime environment set to: development
| 05:30:27 | 0458 | T | Initialized module [Log].
| 05:30:27 | 0458 | T | Initialized module [WebServer].
| 05:30:27 | 0458 | T | Initialized service [SystemUsers].
| 05:30:27 | 0458 | T | Initialized service [Maths].
    ✔ should load configuration
| 05:30:27 | 0459 | I | Hello World from MathsServer
    ✔ should be able to log a message

  010) StorageService Tests
| 05:30:27 | 0462 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:30:27 | 0462 | T | Initialized module [Config].
| 05:30:27 | 0462 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:30:27 | 0462 | T | Runtime environment set to: development
| 05:30:27 | 0463 | T | Initialized module [Log].
| 05:30:27 | 0464 | T | Initialized module [WebServer].
| 05:30:27 | 0464 | T | Initialized service [SystemUsers].
| 05:30:27 | 0464 | T | Initialized service [Maths].
    ✔ should initialize storage
    ✔ should create an empty object
    ✔ should create and delete an object

  020) WebServer Tests
| 05:30:27 | 0467 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:30:27 | 0467 | T | Initialized module [Config].
| 05:30:27 | 0467 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:30:27 | 0467 | T | Runtime environment set to: development
| 05:30:27 | 0468 | T | Initialized module [Log].
| 05:30:27 | 0468 | T | Initialized module [WebServer].
| 05:30:27 | 0468 | T | Initialized service [SystemUsers].
| 05:30:27 | 0468 | T | Initialized service [Maths].
| 05:30:27 | 0469 | T | WebServer - initialized Cors
| 05:30:27 | 0469 | T | WebServer - initialized JsonBodyParser
| 05:30:27 | 0470 | T | WebServer - initialized UrlEncodedParser
| 05:30:27 | 0470 | T | WebServer - initialized FileUpload
| 05:30:27 | 0470 | T | WebServer - initialized Session handler
| 05:30:27 | 0475 | T | WebServer - initialized Passport with Local
| 05:30:27 | 0475 | T | WebServer - initialized Static Folder [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files]
| 05:30:27 | 0475 | T | WebServer - initialized Pug Views [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/views]
| 05:30:27 | 0477 | T | WebServer - generated Http Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_http-api-client.js]
| 05:30:27 | 0478 | T | Added 14 http routes for [/api/SystemUsers] functions.
| 05:30:27 | 0478 | T | Added 3 http routes for [/ui/SystemUsers] pages.
| 05:30:27 | 0478 | T | Added 8 http routes for [/api/Maths] functions.
| 05:30:27 | 0478 | T | Added 0 http routes for [/ui/Maths] pages.
| 05:30:27 | 0479 | T | WebServer - initialized Socket Server
| 05:30:27 | 0480 | T | WebServer - generated Socket Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_socket-api-client.js]
| 05:30:27 | 0480 | T | WebServer - server initialization complete.
| 05:30:27 | 0482 | T | WebServer is listening at [127.0.0.1:4200].
| 05:30:27 | 0482 | T | SocketServer has attached to the WebServer.
    ✔ should start the web server
| 05:30:27 | 0483 | T | WebServer has stopped.
| 05:30:27 | 0483 | T | SocketServer has stopped.
    ✔ should stop the web server

  021) Maths WebService Tests
| 05:30:27 | 0484 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:30:27 | 0484 | T | Initialized module [Config].
| 05:30:27 | 0484 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:30:27 | 0484 | T | Runtime environment set to: development
| 05:30:27 | 0484 | T | Initialized module [Log].
| 05:30:27 | 0484 | T | Initialized module [WebServer].
| 05:30:27 | 0484 | T | Initialized service [SystemUsers].
| 05:30:27 | 0484 | T | Initialized service [Maths].
| 05:30:27 | 0485 | T | WebServer - initialized Cors
| 05:30:27 | 0485 | T | WebServer - initialized JsonBodyParser
| 05:30:27 | 0485 | T | WebServer - initialized UrlEncodedParser
| 05:30:27 | 0485 | T | WebServer - initialized FileUpload
| 05:30:27 | 0485 | T | WebServer - initialized Session handler
| 05:30:27 | 0485 | T | WebServer - initialized Passport with Local
| 05:30:27 | 0485 | T | WebServer - initialized Static Folder [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files]
| 05:30:27 | 0485 | T | WebServer - initialized Pug Views [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/views]
| 05:30:27 | 0486 | T | WebServer - generated Http Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_http-api-client.js]
| 05:30:27 | 0486 | T | Added 14 http routes for [/api/SystemUsers] functions.
| 05:30:27 | 0487 | T | Added 3 http routes for [/ui/SystemUsers] pages.
| 05:30:27 | 0487 | T | Added 8 http routes for [/api/Maths] functions.
| 05:30:27 | 0487 | T | Added 0 http routes for [/ui/Maths] pages.
| 05:30:27 | 0487 | T | WebServer - initialized Socket Server
| 05:30:27 | 0487 | T | WebServer - generated Socket Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_socket-api-client.js]
| 05:30:27 | 0487 | T | WebServer - server initialization complete.
| 05:30:27 | 0488 | T | WebServer is listening at [127.0.0.1:4200].
| 05:30:27 | 0488 | T | SocketServer has attached to the WebServer.
    ✔ should add two numbers
    ✔ should subtract two numbers
    ✔ should multiply two numbers
    ✔ should divide two numbers
| 05:30:27 | 0507 | T | WebServer has stopped.
| 05:30:27 | 0507 | T | SocketServer has stopped.


  11 passing (165ms)


```


