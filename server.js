'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
	logger = require('./config/lib/bunyan').logger,
	mongoose = require('./config/lib/mongoose'),
	express = require('./config/lib/express');

logger.info('Starting initialization of Node.js server');

// Initialize mongoose
mongoose.connect().then(function (db) {
	logger.info('Mongoose connected, proceeding with application configuration');

	try {
		// Initialize express
		var app = express.init(db.admin);

		// Start the app
		app.listen(config.port);

		// Init task scheduler
		var scheduler = require('./config/scheduler');
		scheduler.start();

		// Logging initialization
		logger.info('%s started on port %s', config.app.instanceName, config.port);

	} catch(err) {
		logger.fatal({err: err}, 'Express initialization failed.');
	}

}, function(err) {
	logger.fatal({err: err}, 'Mongoose initialization failed.');
});