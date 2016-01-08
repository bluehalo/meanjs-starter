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
	auditService = require(path.resolve('./app/audit/server/services/audit.server.service.js'));

/**
 * Globals
 */
function clearDatabase() {
	return Audit.remove().exec();
}

//mongoose.set('debug', true);

/**
 * Unit tests
 */
describe('Audit Creation Test:', function() {

	var startTimestamp;
	before(function(done){
		clearDatabase().then(function() {
			var now = Date.now();
			startTimestamp = now - (now % 1000); // remove milliseconds

			done();
		}, done);
	});

	after(function(done) {
		clearDatabase().then(function() {
			done();
		}, done);
	});

	describe('Create new Audit entry', function() {

		it('should begin with no audits', function(done) {
			Audit.find({}).exec().then(function(results) {
				results.should.have.length(0);
				done();
			}, done);
		});

		it('should be able to create a new audit through the service', function(done) {
			auditService.audit('some message', 'eventType', 'eventAction', 'eventActor', 'eventObject').then(function() {
				done();
			}, done);
		});

		it('should have one audit entry', function(done) {
			Audit.find({}).exec().then(function(results) {
				results.should.have.length(1);
				/*
				 * Audit's created date should be after the unit tests started,
				 * but may be the same time since ISO Date strips off the milliseconds,
				 * so we'll remove 1 from the zero'ed milliseconds of the startTimestamp
				 */
				results[0].created.should.be.above(startTimestamp - 1);
				results[0].message.should.equal('some message');
				results[0].audit.auditType.should.equal('eventType');
				results[0].audit.action.should.equal('eventAction');
				results[0].audit.actor.should.equal('eventActor');
				results[0].audit.object.should.equal('eventObject');
				done();
			}, done);
		});

		it('should have one distinct action', function(done) {
			Audit.distinct('audit.action', {}).exec().then(function(results) {
				results.length.should.equal(1);
				results[0].should.equal('eventAction');
				done();
			}, done);
		});

	});

});
