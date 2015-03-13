'use strict';

var path = require('path'),
	deps = require(path.resolve('./config/dependencies.js')),
	errorHandler = deps.errorHandler;

exports.catchError = function(res, err, callback) {
	if (err) {
		return this.send400Error(res, err);
	} else if (null != callback) {
		callback();
	}
};

exports.send400Error = function (res, err) {
	return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	});
};

exports.send403Error = function (res) {
	return res.status(403).send({
		message: 'User is not authorized'
	});
};