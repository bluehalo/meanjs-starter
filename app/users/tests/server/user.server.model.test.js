'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	q = require('q'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	path = require('path'),
	deps = require(path.resolve('./config/dependencies.js')),
	logger = deps.logger;

/**
 * Globals
 */
var spec = {
	user1: {
		name: 'User 1',
		email: 'user1@mail.com',
		username: 'user1',
		password: 'password',
		provider: 'local',
		organization: 'Org 1'
	}, user2: {
		name: 'User 2',
		email: 'user2@mail.com',
		username: 'user2',
		password: 'password',
		provider: 'local',
		organization: 'Org 2'
	}
};
var user, user1, user2,
	stormPayloads;


/**
 * Unit tests
 */
describe('User Model Unit Tests:', function() {
	before(function(done) {
		user = new User(spec.user1);
		user1 = new User(spec.user1);
		user2 = new User(spec.user2);

		done();
	});

	// Testing basic save/retrieve
	describe('Method Save', function() {
		it('should begin with no users', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(0);
				done();
			});
		});

		it('should be able to save without problems', function(done) {
			user.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should now have 1 user', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(1);
				done();
			});
		});

		it('should fail to save an existing user again', function(done) {
			user1.save(function(err){
				should.exist(err);
				done();
			});
		});

		it('should be able to save two different users', function(done) {
			user2.save(function(err){
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a name', function(done) {
			user.name = '';
			user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should now have 2 users', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(2);
				done();
			});
		});
	});

	after(function(done) {
		User.remove().exec().then(function(results) {
			done();
		}, done /* error */);
	});
});