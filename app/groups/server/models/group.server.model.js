'use strict';

var _ = require('lodash'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	path = require('path'),

	deps = require(path.resolve('./config/dependencies.js')),
	query = deps.queryService;

/**
 * Validation
 */

//Validate that the property is not empty
var validateNonEmpty = function(property) {
	return (null != property && property.length > 0);
};

/**
 * Group Schema
 */
var GroupSchema = new Schema({
	title: {
		type: String,
		trim: true,
		default: '',
		validate: [validateNonEmpty, 'Please provide a title']
	},
	description: {
		type: String,
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	}
});


/**
 * Index declarations
 */

// Text-search index
GroupSchema.index({ title: 'text', description: 'text' });

/**
 * Lifecycle Hooks
 */


/**
 * Instance Methods
 */


/**
 * Static Methods
 */


//Search groups by text and other criteria
GroupSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};


// Copy Group for creation
GroupSchema.statics.createCopy = function(group) {
	var toReturn = {};

	toReturn.title = group.title;
	toReturn.description = group.description;
	toReturn.created = group.created;

	return toReturn;
};

// Copy a group for audit logging
GroupSchema.statics.auditCopy = function(group) {
	var toReturn = {};
	group = group || {};

	toReturn._id = group._id;
	toReturn.title = group.title;
	toReturn.description = group.description;

	return toReturn;
};

// Copy a groupPermission for audit logging
GroupSchema.statics.auditCopyGroupPermission = function(group, user, role) {
	var toReturn = {};
	user = user || {};
	group = group || {};

	toReturn.user = {
		_id: user._id,
		name: user.name,
		username: user.username
	};

	toReturn.group = {
		_id: group._id,
		title: group.title
	};

	toReturn.role = role;

	return toReturn;
};

/**
 * Model Registration
 */
mongoose.model('Group', GroupSchema, 'groups');