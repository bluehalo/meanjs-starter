'use strict';

var stomp = require('stompjs'),
	q = require('q'),
	events = require('events'),
	emitter = new events.EventEmitter(),
	config = require('../config'),
	logger = require('./bunyan').logger;

var retryMs = 3000;
var state = 'connecting';
var client;

function doConnect() {
	state = 'connecting';

	// try to connect
	client = stomp.overTCP(config.mq.server, config.mq.port);
	client.connect(config.mq.username, config.mq.password, function() {

		// on success, callback
		state = 'connected';
		logger.info('Stomp: Connected to remote message service.');

		// Fire connect event
		emitter.emit('connect', client);

	}, function(error) {

		logger.info(error, 'Stomp: Connection failed.');

		// Clear the client state
		var oldState = state;
		state = 'disconnected';

		// If we were connected, fire a disconnect event
		if(oldState === 'connected') {
			emitter.emit('disconnect');
		}

		// If we aren't already reconnecting, reconnect (we get duplicate failures for some reason)
		if(oldState !== 'reconnecting') {
			// on failure, try to connect again
			state = 'reconnecting';

			logger.info(error, 'Stomp: Attempting reconnect in ' + retryMs + ' ms...');
			setTimeout(doConnect, retryMs);
		}

	});
}

// Export API
module.exports.getClient = function(){
	var defer = q.defer();

	if(state === 'connected') {
		// If it is already connected, we will resolve immediately
		defer.resolve(client);
	} else {
		// If it is not connected, we will register for the connect event and resolve on that
		emitter.once('connect', function(client){
			defer.resolve(client);
		});
	}

	return defer.promise;
};

// Two events: connect, and fail
module.exports.events = emitter;

module.exports.init = function() {
	//Initial connection
	logger.info('Stomp: Intializing connection...');
	doConnect();
};