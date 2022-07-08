# Testing Output


```


  001) Core Framework Tests
| 05:31:11 | 0750 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:31:11 | 0751 | T | Initialized module [Config].
| 05:31:11 | 0751 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:31:11 | 0751 | T | Runtime environment set to: development
| 05:31:11 | 0751 | T | Initialized module [Log].
| 05:31:11 | 0751 | T | Initialized module [WebServer].
| 05:31:11 | 0751 | T | Initialized service [SystemUsers].
| 05:31:11 | 0752 | T | Initialized service [Maths].
    ✔ should load configuration
| 05:31:11 | 0753 | I | Hello World from MathsServer
    ✔ should be able to log a message

  010) StorageService Tests
| 05:31:11 | 0754 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:31:11 | 0754 | T | Initialized module [Config].
| 05:31:11 | 0754 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:31:11 | 0754 | T | Runtime environment set to: development
| 05:31:11 | 0754 | T | Initialized module [Log].
| 05:31:11 | 0754 | T | Initialized module [WebServer].
| 05:31:11 | 0754 | T | Initialized service [SystemUsers].
| 05:31:11 | 0754 | T | Initialized service [Maths].
    ✔ should initialize storage
    ✔ should create an empty object
    ✔ should create and delete an object

  020) WebServer Tests
| 05:31:11 | 0758 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:31:11 | 0758 | T | Initialized module [Config].
| 05:31:11 | 0758 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:31:11 | 0758 | T | Runtime environment set to: development
| 05:31:11 | 0758 | T | Initialized module [Log].
| 05:31:11 | 0758 | T | Initialized module [WebServer].
| 05:31:11 | 0758 | T | Initialized service [SystemUsers].
| 05:31:11 | 0758 | T | Initialized service [Maths].
| 05:31:11 | 0761 | T | WebServer - initialized Cors
| 05:31:11 | 0761 | T | WebServer - initialized JsonBodyParser
| 05:31:11 | 0761 | T | WebServer - initialized UrlEncodedParser
| 05:31:11 | 0761 | T | WebServer - initialized FileUpload
| 05:31:11 | 0762 | T | WebServer - initialized Session handler
| 05:31:11 | 0767 | T | WebServer - initialized Passport with Local
| 05:31:11 | 0767 | T | WebServer - initialized Static Folder [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files]
| 05:31:11 | 0767 | T | WebServer - initialized Pug Views [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/views]
| 05:31:11 | 0770 | T | WebServer - generated Http Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_http-api-client.js]
| 05:31:11 | 0771 | T | Added 14 http routes for [/api/SystemUsers] functions.
| 05:31:11 | 0771 | T | Added 3 http routes for [/ui/SystemUsers] pages.
| 05:31:11 | 0771 | T | Added 8 http routes for [/api/Maths] functions.
| 05:31:11 | 0771 | T | Added 0 http routes for [/ui/Maths] pages.
| 05:31:11 | 0772 | T | WebServer - initialized Socket Server
| 05:31:11 | 0773 | T | WebServer - generated Socket Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_socket-api-client.js]
| 05:31:11 | 0773 | T | WebServer - server initialization complete.
| 05:31:11 | 0775 | T | WebServer is listening at [127.0.0.1:4200].
| 05:31:11 | 0775 | T | SocketServer has attached to the WebServer.
    ✔ should start the web server
| 05:31:11 | 0776 | T | WebServer has stopped.
| 05:31:11 | 0776 | T | SocketServer has stopped.
    ✔ should stop the web server

  021) Maths WebService Tests
| 05:31:11 | 0777 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:31:11 | 0777 | T | Initialized module [Config].
| 05:31:11 | 0777 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:31:11 | 0777 | T | Runtime environment set to: development
| 05:31:11 | 0777 | T | Initialized module [Log].
| 05:31:11 | 0777 | T | Initialized module [WebServer].
| 05:31:11 | 0777 | T | Initialized service [SystemUsers].
| 05:31:11 | 0777 | T | Initialized service [Maths].
| 05:31:11 | 0778 | T | WebServer - initialized Cors
| 05:31:11 | 0778 | T | WebServer - initialized JsonBodyParser
| 05:31:11 | 0778 | T | WebServer - initialized UrlEncodedParser
| 05:31:11 | 0778 | T | WebServer - initialized FileUpload
| 05:31:11 | 0778 | T | WebServer - initialized Session handler
| 05:31:11 | 0778 | T | WebServer - initialized Passport with Local
| 05:31:11 | 0778 | T | WebServer - initialized Static Folder [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files]
| 05:31:11 | 0778 | T | WebServer - initialized Pug Views [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/views]
| 05:31:11 | 0779 | T | WebServer - generated Http Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_http-api-client.js]
| 05:31:11 | 0780 | T | Added 14 http routes for [/api/SystemUsers] functions.
| 05:31:11 | 0780 | T | Added 3 http routes for [/ui/SystemUsers] pages.
| 05:31:11 | 0780 | T | Added 8 http routes for [/api/Maths] functions.
| 05:31:11 | 0780 | T | Added 0 http routes for [/ui/Maths] pages.
| 05:31:11 | 0780 | T | WebServer - initialized Socket Server
| 05:31:11 | 0781 | T | WebServer - generated Socket Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_socket-api-client.js]
| 05:31:11 | 0781 | T | WebServer - server initialization complete.
| 05:31:11 | 0781 | T | WebServer is listening at [127.0.0.1:4200].
| 05:31:11 | 0782 | T | SocketServer has attached to the WebServer.
    ✔ should add two numbers
    ✔ should subtract two numbers
    ✔ should multiply two numbers
    ✔ should divide two numbers
| 05:31:11 | 0800 | T | WebServer has stopped.
| 05:31:11 | 0800 | T | SocketServer has stopped.


  11 passing (152ms)


```


