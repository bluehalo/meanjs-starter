'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
	mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),
	logger = require('./bunyan').logger;

logger.info('Initializing MongoDB Connections...');

mongoose.set('debug', (config.mongoose)? config.mongoose.debug: false);


// Load the mongoose models
module.exports.loadModels = function() {
	// Globbing model files
	config.files.server.models.forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});
};

var dbs = {};

// Initialize Mongoose
module.exports.connect = function(cb) {
	var _this = this;

	var defer = q.defer();

	defer.promise.then(function(result) {

		logger.info('Loading mongoose models');
		try {
			_this.loadModels();
		} catch (err) {
			logger.fatal({err: err}, 'Mongoose model load failed');
		}

		// Call callback FN
		if (cb) cb(result);

	});

	// Connect to the primary database
	var db = mongoose.connect(config.db, function(err) {
		if (err) {
			logger.fatal({err: err}, 'Could not connect to MongoDB!');
			defer.reject();
		} else {
			logger.info('Connected to MongoDB');
			defer.resolve(db);
		} 
	});

	dbs.primary = db;

};

// Disconnect Mongoose
module.exports.disconnect = function(cb) {
	// Make sure the connections were made
	if(null != dbs.primary && null != dbs.primary.disconnect) {
		// Disconnect
		dbs.primary.disconnect(function(err) {
			logger.info('Disconnected from MongoDB!');
			cb(err);
		});
	} else {
		logger.warn('No MongoDB connection to disconnect!');
	}
};

module.exports.dbs = dbs;
