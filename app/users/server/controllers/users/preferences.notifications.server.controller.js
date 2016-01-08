'use strict';

var _ = require('lodash'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	util = deps.utilService,
	logger = deps.logger,
	auditService = deps.auditService,

	Alert = dbs.admin.model('Alert'),
	Stream = dbs.admin.model('Stream'),
	User = dbs.admin.model('User'),
	UserAgreement = dbs.admin.model('UserAgreement'),
	NotificationPreference = dbs.admin.model('NotificationPreference');


/*******
 * Private methods
 ******* */

var getStreamsByIds = function(streamIds) {
	var defer = q.defer();
	Stream.find({ _id: { $in: streamIds } }, function(err, data) {
		
		if(err) {
			// failure
			defer.reject(err);
		}
		
		defer.resolve(data);
		
	});
	return defer.promise;
};

var mapById = function(elements) {
	var map = {};
	elements.forEach(function(e) {
		map[e._id] = e;
	});
	return map;
};

/**
 * 
 */
var getAllMyAlerts = function(user, res) {
	var defer = q.defer();
	
	var query = {}; // open-ended query to retrieve without access controls
	if( !User.hasRoles(user, ['admin']) ) {
		
		// if the user is NOT an admin, filter based on their group IDs instead
		var groupIds = [];
		user.groups.forEach(function(g) {
			groupIds.push(g._id);
		});
		
		query = {
			group: { $in: groupIds }
		};
		
	}
	
	Stream.search(query, '').then(function(result){
		// success
		var toReturn = {
			totalSize: result.count,
			elements: result.results
		};
		
		var streamIds = [],
			streamMap = {};
		result.results.forEach(function(s) {
			streamMap[s._id] = {
				_id: s._id,
				creator: s.creator,
				creatorName: s.creatorName,
				criteria: s.criteria,
				title: s.title,
				description: s.description,
				group: s.group,
				created: s.created,
				updated: s.updated
			};
			streamIds.push(s._id);
		});

		Alert.find({ stream: { $in: streamIds } }, function(err, data) {
			if (err) {
				defer.reject(err);
			}
		
			var alerts = data.map(function(a) {
				var c = a.criteria || {};
				return {
					_id: a._id,
					creator: a.creator,
					title: a.title,
					criteria: {
						volume: c.volume
					},
					updated: a.updated,
					created: a.created,
					stream: streamMap[a.stream]
				};
			});
		
			defer.resolve(alerts);
		});
	}, function(error){
		defer.reject(error);
	});
	
	return defer.promise;
};

/**
 * Retrieves relevant data about the object of a notification preference
 * in order to display that to the user
 */
var populateAlertInformation = function( notificationPreferences ) {
	var defer = q.defer();
	
	/*
	 * Get all alert IDs for a single Mongo query to pull all
	 * alert data
	 */
	var alertIds = [];
	notificationPreferences.forEach(function(np) {
		if(np.notificationType === 'alert') {
			alertIds.push(np.referenceId);
		}
	});
	
	Alert.find({ _id: { $in: alertIds } }, function(err, alerts) {
		if(err) {
			// failure
			defer.reject(err);
		}
	
		/*
		 * Map the alerts to their IDs for quick lookup as
		 * we'll next iterate through the notification preferences
		 * to set them.
		 */
		var alertMap = {};
		var streamIds = [];
		alerts.forEach(function(a) {
			alertMap[a._id] = a;
			streamIds.push(a.stream);
		});
	
		getStreamsByIds(streamIds).then(function(streams) {
			var streamMap = mapById(streams);
	
			// Add the alert information to the proper notification preference
			var preferencesToReturn = notificationPreferences.map(function(np) {
				var data = JSON.parse(JSON.stringify(np));
				if(data.notificationType === 'alert' && alertMap.hasOwnProperty(data.referenceId)) {
					// convert alert from immutable object to allow changing the stream details
					var a = JSON.parse(JSON.stringify(alertMap[data.referenceId]));
					a.stream = streamMap[a.stream];
					data.alert = a;
				}
				return data;
			});
	
			defer.resolve(preferencesToReturn);
	
		}, defer.reject);
	
	});
	
	return defer.promise;
};

/**
 * Builds and returns a callback function scoped with the required input userId, notification type, and response
 */
var addAllMyNotificationsByType = function(user, type, res) {
	return function(data) {
		
		/*
		 * Build map of the user's notifications of this type to easily
		 * match against the passed-in data values, knowing that the
		 * referenceId will match the '_id' field of the input data elements
		 */
		var notificationPreferencesMapForUser = {};
		if(null != user.preferences && Array.isArray(user.preferences.notifications)) {
			
			user.preferences.notifications.forEach(function(p) {
				// check user's notifications for only ones of this type
				if(p.notificationType === type) {
					notificationPreferencesMapForUser[p.referenceId] = p;
				}
			});
			
		}
		
		/*
		 * Match the data values against the user's existing notification preferences
		 * and default if not yet set
		 */
		var resultsWithNotificationPreferences = data.map(function(d) {
			var newData = JSON.parse(JSON.stringify(d));
			
			var np = notificationPreferencesMapForUser[d._id];
			if(typeof np === 'undefined') {
				// default value
				newData.notificationPreferences = { email: false, sms: false, ui: false };
			}
			else {
				newData.notificationPreferences = np.values;
			}
			
			return newData;
		});
		
		res.jsonp(resultsWithNotificationPreferences);
	};
};

/*******
 * Standard Operations
 ******* */

/**
 * Retrieves all objects by a type that the user has access to,
 * and populates the notification preferences for that object set
 * by the user
 */
exports.getAllNotificationPreferencesForUserByType = function(req, res) {
	var user = req.user;
	var notificationType = req.params.notificationType;

	var retrieveFn;
	if('alert' === notificationType) {
		retrieveFn = getAllMyAlerts;
	}
	// Possible future development
//	else if( 'streams' === notificationType ) {
//		retrieveFn = getAllMyStreams;
//	}
	else {
		return util.send400Error(res, 'Unsupported Notification Type: ' + notificationType);
	}

	retrieveFn(user, res)
		.then(addAllMyNotificationsByType(user, notificationType, res), function(err) {
			logger.error(err);
			util.send400Error(res, err);
		});
};

/**
 * Retrieve the Notification Preferences for this User for a Type and ID
 */
exports.getNotificationPreferencesByTypeAndId = function(req, res) {
	
	var userId = req.user._id,
		notificationType = req.params.notificationType,
		referenceId = new mongoose.Types.ObjectId(req.params.referenceId);
	
	User.findOne(
		{
			_id: userId,
			'preferences.notifications.notificationType': notificationType,
			'preferences.notifications.referenceId' : referenceId
		},
		{ 'preferences.notifications.$': 1 },
		function(error, doc) {
			if(error) {
				return util.send400Error(res, error);
			}
			
			if(null != doc) {
				res.jsonp(doc.preferences.notifications[0].values);
			}
			else {
				// default
				res.jsonp({ email: false, sms: false, ui: false });
			}
			
		});
	
};


/**
 * Set the Notification Preferences for this User for a Type and ID
 */
exports.setNotificationPreferencesByTypeAndId = function(req, res) {

	var user = req.user;
	
	var notificationType = req.params.notificationType,
		referenceId = new mongoose.Types.ObjectId(req.params.referenceId);
	
	var np = new NotificationPreference({
		notificationType: notificationType,
		referenceId: referenceId,
		values: req.body
	});
	
	user.updateNotificationPreference(np).then(function() {
		res.jsonp({ success: true });
	}, function(err) {
		logger.error(err);
		return util.send400Error(res, err);
	});
	
};
