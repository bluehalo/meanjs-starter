'use strict';

var path = require('path'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = require(path.resolve('./app/core/server/controllers/config.server.controller.js')),
	pjson = require(path.resolve('./package.json'));

exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		config: config.getSystemConfig()
	});
};