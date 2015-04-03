'use strict';

var path = require('path'),

	groups = require(path.resolve('./app/groups/server/controllers/groups.server.controller.js')),
	users = require(path.resolve('./app/users/server/controllers/users.server.controller.js'));

module.exports = function(app) {

	/**
	 * Group Routes
	 */

	app.route('/group')
		.post(users.requiresLogin, users.requiresEua, users.requiresRoles(['editor']), groups.create);

	app.route('/groups')
		.post(users.requiresLogin, users.requiresEua, groups.search);

	app.route('/group/:groupId')
		.get(users.requiresLogin, users.hasAdminOr(groups.hasAuthorization), groups.read)
		.post(users.requiresLogin, users.requiresEua, users.hasAdminOr(groups.hasAuthorization), groups.update)
		.delete(users.requiresLogin, users.requiresEua, users.hasAdminOr(groups.hasAuthorization), groups.delete);

	/**
	 * Group editors Routes (requires group admin role)
	 */
	app.route('/group/:groupId/users')
		.post(users.requiresLogin, users.requiresEua, users.hasAdminOr(groups.hasAuthorization), groups.searchMembers);

	app.route('/group/:groupId/user/:userId')
		.post(  users.requiresLogin, users.requiresEua, users.hasAdminOr(groups.hasAuthorization), groups.userAdd)
		.delete(users.requiresLogin, users.requiresEua, users.hasAdminOr(groups.hasAuthorization), groups.userRemove);

	app.route('/group/:groupId/user/:userId/role')
		.post(  users.requiresLogin, users.requiresEua, users.hasAdminOr(groups.hasAuthorization), groups.userRoleAdd)
		.delete(users.requiresLogin, users.requiresEua, users.hasAdminOr(groups.hasAuthorization), groups.userRoleRemove);


	// Finish by binding the group middleware
	app.param('groupId', groups.groupById);
	app.param('userId', users.userById);
};
