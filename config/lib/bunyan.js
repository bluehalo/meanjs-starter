'use strict';

var config = require('../config'),
	bunyan = require('bunyan'),
	logstash = require('bunyan-logstash');

function stdoutStream() {
	return {
		level: 'debug',
		stream: process.stdout
	};
}

function streams() {
	var strs = [stdoutStream()];

	if (null != config.log && null != config.log.application) {
		var appLog = config.log.application;

		//add log file if configured
		if (null != appLog.file) {
			console.log('Configuring logger to use file: ' + appLog.file);

			strs.push({
				type: 'rotating-file',
				level: 'info',
				path: appLog.file,
				period: '1d',	// daily rotation
				count: 4		// keep 3 back copies
			});
		}

		if (null != appLog.logstash) {
			strs.push({
				type: 'raw',
				level: 'info',
				stream: logstash.createStream({
					host: appLog.logstash.host,
					port: appLog.logstash.port
				})
			});
		}
	}

	return strs;
}

function auditStreams() {
	var strs = [stdoutStream()];

	if (null != config.log && null != config.log.audit) {
		var auditLog = config.log.audit;

		if (null != auditLog.file) {
			console.log('Configuring audit logger to use file: ' + auditLog.file);

			strs.push({
				type: 'rotating-file',
				level: 'info',
				path: auditLog.file,
				period: '1d',	// Rotation period
				count: 4		// Number of files to keep
			});
		}

		if (null != auditLog.logstash) {
			strs.push({
				type: 'raw',
				level: 'info',
				stream: logstash.createStream({
					host: auditLog.logstash.host,
					port: auditLog.logstash.port
				})
			});
		}
	}

	return strs;
}

function reqSerializer(req) {
	var output = bunyan.stdSerializers.req(req);
	output.user = req.session.passport.user;

	return output;
}

var logger = bunyan.createLogger({
	name: 'wildfire',
	streams: streams(),
	serializers: {
		req: reqSerializer,
		err: bunyan.stdSerializers.err
	}
});

var auditLogger = bunyan.createLogger({
	name: 'audit',
	streams: auditStreams(),
	serializers: {
		req: reqSerializer,
		err: bunyan.stdSerializers.err
	}
});

module.exports.logger = logger;
module.exports.auditLogger = {
	audit: function(message, eventType, eventAction, eventActor, eventObject) {
		var a = { 
			audit: { 
				type: eventType,
				action: eventAction,
				actor: eventActor,
				object: eventObject
			}
		};
	
		auditLogger.info(a, message);
	}
};
