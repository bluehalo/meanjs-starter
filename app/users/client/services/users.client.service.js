'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('wf.users').factory('userService', 
		['$http', '$q', '$log', 'Authentication', 
		 function($http, $q, $log, Authentication ) {

	/**
	 * Public methods to be exposed through the service
	 */

	// Get the auth system configuration
	function getAuthConfig() {
		var request = $http ({
			method: 'get',
			url: 'user/config'
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Retrieve
	function get(id) {
		var request = $http ({
			method: 'get',
			url: 'user/' + id
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Update the current user
	function update(user) {
		var request = $http({
			method: 'post',
			url: 'user/me',
			data: user
		});
		return request.then(function(response){
			Authentication.setUser(response.data);
			return response.data;
		}, handleFailure);
	}

	// Search Users
	function search(q, s, pageable){
		var request = $http({
			method: 'post',
			url: 'users',
			data: { s: s , q: q },
			params: pageable
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Match Users (will execute a contains search)
	function match(q, s, pageable){
		var request = $http({
			method: 'post',
			url: 'users/match',
			data: { s: s , q: q },
			params: pageable
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
		sort: {
			name: { label: 'Name', sort: 'name', dir: 'ASC' },
			username: { label: 'Username', sort: 'username', dir: 'ASC' },
			created: { label: 'Created', sort: 'created', dir: 'DESC' },
			relevance: { label: 'Relevance', sort: 'score', dir: 'DESC' }
		},
		get: get,
		update: update,
		search: search,
		match: match,
		getAuthConfig: getAuthConfig
	});

}]);