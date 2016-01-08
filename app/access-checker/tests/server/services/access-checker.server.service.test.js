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

	accessChecker = require(path.resolve('app/access-checker/server/services/access-checker.server.service.js'));



/**
 * Helpers
 */
function clearDatabase() {
	return q.all([
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

function cacheSpec(key) {
	return {
		key: key.toLowerCase(),
		value: {
			name: key + ' Name',
			organization: key + ' Organization',
			email: key + '@mail.com',
			username: key + '_username',
			roles: ['role1', 'role2'],
			groups: ['group1', 'group2']
		}
	};
}

function providerSpec(key) {
	return {
		name: key + ' Name',
		organization: key + ' Organization',
		email: key + '@mail.com',
		username: key + '_username',
		roles: ['role1', 'role2'],
		groups: ['group1', 'group2']
	};
}

/**
 * Unit tests
 */
describe('Access Checker:', function() {

	// Specs for tests
	var spec = { cache: {} };
	var provider = {};

	// Cache and provider agree, entry is current
	spec.cache.good = cacheSpec('good');
	provider.good = providerSpec('good');

	// Cache and provider disagree, entry is expired
	spec.cache.expired = cacheSpec('expired');
	spec.cache.expired.ts = Date.now() - 1000*60*60*24*10;
	provider.expired = providerSpec('expirednew');

	// Cache and provider disagree, entry id not expired
	spec.cache.outdated = cacheSpec('outdated');
	spec.cache.outdated.ts = Date.now() - 1000*60*60*24*10;
	provider.outdated = providerSpec('outdatednew');

	// Cache has entry that is now missing from provider
	spec.cache.cacheonly = cacheSpec('cacheonly');

	// Entry is only in the provider
	provider.provideronly = providerSpec('provideronly');

	var cache = {};

	before(function(done) {
		clearDatabase().then(function() {
			var defers = [];

			_.keys(spec.cache).forEach(function(k) {
				var d = save(new CacheEntry(spec.cache[k])).then(function(e) {
					cache[k] = e;
				});
				defers.push(d);
			});

			q.all(defers).then(function(result) {
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
	 * Test functionality with the access checker provider fails
	 */
	describe('Broken Access Checker', function() {

		before(function(done) {
			// All of the data is loaded, so initialize proxy-pki
			config.auth.accessChecker = {
				provider: {
					file: 'app/access-checker/tests/server/providers/failure-provider.server.service.js',
					config: {}
				}
			};

			done();
		});

		// Provider fails on get
		it('should not update the cache when the access checker provider fails', function(done) {
			accessChecker.get('provideronly').then(function(result) {
				should.fail('Fail provider should throw an error');
			}, function(err) {
				// Should have errored
				should.exist(err);
				CacheEntry.findOne({ key: 'provideronly' }, function(err, result) {
					should.not.exist(result);
					done();
				});
			}).done();
		});

		// Provider fails on refresh attempt
		it('should not update the cache on refresh when the access checker provider fails', function(done) {
			accessChecker.refreshEntry(spec.cache.outdated.key).then(function(result) {
				should.fail('Fail provider should throw an error');
			}, function(err) {
				// Should have errored
				should.exist(err);

				// Query for the cache object and verify it hasn't been updated
				CacheEntry.findOne({ _id: cache.outdated._id }, function(err, result) {
					should.exist(result);
					should(result.value.name).equal(spec.cache.outdated.value.name);
					should(result.value.organization).equal(spec.cache.outdated.value.organization);
					should(result.value.email).equal(spec.cache.outdated.value.email);
					should(result.value.username).equal(spec.cache.outdated.value.username);

					should.exist(result.value.roles);
					(result.value.roles).should.containDeep(spec.cache.outdated.value.roles);

					should.exist(result.value.groups);
					(result.value.groups).should.containDeep(spec.cache.outdated.value.groups);

					done();
				});

			}).done();
		});

	});

	
	/**
	 * Test basic functionality of a working provider
	 */
	describe('Working Access Checker', function() {

		before(function(done) {
			// All of the data is loaded, so initialize proxy-pki
			config.auth.accessChecker = {
				provider: {
					file: 'app/access-checker/tests/server/providers/example-provider.server.service.js',
					config: provider
				}
			};

			done();
		});

		// Pull from cache
		it('should do nothing when the key is null', function(done) {
			// should return the info from the cache
			accessChecker.get(null).then(function(info) {
				should.fail('Should error when key is null');
			}, function(err) {
				should.exist(err);
				done();
			}).done();
		});

		// Pull from cache
		it('should pull from cache when the entry is current and present', function(done) {
			// should return the info from the cache
			accessChecker.get(spec.cache.good.key).then(function(info) {
				should.exist(info);
				should(info.name).equal(spec.cache.good.value.name);
				should(info.organization).equal(spec.cache.good.value.organization);
				should(info.email).equal(spec.cache.good.value.email);
				should(info.username).equal(spec.cache.good.value.username);

				should.exist(info.roles);
				(info.roles).should.containDeep(spec.cache.good.value.roles);

				should.exist(info.groups);
				(info.groups).should.containDeep(spec.cache.good.value.groups);

				done();
			}, function(err) {
				should.fail(err);
			}).done();
		});

		// Pull from provider
		it('should pull from provider and update cache when entry is expired', function(done) {
			// should return the info from the provider
			accessChecker.get(spec.cache.expired.key).then(function(info) {
				should.exist(info);
				should(info.name).equal(provider.expired.name);
				should(info.organization).equal(provider.expired.organization);
				should(info.email).equal(provider.expired.email);
				should(info.username).equal(provider.expired.username);

				should.exist(info.roles);
				(info.roles).should.containDeep(provider.expired.roles);

				should.exist(info.groups);
				(info.groups).should.containDeep(provider.expired.groups);

				CacheEntry.findOne({ key: cache.expired.key }, function(err, result) {
					should.exist(result);
					should(result.value.name).equal(provider.expired.name);
					should(result.value.organization).equal(provider.expired.organization);
					should(result.value.email).equal(provider.expired.email);
					should(result.value.username).equal(provider.expired.username);

					should.exist(result.value.roles);
					(result.value.roles).should.containDeep(provider.expired.roles);

					should.exist(result.value.groups);
					(result.value.groups).should.containDeep(provider.expired.groups);

					done();
				});
			}, function(err) {
				should.fail(err);
			}).done();
		});

		// Cache only
		it('should return the cache entry if the entry is missing from the provider', function(done) {
			// should return the info from the cache
			accessChecker.get(spec.cache.cacheonly.key).then(function(info) {
				should.exist(info);
				should(info.name).equal(spec.cache.cacheonly.value.name);
				should(info.organization).equal(spec.cache.cacheonly.value.organization);
				should(info.email).equal(spec.cache.cacheonly.value.email);
				should(info.username).equal(spec.cache.cacheonly.value.username);

				should.exist(info.roles);
				(info.roles).should.containDeep(spec.cache.cacheonly.value.roles);

				should.exist(info.groups);
				(info.groups).should.containDeep(spec.cache.cacheonly.value.groups);

				CacheEntry.findOne({ key: cache.cacheonly.key }, function(err, result) {
					should.exist(result);
					should(result.value.name).equal(spec.cache.cacheonly.value.name);
					should(result.value.organization).equal(spec.cache.cacheonly.value.organization);
					should(result.value.email).equal(spec.cache.cacheonly.value.email);
					should(result.value.username).equal(spec.cache.cacheonly.value.username);

					should.exist(result.value.roles);
					(result.value.roles).should.containDeep(spec.cache.cacheonly.value.roles);

					should.exist(result.value.groups);
					(result.value.groups).should.containDeep(spec.cache.cacheonly.value.groups);

					done();
				});
			}, function(err) {
				should.fail(err);
			}).done();
		});

		// Provider only
		it('should update the cache when pulling from the provider', function(done) {
			// should return the info from the cache
			accessChecker.get('provideronly').then(function(info) {
				should.exist(info);
				should(info.name).equal(provider.provideronly.name);
				should(info.organization).equal(provider.provideronly.organization);
				should(info.email).equal(provider.provideronly.email);
				should(info.username).equal(provider.provideronly.username);

				should.exist(info.roles);
				(info.roles).should.containDeep(provider.provideronly.roles);

				should.exist(info.groups);
				(info.groups).should.containDeep(provider.provideronly.groups);

				CacheEntry.findOne({ key: 'provideronly' }, function(err, result) {
					should.exist(result);
					should(result.value.name).equal(provider.provideronly.name);
					should(result.value.organization).equal(provider.provideronly.organization);
					should(result.value.email).equal(provider.provideronly.email);
					should(result.value.username).equal(provider.provideronly.username);

					should.exist(result.value.roles);
					(result.value.roles).should.containDeep(provider.provideronly.roles);

					should.exist(result.value.groups);
					(result.value.groups).should.containDeep(provider.provideronly.groups);

					done();
				});
			}, function(err) {
				should.fail(err);
			}).done();
		});
	});

});
