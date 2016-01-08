'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
	mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),
	logger = require('./bunyan').logger;

// Set the mongoose debugging option based on the configuration, defaulting to false
var mongooseDebug = (config.mongoose)? config.mongoose.debug: false;
logger.info('Mongoose: Setting debug to %s', mongooseDebug);
mongoose.set('debug', mongooseDebug);

// Override the global mongoose to use q for promises
mongoose.Promise = require('q').Promise;

// Load the mongoose models
module.exports.loadModels = function() {
	// Globbing model files
	config.files.server.models.forEach(function(modelPath) {
		logger.debug('Mongoose: Loading %s', modelPath);
		require(path.resolve(modelPath));
	});
};


// This is the set of dbs
module.exports.dbs = {};

// Initialize Mongoose
module.exports.connect = function() {
	var that = this;
	var defer = q.defer();

	var dbSpecs = [];
	var defaultDbSpec;

	// Organize the dbs we need to connect
	for(var dbSpec in config.db) {
		if(dbSpec === 'admin') {
			defaultDbSpec = { name: dbSpec, connectionString: config.db[dbSpec] };
		}
		else {
			dbSpecs.push({ name: dbSpec, connectionString: config.db[dbSpec] });
		}
	}

	// Connect to the default db to kick off the process
	var defaultDbDefer = q.defer();
	var defaultDb = mongoose.connect(defaultDbSpec.connectionString, defaultDbDefer.makeNodeResolver());

	// Once we're connected to the default db, try the others
	defaultDbDefer.promise.then(function(result) {
		logger.info('Mongoose: Connected to \'%s\' default db', defaultDbSpec.name);

		// store it in the db list
		that.dbs[defaultDbSpec.name] = defaultDb;

		// Connect to the rest of the dbs
		var promises = [];
		dbSpecs.forEach(function(spec) {
			var specDeferral = q.defer();

			// Create the secondary connection
			var connection = mongoose.createConnection(spec.connectionString, specDeferral.makeNodeResolver());
			promises.push(specDeferral.promise.then(function(result) {
				logger.info('Mongoose: Connected to \'%s\' db', spec.name);
				that.dbs[spec.name] = connection;
				q.resolve();
			}, function(err) {
				logger.fatal({err: err}, 'Mongoose: Could not connect to \'%s\' db', spec.name);
				q.reject(err);
			}));
		});

		q.all(promises).then(function(results) {
			try {
				that.loadModels();
				// Resolve the defer because the mongoose load worked
				defer.resolve(that.dbs);
			} catch (err) {
				// reject the defer and return, log at the higher level
				defer.reject(err);
			}
		}, function(err) {
			defer.reject(err);
		});

	}, function(err) {
		logger.fatal({err: err}, 'Mongoose: Could not connect to \'%s\' db', defaultDbSpec.name);
	});

	return defer.promise;
};


//Disconnect from Mongoose
module.exports.disconnect = function() {

	// Create defers for mongoose connections
	var promises = [];
	for(var d in this.dbs) {
		var dbDeferral = q.defer();
		promises.push(dbDeferral.promise);

		if (this.dbs[d].disconnect) {
			this.dbs[d].disconnect(dbDeferral.makeNodeResolver());
		}
		else {
			dbDeferral.resolve();
		}
	}

	// Create a join for the defers
	return q.all(promises);

};
