'use strict';

var path = require('path'),
	core = require(path.resolve('./app/core/server/controllers/core.server.controller.js'));

module.exports = function(app) {
	// Root routing
	app.route('/').get(core.index);
};