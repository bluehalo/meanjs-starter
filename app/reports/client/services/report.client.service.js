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
	function recentActivity(id) {
		var request = $http({
			method: 'post',
			url: 'report/' + id + '/activity'
		});
		return request.then(handleSuccess, handleFailure);
	}


	// Process the recentActivity response into the user activity summary model
	function processUserActivitySummary(recentActivity) {
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

		// Build a map of screen names to profile data
		var usersMap = {};
		if(null != recentActivity.profileMetadata) {
			recentActivity.profileMetadata.forEach(function(element) {
				if(null == element) return;

				var sn = element.screenName;
				if(null == usersMap[sn]) {
					usersMap[sn] = {};
				}

				if(null != current && current._id === element.reportInstance) {
					usersMap[sn].current = element;
				} else if(null != previous && previous._id === element.reportInstance){
					usersMap[sn].previous = element;
				}

			});
		}

		// convert the map to an array
		for(var key in usersMap) {
			var element = usersMap[key];
			element.screenName = key;

			users.push(element);
		}

		return {
			users: users,
			current: current,
			previous: previous
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
		recentActivity: recentActivity,
		processUserActivitySummary: processUserActivitySummary

	});

}]);