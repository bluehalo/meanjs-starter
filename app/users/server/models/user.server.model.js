'use strict';

var _ = require('lodash'),
	crypto = require('crypto'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	path = require('path'),

	deps = require(path.resolve('./config/dependencies.js')),
	query = deps.queryService;


/**
 * Validation
 */

// Validate that the property is not empty
var validateNonEmpty = function(property) {
	var toReturn = true;

	// Only care if it's local
	if(this.provider === 'local') {
		toReturn = (null != property && property.length > 0);
	}

	return toReturn;
};

// Validate the password
var validatePassword = function(password) {
	var toReturn = true;

	// only care if it's local
	if(this.provider === 'local') {
		toReturn = (null != password) && password.length >= 6;
	}

	return toReturn;
};
var passwordMessage = 'Password must be at least 6 characters long.';


var GroupPermissionSchema = new Schema({
	_id: {
		type: Schema.ObjectId,
		ref: 'Group'
	},
	roles: {
		type: {
			editor: {
				type: String,
				default: false
			},
			admin: {
				type: String,
				default: false
			}
		}
	}
});

var UserSchema = new Schema({
	name: {
		type: String,
		trim: true,
		default: '',
		validate: [validateNonEmpty, 'Please provide a name']
	},
	email: {
		type: String,
		trim: true,
		default: '',
		validate: [validateNonEmpty, 'Please provide an email address'],
		match: [/.+\@.+\..+/, 'Please provide a valid email address']
	},
	username: {
		type: String,
		unique: 'There is already an account with this username',
		required: 'Please provide a username',
		trim: true
	},
	password: {
		type: String,
		default: '',
		validate: [validatePassword, passwordMessage]
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: {
			user: {
				type: String,
				default: false
			},
			editor: {
				type: String,
				default: false
			},
			admin: {
				type: String,
				default: false
			}
		}
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	},
	acceptedEua: {
		type: Date,
		default: null
	},
	lastLogin: {
		type: Date,
		default: null
	},
	groups: {
		type: [GroupPermissionSchema],
		default: []
	}
});


/**
 * Index declarations
 */

// Text-search index
UserSchema.index({ name: 'text', email: 'text', username: 'text', 'groups.group': 1 });


/**
 * Lifecycle Hooks
 */

// Process the password
UserSchema.pre('save', function(next) {
	var user = this;

	// If the password is modified and it is valid, then re- salt/hash it
	if (user.isModified('password') && validatePassword.call(user, user.password)) {
		user.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		user.password = user.hashPassword(user.password);
	}

	next();
});




/**
 * Instance Methods
 */

// Hash Password
UserSchema.methods.hashPassword = function(password) {
	var user = this;

	if (user.salt && password) {
		return crypto.pbkdf2Sync(password, user.salt, 10000, 64).toString('base64');
	} else {
		return password;
	}
};

// Authenticate a password against the user
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};


/**
 * Static Methods
 */

UserSchema.statics.hasRoles = function(user, roles){
	var toReturn = true;

	if(null != roles) {
		roles.forEach(function(element) {
			if(!user.roles[element]) {
				toReturn = false;
			}
		});
	}

	return toReturn;
};

//Search users by text and other criteria
UserSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};

// Find users using a contains/wildcard regex on a fixed set of fields
UserSchema.statics.containsQuery = function(queryTerms, fields, search, limit, offset, sortArr) {
	return query.containsQuery(this, queryTerms, fields, search, limit, offset, sortArr);
};

// Filtered Copy of a User (public)
UserSchema.statics.filteredCopy = function(user) {
	var toReturn = null;

	if(null != user){
		toReturn = {};

		toReturn._id = user._id;
		toReturn.name = user.name;
		toReturn.username = user.username;
		toReturn.created = user.created;
		toReturn.lastLogin = toReturn.lastLogin;
	}

	return toReturn;
};

//Group Copy of a User (has group roles for the group )
UserSchema.statics.groupCopy = function(user, groupId) {
	var toReturn = null;

	if(null != user){
		toReturn = {};

		toReturn._id = user._id;
		toReturn.name = user.name;
		toReturn.username = user.username;
		toReturn.created = user.created;
		toReturn.lastLogin = toReturn.lastLogin;

		// Copy only the relevant group roles
		toReturn.groups = [];
		if(null != user.groups) {
			user.groups.forEach(function(element){
				if(null != element._id && element._id.equals(groupId)) {
					toReturn.groups.push(element);
				}
			});
		}
	}

	return toReturn;
};

// Full Copy of a User (admin)
UserSchema.statics.fullCopy = function(user) {
	var toReturn = null;

	if(null != user){
		toReturn = {};

		toReturn._id = user._id;
		toReturn.name = user.name;
		toReturn.email = user.email;
		toReturn.phone = user.phone;
		toReturn.username = user.username;
		toReturn.roles = user.roles;
		toReturn.updated = user.updated;
		toReturn.created = user.created;
		toReturn.acceptedEua = user.acceptedEua;
		toReturn.lastLogin = user.lastLogin;
		toReturn.groups = user.groups;
	}

	return toReturn;
};

// Copy User for creation
UserSchema.statics.createCopy = function(user) {
	var toReturn = {};

	toReturn.name = user.name;
	toReturn.email = user.email;
	toReturn.phone = user.phone;
	toReturn.username = user.username;
	toReturn.password = user.password;
	toReturn.created = Date.now();
	toReturn.updated = toReturn.created;

	return toReturn;
};

// Copy a user for audit logging
UserSchema.statics.auditCopy = function(user) {
	var toReturn = {};
	user = user || {};

	toReturn._id = user._id;
	toReturn.name = user.name;
	toReturn.username = user.username;

	return toReturn;
};

/**
 * Model Registration
 */
mongoose.model('User', UserSchema);
mongoose.model('GroupPermission', GroupPermissionSchema);
