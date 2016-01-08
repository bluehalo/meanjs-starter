'use strict';

// Setting up route
angular.module('asymmetrik.access-checker').config(['$stateProvider',
	function($stateProvider) {

		$stateProvider
			// Abstract cache entry route
			.state('admin.cache-entry', {
				abstract: true,
				template: '<ui-view/>',
				data: {
					roles: [ 'admin' ]
				}
			})

			/* List/search view for cache entries */
			.state('admin.cache-entry.list', {
				url: '/admin/cacheEntries',
				templateUrl: 'app/access-checker/views/cache-entries-list.client.view.html',
				controller: 'CacheEntriesListController',
				resolve: {
					config: function(configService) {
						return configService.getConfig();
					}
				}
			});

	}
]);