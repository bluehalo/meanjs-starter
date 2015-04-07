'use strict';

var mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	logger = deps.logger,
	auditLogger = deps.auditLogger;


var keepAlive = true;
var interval;
var services = [];

function timeoutHandler() {
	logger.debug('Running scheduler');

	// Loop over all of the services
	services.forEach(function(service) {
		try{
			service.run();
		} catch(err) {
			// the main loop won't die if a service is failing
		}
	});

	if(keepAlive) {
		setTimeout(timeoutHandler, interval);
	}
}


module.exports.start = function() {
	// Only start if we're actually configured
	if(null != config.scheduler) {
		var serviceConfigs = config.scheduler.services || [];

		// Initialize the services
		serviceConfigs.forEach(function(serviceConfig) {
			var service = {};

			// Get the implementation of the service
			service.service = require(path.resolve(serviceConfig.file));

			// Store the original service config
			service.config = serviceConfig;

			// Get the service run interval
			service.interval = serviceConfig.interval;

			// Validate the service
			if(null == service.interval || service.interval < 1000) {
				logger.warn(service, 'Bad service configuration provided');
			} else {
				// Store it in the services array
				services.push(service);
			}
		});

		// Start the timer
		interval = config.scheduler.interval || 10000;
		setTimeout(timeoutHandler, 0);
	}
};
