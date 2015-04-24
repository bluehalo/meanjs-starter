'use static';

var path = require('path');

// Main config module
module.exports.config = require(path.resolve('./config/config'));

// Logging and Auditing
module.exports.logger = require(path.resolve('./config/lib/bunyan')).logger;
module.exports.auditLogger = require(path.resolve('./config/lib/bunyan')).auditLogger;

// STOMP
module.exports.stomp = require(path.resolve('./config/lib/stomp'));

// Core Controllers
module.exports.errorHandler = require(path.resolve('./app/core/server/controllers/errors.server.controller.js'));
module.exports.queryService = require(path.resolve('./app/util/server/services/query.server.service.js'));
module.exports.utilService = require(path.resolve('./app/util/server/services/util.server.service.js'));
