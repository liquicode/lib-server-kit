# Testing Output


```


  001) Core Framework Tests
| 05:32:45 | 0738 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:32:45 | 0739 | T | Initialized module [Config].
| 05:32:45 | 0739 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:32:45 | 0739 | T | Runtime environment set to: development
| 05:32:45 | 0739 | T | Initialized module [Log].
| 05:32:45 | 0739 | T | Initialized module [WebServer].
| 05:32:45 | 0740 | T | Initialized service [SystemUsers].
| 05:32:45 | 0740 | T | Initialized service [Maths].
    ✔ should load configuration
| 05:32:45 | 0741 | I | Hello World from MathsServer
    ✔ should be able to log a message

  010) StorageService Tests
| 05:32:45 | 0742 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:32:45 | 0742 | T | Initialized module [Config].
| 05:32:45 | 0742 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:32:45 | 0742 | T | Runtime environment set to: development
| 05:32:45 | 0742 | T | Initialized module [Log].
| 05:32:45 | 0742 | T | Initialized module [WebServer].
| 05:32:45 | 0742 | T | Initialized service [SystemUsers].
| 05:32:45 | 0742 | T | Initialized service [Maths].
    ✔ should initialize storage
    ✔ should create an empty object
    ✔ should create and delete an object

  020) WebServer Tests
| 05:32:45 | 0748 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:32:45 | 0748 | T | Initialized module [Config].
| 05:32:45 | 0748 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:32:45 | 0748 | T | Runtime environment set to: development
| 05:32:45 | 0748 | T | Initialized module [Log].
| 05:32:45 | 0748 | T | Initialized module [WebServer].
| 05:32:45 | 0748 | T | Initialized service [SystemUsers].
| 05:32:45 | 0748 | T | Initialized service [Maths].
| 05:32:45 | 0750 | T | WebServer - initialized Cors
| 05:32:45 | 0750 | T | WebServer - initialized JsonBodyParser
| 05:32:45 | 0750 | T | WebServer - initialized UrlEncodedParser
| 05:32:45 | 0751 | T | WebServer - initialized FileUpload
| 05:32:45 | 0751 | T | WebServer - initialized Session handler
| 05:32:45 | 0755 | T | WebServer - initialized Passport with Local
| 05:32:45 | 0755 | T | WebServer - initialized Static Folder [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files]
| 05:32:45 | 0755 | T | WebServer - initialized Pug Views [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/views]
| 05:32:45 | 0757 | T | WebServer - generated Http Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_http-api-client.js]
| 05:32:45 | 0758 | T | Added 14 http routes for [/api/SystemUsers] functions.
| 05:32:45 | 0758 | T | Added 3 http routes for [/ui/SystemUsers] pages.
| 05:32:45 | 0759 | T | Added 8 http routes for [/api/Maths] functions.
| 05:32:45 | 0759 | T | Added 0 http routes for [/ui/Maths] pages.
| 05:32:45 | 0760 | T | WebServer - initialized Socket Server
| 05:32:45 | 0761 | T | WebServer - generated Socket Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_socket-api-client.js]
| 05:32:45 | 0761 | T | WebServer - server initialization complete.
| 05:32:45 | 0763 | T | WebServer is listening at [127.0.0.1:4200].
| 05:32:45 | 0764 | T | SocketServer has attached to the WebServer.
    ✔ should start the web server
| 05:32:45 | 0765 | T | WebServer has stopped.
| 05:32:45 | 0765 | T | SocketServer has stopped.
    ✔ should stop the web server

  021) Maths WebService Tests
| 05:32:45 | 0766 | T | Merged configuration settings from file [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/MathsServer.settings.json].
| 05:32:45 | 0766 | T | Initialized module [Config].
| 05:32:45 | 0766 | T | Merged configuration from settings object: {"Log":{"Console":{"enabled":true},"Shell":{"enabled":false}}}
| 05:32:45 | 0766 | T | Runtime environment set to: development
| 05:32:45 | 0766 | T | Initialized module [Log].
| 05:32:45 | 0766 | T | Initialized module [WebServer].
| 05:32:45 | 0766 | T | Initialized service [SystemUsers].
| 05:32:45 | 0766 | T | Initialized service [Maths].
| 05:32:45 | 0767 | T | WebServer - initialized Cors
| 05:32:45 | 0767 | T | WebServer - initialized JsonBodyParser
| 05:32:45 | 0767 | T | WebServer - initialized UrlEncodedParser
| 05:32:45 | 0767 | T | WebServer - initialized FileUpload
| 05:32:45 | 0767 | T | WebServer - initialized Session handler
| 05:32:45 | 0767 | T | WebServer - initialized Passport with Local
| 05:32:45 | 0767 | T | WebServer - initialized Static Folder [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files]
| 05:32:45 | 0767 | T | WebServer - initialized Pug Views [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/views]
| 05:32:45 | 0768 | T | WebServer - generated Http Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_http-api-client.js]
| 05:32:45 | 0768 | T | Added 14 http routes for [/api/SystemUsers] functions.
| 05:32:45 | 0768 | T | Added 3 http routes for [/ui/SystemUsers] pages.
| 05:32:45 | 0769 | T | Added 8 http routes for [/api/Maths] functions.
| 05:32:45 | 0769 | T | Added 0 http routes for [/ui/Maths] pages.
| 05:32:45 | 0769 | T | WebServer - initialized Socket Server
| 05:32:45 | 0769 | T | WebServer - generated Socket Api Client: [/home/andre/code-projects/orgs/liquicode/libs/lib-server-kit.git/tests/MathsServer/web/files/_socket-api-client.js]
| 05:32:45 | 0770 | T | WebServer - server initialization complete.
| 05:32:45 | 0770 | T | WebServer is listening at [127.0.0.1:4200].
| 05:32:45 | 0770 | T | SocketServer has attached to the WebServer.
    ✔ should add two numbers
    ✔ should subtract two numbers
    ✔ should multiply two numbers
    ✔ should divide two numbers
| 05:32:45 | 0788 | T | WebServer has stopped.
| 05:32:45 | 0788 | T | SocketServer has stopped.


  11 passing (168ms)


```


