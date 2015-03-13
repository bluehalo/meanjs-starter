'use strict';

var passport = require('passport'),
	User = require('mongoose').model('User'),
	path = require('path'),
	config = require(path.resolve('./config/config.js'));

module.exports.init = function() {
	// Serialize sessions
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// Deserialize sessions
	passport.deserializeUser(function(id, done) {
		User.findOne({
			_id: id
		}, '-salt -password', function(err, user) {
			done(err, user);
		});
	});

	// Initialize strategies
	config.utils.getGlobbedPaths('./config/strategies/**/*.js').forEach(function(strategy) {
		require(path.resolve(strategy))();
	});
};