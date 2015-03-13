'use strict';

// Service for managing EUA's. Accepting and getting the current EUA is handled in the auth service
angular.module('asymmetrik.users').factory('euaService', 
		['$http', '$q', '$log', 
		 function($http, $q, $log) {

	/**
	 * Public methods to be exposed through the service
	 */

	// Create
	function create(eua) {
		var request = $http({
			method: 'post',
			url: 'eua',
			data: eua
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Retrieve
	function get(id) {
		var request = $http ({
			method: 'get',
			url: 'eua/' + id
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Search Euas
	function search(q, s, pageable){
		var request = $http({
			method: 'post',
			url: 'euas',
			data: { s: s , q: q },
			params: pageable
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Update
	function update(eua) {
		var request = $http({
			method: 'post',
			url: 'eua/' + eua._id,
			data: eua
		});
		return request.then(handleSuccess, handleFailure);
	}

	// Delete
	function remove(id) {
		var request = $http({
			method: 'delete',
			url: 'eua/' + id
		});
		return request.then(handleSuccess, handleFailure);
	}

	function publish(id) {
		var request = $http({
			method: 'post',
			url: 'eua/' + id + '/publish'
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
			published: { label: 'Published', sort: 'published', dir: 'DESC' },
			relevance: { label: 'Relevance', sort: 'score', dir: 'DESC' }
		},
		create: create,
		get: get,
		search: search,
		update: update,
		remove: remove,
		publish: publish
	});

}]);