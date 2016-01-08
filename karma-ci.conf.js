'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),

	config = require('./config/config'),
	assets = config.assets,

	reportDir = path.resolve('./reports');

// Karma configuration
module.exports = function(karmaConfig) {

	// source files, that you wanna generate coverage for
	// do not include tests or libraries
	// (these files will be instrumented by Istanbul)
	var preprocessors = {};
	var srcForCoverage = 'app/*/client/**/*.js';
	preprocessors[srcForCoverage] = ['coverage'];

	karmaConfig.set({
		// Frameworks to use
		frameworks: ['jasmine'],

		// List of files / patterns to load in the browser
		files: _.union(assets.client.lib.js, assets.client.lib.tests, assets.client.js, assets.tests.client),

		// Test results reporter to use
		// Possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: ['progress', 'junit', 'coverage'],

		preprocessors: preprocessors,

		junitReporter: {
			outputDir: reportDir + '/karma',
			useBrowserName: false
		},

		coverageReporter: {
			type : 'cobertura',
			dir : reportDir + '/karma'
		},

		// Web server port
		port: config.devPorts.karma,

		// Enable / disable colors in the output (reporters and logs)
		colors: true,

		// Level of logging
		// Possible values: karmaConfig.LOG_DISABLE || karmaConfig.LOG_ERROR || karmaConfig.LOG_WARN || karmaConfig.LOG_INFO || karmaConfig.LOG_DEBUG
		logLevel: karmaConfig.LOG_INFO,

		// Enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['PhantomJS'],

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,

		// Continuous Integration mode
		// If true, it capture browsers, run tests and exit
		singleRun: true
	});
};
