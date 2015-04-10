'use strict';

var path = require('path'),
	users = require(path.resolve('./app/users/server/controllers/users.server.controller.js')),
	groups = require(path.resolve('./app/groups/server/controllers/groups.server.controller.js')),
	reports = require(path.resolve('./app/reports/server/controllers/reports.server.controller.js'));

module.exports = function(app) {

	app.route('/report')
		.post(users.requiresLogin, users.requiresEua, users.requiresRoles(['user']), users.hasAdminOr(reports.hasEditAuthorization), reports.create);

	app.route('/reports')
		.post(users.requiresLogin, users.requiresEua, users.requiresRoles(['user']), reports.search);

	app.route('/report/:reportId')
		.get(   users.requiresLogin, users.requiresEua, users.requiresRoles(['user']), users.hasAdminOr(reports.hasViewAuthorization), reports.read)
		.post(  users.requiresLogin, users.requiresEua, users.requiresRoles(['user']), users.hasAdminOr(reports.hasEditAuthorization), reports.update)
		.delete(users.requiresLogin, users.requiresEua, users.requiresRoles(['user']), users.hasAdminOr(reports.hasEditAuthorization), reports.delete);

	app.route('/report/:reportId/run')
		.post(  users.requiresLogin, users.requiresEua, users.requiresRoles(['user']), users.hasAdminOr(reports.hasEditAuthorization), reports.run);
	app.route('/report/:reportId/active')
		.post(  users.requiresLogin, users.requiresEua, users.requiresRoles(['user']), users.hasAdminOr(reports.hasEditAuthorization), reports.setActive);

	// This route is unprotected
	app.route('/report/:reportId/activity')
		.post(  reports.userActivity );

	app.param('reportId', reports.reportById);
};
