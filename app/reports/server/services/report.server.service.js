'use strict';

var async = require('async'),
	mongoose = require('mongoose'),
	path = require('path'),
	Twitter = require('twitter'),
	q = require('q'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	logger = deps.logger,
	auditLogger = deps.auditLogger,
	util = deps.utilService,

	Report = mongoose.model('Report'),
	ReportInstance = mongoose.model('ReportInstance'),
	ProfileMetadata = mongoose.model('ProfileMetadata');


/*
 * Run the actual report
 */
function runReport(report, svcConfig) {
	var defer = q.defer();

	logger.debug(report._id + ': Running report');

	async.waterfall([

		// Create a new Report Instance
		function(callback){
			var instance = new ReportInstance({
				report: report
			});
			instance.save(function(err, result) {
				if(err || result == null) {
					logger.error(err, report._id + ': Error creating report instance');
					callback(err);
				} else {
					callback(null, result);
				}
			});
		},

		// Query Twitter
		function(instance, callback) {
			// Create the twitter client (Gonna recreate it every time for now)
			var client = new Twitter({
				consumer_key: svcConfig.apiKey,
				consumer_secret: svcConfig.apiSecret,
				access_token_key: svcConfig.tokenKey,
				access_token_secret: svcConfig.tokenSecret
			});

			// Build a comma separated list of screennames as a parameter
			var screennames;
			if(null != report.criteriaUsers) {
				screennames = report.criteriaUsers.join(',');
			} else {
				logger.warn('Report: ' + report._id + ' has no users criteria...');
				callback(null, [], instance);
			}

			logger.debug(report._id + ':   Querying Twitter for ' + report.criteriaUsers.length + ' screen names');

			// Issue the actual query
			client.post('users/lookup', { screen_name: screennames }, function(error, results, raw) {
				if(error) callback(error, instance);

				if(null == results) {
					results = [];
				}

				logger.debug(report._id + ':   Twitter returned ' + results.length + ' user profiles');
				callback(null, results, instance);
			});

		},

		// Process and Persist the raw results to MongoDB
		function(profiles, instance, callback) {
			if(null == profiles) {
				profiles = [];
			}

			// Create a map of screenname to profile
			var profilesMap = {};
			profiles.forEach(function(element) {
				profilesMap[element.screen_name.toLowerCase()] = element;
			});

			// Add the missing screennames to the result
			var missingProfiles = [];
			report.criteriaUsers.forEach(function(element) {
				var screen_name = element.toLowerCase();
				if(null == profilesMap[screen_name]) {
					// Empty profiles except for the screen name
					missingProfiles.push({
						screen_name: screen_name
					});
				}
			});

			// Now iterate over all the profiles and create the profile metadata for insertion
			var promises = [];
			profiles.forEach(function(element) {
				var defer = q.defer();

				var pmd = new ProfileMetadata({
					ts: Date.now(),
					screenName: element.screen_name,
					found: true,
					reportInstance: instance._id,
					payload: element
				});

				pmd.save(function(err, result) {
					if(null != err) {
						logger.error(err);
					}
					defer.resolve();
				});
				promises.push(defer.promise);
			});
			missingProfiles.forEach(function(element) {
				var defer = q.defer();

				var pmd = new ProfileMetadata({
					ts: Date.now(),
					screenName: element.screen_name,
					found: false,
					reportInstance: instance._id,
					payload: element
				});

				pmd.save(function(err, result) {
					if(null != err) {
						logger.error(err);
					}
					defer.resolve();
				});
				promises.push(defer.promise);
			});

			// Join on all the promises and then call the callback.
			q.all(promises).then(function() {
				callback(null, instance);
			});

		}

	], function(err, instance) {
		if(null == instance) {
			defer.reject('Report instance is undefined!');
			return;
		}

		// Complete the Report Instance
		instance.completed = Date.now();
		instance.success = (null == err);
		instance.save(function(err, result) {
			if(err) {
				logger.error(err, report._id + ': Error persisting final state');
			}
			defer.resolve();
		});

	});

	return defer.promise;
}

/*
 * Reset the state of the report given the completion of a report
 */
function resetReport(report, success) {
	// default to false
	success = (success == null) ? false : success;

	report.state.running = false;
	report.state.nextRun = Date.now() + report.period;
	report.state.success = success;

	if(success) {
		report.state.lastComplete = Date.now();
	}

	report.save(function(err) {
		if(err) {
			logger.error(err, report._id + ': Error saving report state upon completion');
		} else {
			logger.debug(report._id + ': Completed report');
		}
	});
}


/*
 * Whenever called, will search for reports that need to be run and
 * then run them. Will also update the report metadata.
 */
exports.run = function(svcConfig) {
	//logger.debug('Running the report service');

	// Create a defer for the response
	var defer = q.defer();

	/* 
	 * Get reports that need to run
	 * This would be any report that:
	 *   - is active
	 *   - isn't already running 
	 *   - whose next scheduled run time has passed
	 */
	Report.find({ 
		'active' : true,
		'state.running': false, 
		'state.nextRun': { $lte: Date.now() }
	}).exec(function(err, results) {
		if(err) {
			logger.error(err, 'Failed to retrieve reports.');
			defer.reject(err);
			return;
		}

		if(null != results && results.length > 0) {
			logger.debug('Running ' + results.length + ' reports.');
		}

		// Iterate over each report that needs to be run and run it
		results.forEach(function(report) {

			// Run the report
			runReport(report, svcConfig).then(function(result) {
				resetReport(report, true);
			}, function(error) {
				resetReport(report, false);
			});

		});

		defer.resolve();

	});

	// return the promise
	return defer.promise;
};