'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	Group = mongoose.model('Group');

/**
 * Globals
 */
var group, group2;

/**
 * Unit tests
 */
describe('Group Model Unit Tests:', function() {
	before(function(done) {
		group = new Group({
			title: 'Title',
			description: 'Description'
		});
		group2 = new Group({
			title: 'Title 2',
			description: 'Description 2'
		});

		done();
	});

	describe('Method Save', function() {
		it('should begin with no groups', function(done) {
			Group.find({}, function(err, groups) {
				groups.should.have.length(0);
				done();
			});
		});

		it('should be able to save without problems', function(done) {
			group.save(done);
		});

		it('should be able to show an error when try to save without a title', function(done) {
			group.title = '';
			return group.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	after(function(done) {
		Group.remove().exec();
		done();
	});
});