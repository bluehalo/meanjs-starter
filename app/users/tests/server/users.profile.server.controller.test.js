'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	q = require('q'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Audit = mongoose.model('Audit'),
	path = require('path'),
	deps = require(path.resolve('./config/dependencies.js')),
	logger = deps.logger,

	userProfileController = require(path.resolve('app/users/server/controllers/users/users.profile.server.controller.js'));

/**
 * Globals
 */
var spec = {
	user1: {
		_id: mongoose.Types.ObjectId(),
		name: 'User 1',
		email: 'user1@mail.com',
		username: 'user1',
		password: 'password',
		provider: 'local',
		organization: 'Org 1'
	}, user2: {
		_id: mongoose.Types.ObjectId(),
		name: 'User 2',
		email: 'user2@mail.com',
		username: 'user2',
		password: 'password',
		provider: 'local',
		organization: 'Org 2'
	}, user3: {
		_id: mongoose.Types.ObjectId(),
		name: 'User 3',
		email: 'user3@mail.com',
		username: 'user3',
		password: 'password',
		provider: 'local',
		organization: 'Org 3'
	}
};
var user, user1, user2, user3;

var getAllQuery = function() {
	return {
		body: {
			q: '',
			s: ''
		},
		query: {
			page: 0,
			size: 10,
			sort: null,
			dir: null
		}
	};
};

var getResponsePromise = function(response) {
	var defer = q.defer();
	response.jsonp = function(results) {
		defer.resolve(results);
	};
	response.status = function(statusCode) {
		return {
			json: function(obj) {
				logger.info('Sending Status: %s with Message: %s', statusCode, obj.message);
				defer.reject(obj.message);
			}
		};
	};
	return defer.promise;
};

/**
 * Unit tests
 */
describe('User Profile Controller Unit Tests:', function() {
	before(function(done) {
		user = new User(spec.user1);
		user1 = new User(spec.user1);
		user2 = new User(spec.user2);
		user3 = new User(spec.user3);

		done();
	});

	// Testing basic save/retrieve
	describe('User Create and Search', function() {
		it('should begin with no users', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(0);
				done();
			});
		});

		it('search should return no users', function(done) {
			var req = getAllQuery();
			var res = {};

			// execute the call
			userProfileController.searchUsers(req, res);

			// wait for the jsonp response, then test the results
			getResponsePromise(res).then(function(results) {
				results.elements.should.have.length(0);
				done();
			});
		});

		it('should be able to save a new user', function(done) {
			user.save(done);
		});

		it('should now have 1 user in database', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(1);
				done();
			});
		});

		it('search should return one new user', function(done) {
			var req = getAllQuery();
			var res = {};

			// execute the call
			userProfileController.searchUsers(req, res);

			// wait for the jsonp response, then test the results
			getResponsePromise(res).then(function(results) {
				results.elements.should.have.length(1);
				var userResult = results.elements[0];
				userResult.name.should.equal('User 1');
				userResult.username.should.equal('user1');
				done();
			});
		});

		it('should be able to save a second new user', function(done) {
			user2.save(done);
		});

		it('should now have 2 users in database', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(2);
				done();
			});
		});

		it('search should return two users', function(done) {
			var req = getAllQuery();
			var res = {};

			// execute the call
			userProfileController.searchUsers(req, res);

			// wait for the jsonp response, then test the results
			getResponsePromise(res).then(function(results) {

				results.elements.should.have.length(2);

				// Verify first result
				var userResult01 = results.elements[0];
				userResult01.name.should.equal('User 1');
				userResult01.username.should.equal('user1');

				// Verify second result
				var userResult02 = results.elements[1];
				userResult02.name.should.equal('User 2');
				userResult02.username.should.equal('user2');
				done();
			});
		});

		it('should be able to save a third new user', function(done) {
			user3.save(done);
		});

		it('should now have 3 users in database', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(3);
				done();
			});
		});

		it('search should return three users', function(done) {
			var req = getAllQuery();
			var res = {};

			// execute the call
			userProfileController.searchUsers(req, res);

			// wait for the jsonp response, then test the results
			getResponsePromise(res).then(function(results) {

				results.elements.should.have.length(3);

				// Verify first result
				var userResult01 = results.elements[0];
				userResult01.name.should.equal('User 1');
				userResult01.username.should.equal('user1');

				// Verify second result
				var userResult02 = results.elements[1];
				userResult02.name.should.equal('User 2');
				userResult02.username.should.equal('user2');

				// Verify third result
				var userResult03 = results.elements[2];
				userResult03.name.should.equal('User 3');
				userResult03.username.should.equal('user3');

				done();
			});
		});

		it('should fail to save an existing user again', function(done) {
			user1.save(function(err){
				should.exist(err);
				done();
			});
		});

		it('search for page 0 with size 2', function(done) {
			var req = {
				body: {
					q: '',
					s: ''
				},
				query: {
					page: 0,
					size: 2,
					sort: null,
					dir: null
				}
			};
			var res = {};

			// execute the call
			userProfileController.searchUsers(req, res);

			// wait for the jsonp response, then test the results
			getResponsePromise(res).then(function(results) {

				results.elements.should.have.length(2);

				// Verify first result
				var userResult01 = results.elements[0];
				userResult01.name.should.equal('User 1');
				userResult01.username.should.equal('user1');

				// Verify second result
				var userResult02 = results.elements[1];
				userResult02.name.should.equal('User 2');
				userResult02.username.should.equal('user2');

				done();
			});
		});

	});
	
	describe('Admin User GetAll Usernames', function() {
		
		it('should now have 3 users in database', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(3);
				done();
			});
		});
		
		it('getting all usernames should return the 3 expected', function(done) {
			var req = {
				body: { field: 'username', query: {}},
				query: {}
			};
			var res = {};
			var promise = getResponsePromise(res);
			
			userProfileController.adminGetAll(req, res);
			
			promise.then(function(results) {
				logger.info('Results: ' + JSON.stringify(results));
				results.should.have.length(3);
				results[0].should.equal('user1');
				results[1].should.equal('user2');
				results[2].should.equal('user3');
				done();
			});
		});

		it('getting one username should return the 1 expected', function(done) {
			var req = {
				body: { field: 'username', query: {username: 'user1'}},
				query: {}
			};
			var res = {};
			var promise = getResponsePromise(res);

			userProfileController.adminGetAll(req, res);

			promise.then(function(results) {
				logger.info('Results: ' + JSON.stringify(results));
				results.should.have.length(1);
				results[0].should.equal('user1');
				done();
			});
		});

		it('getting one _id should return the 1 expected', function(done) {
			var req = {
				body: { field: 'username', query: { _id: { $obj: spec.user1._id.toString() } }},
				query: {}
			};
			var res = {};
			var promise = getResponsePromise(res);

			userProfileController.adminGetAll(req, res);

			promise.then(function(results) {
				logger.info('Results: ' + JSON.stringify(results));
				results.should.have.length(1);
				results[0].should.equal('user1');
				done();
			});
		});
		
	});

	describe('canEditProfile', function() {

		it('local auth and undef bypass should be able to edit', function(done) {
			var user = { };

			var result = userProfileController.canEditProfile('local', user);

			result.should.equal(true);
			done();
		});

		it('local auth and no bypass should be able to edit', function(done) {
			var user = { bypassAccessCheck: false };

			var result = userProfileController.canEditProfile('local', user);

			result.should.equal(true);
			done();
		});

		it('local auth and bypass should be able to edit', function(done) {
			var user = { bypassAccessCheck: true };

			var result = userProfileController.canEditProfile('local', user);

			result.should.equal(true);
			done();
		});

		it('proxy-pki auth and undef bypass should not be able to edit', function(done) {
			var user = { };

			var result = userProfileController.canEditProfile('proxy-pki', user);

			result.should.equal(false);
			done();
		});

		it('proxy-pki auth and no bypass should not be able to edit', function(done) {
			var user = { bypassAccessCheck: false };

			var result = userProfileController.canEditProfile('proxy-pki', user);

			result.should.equal(false);
			done();
		});

		it('proxy-pki auth and bypass should be able to edit', function(done) {
			var user = { bypassAccessCheck: true };

			var result = userProfileController.canEditProfile('proxy-pki', user);

			result.should.equal(true);
			done();
		});

	});

	after(function(done) {
		q.all([ User.remove().exec(), Audit.remove().exec() ]).then(function(results) {
			done();
		}, done /* error */);
	});
});