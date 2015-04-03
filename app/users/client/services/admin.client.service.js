'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('wf.users').factory('adminService', ['$http', '$q', '$log', function($http, $q, $log) {

	/**
	 * Public methods to be exposed through the service
	 */

	// Create
	function create(user) {
		var request = $http({
			method: 'post',
			url: 'admin/user',
			data: user
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Retrieve
	function get(id) {
		var request = $http({
			method: 'get',
			url: 'admin/user/' + id
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Update
	function update(user) {
		var request = $http({
			method: 'post',
			url: 'admin/user/' + user._id,
			data: user
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Delete
	function remove(id) {
		var request = $http({
			method: 'delete',
			url: 'admin/user/' + id
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Search Users
	function search(q, s, pageable){
		var request = $http({
			method: 'post',
			url: 'admin/users',
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
		create: create,
		get: get,
		update: update,
		remove: remove,
		search: search
	});

}]);