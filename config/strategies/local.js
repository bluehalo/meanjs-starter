'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	mongoose = require('mongoose'),
	LocalStrategy = require('passport-local').Strategy,
	User = mongoose.model('User');

module.exports = function() {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {

			User.findOne({
				username: username
			}, function(err, user) {
				// Error from the system
				if (err) {
					return done(err);
				}

				// The user wasn't found
				if (!user) {
					return done(null, false, {
						message: 'Unknown user'
					});
				}

				// The password is wrong
				if (!user.authenticate(password)) {
					return done(null, false, {
						message: 'Invalid password'
					});
				}

				// Return the user
				return done(null, user);
			});

		}

	));
};