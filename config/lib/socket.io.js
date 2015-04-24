'use strict';

// Load the module dependencies
var config = require('../config'),
	logger = require('./bunyan').logger,
	stomp = require('./stomp'),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	passport = require('passport'),
	socketio = require('socket.io'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),
	http = require('http');


function onConnect(socket) {
	logger.info('SocketIO: New client connection');

	var state;

	/**
	 * Basic Functionality
	 */

	// Unsubscribe to topic
	var unsubscribe = function(){
		// Unsubscribe from the state's topic
		logger.info('SocketIO: Unsubscribing from topic: ' + state.topic);
		state.unsubscribe();
		state = undefined;
	};

	// Subscribe to topic
	var subscribe = function(topic){
		if(null != topic){
			// subscribe to the subscription topic
			stomp.getClient().then(function(client){
				logger.info('SocketIO: Subscribing to topic: ' + topic);
				var s = client.subscribe(topic, stompPayloadHandler);
				state = { topic: topic, unsubscribe: s.unsubscribe };
			});
		}

		return topic;
	};

	/**
	 * Server Handlers
	 */
	function stompPayloadHandler(payload) {
		//logger.info('SocketIO: Received Stomp Payload');
		if(null != payload && null != payload.body) {
			try {
				socket.emit('payload', JSON.parse(payload.body));
			} catch(e) {
				logger.error({err: e, msg: payload.body }, 'Error parsing JSON payload body.');
			}
		}
	}
	function stompDisconnectHandler() {
		logger.info('SocketIO: Received Stomp disconnect notification.');
		if(null != state) {
			// Resubscribe to the topic
			subscribe(state.topic);
		}
	}
	function stompFailureHandler(error) {
		logger.info('SocketIO: Received Stomp connection failure notification.');
	}

	/**
	 * Client Handlers
	 */
	function clientUnsubscribeHandler() {
		logger.info('SocketIO: Received client unsubscribe request');

		if(null != state){
			unsubscribe();
		}
		state = undefined;
	}

	function clientSubscribeHandler(payload) {
		logger.info('SocketIO: Received client subscribe request');

		// If a subscription exists, than unsubscribe
		if(null != state){
			unsubscribe();
		}
		state = undefined;

		// Subscribe to the new subscription
		subscribe('/topic/topicname');
	}

	function clientDisconnectHandler() {
		logger.info('SocketIO: Lost connection to client.');

		// If a subscription exists, unsubscribe
		if(null != state) {
			unsubscribe();
		}
		state = undefined;

		// Remove the reconnect listener
		stomp.events.removeListener('disconnect', stompDisconnectHandler);
	}


	/**
	 * Listener setup
	 */
	socket.on('subscription:subscribe', clientSubscribeHandler);
	socket.on('subscription:unsubscribe', clientUnsubscribeHandler);
	socket.on('disconnect', clientDisconnectHandler);

	// Register for stomp reconnect events
	stomp.events.on('disconnect', stompDisconnectHandler);
}


// Define the Socket.io configuration method
module.exports = function(app, db) {

	// Create a new HTTP server
	logger.info('Creating HTTP Server');
	var server = http.createServer(app);

	// Create a new Socket.io server
	logger.info('Creating SocketIO Server');
	var io = socketio.listen(server);

	// Create a MongoDB storage object
	var mongoStore = new MongoStore({
		db: db.connection.db,
		collection: config.auth.sessionCollection
	});

	// Intercept Socket.io's handshake request
	io.use(function(socket, next) {
		// Use the 'cookie-parser' module to parse the request cookies
		cookieParser(config.auth.sessionSecret)(socket.request, {}, function(err) {
			// Get the session id from the request cookies
			var sessionId = socket.request.signedCookies['connect.sid'];

			// Use the mongoStorage instance to get the Express session information
			mongoStore.get(sessionId, function(err, session) {
				// Set the Socket.io session information
				socket.request.session = session;

				// Use Passport to populate the user details
				passport.initialize()(socket.request, {}, function() {
					passport.session()(socket.request, {}, function() {
						if (socket.request.user) {
							next(null, true);
						} else {
							next(new Error('User is not authenticated'), false);
						}
					});
				});
			});
		});
	});

	// Add an event listener to the 'connection' event
	io.on('connection', onConnect);

	return server;
};