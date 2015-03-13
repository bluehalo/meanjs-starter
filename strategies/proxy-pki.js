'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	mongoose = require('mongoose'),
	util = require('util'),
	config = require('../config'),
	User = mongoose.model('User');

function Strategy(options, verify) {
	if (typeof options === 'function') {
		verify = options;
		options = {};
	}

	if (!verify) throw new Error('Proxy Pki Strategy requires a verify function');

	passport.Strategy.call(this);

	this.name = 'proxy-pki';
	this._verify = verify;
	this._header = options.header || 'x-ssl-client-s-dn';
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of the dn header value.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
	options = options || {};
	var self = this;

	var dn = req.headers[self._header];
	if (!dn) {
		return this.fail(400);
	}

	function verified(err, user, info) {
		if (err) { return self.error(err); }
		if (!user) { return self.fail(info); }
		self.success(user);
	}

	try {
		self._verify(req, dn, verified);
	} catch(ex) {
		return self.error(ex);
	}
};



// Export our custom token local strategy
module.exports = function() {

	passport.use(new Strategy({
		header: config.auth.header
	},function(req, dn, done) {
		if(!dn){
			return done(null, false, { message: 'Missing PKI information.' });
		}

		User.findOne({
			'providerData.dnLower': dn.toLowerCase()
		}, function(err, user) {
			// Error from the system
			if (err) {
				return done(err);
			}

			// The user was't found
			if (!user) {
				return done(null, false, {
					message: 'Unknown user'
				});
			}

			// Return the user
			return done(null, user);
		});
	}));
};