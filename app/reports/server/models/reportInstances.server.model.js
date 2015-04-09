'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	query = deps.queryService,
	logger = deps.logger;


/**
 * Helper Methods
 */
function validateNonEmpty(property) {
	return (null != property && property.length > 0);
}


/**
 * Schema Declaration
 */
var ReportInstanceSchema = new Schema({
	report: {
		type: Schema.ObjectId,
		ref: 'Report'
	},
	started: {
		type: Date,
		default: Date.now
	},
	completed: {
		type: Date
	},
	success: {
		type: Boolean
	},

	criteria: {
		type: {
			users: [String]
		}
	}

});

/**
 * Index declarations
 */
ReportInstanceSchema.index({ report: 1 });


/**
 * Lifecycle hooks
 */

// Before save
ReportInstanceSchema.pre('save', function(next){
	next();
});


/**
 * Static Methods
 */


// Search subscriptions by text and other criteria
ReportInstanceSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};


// Create a filtered subscription for auditing
ReportInstanceSchema.statics.auditCopy = function(src) {
	var newInstance = {};
	src = src || {};

	newInstance.report = src.report;
	newInstance.started = src.started;
	newInstance.completed = src.completed;
	newInstance._id = src._id;

	return newInstance;
};

/**
 * Register the Schema with Mongoose
 */
mongoose.model('ReportInstance', ReportInstanceSchema, 'report.instances');
