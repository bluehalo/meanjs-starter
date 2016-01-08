# MEAN Starter #

## Prerequisites ##
1. MongoDB installed and running (http://mongodb.org)
1. Node.js and NPM installed (http://nodejs.org)
1. Gulp.js installed globally (http://gulpjs.com)
1. Bower.js installed globally (http://bower.io)
1. Bunyan.js installed globally (https://github.com/trentm/node-bunyan)


## Installation ##
1. Checkout from Git
1. Run 'npm install' from the project directory


## Configuration ##
You will want to make your own configuration file for the application. There are template development and production config files located under /config/env/ The best approach is to copy the development.template.js file and rename it to development.js and then customize the settings for your environment.


## Running the Application ##
We use Gulp to build and run the application. There are several tasks in the gulpfile that can be used to build/run/test the application. See gulpfile.js (the 'Main Tasks' section near the bottom of the file) for the tasks that can be executed along with documentation for each. To run the app, execute the following from the command line:

$ export NODE_ENV=development && gulp debug | bunyan

This will set the NODE_ENV environment variable to your config file (eg. 'development' or 'production'), run the gulp debug task, and pipe the output to bunyan, which serializes your log output to human-readable form. The 'debug' task will start the Node.js server on port 3000 (default). Node.js is run using nodemon, which will monitor the directory system for changes, restarting the app automatically on changes.

## Configuring First Account ##
Create an account from the application's homepage

From the mongo shell run the following two commands:

use {admin db-name}
db.users.update({}, {$set: {"roles" : { "user" : true, "editor" : true, "admin" : true }}})

## Debugging ##
There are several options for debugging the server application. You can use an IDE like WebStorm, or you can use [node-inspector](https://github.com/node-inspector/node-inspector) to use the Chrome developer tools to debug the application.

The gulp debug task will launch node inspector, which will run a server you can hit to debug the server javascript code using the browser. The location is http://localhost:{node-inspector-port}/debug?port={debug-port}. These ports can be found in the default environment config file and modified in your custom config file.

If you want to force the app to break on the first line to be executed, you can pass in the console parameter '--debugBrk'. A full example of a command used to launch the app looks like: 'export NODE_ENV=reblace && gulp debug --debugBrk | bunyan'. This will set the NODE_ENV environment variable, run the 'debug' gulp task, breaking on the first line (omit normally), and then piping the results to bunyan log formatter.
