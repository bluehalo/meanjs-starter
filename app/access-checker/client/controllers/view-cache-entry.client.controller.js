'use strict';

angular.module('asymmetrik.audit').controller('ViewCacheEntryController',
		[ '$scope', '$state', '$stateParams', '$log', '$modalInstance',
		  'cacheEntry',

	function( $scope, $state, $stateParams, $log, $modalInstance,
				cacheEntry) {

		$scope.cacheEntry = cacheEntry;

		// Derived from http://stackoverflow.com/a/1359808 and http://stackoverflow.com/a/23124958
		$scope.sortObjectKeys = function(o) {
			if(typeof o !== 'object' || null == o) {
				return o;
			}

			// Maintain the order of arrays, but sort keys of the array elements
			if(Array.isArray(o)) {
				return o.map($scope.sortObjectKeys);
			}

			var sorted = {}, key, keys = [];
			for(key in o) {
				if(o.hasOwnProperty(key)) {
					keys.push(key);
				}
			}
			keys.sort();
			for(key = 0; key < keys.length; key++) {
				sorted[keys[key]] = $scope.sortObjectKeys( o[keys[key]] );
			}

			return sorted;
		};

		/**
		 * When the user has declared that they
		 * are done with this form, dismiss it
		 */
		$scope.done = function() {
			$modalInstance.dismiss();
		};

	}
]);