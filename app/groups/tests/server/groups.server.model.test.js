'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),
	should = require('should'),

	deps = require(path.resolve('./config/dependencies.js')),
	dbs = deps.dbs,

	Audit = dbs.admin.model('Audit'),
	Group = dbs.admin.model('Group'),
	User = dbs.admin.model('User'),
	groups = require(path.resolve('./app/groups/server/controllers/groups.server.controller.js'));

/**
 * Globals
 */
function clearDatabase() {
	return q.all([
		Audit.remove().exec(),
		Group.remove().exec(),
		User.remove().exec()
	]);
}

var group1, group2, group3, group4;

var spec = {
	user1: {
		name: 'User 1',
		email: 'user1@mail.com',
		username: 'user1',
		password: 'password',
		provider: 'local',
	},
	group1: {
		title: 'Title',
		description: 'Description'
	},
	group2: {
		title: 'Title 2',
		description: 'Description 2'
	},
	group3: {
		title: 'Title 3',
		description: 'Description 3'
	},
	group4: {
		title: 'Title 4',
		description: 'Description 4'
	}
};

/**
 * Unit tests
 */
describe('Group Model Unit Tests:', function() {
	before(function(done) {
		clearDatabase().then(function() {
			group1 = new Group(spec.group1);
			group2 = new Group(spec.group2);
			group3 = new Group(spec.group3);
			group4 = new Group(spec.group4);
			done();
		}, done).done();
	});

	after(function(done) {
		clearDatabase().then(function() {
			done();
		}, done).done();
	});

	describe('Method Save', function() {
		it('should begin with no groups', function(done) {
			Group.find({}).exec().then(function(groups) {
				groups.should.have.length(0);
				done();
			}, done);
		});

		it('should be able to save without problems', function(done) {
			group1.save(done);
		});

		it('should be able to show an error when try to save without a title', function(done) {
			group1.title = '';
			group1.save(function(err) {
				should.exist(err);
				done();
			});
		});

	});

	describe('User group permissions', function() {
		var user1 = new User(spec.user1);

		it('should begin with no users', function(done) {
			User.find({}).exec().then(function(users) {
				users.should.have.length(0);
				done();
			}, done);
		});

		it('should create groups without problems', function(done) {
			group1.title = spec.group1.title;
			group1.save(function(err) {
				should.not.exist(err);
				should.exist(group1._id);
			});
			group2.save(function(err) {
				should.not.exist(err);
				should.exist(group2._id);
			});
			group3.save(function(err) {
				should.not.exist(err);
				should.exist(group3._id);
			});
			group4.save(function(err) {
				should.not.exist(err);
				should.exist(group4._id);
			});
			done();
		});

		it ('should associate group editing with user 1', function(done) {
			user1.groups = [];
			user1.groups.push({ _id: group1.id });
			user1.groups.push({ _id: group2.id, roles: { editor: true } });
			user1.groups.push({ _id: group3.id, roles: { editor: true, admin: true } });

			var groupIds = groups.getGroupIds(user1);
			var editorGroupIds = groups.getEditGroupIds(user1);
			var adminGroupIds = groups.getAdminGroupIds(user1);

			groupIds.should.have.length(3);
			editorGroupIds.should.have.length(2);
			adminGroupIds.should.have.length(1);
			done();
		});

		it ('should filter groupIds', function(done) {
			var groupIds1 = groups.filterGroupIds(user1, [ group1.id ]);
			groupIds1.should.have.length(1);
			groupIds1[0].should.equal(group1.id);

			var groupIds2 = groups.filterGroupIds(user1, [ group1.id, group2.id, group4.id ]);
			groupIds2.should.have.length(2);
			groupIds2[0].should.equal(group1.id);
			groupIds2[1].should.equal(group2.id);

			// Try it with a group the user has no access to.
			var groupIds3 = groups.filterGroupIds(user1, [ group4.id ]);
			groupIds3.should.have.length(0);

			// Try it without any explicit group filters.  We should get all the user's groups.
			var groupIds4 = groups.filterGroupIds(user1);
			groupIds4.should.have.length(3);
			groupIds4[0].should.equal(group1.id);
			groupIds4[1].should.equal(group2.id);
			groupIds4[2].should.equal(group3.id);

			done();
		});
	});
});