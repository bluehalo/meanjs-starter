'use strict';

angular.module('app.core').service('configService', [ '$http', '$q',
	function($http, $q){

		// Create a defer and then make the call to resolve it 
		var configDefer = $q.defer();
		$http({
			method: 'get',
			url: 'config'
		}).then(function(response){
			// Success
			configDefer.resolve(response.data);
		}, function(response){
			// Failed
			if (!angular.isObject( response.data ) || null == response.data.message){
				configDefer.reject('An unknown error occurred.');
			}

			configDefer.reject(response.data.message);
		});


		/**
		 * Public methods to be exposed through the service
		 */

		// Get Config - Returns a promise for loading the singleton config instance
		function getConfig() {
			return configDefer.promise;
		}


		/**
		 * Private methods
		 */



		/**
		 * Return the public API
		 */
		return {
			getConfig: getConfig
		};
	}
]);