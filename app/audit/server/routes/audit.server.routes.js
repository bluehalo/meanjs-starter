'use strict';

var path = require('path'),
	users = require(path.resolve('./app/users/server/controllers/users.server.controller.js')),
	auditController = require(path.resolve('./app/audit/server/controllers/audit.server.controller.js'));

module.exports = function(app) {

	app.route('/audit')
		.post(users.hasAuditorAccess, auditController.search);

	app.route('/audit/distinctValues')
		.get(users.hasAuditorAccess, auditController.getDistinctValues);

};
