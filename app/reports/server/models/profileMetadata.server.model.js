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
var ProfileMetadataSchema = new Schema({
	ts: {
		type: Date,
		default: Date.now
	},
	screenName: {
		type: String,
		validate: [validateNonEmpty, 'Must provide a screenName']
	},
	reportInstance: {
		type: Schema.ObjectId,
		ref: 'ReportInstance'
	},
	payload: {}
});

/**
 * Index declarations
 */
ProfileMetadataSchema.index({ screenName: 1 });


/**
 * Lifecycle hooks
 */

// Before save
ProfileMetadataSchema.pre('save', function(next){
	next();
});


/**
 * Static Methods
 */

/**
 * Register the Schema with Mongoose
 */
mongoose.model('ProfileMetadata', ProfileMetadataSchema, 'report.profileMetadata');
