'use strict';

var path = require('path'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	pjson = require(path.resolve('./package.json'));


var getSystemConfig = function() {
	var toReturn = {
		auth: config.auth.strategy,
		classification: config.classification,
		copyright: config.copyright,
		map: config.map,
		urlHandler: config.urlHandler,
		version: pjson.version,
		clientDebugEnabled: config.clientDebugEnabled,
		userUrlTemplate: config.userUrlTemplate,
		maxScan: config.maxScan,
		maxExport: config.maxExport,
		showTwitterImages: config.showTwitterImages
	};

	return toReturn;
};

exports.getSystemConfig = getSystemConfig;

// Read
exports.read = function(req, res) {
	/**
	 *  Add unsecured configuration data
	 */
	res.json(getSystemConfig());
};
