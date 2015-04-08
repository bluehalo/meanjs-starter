'use strict';

var mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	logger = deps.logger,
	auditLogger = deps.auditLogger,
	util = deps.utilService,

	Report = mongoose.model('Report');

function runReport(report) {
	var defer = q.defer();

	logger.info('Running report: ' + report.title, report);
	defer.resolve();

	return defer.promise;
}

exports.run = function(config) {
	logger.debug('Running the report service');

	// Create a defer for the response
	var defer = q.defer();

	/* 
	 * Get reports that need to run
	 * This would be any report that isn't already running 
	 * and whose next scheduled run time has passed
	 */
	Report.find({ 
		'state.running': false, 
		'state.nextRun': { $lte: Date.now() } 
	}).exec(function(err, results) {
		if(err) {
			logger.error('Failed to retrieve reports.', err);
			defer.reject(err);
		}

		var reportPromises = [];

		// Iterate over each report that needs to be run and run it
		results.forEach(function(element) {
			reportPromises.push(runReport(element));
		});

		q.all(reportPromises).then(function(results) {
			defer.resolve();
		}, function(error) {
			defer.reject(error);
		});

	});

	// return the promise
	return defer.promise;
};