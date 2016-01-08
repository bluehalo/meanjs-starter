'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	config = require('./config/config'),
	assets = config.assets;

// Karma configuration
module.exports = function(karmaConfig) {

	karmaConfig.set({
		// Frameworks to use
		frameworks: ['jasmine'],

		// List of files / patterns to load in the browser
		files: _.union(assets.client.lib.js, assets.client.lib.tests, assets.client.js, assets.tests.client),

		// Test results reporter to use
		// Possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: ['mocha'],

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
		browsers: ['Chrome'],

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,

		singleRun: false
	});
};
