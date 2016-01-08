'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	path = require('path'),
	q = require('q'),
	should = require('should'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,

	User = dbs.admin.model('User'),
	CacheEntry = dbs.admin.model('CacheEntry'),

	local = require(path.resolve('./config/strategies/local.js')),
	proxyPki = require(path.resolve('./config/strategies/proxy-pki.js')),

	userAuthenticationController = require(path.resolve('app/users/server/controllers/users/users.authentication.server.controller.js'));



/**
 * Helpers
 */
function clearDatabase() {
	return q.all([
		User.remove().exec(),
		CacheEntry.remove().exec()
	]);
}

function save(object) {
	var defer = q.defer();
	object.save(function(err, result) {
		if(null != err) {
			defer.reject(err);
		}
		else {
			defer.resolve(result);
		}
	});
	return defer.promise;
}

function userSpec(key) {
	return {
		name: key + ' Name',
		email: key + '@mail.com',
		username: key + '_username',
		organization: key + ' Organization'
	};
}

function localUserSpec(key) {
	var spec = userSpec(key);
	spec.provider = 'local';
	spec.password = 'password';
	return spec;
}

function proxyPkiUserSpec(key) {
	var spec = userSpec(key);
	spec.provider = 'proxy-pki';
	spec.providerData = {
		dn: key,
		dnLower: key.toLowerCase()
	};
	return spec;
}

function cacheSpec(key) {
	return {
		key: key.toLowerCase(),
		value: {
			name: key + ' Name',
			organization: key + ' Organization',
			email: key + '@mail.com',
			username: key + '_username'
		}
	};
}

/**
 * Unit tests
 */
describe('User Auth Controller:', function() {

	before(function(done) {
		done();
	});

	after(function(done) {
		done();
	});


	describe('\'local\' Strategy', function() {
		var spec = { user: localUserSpec('user1') };
		var user;

		before(function(done) {
			clearDatabase().then(function() {
				// Create the user
				return save(new User(spec.user))
					.then(function(result) { user = result; })
					.then(function() {
						//setup to use local passport
						config.auth.strategy = 'local';
						local();
						done();
					});
			}, done).done();
		});

		after(function(done) {
			clearDatabase().then(function() {
				done();
			}, done).done();
		});

		describe('login', function() {
			it('should succeed with correct credentials', function(done) {
				var req = {};
				req.body = { username: spec.user.username, password: spec.user.password };
				req.login = function(u, cb) { return cb && cb(); };

				var res = {};
				res.status = function(status) {
					should(status).equal(200);

					return {
						json: function(result) {
							// Should return the user
							should.exist(result);
							should(result.username).equal(user.username);
							should(result.name).equal(user.name);

							// The user's password should be removed
							should.not.exist(result.password);

							done();
							return this;
						}
					};
				};

				userAuthenticationController.signin(req, res, function() {});
			});

			it('should fail with incorrect password', function(done) {
				var req = {};
				req.body = { username: user.username, password: 'wrong' };
				req.login = function(u, cb) { return cb && cb(); };

				var res = {};
				res.status = function (status) {
					should(status).equal(401);

					return {
						json: function(info) {
							should.exist(info);
							should(info.type).equal('invalid-credentials');

							done();
							return this;
						}
					};
				};

				userAuthenticationController.signin(req, res, function() {});
			});

			it('should fail with missing password', function(done) {
				var req = {
					body: {
						username: user.username,
						password: undefined
					}
				};
				req.login = function(user, cb) {
					return cb && cb();
				};

				var res = {
					status: function (status) {
						should(status).equal(400);

						return {
							json: function(info) {
								should.exist(info);
								should(info.type).equal('missing-credentials');

								done();
								return this;
							}
						};
					 },
				};

				userAuthenticationController.signin(req, res, function() {});
			});

			it('should fail with missing username', function(done) {
				var req = {
					body: {
						username: undefined,
						password: 'asdfasdf'
					}
				};
				req.login = function(user, cb) {
					return cb && cb();
				};

				var res = {
					status: function (status) {
						should(status).equal(400);

						return {
							json: function(info) {
								should.exist(info);
								should(info.type).equal('missing-credentials');

								done();
								return this;
							}
						};
					 },
				};

				userAuthenticationController.signin(req, res, function() {});
			});

			it('should fail with unknown user', function(done) {
				var req = {
					body: {
						username: 'totally doesnt exist',
						password: 'asdfasdf'
					}
				};
				req.login = function(user, cb) {
					return cb && cb();
				};

				var res = {
					status: function (status) {
						should(status).equal(401);

						return {
							json: function(info) {
								should.exist(info);
								should(info.type).equal('invalid-credentials');

								done();
								return this;
							}
						};
					 },
				};

				userAuthenticationController.signin(req, res, function() {});
			});

		}); // describe - login

	});



	describe('Proxy PKI Strategy', function() {

		// Specs for tests
		var spec = { cache: {}, user: {} };

		// Synced User/Cache Entry
		spec.cache.synced = cacheSpec('synced');
		spec.cache.synced.value.roles = ['role1', 'role2'];
		spec.cache.synced.value.groups = ['group1', 'group2'];
		spec.user.synced = proxyPkiUserSpec('synced');
		spec.user.synced.externalRoles = ['role1', 'role2'];
		spec.user.synced.externalGroups = ['group1', 'group2'];

		// Different user metadata in cache
		spec.cache.oldMd = cacheSpec('oldMd');
		spec.user.oldMd = proxyPkiUserSpec('oldMd');
		spec.cache.oldMd.value.name = 'New Name';
		spec.cache.oldMd.value.organization = 'New Organization';
		spec.cache.oldMd.value.email = 'New Email';

		// Different roles in cache
		spec.cache.differentRolesAndGroups = cacheSpec('differentRoles');
		spec.cache.differentRolesAndGroups.value.roles = ['role1', 'role2'];
		spec.cache.differentRolesAndGroups.value.groups = ['group1', 'group2'];
		spec.user.differentRolesAndGroups = proxyPkiUserSpec('differentRoles');
		spec.user.differentRolesAndGroups.externalRoles = ['role3', 'role4'];
		spec.user.differentRolesAndGroups.externalGroups = ['group3', 'group4'];

		// Missing from cache, no bypass
		spec.user.missingUser = proxyPkiUserSpec('missingUser');
		spec.user.missingUser.externalRoles = ['role1', 'role2'];
		spec.user.missingUser.externalGroups = ['group1', 'group2'];

		// Expired in cache, no bypass
		spec.user.expiredUser = proxyPkiUserSpec('expiredUser');
		spec.cache.expiredUser = cacheSpec('expiredUser');
		spec.cache.expiredUser.ts = Date.now() - 1000*60*60*48;
		spec.user.expiredUser.externalRoles = ['role1', 'role2'];
		spec.user.expiredUser.externalGroups = ['group1', 'group2'];

		// Missing from cache, with bypass
		spec.user.missingUserBypassed = proxyPkiUserSpec('missingUserBypassed');
		spec.user.missingUserBypassed.bypassAccessCheck = true;
		spec.user.missingUserBypassed.externalRoles = ['role1', 'role2'];
		spec.user.missingUserBypassed.externalGroups = ['group1', 'group2'];

		// Only in cache
		spec.cache.cacheOnly = cacheSpec('cacheOnly');
		spec.cache.cacheOnly.value.roles = ['role1', 'role2', 'role3'];
		spec.cache.cacheOnly.value.groups = ['group1', 'group2', 'group3'];

		var cache = {};
		var user = {};

		before(function(done) {
			clearDatabase().then(function() {
				var defers = [];

				_.keys(spec.cache).forEach(function(k) {
					var d = save(new CacheEntry(spec.cache[k])).then(function(e) {
						cache[k] = e;
					});
					defers.push(d);
				});

				_.keys(spec.user).forEach(function(k) {
					var d = save(new User(spec.user[k])).then(function(e) {
						user[k] = e;
					});
					defers.push(d);
				});

				q.all(defers).then(function(result) {
					// All of the data is loaded, so initialize proxy-pki
					config.auth.strategy = 'proxy-pki';
					config.auth.accessChecker = {
						provider: {
							file: 'app/access-checker/tests/server/providers/example-provider.server.service.js',
							config: {}
						}
					};
					proxyPki();

					done();
				}, done);

			}, done).done();
		});

		after(function(done) {
			clearDatabase().then(function() {
				done();
			}, done).done();
		});

		/**
		 * Test basic login where access checker isn't really involved.
		 * Granting access and denying access based on known/unknown dn
		 */
		describe('basic login', function() {

			var req = {};
			req.login = function(user, cb) { return cb && cb(); };

			it('should work when user is synced with access checker', function(done) {
				req.headers = { 'x-ssl-client-s-dn': spec.user.synced.providerData.dn };
				var res = {
					status: function (status) {
						should(status).equal(200);
						return {
							json: function(info) {
								should.exist(info);
								should(info.name).equal(spec.user.synced.name);
								should(info.organization).equal(spec.user.synced.organization);
								should(info.email).equal(spec.user.synced.email);
								should(info.username).equal(spec.user.synced.username);
								should.exist(info.externalRoles);
								(info.externalRoles).should.have.length(spec.user.synced.externalRoles.length);
								(info.externalRoles).should.containDeep(spec.user.synced.externalRoles);

								done();
								return this;
							}
						};
					}
				};

				userAuthenticationController.signin(req, res, function() {});
			});


			// No DN header
			it('should fail when there is no dn', function(done) {
				req.headers = {};
				var res = {
					status: function (status) {
						return {
							json: function(info) {
								should(info.type).equal('missing-credentials');
								should(status).equal(400);

								done();
								return this;
							}
						};
					}
				};

				userAuthenticationController.signin(req, res, function() {});
			});

			// Unknown DN header
			it('should fail when the dn is unknown and auto create is disabled', function(done) {
				config.auth.autoCreateAccounts = false;
				req.headers = { 'x-ssl-client-s-dn': 'unknown' };
				var res = {
					status: function (status) {
						return {
							json: function(info) {
								should(info.type).equal('invalid-credentials');
								should(status).equal(401);

								config.auth.autoCreateAccounts = true;

								done();
								return this;
							}
						};
					}
				};

				userAuthenticationController.signin(req, res, function() {});
			});

		});

		/**
		 * Test situations where access checking is more involved because the cache
		 * is not in sync with the user
		 */
		describe('syncing with access checker', function() {

			var req = {};
			req.login = function(user, cb) { return cb && cb(); };

			it('should update the user info from access checker on login', function(done) {
				req.headers = { 'x-ssl-client-s-dn': spec.user.oldMd.providerData.dn };
				var res = {
					status: function (status) {
						should(status).equal(200);
						return {
							json: function(info) {
								should.exist(info);
								should(info.name).equal(spec.cache.oldMd.value.name);
								should(info.organization).equal(spec.cache.oldMd.value.organization);
								should(info.email).equal(spec.cache.oldMd.value.email);
								should(info.username).equal(spec.cache.oldMd.value.username);

								done();
								return this;
							}
						};
					}
				};

				userAuthenticationController.signin(req, res, function() {});
			});

			it('should sync roles and groups from access checker on login', function(done) {
				req.headers = { 'x-ssl-client-s-dn': spec.user.differentRolesAndGroups.providerData.dn };
				var res = {
					status: function (status) {
						should(status).equal(200);
						return {
							json: function(info) {
								should.exist(info);
								should.exist(info.externalRoles);
								(info.externalRoles).should.containDeep(spec.cache.differentRolesAndGroups.value.roles);

								should.exist(info.externalGroups);
								(info.externalGroups).should.containDeep(spec.cache.differentRolesAndGroups.value.groups);

								done();
								return this;
							}
						};
					}
				};

				userAuthenticationController.signin(req, res, function() {});
			});
		});

		describe('missing or expired cache entries with no bypass', function() {
			var req = {};
			req.login = function(user, cb) { return cb && cb(); };

			it('should have external roles and groups removed on login when missing from cache', function(done) {
				req.headers = { 'x-ssl-client-s-dn': spec.user.missingUser.providerData.dn };
				var res = {
					status: function (status) {
						should(status).equal(200);
						return {
							json: function(info) {
								should.exist(info);
								should(info.name).equal(spec.user.missingUser.name);
								should(info.organization).equal(spec.user.missingUser.organization);
								should(info.email).equal(spec.user.missingUser.email);
								should(info.username).equal(spec.user.missingUser.username);

								should.exist(info.externalRoles);
								(info.externalRoles).should.have.length(0);

								should.exist(info.externalGroups);
								(info.externalGroups).should.have.length(0);

								done();
								return this;
							}
						};
					}
				};

				userAuthenticationController.signin(req, res, function() {});
			});


			it('should have external roles and groups removed on login when cache expired', function(done) {
				req.headers = { 'x-ssl-client-s-dn': spec.user.expiredUser.providerData.dn };
				var res = {
					status: function (status) {
						should(status).equal(200);
						return {
							json: function(info) {
								should.exist(info);
								should(info.name).equal(spec.user.expiredUser.name);
								should(info.organization).equal(spec.user.expiredUser.organization);
								should(info.email).equal(spec.user.expiredUser.email);
								should(info.username).equal(spec.user.expiredUser.username);

								should.exist(info.externalRoles);
								(info.externalRoles).should.have.length(0);

								should.exist(info.externalGroups);
								(info.externalGroups).should.have.length(0);

								done();
								return this;
							}
						};
					}
				};

				userAuthenticationController.signin(req, res, function() {});
			});

		});

		describe('missing cache entries with bypass access checker enabled', function() {
			var req = {};
			req.login = function(user, cb) { return cb && cb(); };

			it('should preserve user info, roles and groups on login', function(done) {
				req.headers = { 'x-ssl-client-s-dn': spec.user.missingUserBypassed.providerData.dn };
				var res = {
					status: function (status) {
						should(status).equal(200);
						return {
							json: function(info) {
								should.exist(info);
								should(info.name).equal(spec.user.missingUserBypassed.name);
								should(info.organization).equal(spec.user.missingUserBypassed.organization);
								should(info.email).equal(spec.user.missingUserBypassed.email);
								should(info.username).equal(spec.user.missingUserBypassed.username);
								should.exist(info.externalRoles);
								(info.externalRoles).should.have.length(spec.user.missingUserBypassed.externalRoles.length);
								should.exist(info.externalGroups);
								(info.externalGroups).should.have.length(spec.user.missingUserBypassed.externalGroups.length);

								done();
								return this;
							}
						};
					}
				};

				userAuthenticationController.signin(req, res, function() {});
			});

		});

		describe('auto create accounts', function() {
			var req = {};
			req.login = function(user, cb) { return cb && cb(); };

			it('should create a new account from access checker information', function(done) {
				req.headers = { 'x-ssl-client-s-dn': spec.cache.cacheOnly.key };
				var res = {
					status: function (status) {
						should(status).equal(200);
						return {
							json: function(info) {
								should.exist(info);
								should(info.name).equal(spec.cache.cacheOnly.value.name);
								should(info.organization).equal(spec.cache.cacheOnly.value.organization);
								should(info.email).equal(spec.cache.cacheOnly.value.email);
								should(info.username).equal(spec.cache.cacheOnly.value.username);
								should.exist(info.externalRoles);
								(info.externalRoles).should.containDeep(spec.cache.cacheOnly.value.roles);
								should.exist(info.externalGroups);
								(info.externalGroups).should.containDeep(spec.cache.cacheOnly.value.groups);

								done();
								return this;
							}
						};
					}
				};

				userAuthenticationController.signin(req, res, function() {});
			});
		});

	});
});
