'use strict';

// Service for managing a user's notification preferences for objects
angular.module('asymmetrik.users').factory('userNotificationPreferencesService', 
		['$http', '$q', '$log', 
		 function($http, $q, $log) {

	/**
	 * Public methods to be exposed through the service
	 */

	// Search
	function search(q, type, pageable, timeout) {
		var request = $http({
			method: 'post',
			url: '/users/me/preferences/notifications',
			data: { q: q },
			params: pageable,
			timeout: timeout
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Retrieve
	function get(id, type) {
		var request = $http ({
			method: 'get',
			url: '/users/me/preferences/notifications/' + type + '/' + id
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Save
	function save(id, type, preferences){
		var request = $http({
			method: 'post',
			url: '/users/me/preferences/notifications/' + type + '/' + id,
			data: preferences
		});
		return request.then(handleSuccess, handleFailure);
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
		get: get,
		search: search,
		save: save
	});

}]);