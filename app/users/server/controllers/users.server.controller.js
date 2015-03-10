'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path');

/**
 * Extend user's controller
 */
module.exports = _.extend(
	require(path.resolve('./app/users/server/controllers/users/users.authentication.server.controller.js')),
	require(path.resolve('./app/users/server/controllers/users/users.authorization.server.controller.js')),
	require(path.resolve('./app/users/server/controllers/users/users.password.server.controller.js')),
	require(path.resolve('./app/users/server/controllers/users/users.profile.server.controller.js'))
);