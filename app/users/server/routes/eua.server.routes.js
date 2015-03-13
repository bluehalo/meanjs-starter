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
		.post(users.requiresLogin, users.requiresRoles(['admin']), users.searchEuas);

	app.route('/eua/accept')
		.post(users.requiresLogin, users.acceptEua);

	app.route('/eua/:euaId/publish')
		.post(users.requiresLogin, users.requiresRoles(['admin']), users.publishEua);

	app.route('/eua/:euaId')
		.get(   users.requiresLogin, users.requiresRoles(['admin']), users.getEuaById)
		.post(  users.requiresLogin, users.requiresRoles(['admin']), users.updateEua)
		.delete(users.requiresLogin, users.requiresRoles(['admin']), users.deleteEua);

	app.route('/eua')
		.get( users.requiresLogin, users.getCurrentEua)
		.post(users.requiresLogin, users.requiresRoles(['admin']), users.createEua);

	// Finish by binding the user middleware
	app.param('euaId', users.euaById);

};
