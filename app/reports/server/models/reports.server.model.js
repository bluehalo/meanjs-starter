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

function validateCriteriaUsers(users) {
	return (null != users && users.length > 0);
}

function toLowerCase(v){
	return (null != v)? v.toLowerCase(): undefined;
}

function processCriteriaUsers(criteriaUsers) {

	// Check the users list
	if(null != criteriaUsers) {

		var userMap = {};
		criteriaUsers.forEach(function(element) {
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
		criteriaUsers = users;
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
		default: 24*60*60*1000  // 24 hours
	},

	criteriaUsers: {
		type: [String],
		validate: [validateCriteriaUsers, 'Please provide a valid list of user accounts']
	},

	state: {
		running: {
			type: Boolean,
			default: false
		},
		lastComplete: {
			type: Date,
			default: null
		},
		nextRun: {
			type: Date,
			default: Date.now()
		},
		success: {
			type: Boolean,
			default: false
		}
	}

});

/**
 * Index declarations
 */

// Text-search index
ReportSchema.index({ title: 'text', description: 'text' });
ReportSchema.index({ active: 1, 'state.running': 1, 'state.nextRun': -1 });


/**
 * Lifecycle hooks
 */

// Before save
ReportSchema.pre('save', function(next){
	this.title_lowercase = this.title;
	processCriteriaUsers(this.criteriaUsers);

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
mongoose.model('Report', ReportSchema, 'report.reports');
