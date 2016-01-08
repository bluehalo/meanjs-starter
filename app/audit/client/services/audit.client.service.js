'use strict';

angular.module('asymmetrik.audit').service('auditService',
		[ '$rootScope', '$http', '$q', '$log', '$state', '$window',
	function($rootScope, $http, $q, $log, $state, $window) {

		/**
		 * Private methods
		 */
		function handleSuccess(response) {
			return response.data;
		}

		function handleFailure(response) {
			if (!angular.isObject( response.data ) || null == response.data.message){
				return( $q.reject( 'An unknown error occurred.' ) );
			}

			return $q.reject(response.data.message);
		}
		
		function getDistinctAuditValues(field) {
			var request = $http({
				method: 'get',
				url: 'audit/distinctValues',
				params: { field: field }
			});
			return request.then(handleSuccess, handleFailure);
		}

		// Search Events
		function search(q, s, pageable){
			var request = $http({
				method: 'post',
				url: 'audit',
				data: { s: s , q: q },
				params: pageable
			});
			return request.then(handleSuccess, handleFailure);
		}

		// Return the public API
		return ({
			getDistinctAuditValues: getDistinctAuditValues,
			search: search,
			sort: {
				created: { label: 'Created', sort: 'created', dir: 'DESC' },
				actor: { label: 'Actor', sort: 'audit.actor.name', dir: 'ASC' },
				type: { label: 'Type', sort: 'audit.auditType', dir: 'DESC' }
			}
		});
	}
]);
