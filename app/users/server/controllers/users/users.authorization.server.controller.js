'use strict';

var _ = require('lodash'),
	mongoose = require('mongoose'),
	path = require('path'),

	deps = require(path.resolve('./config/dependencies.js')),

	User = mongoose.model('User');


/**
 * Private Methods
 */

// Requires login check
function requiresLogin(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}

	next();
}

//User authorizations routing middleware
function requiresRoles(roles){

	return function(req, res, next) {
		if (User.hasRoles(req.user, ['admin']) || User.hasRoles(req.user, roles)) {
			return next();
		} else {
			return res.status(403).send({
				message: 'User is missing required roles'
			});
		}
	};

}


/**
 * Exposed API
 */

// User middleware - stores user corresponding to id in 'userParam'
exports.userById = function(req, res, next, id) {
	User.findOne({
		_id: id
	}).exec(function(err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Failed to load User ' + id));
		req.userParam = user;
		next();
	});
};

// Requires login routing middleware
exports.requiresLogin = requiresLogin;
exports.requiresRoles = requiresRoles;

// Detects if the user has admin role
exports.hasAdmin = function() {
	return requiresRoles(['admin']);
};

// Detects if the user has the user role
exports.hasUser = function() {
	return requiresRoles(['user']);
};

exports.hasAdminOr = function(func) {
	return function(req, res, next) {
		if(User.hasRoles(req.user, ['admin'])) {
			next();
		} else {
			func(req, res, next);
		}
	};
};