# My Application #

## Prerequisites ##
1. MongoDB installed and running (http://mongodb.org)
1. Node.js installed (http://nodejs.org)
1. Gulp.js installed (http://gulpjs.com)
1. Bower.js installed (http://bower.io)

## Installation ##
1. Checkout from Git
1. Run 'npm install' from the project directory
1. Install bunyan globally ('npm install -g bunyan')

## Configuration ##
You will want to make your own configuration file for the application. There are example development and production config files located under /config/env/ The best approach is to copy the development.js file and rename it to something else.

Once you've got your custom config file, you can update paths and other settings in that file (you can add the file to the .gitignore so you won't accidentally commit it).


## Running the Application ##
Set the NODE_ENV environment variable to have the value equal to the name of your config file (eg. if I named my config file 'reblace.js' I would make NODE_ENV=reblace). You can set env variables in linux using 'export NODE_ENV=value'.

Run 'gulp debug | bunyan' from the project directory to start the Node.js server. The gulp debug task runs nodemon to monitor the directory system for changes and it will rebuild/deploy the application automatically as changes are made.

## Debugging ##
There are several options for debugging the server application. You can use an IDE like WebStorm, or you can use [node-inspector](https://github.com/node-inspector/node-inspector) to use the Chrome developer tools to debug the application.

The gulp debug task will launch node inspector, which will run a server you can hit to debug the server javascript code using the browser. The location is http://localhost:{node-inspector-port}/debug?port={debug-port}
