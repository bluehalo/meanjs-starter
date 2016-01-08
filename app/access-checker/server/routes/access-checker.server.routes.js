'use strict';

var passport = require('passport'),
	path = require('path'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	logger = deps.logger,

	users = require(path.resolve('./app/users/server/controllers/users.server.controller.js')),
	accessChecker = require(path.resolve('./app/access-checker/server/controllers/access-checker.server.controller.js'));

module.exports = function(app) {
	/**
	 * Routes that only apply to the 'proxy-pki' passport strategy
	 */
	logger.info('Configuring proxy-pki user authentication routes.');

	app.route('/access-checker/entry/:key')
		.post(users.hasAdminAccess, accessChecker.refreshEntry)
		.delete(users.hasAdminAccess, accessChecker.deleteEntry);

	app.route('/access-checker/entries/search')
		.post(users.hasAdminAccess, accessChecker.searchEntries);

	app.route('/access-checker/entries/match')
		.post(users.hasAdminAccess, accessChecker.matchEntries);

	// Refresh current user
	app.route('/access-checker/user')
		.post(users.has(users.requiresLogin), accessChecker.refreshCurrentUser);

};
