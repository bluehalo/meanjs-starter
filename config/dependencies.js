'use static';

var path = require('path');

// Main config module
module.exports.config = require(path.resolve('./config/config'));

// Logging and Auditing
module.exports.logger = require(path.resolve('./config/lib/bunyan')).logger;
module.exports.auditLogger = require(path.resolve('./config/lib/bunyan')).auditLogger;

// Access to the MongoDB db objects
module.exports.dbs = require(path.resolve('./config/lib/mongoose')).dbs;

// Kafka
//module.exports.kafkaProducer = require(path.resolve('./config/lib/kafka-producer'));
//module.exports.kafkaConsumer = require(path.resolve('./config/lib/kafka-consumer'));

// Socket IO
module.exports.socketIO = require(path.resolve('./config/lib/socket.io'));

// Core Controllers
module.exports.auditService = require(path.resolve('./app/audit/server/services/audit.server.service.js'));
module.exports.errorHandler = require(path.resolve('./app/core/server/controllers/errors.server.controller.js'));
module.exports.queryService = require(path.resolve('./app/util/server/services/query.server.service.js'));
module.exports.utilService = require(path.resolve('./app/util/server/services/util.server.service.js'));
module.exports.schemaService = require(path.resolve('./app/util/server/services/schema.server.service.js'));
module.exports.csvStream = require(path.resolve('./app/util/server/services/csv-stream.server.service.js'));
module.exports.delayedStream = require(path.resolve('./app/util/server/services/delayed-stream.server.service.js'));
