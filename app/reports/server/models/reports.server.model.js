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

function validateUsers(users) {
	return (null != users && users.length > 0);
}

function validateCriteria(criteria) {
	return null != criteria && (validateUsers(criteria.users));
}

function toLowerCase(v){
	return (null != v)? v.toLowerCase(): undefined;
}


/**
 * Schema Declaration
 */
var ReportSchema = new Schema({
	title: {
		type: String,
		trim: true,
		default: '',
		validate: [validateNonEmpty, 'Please provide a title']
	},
	title_lowercase: {
		type: String,
		set: toLowerCase
	},
	description: {
		type: String,
		trim: true,
		default: ''
	},
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date,
		default: Date.now
	},
	lastExecuted: {
		type: Date,
		default: null
	},
	period: {
		type: Number,
		default: 24*60*60  // 24 hours
	},

	group: {
		type: Schema.ObjectId,
		ref: 'Group'
	},
	creator: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	creatorName: {
		type: String
	},

	criteria: {
		users: [ String ],
		validate: [validateCriteria, 'Please provide a valid criteria']
	}
});


/**
 * Index declarations
 */

// Text-search index
ReportSchema.index({ title: 'text', description: 'text' });

/**
 * Lifecycle hooks
 */

// Before save
ReportSchema.pre('save', function(next){
	this.title_lowercase = this.title;

	next();
});


/**
 * Static Methods
 */


// Search subscriptions by text and other criteria
ReportSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};


// Create a filtered subscription for auditing
ReportSchema.statics.auditCopy = function(src) {
	var newReport = {};
	src = src || {};

	newReport.title = src.title;
	newReport.description = src.description;
	//newReport.criteria = src.criteria;
	newReport._id = src._id;

	return newReport;
};

/**
 * Register the Schema with Mongoose
 */
mongoose.model('Report', ReportSchema, 'reports');
