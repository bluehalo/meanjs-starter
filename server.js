'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
	logger = require('./config/lib/bunyan').logger,
	mongoose = require('./config/lib/mongoose'),
	express = require('./config/lib/express'),
	stomp = require('./config/lib/stomp');

logger.info('Starting initialization of Node.js server');

// Initialize mongoose
mongoose.connect(function (db) {
	logger.info('Mongoose connected, proceeding with application configuration');

	try {
		// Initialize express
		var app = express.init(db);
	
		// Start the app by listening on <port>
		app.listen(config.port);
	
		// Logging initialization
		logger.info('Node app listening on port ' + config.port);

		// Init task scheduler
		var scheduler = require('./config/scheduler');
		scheduler.start();

	} catch(err) {
		logger.fatal({err: err}, 'Express initialization failed.');
	}

});

// Initialize STOMP
stomp.init();
