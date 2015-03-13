'use strict';

var _ = require('lodash'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	path = require('path'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	util = deps.utilService,
	logger = deps.logger,
	auditLogger = deps.auditLogger,

	User = mongoose.model('User');


/**
 * Private methods
 */

function save(user, req, res) {
	user.save(function(err) {
		util.catchError(res, err, function() {
			// Audit admin creates
			auditLogger.audit('admin user create', 'user', 'admin user create',
				User.auditCopy(req.user),
				{ user: User.auditCopy(user) });

			res.jsonp(User.fullCopy(user));
		});
	});
}

// Login the user
function login(user, req, res) {
	// Remove sensitive data before login
	delete user.password;
	delete user.salt;

	req.login(user, function(err) {
		if (err) {
			res.status(400).send(err);
		} else {
			// update the user's last login time
			User.findOneAndUpdate(
				{ _id: user._id },
				{ lastLogin: Date.now() },
				{ new: true, upsert: false },
				function(err, user) {
					util.catchError(res, err, function() {
						res.jsonp(User.fullCopy(user));
					});
				});
		}
	});
}

// Authenticate and login the user. Passport handles authentication.
function authenticateAndLogin(strategy, req, res, next) {
	passport.authenticate(strategy, function(err, user, info) {
		if (err || !user) {
			// Audit failed authentication
			auditLogger.audit('authentication failed', 'user', 'authentication failed',
				{ }, 
				{ err: err, user: user, info: info });

			res.status(400).send(info);
		} else {
			login(user, req, res);
		}
	})(req, res, next);
}

//Signup the user - creates the user object and logs in the user
function signup(user, req, res) {
	// Then save the user 
	user.save(function(err) {
		util.catchError(res, err, function() {
			// Audit user signup
			auditLogger.audit('user signup', 'user', 'user signup',
				{},
				{ user: User.auditCopy(user) });

			login(user, req, res);
		});
	});
}


/**
 * Configuration Access
 */
exports.getAuthConfig = function(req, res) {
	var toReturn = {
		auth: config.auth.strategy
	};

	res.json(toReturn);
};



/**
 * The various ways to signup and signin
 */

// Local strategy signup (provide username/password)
exports.signup = function(req, res) {
	var user = new User(User.createCopy(req.body));
	user.provider = 'local';

	signup(user, req, res);
};

// Proxy PKI Signup, provides user dn via header
exports.proxyPkiSignup = function(req, res) {
	var dn = req.headers[config.auth.header];
	if(null == dn) {
		res.status('400').send({ message: 'Missing PKI information.' });
		return;
	}

	var user = new User(User.createCopy(req.body));
	user.providerData = { dn: dn, dnLower: dn.toLowerCase() };
	user.username = dn; //TODO: extract the username
	user.provider = 'pki';

	signup(user, req, res);
};

//Admin Create a User (Local Strategy)
exports.adminCreateUser = function(req, res) {
	var user = new User(User.createCopy(req.body));
	user.roles = req.body.roles;
	user.provider = 'local';

	save(user, req, res);
};

//Admin Create a User (Pki Strategy)
exports.adminCreateUserPki = function(req, res) {
	var user = new User(User.createCopy(req.body));
	user.roles = req.body.roles;

	if(null != req.body.username) {
		user.username = req.body.username;
		user.providerData = { dn: req.body.username, dnLower: req.body.username.toLowerCase() };
	}
	user.provider = 'pki';

	save(user, req, res);
};

// Local signin
exports.signin = function(req, res, next) {
	authenticateAndLogin('local', req, res, next);
};

// Signin via proxied pki
exports.proxyPkiSignin = function(req, res, next) {
	authenticateAndLogin('proxy-pki', req, res, next);
};

// Signin via direct pki
exports.pkiSignin = function(req, res, next) {
	authenticateAndLogin('pki', req, res, next);
};


// Signout - logs the user out and redirects them
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};

