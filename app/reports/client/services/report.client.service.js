'use strict';

// Service for managing EUA's. Accepting and getting the current EUA is handled in the auth service
angular.module('asymmetrik.reports').factory('reportService', 
		['$http', '$q', '$log', 
		 function($http, $q, $log) {

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

	function setEnabled(id, enabled) {
		var request = $http({
			method: 'post',
			url: 'report/' + id + '/enabled',
			params: {
				enabled: enabled
			}
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
			title: { label: 'Name', sort: 'name', dir: 'ASC' },
			created: { label: 'Created', sort: 'created', dir: 'DESC' },
			enabled: { label: 'Enabled', sort: 'enabled', dir: 'DESC' },
			relevance: { label: 'Relevance', sort: 'score', dir: 'DESC' }
		},
		create: create,
		get: get,
		search: search,
		update: update,
		remove: remove,
		setEnabled: setEnabled
	});

}]);