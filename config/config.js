'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	chalk = require('chalk'),
	glob = require('glob'),
	path = require('path');

/**
 * Get files by glob patterns
 */
var getGlobbedPaths = function(globPatterns, excludes) {
	// URL paths regex
	var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	// The output array
	var output = [];

	// If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob 
	if (_.isArray(globPatterns)) {
		globPatterns.forEach(function(globPattern) {
			output = _.union(output, getGlobbedPaths(globPattern, excludes));
		});
	} else if (_.isString(globPatterns)) {
		if (urlRegex.test(globPatterns)) {
			output.push(globPatterns);
		} else {
			glob(globPatterns, {
				sync: true
			}, function(err, files) {
				if (excludes) {
					files = files.map(function(file) {
						if (_.isArray(excludes)) {
							for (var i in excludes) {
								file = file.replace(excludes[i], '');
							}
						} else {
							file = file.replace(excludes, '');
						}

						return file;
					});
				}

				output = _.union(output, files);
			});
		}
	}

	return output;
};

/**
 * Validate NODE_ENV existance
 */
var validateEnvironmentVariable = function() {

	if(null == process.env.NODE_ENV) {
		process.env.NODE_ENV = 'development';

		// Using console.log because this stuff happens before the environment is configured yet
		console.log('NODE_ENV not set, using default environment: "development" instead.');
	} else {
		console.log('NODE_ENV is set to: "' + process.env.NODE_ENV + '"');
	}

	// Try to get the environment file and see if we can load it
	glob('./config/env/' + process.env.NODE_ENV + '.js', {
		sync: true
	}, function(err, environmentFiles) {

		if (!environmentFiles.length) {
			console.log(chalk.red('No configuration files found matching environment: "' + process.env.NODE_ENV + '"'));
			// Reset console color
			console.log(chalk.white(''));
		}
	});

};

/**
 * Initialize global configuration files
 */
var initGlobalConfigFolders = function(config, assets) {
	// Appending files
	config.folders = {
		server: {},
		client: {}
	};

	// Setting globbed client paths
	config.folders.client = getGlobbedPaths(path.join(process.cwd(), 'app/*/client/'), process.cwd().replace(new RegExp(/\\/g),'/'));
};

/**
 * Initialize global configuration files
 */
var initGlobalConfigFiles = function(config, assets) {
	// Appending files
	config.files = {
		server: {},
		client: {}
	};

	// Setting Globbed model files
	config.files.server.models = getGlobbedPaths(assets.server.models);

	setTimeout(function(){
		// Setting Globbed route files
		var routeFiles = getGlobbedPaths(assets.server.routes);
	}, 30000);

	// Setting Globbed route files
	config.files.server.routes = getGlobbedPaths(assets.server.routes);

	// Setting Globbed config files
	config.files.server.configs = getGlobbedPaths(assets.server.config);

	// Setting Globbed socket files
	config.files.server.sockets = getGlobbedPaths(assets.server.sockets);

	// Setting Globbed policies files
	config.files.server.policies = getGlobbedPaths(assets.server.policies);

	// Setting Globbed js files
	config.files.client.js = getGlobbedPaths(assets.client.lib.js, 'public/').concat(getGlobbedPaths(assets.client.js, ['client/', 'public/']));

	// Setting Globbed css files
	config.files.client.css = getGlobbedPaths(assets.client.lib.css, 'public/').concat(getGlobbedPaths(assets.client.css, ['client/', 'public/']));

	// Setting Globbed test files
	config.files.client.tests = getGlobbedPaths(assets.client.tests);
};

/**
 * Initialize global configuration
 */
var initGlobalConfig = function() {
	// Validate NDOE_ENV existance
	validateEnvironmentVariable();

	// Get the default config
	var defaultConfig = require(path.join(process.cwd(), 'config/env/default'));

	// Get the current config
	var environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

	// Merge config files
	var config = _.extend(defaultConfig, environmentConfig);

	// Determine the deployment mode (defaults to 'development')
	var mode = (null != config.deploymentMode) ? config.deploymentMode : 'development';

	// Get the default assets
	var defaultAssets = require(path.join(process.cwd(), 'config/assets/default'));

	// Get the current assets
	var environmentAssets = require(path.join(process.cwd(), 'config/assets/', mode)) || {};

	// Merge assets
	var assets = _.extend(defaultAssets, environmentAssets);

	// Initialize global globbed files
	initGlobalConfigFiles(config, assets);

	// Initialize global globbed folders
	initGlobalConfigFolders(config, assets);

	// Expose configuration utilities
	config.utils = {
		getGlobbedPaths: getGlobbedPaths
	};

	return config;
};

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();