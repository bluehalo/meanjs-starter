'use strict';

var passport = require('passport'),
	path = require('path'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	logger = deps.logger,

	users = require(path.resolve('./app/users/server/controllers/users.server.controller.js')),
	groups = require(path.resolve('./app/groups/server/controllers/groups.server.controller.js'));


module.exports = function(app) {

	/**
	 * User Routes (don't require admin)
	 */

	// Get the auth system configuration
	app.route('/user/config')
		.get(users.getAuthConfig);

	// Self-service user routes
	app.route('/user/me')
		.get( users.requiresLogin, users.getCurrentUser)
		.post(users.requiresLogin, users.updateCurrentUser);

	// User getting another user's info
	app.route('/user/:userId')
		.get(users.requiresLogin, users.requiresRoles(['user']), users.getUserById);

	// User searching for other users
	app.route('/users')
		.post(users.requiresLogin, users.requiresRoles(['user']), users.searchUsers);

	// User match-based search for other users (this searches based on a fragment)
	app.route('/users/match')
		.post(users.requiresLogin, users.requiresRoles(['user']), users.matchUsers);

	/**
	 * Admin User Routes (requires admin)
	 */

	// Admin retrieve/update/delete
	app.route('/admin/user/:userId')
		.get(   users.requiresLogin, users.requiresRoles(['admin']), users.adminGetUser)
		.post(  users.requiresLogin, users.requiresRoles(['admin']), users.adminUpdateUser)
		.delete(users.requiresLogin, users.requiresRoles(['admin']), users.adminDeleteUser);

	// Admin search users
	app.route('/admin/users')
		.post(users.requiresLogin, users.requiresRoles(['admin']), users.adminSearchUsers);


	/**
	 * Auth-specific routes
	 */
	app.route('/auth/signout')
		.get(users.requiresLogin, users.signout);

	if(config.auth.strategy === 'local') {

		logger.info('Configuring local user authentication routes.');

		// Admin Create User
		app.route('/admin/user')
			.post(users.requiresLogin, users.requiresRoles(['admin']), users.adminCreateUser);

		// Default setup is basic local auth
		app.route('/auth/signup').post(users.signup);
		app.route('/auth/signin').post(users.signin);

		app.route('/auth/forgot').post(users.forgot);
		app.route('/auth/reset/:token').get(users.validateResetToken);
		app.route('/auth/reset/:token').post(users.reset);

	} else if(config.auth.strategy === 'proxy-pki') {

		logger.info('Configuring proxy-pki user authentication routes.');

		// Admin Create User
		app.route('/admin/user')
			.post(users.requiresLogin, users.requiresRoles(['admin']), users.adminCreateUserPki);

		// DN passed via header from proxy
		app.route('/auth/signin').post(users.proxyPkiSignin);
		app.route('/auth/signup').post(users.proxyPkiSignup);

	}

	// Finish by binding the user middleware
	app.param('userId', users.userById);
};
