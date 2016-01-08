'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	
	path = require('path'),
	q = require('q'),
	deps = require(path.resolve('./config/dependencies.js')),
	logger = deps.logger,
	dbs = deps.dbs,
	
	KafkaSocket = require(path.resolve('./app/util/server/sockets/kafka.server.socket.js'));

/**
 * Globals
 */


/**
 * Unit tests
 */
describe('Kafka Socket Controller Test:', function() {
	
	var ctrl;
	
	before(function(done) {
		
		// Mock out the subscribe and unsubscribe methods to do nothing
		var noOp = function() {};
		KafkaSocket.prototype.subscribe = noOp;
		KafkaSocket.prototype.unsubscribe = noOp;
		
		// Initialize
		ctrl = new KafkaSocket({
			socket: {}
		});
		done();
	});
	
	describe('Socket should be passed through to base', function() {
		
		it('base socket controller should have the socket object', function(done) {
			var s = ctrl.getSocket();
			should.exist(s);
			done();
		});
		
	});
	
	describe('default emit values should be default', function() {
		
		it('default emit message key', function(done) {
			var key = ctrl.getEmitMessageKey();
			should.not.exist(key);
			done();
		});
		
		it('default emit type', function(done) {
			var type = ctrl.getEmitType();
			type.should.equal('payload');
			done();
		});
		
	});

	after(function(done) {
		// Clean up
		done();
	});
});