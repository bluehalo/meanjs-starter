'use strict';

// Service for managing EUA's. Accepting and getting the current EUA is handled in the auth service
angular.module('asymmetrik.reports').factory('reportService', 
		['$http', '$q', '$log', 
		 function($http, $q, $log) {

	var sort = {};
	sort.map = {
		title: { label: 'Name', sort: 'name', dir: 'ASC' },
		created: { label: 'Created', sort: 'created', dir: 'DESC' },
		enabled: { label: 'Enabled', sort: 'enabled', dir: 'DESC' },
		relevance: { label: 'Relevance', sort: 'score', dir: 'DESC' }
	};
	sort.array = [ sort.map.title, sort.map.created, sort.map.enabled, sort.map.relevance ];

	var periods = {};
	periods.map = {
		hour: { label: 'every hour', value: 60*60*1000 },
		sixHours: { label: 'every 6 hours', value: 6*60*60*1000 },
		twelveHours: { label: 'every 12 hours', value: 12*60*60*1000 },
		day: { label: 'every day', value: 24*60*60*1000 },
		week: { label: 'every week', value: 7*24*60*60*1000 }
	};
	periods.array = [ periods.map.hour, periods.map.sixHours, periods.map.twelveHours, periods.map.day, periods.map.week ];

	/**
	 * Public methods to be exposed through the service
	 */

	// Create
	function create(report) {
		var request = $http({
			method: 'post',
			url: 'report',
			data: report
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Retrieve
	function get(id) {
		var request = $http ({
			method: 'get',
			url: 'report/' + id
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Search Reports
	function search(q, s, pageable){
		var request = $http({
			method: 'post',
			url: 'reports',
			data: { s: s , q: q },
			params: pageable
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Update
	function update(report) {
		var request = $http({
			method: 'post',
			url: 'report/' + report._id,
			data: report
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Delete
	function remove(id) {
		var request = $http({
			method: 'delete',
			url: 'report/' + id
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Set the active field on the report
	function setActive(id, active) {
		var request = $http({
			method: 'post',
			url: 'report/' + id + '/active',
			params: {
				active: active
			}
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Schedule the report to run immediately
	function runReport(id) {
		var request = $http({
			method: 'post',
			url: 'report/' + id + '/run'
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Get the most recent two report instances
	function reportActivity(id) {
		var request = $http({
			method: 'post',
			url: 'report/' + id + '/activity'
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Get the most recent user profile data
	function userActivity(screenName) {
		var request = $http({
			method: 'post',
			url: 'user/activity',
			params: {
				screenName: screenName
			}
		});
		return request.then(handleSuccess, handleFailure);
	}

	function processProfileMetadata(profileMetadata) {
		var toReturn = {
			_id: profileMetadata._id,
			md: {
				ts: profileMetadata.ts,
				reportInstance: profileMetadata.reportInstance,
				screenName: profileMetadata.screenName,
				found: profileMetadata.found
			},
			p: {}
		};

		// Copy over the stuff we want from the payload
		if(null != profileMetadata.payload) {

			toReturn.p.createdDate = (null != profileMetadata.payload.created_at) ? new Date(profileMetadata.payload.created_at) : null;

			toReturn.p.favoritesCount = profileMetadata.payload.favourites_count;
			toReturn.p.followersCount = profileMetadata.payload.followers_count;
			toReturn.p.friendsCount = profileMetadata.payload.friends_count;
			toReturn.p.listedCount = profileMetadata.payload.listed_count;
			toReturn.p.statusesCount = profileMetadata.payload.statuses_count;

			toReturn.p.location = profileMetadata.payload.location;
			toReturn.p.name = profileMetadata.payload.name;
			toReturn.p.verified = profileMetadata.payload.verified;
			toReturn.p.geoEnabled = profileMetadata.payload.geo_enabled;
			toReturn.p.language = profileMetadata.payload.lang;
			toReturn.p.timezone = profileMetadata.payload.time_zone;

		} else {
			toReturn.p.createdDate = null;

			toReturn.p.favoritesCount = 0;
			toReturn.p.followersCount = 0;
			toReturn.p.friendsCount = 0;
			toReturn.p.listedCount = 0;
			toReturn.p.statusesCount = 0;

			toReturn.p.location = null;
			toReturn.p.name = null;
			toReturn.p.verified = null;
			toReturn.p.geoEnabled = null;
			toReturn.p.language = null;
			toReturn.p.timezone = null;

		}

		return toReturn;
	}

	// Process the recentActivity response into the user activity summary model
	function processReportActivitySummary(recentActivity) {
		var users = [];
		var current;
		var previous;

		// Figure out which is the current and which is the previous
		var reportInstances = recentActivity.reportInstances;
		if(null != reportInstances) {
			if(reportInstances.length > 0) {
				current = reportInstances[0];
			}
			if(reportInstances.length > 1) {
				previous = reportInstances[1];
			}
		}

		// Build a map of screen names to profile data, seeded with the criteria user list
		var usersMap = {};
		if(null != recentActivity.report && null != recentActivity.report.criteriaUsers) {
			recentActivity.report.criteriaUsers.forEach(function(element) {
				usersMap[element.toLowerCase()] = {
					screenName: element
				};
			});
		}

		// Populate with the actual profiles from the results
		if(null != recentActivity.profileMetadata) {
			recentActivity.profileMetadata.forEach(function(element) {
				if(null == element) return;

				var sn = element.screenName.toLowerCase();
				if(null == usersMap[sn]) {
					usersMap[sn] = {
						screenName: element.screenName
					};
				}

				usersMap[sn].screenName = element.screenName;
				var isCurrent = (null != current && current._id === element.reportInstance);
				var isPrevious = (null != previous && previous._id === element.reportInstance);

				var processedElement = processProfileMetadata(element);

				if(isCurrent) {
					usersMap[sn].current = processedElement;
				} else if(isPrevious) {
					usersMap[sn].previous = processedElement;
				}
			});
		}

		// convert the map to an array
		for(var key in usersMap) {
			users.push(usersMap[key]);
		}

		users.forEach(function(element) {
			var current = {
				friendsCount: 0,
				followersCount: 0,
				statusesCount: 0
			};
			var previous = {
				friendsCount: 0,
				followersCount: 0,
				statusesCount: 0
			};
			var delta = {};

			// Set the current values
			if(null != element.current && null != element.current.p) {
				current.friendsCount = element.current.p.friendsCount;
				current.followersCount = element.current.p.followersCount;
				current.statusesCount = element.current.p.statusesCount;
			}
			if(null != element.previous && null != element.previous.p) {
				previous.friendsCount = element.previous.p.friendsCount;
				previous.followersCount = element.previous.p.followersCount;
				previous.statusesCount = element.previous.p.statusesCount;
			}

			delta.friendsCount = current.friendsCount - previous.friendsCount;
			delta.friendsPercent = (previous.friendsCount !== 0)? delta.friendsCount/previous.friendsCount : 0;

			delta.followersCount = current.followersCount - previous.followersCount;
			delta.followersPercent = (previous.followersCount !== 0)? delta.followersCount/previous.followersCount : 0;

			delta.statusesCount = current.statusesCount - previous.statusesCount;
			delta.statusesPercent = (previous.statusesCount !== 0)? delta.statusesCount/previous.statusesCount : 0;

			element.delta = delta;
		});

		return {
			users: users,
			current: current,
			previous: previous
		};
	}

	// Process the recentActivity response into the user activity summary model
	function processUserActivitySummary(profileMetadatas) {
		var profiles = [];
		var user = {
			screenName: null,
			created: null,
			inactive: null
		};

		profileMetadatas.forEach(function(element) {
			var profile = processProfileMetadata(element);

			if(null != profile.p.createdDate) {
				user.created = profile.p.createdDate;
			}
			if(null != profile.md.screenName) {
				user.screenName = profile.md.screenName;
			}
			if(!profile.md.found) {
				if(null == user.inactive || user.inactive > profile.md.ts) {
					user.inactive = profile.md.ts;
				}
			}

			profiles.push(profile);
		});

		return {
			profiles: profiles,
			user: user
		};
	}

	/**
	 * Private methods
	 */
	function handleSuccess(response) {
		return response.data;
	}

	function handleFailure(response) {
		if (!angular.isObject( response.data ) || null == response.data.message){
			return( $q.reject( { message: 'An unknown error occurred.' } ) );
		}

		return $q.reject(response.data);
	}



	// Return the public API
	return ({

		sort: sort,
		periods: periods,

		create: create,
		get: get,
		search: search,
		update: update,
		remove: remove,
		setActive: setActive,
		runReport: runReport,
		reportActivity: reportActivity,
		userActivity: userActivity,
		processUserActivitySummary: processUserActivitySummary,
		processReportActivitySummary: processReportActivitySummary

	});

}]);