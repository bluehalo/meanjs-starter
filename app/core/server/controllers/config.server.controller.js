'use strict';

var path = require('path'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	pjson = require(path.resolve('./package.json'));



// Read
exports.read = function(req, res) {
	/**
	 *  Add unsecured configuration data
	 */
	var toReturn = {
		auth: config.auth.strategy,
		classification: config.classification,
		copyright: config.copyright,
		version: pjson.version
	};

	res.json(toReturn);
};
