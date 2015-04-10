'use strict';

var mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),
	_ = require('lodash'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	logger = deps.logger,
	auditLogger = deps.auditLogger,
	util = deps.utilService,

	Group = mongoose.model('Group'),
	GroupPermission = mongoose.model('GroupPermission'),
	Report = mongoose.model('Report'),
	User = mongoose.model('User');

/**
 * Local Functions
 */
function copyGroupMutableFields(dest, src) {
	dest.title = src.title;
	dest.description = src.description;
}


function userAddFunc(user, groupPermission, callback) {
	User.update({ _id: user._id}, { $addToSet: { groups: groupPermission } }, callback);
}

function getGroupPermission(groupId, user) {
	if (null != groupId && null != user.groups) {
		var groupPermissions = user.groups.filter(function(group) {
			return group._id.id === new mongoose.Types.ObjectId(groupId).id;
		});
		if (null != groupPermissions && groupPermissions.length > 0) {
			return groupPermissions[0];
		}
	}

	return null;
}

function getGroupRoles(groupId, user) {
	var permission = getGroupPermission(groupId, user);
	if (null != permission) {
		return permission.roles;
	}

	return null;
}

function verifyNotLastAdmin(user, group) {
	var defer = q.defer();
	User.findOne({ _id: { $ne: user._id }, groups: { $elemMatch: { _id: group._id, 'roles.admin': true } } }).exec(function(err, user) {
		if(null != user) {
			defer.resolve(user);
		} else if(null != err){
			defer.reject(err);
		} else {
			defer.reject('Group must have at least one admin.');
		}
	});
	return defer.promise;
}

function verifyNoReportsInGroup(group) {
	var defer = q.defer();
	Report.findOne({ group: group._id }).exec(function(err, report) {
		if(null != err) {
			// There was an error
			defer.reject(err);
		} else if(null != report){
			// There are reports left
			defer.reject('There are still reports in this group.');
		} else {
			// No errors, no reports
			defer.resolve();
		}
	});
	return defer.promise;
}

// Create
exports.create = function(req, res) {
	var newGroup = new Group(req.body);
	newGroup.created = Date.now();
	newGroup.updated = Date.now();

	newGroup.save(function(err, group) {
		util.catchError(res, err, function() {
			var groupPermission = new GroupPermission({ _id: group._id, roles: { editor: true, admin: true } });

			userAddFunc(req.user, groupPermission, function(err) {
				util.catchError(res, err, function() {
					res.jsonp(group);

					// Audit creation of groups
					auditLogger.audit('group created', 'group', 'create',
						User.auditCopy(req.user),
						{ group: Group.auditCopy(group) });
				});
			});
		});
	});
};


// Read
exports.read = function(req, res) {
	var group = req.group;

	// Attaching the list of users to the group
	User.find({ 'groups._id': group._id }).exec(function(err, results){
		util.catchError(res, err, function() {
			group.users = User.filteredCopy(results);
			res.jsonp(group);
		});
	});
};


// Update
exports.update = function(req, res) {
	// Retrieve the group from persistence
	var group = req.group;

	// Make a copy of the original group for a "before" snapshot
	var originalGroup = Group.auditCopy(group);

	// Update the updated date
	group.updated = Date.now();

	// Copy in the fields that can be changed by the user
	copyGroupMutableFields(group, req.body);

	// Save
	group.save(function(err) {
		util.catchError(res, err, function() {
			res.jsonp(group);
		});
	});

	// Audit the save action
	auditLogger.audit('group updated', 'group', 'update',
		User.auditCopy(req.user),
		{ before: originalGroup, after: Group.auditCopy(group) });
};



// Delete
exports.delete = function(req, res) {
	var group = req.group;

	// Make sure that there are no reports under this channel
	verifyNoReportsInGroup(group).then(function(){

		// There were no report`s, so proceed with the delete

		// Build the promise response
		var deleteGroupDefer = q.defer();
		group.remove(function(err) {
			if(null != err){
				deleteGroupDefer.reject(err);
			} else {
				deleteGroupDefer.resolve();
			}
		});
		var deleteUserGroupsDefer = q.defer();
		User.update({ 'groups._id': group._id}, { $pull: { groups: { _id: group._id } } }, function(err, numAffected) {
			if(null != err){
				deleteUserGroupsDefer.reject(err);
			} else {
				deleteUserGroupsDefer.resolve(numAffected);
			}
		});

		// Run the two commands concurrently
		q.all([deleteGroupDefer.promise, deleteUserGroupsDefer.promise]).then(function(results){
			group.usersRemoved = results[1];
			res.jsonp(group);
		}, function(err){
			// failure
			return util.send400Error(res, err);
		});

		// Audit the group delete attempt
		auditLogger.audit('group deleted', 'group', 'delete',
			User.auditCopy(req.user),
			{ group: Group.auditCopy(req.group) });

	}, function(err){
		return util.send400Error(res, err);
	});

};



// Search - with paging and sorting
exports.search = function(req, res) {
	var query = req.body.q;
	var search = req.body.s;
	var roles = req.body.roles || {};

	var page = req.query.page;
	var size = req.query.size;
	var sort = req.query.sort;
	var dir = req.query.dir;

	// Limit has to be at least 1 and no more than 100
	if(null == size){ size = 20; }
	size = Math.max(1, Math.min(100, size));

	// Page needs to be positive and has no upper bound
	if(null == page){ page = 0; }
	page = Math.max(0, page);

	// Sort can be null, but if it's non-null, dir defaults to DESC
	if(null != sort && dir == null){ dir = 'ASC'; }

	// Create the variables to the search call
	var limit = size;
	var offset = page*size;
	var sortArr;
	if(null != sort){
		sortArr = [{ property: sort, direction: dir }];
	}

	// If we aren't an admin, we need to constrain the results
	if(null == req.user.roles || !req.user.roles.admin) {
		// add the group constraint

		var groups = [];

		if(null != req.user.groups) {
			req.user.groups.forEach(function(group) {
				var include = true;

				if(roles.admin && roles.editor) {
					// we need to have admin and editor
					include = group.admin && group.editor;
				} else if(roles.admin) {
					// we need only admin
					include = group.admin;
				} else if(roles.editor) {
					// we need only editor
					include = group.editor;
				}

				if(include) {
					groups.push(group._id);
				}
			});
		}

		// Build the query
		query = query || {};
		query._id = {
			$in: groups
		};
	}

	Group.search(query, search, limit, offset, sortArr).then(function(result){
		// success
		var toReturn = {
			totalSize: result.count,
			pageNumber: page,
			pageSize: size,
			totalPages: Math.ceil(result.count/size),
			elements: result.results
		};

		// Serialize the response
		res.jsonp(toReturn);
	}, function(error){
		// failure
		logger.error({err: error, req: req}, 'Error searching for groups');
		return util.send400Error(res, error);
	});
};

// Search the members of a group
exports.searchMembers = function(req, res) {
	var user = req.userParam;
	var group = req.group;

	var query = req.body.q;
	var search = req.body.s;

	var page = req.query.page;
	var size = req.query.size;
	var sort = req.query.sort;
	var dir = req.query.dir;

	// Limit has to be at least 1 and no more than 100
	if(null == size){ size = 20; }
	size = Math.max(1, Math.min(100, size));

	// Page needs to be positive and has no upper bound
	if(null == page){ page = 0; }
	page = Math.max(0, page);

	// Sort can be null, but if it's non-null, dir defaults to DESC
	if(null != sort && dir == null){ dir = 'DESC'; }

	// Create the variables to the search call
	var limit = size;
	var offset = page*size;
	var sortArr;
	if(null != sort){
		sortArr = [{ property: sort, direction: dir }];
	}

	// Inject the group query parameters
	query = query || {};
	query['groups._id'] = group._id;

	User.search(query, search, limit, offset, sortArr).then(function(result){

		// Create the return copy of the users
		var users = [];
		result.results.forEach(function(element){
			users.push(User.groupCopy(element, group._id));
		});

		// success
		var toReturn = {
			totalSize: result.count,
			pageNumber: page,
			pageSize: size,
			totalPages: Math.ceil(result.count/size),
			elements: users
		};

		// Serialize the response
		res.jsonp(toReturn);
	}, function(error){
		// failure
		logger.error(error);
		return util.send400Error(res, error);
	});

};


// Add a user to a group (automatically gives them read access)
exports.userAdd = function(req, res) {
	var user = req.userParam;
	var group = req.group;

	var groupPermission = new GroupPermission({ _id: group._id, roles: { editor: false, admin: false } });

	userAddFunc(user, groupPermission, function(err) {
		util.catchError(res, err, function() {
			res.jsonp(groupPermission);
		});
	});

	// Audit the create action
	auditLogger.audit('group user added', 'group', 'user add',
		Group.auditCopy(req.user), { groupPermission: Group.auditCopyGroupPermission(group, user) });
};



// Remove a user from a group (automatically clears all their roles)
exports.userRemove = function(req, res) {
	var user = req.userParam;
	var group = req.group;

	verifyNotLastAdmin(user, group).then(function(){
		User.update({ _id: user._id}, { $pull: { groups: { _id: group._id } } }, function(err) {
			util.catchError(res, err, function() {
				res.jsonp( { success: true } );
			});
		});

		// Audit the groupPermission delete attempt
		auditLogger.audit('group user removed', 'group', 'user remove',
			Group.auditCopy(req.user), { groupPermission: Group.auditCopyGroupPermission(group, user) });
	}, function(error) {
		util.send400Error(res, error);
	});
};

function validateGroupRole(role, res) {
	if(null != role && 'admin' !== role && 'editor' !== role) {
		util.send400Error(res, 'Bad request. Role does not exist.');
	}
}

// Add a user role to the user in the group
exports.userRoleAdd = function(req, res) {
	var user = req.userParam;
	var group = req.group;
	var role = req.query.role;

	validateGroupRole(role, res);
	var setValue = {};
	setValue['groups.$.roles.' + role] = true;

	// Save
	User.update({ _id: user._id, 'groups._id': group._id }, { $set: setValue }, function(err) {
		util.catchError(res, err, function() {
			res.jsonp( { success: true } );
		});
	});

	// Audit the create action
	auditLogger.audit('group user role added', 'group', 'user role add',
		Group.auditCopy(req.user), { groupPermission: Group.auditCopyGroupPermission(group, user, role) });
};


// Remove a user role to the user in the group
exports.userRoleRemove = function(req, res) {
	var user = req.userParam;
	var group = req.group;
	var role = req.query.role;

	validateGroupRole(role, res);

	var doUserRoleRemove = function() {
		var setValue = {};
		setValue['groups.$.roles.' + role] = false;

		// Save
		User.update({ _id: user._id, 'groups._id': group._id }, { $set: setValue }, function(err) {
			util.catchError(res, err, function() {
				res.jsonp( { success: true } );
			});
		});

		// Audit the create action
		auditLogger.audit('group user role removed', 'group', 'user role remove',
			Group.auditCopy(req.user), { groupPermission: Group.auditCopyGroupPermission(group, user, role) });
	};

	if(role === 'admin') {
		verifyNotLastAdmin(user, group).then(doUserRoleRemove, function(error) {
			util.send400Error(res, error);
		});	
	} else {
		doUserRoleRemove();
	}

};


/**
 * Group middleware
 */
exports.groupById = function(req, res, next, id) {
	Group.findOne({ _id: id }).exec(function(err, group) {
		if (err) return next(err);
		if (!group) return next(new Error('Failed to load group ' + id));
		req.group = group;
		next();
	});
};


/**
 * Group authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	User.findOne({ _id: req.user._id, 'groups._id': req.group._id }).exec(function(err, user) {
		// If there was an error, obviously we need to bail
		if (err){
			return next(err);
		}

		// If there was no user, then we didn't find a user with this group
		if (!user){
			return util.send403Error(res);
		}

		// Now check the actual group permissions and see if the user 
		var groupRoles = getGroupRoles(req.group._id, user);
		if(null == groupRoles || !groupRoles.admin) {
			return util.send403Error(res);
		}

		next();
	});
};


exports.hasGroupEdit = function(groupId, user) {
	var roles = getGroupRoles(groupId, user);

	if (null != roles) {
		return roles.editor;
	}

	return false;
};

exports.hasGroup = function(groupId, user) {
	var permission = getGroupPermission(groupId, user);
	if (null != permission) {
		return true;
	}

	return false;
};
