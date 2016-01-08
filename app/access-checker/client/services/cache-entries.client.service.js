'use strict';

// CacheEntries service used for communicating with the access-checker REST endpoint
angular.module('asymmetrik.access-checker').factory('cacheEntriesService',
	['$rootScope', '$state', '$location', '$http', '$q', '$log', 'Authentication',
		function($rootScope, $state, $location, $http, $q, $log, Authentication ) {

			var sort = {};
			sort.map = {
				key: { label: 'Key', sort: 'key', dir: 'ASC' },
				timestamp: { label: 'Timestamp', sort: 'timestamp', dir: 'DESC' }
			};
			sort.array = [ sort.map.key, sort.map.timestamp, sort.map.value ];


			/**
			 * Public methods to be exposed through the service
			 */

			// Search Cache Entries
			function search(q, s, pageable){
				var request = $http({
					method: 'post',
					url: 'access-checker/entries/search',
					data: { s: s , q: q },
					params: pageable
				});
				return request.then(handleSuccess, handleFailure);
			}

			// Match Cache (will execute a contains search)
			function match(q, s, pageable){
				var request = $http({
					method: 'post',
					url: 'access-checker/entries/match',
					data: { s: s , q: q },
					params: pageable
				});
				return request.then(handleSuccess, handleFailure);
			}

			// Delete entry
			function deleteEntry(key) {
				var request = $http({
					method: 'delete',
					url: 'access-checker/entry/' + encodeURIComponent(key),
					data: { key: key }
				});
				return request.then(handleSuccess, handleFailure);
			}

			// Refresh entry
			function refreshEntry(key) {
				var request = $http({
					method: 'post',
					url: 'access-checker/entry/' + encodeURIComponent(key),
					data: { key: key }
				});
				return request.then(handleSuccess, handleFailure);
			}

			// Refresh current user
			function refreshCurrentUser() {
				var request = $http({
					method: 'post',
					url: 'access-checker/user'
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
				sort: sort,
				search: search,
				match: match,
				deleteEntry: deleteEntry,
				refreshEntry: refreshEntry,
				refreshCurrentUser: refreshCurrentUser
			});

		}]);