'use strict';

var passport = require('passport'),
	path = require('path'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	logger = deps.logger,

	users = require(path.resolve('./app/users/server/controllers/users.server.controller.js'));


module.exports = function(app) {

	/**
	 * End User Agreement Routes
	 */

	app.route('/euas')
		.post(users.hasAdminAccess, users.searchEuas);

	app.route('/eua/accept')
		.post(users.has(users.requiresLogin), users.acceptEua);

	app.route('/eua/:euaId/publish')
		.post(users.hasAdminAccess, users.publishEua);

	app.route('/eua/:euaId')
		.get(   users.hasAdminAccess, users.getEuaById)
		.post(  users.hasAdminAccess, users.updateEua)
		.delete(users.hasAdminAccess, users.deleteEua);

	app.route('/eua')
		.get( users.has(users.requiresLogin), users.getCurrentEua)
		.post(users.hasAdminAccess, users.createEua);

	// Finish by binding the user middleware
	app.param('euaId', users.euaById);

};
