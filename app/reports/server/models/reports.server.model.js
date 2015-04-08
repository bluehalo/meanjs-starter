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

function processCriteria(criteria) {

	// Check the users list
	if(null != criteria && null != criteria.users) {

		var userMap = {};
		criteria.users.forEach(function(element) {
			// Trim whitespace
			element = element.trim();

			// Strip @ sign
			if(element.length > 0 && element.charAt(0) === '@') {
				element = element.substring(1);
			}

			// If it's not empty, add it
			if(element.length > 0) {
				userMap[element] = true;
			}
		});

		var users = [];
		for(var user in userMap) {
			users.push(user);
		}
		criteria.users = users;
	}
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
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date,
		default: Date.now
	},

	active: {
		type: Boolean,
		default: true
	},
	period: {
		type: Number,
		default: 24*60*60  // 24 hours
	},

	criteria: {
		type: {
			users: [String]
		},
		validate: [validateCriteria, 'Please provide a valid criteria']
	},

	state: {
		running: {
			type: Boolean,
			default: false
		},
		lastComplete: {
			type: Date,
			default: 0
		},
		nextRun: {
			type: Date,
			default: Date.now()
		}
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
	processCriteria(this.criteria);

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
