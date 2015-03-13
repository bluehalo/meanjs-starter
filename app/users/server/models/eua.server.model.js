'use strict';

var crypto = require('crypto'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./config/dependencies.js')),
	query = deps.queryService;


/**
 * Validation
 */

// Validate that the property is not empty
var validateNonEmpty = function(property) {
	return (null != property && property.length > 0);
};


/**
 * User Schema
 */
var UserAgreementSchema = new Schema({
	title: {
		type: String,
		trim: true,
		default: '',
		validate: [validateNonEmpty, 'Please provide a title']
	},
	text: {
		type: String,
		trim: true,
		default: '',
		validate: [validateNonEmpty, 'Please provide text']
	},
	published: {
		type: Date
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	}
});


/**
 * Index declarations
 */
UserAgreementSchema.index({ title: 'text', text: 'text' });


/**
 * Lifecycle Hooks
 */



/**
 * Instance Methods
 */


/**
 * Static Methods
 */

//Search euas by text and other criteria
UserAgreementSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};

//Get the most recent eua
var getCurrentEua = function() {
	var defer = q.defer();

	query.search(this, { 'published': { '$ne': null, '$exists': true } }, undefined, 1, 0, [{ property: 'published', direction: 'desc' }]).then(
		function(result) {
			var toReturn = null;
			if(result.count > 0) {
				toReturn = result.results[0];
			}

			defer.resolve(toReturn);
		}, function(error){
			defer.reject(error);
		});

	return defer.promise;
};
UserAgreementSchema.statics.getCurrentEua = getCurrentEua;


//Copy a user for audit logging
UserAgreementSchema.statics.auditCopy = function(eua) {
	var newEua = {};
	eua = eua || {};

	newEua._id = eua._id;
	newEua.title = eua.title;
	newEua.text = eua.text;
	newEua.published = eua.published;
	newEua.created = eua.created;
	newEua.updated = eua.updated;

	return newEua;
};

/**
 * Model Registration
 */
mongoose.model('UserAgreement', UserAgreementSchema);