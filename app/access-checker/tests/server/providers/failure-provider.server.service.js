'use strict';

var path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./config/dependencies.js')),
	logger = deps.logger;


// Simple example provider that simply returns the user if they exist in the config
module.exports = function(config) {
	return {
		get: function(id) {
			throw new Error('Stuffs broke.');
		}
	};
};
