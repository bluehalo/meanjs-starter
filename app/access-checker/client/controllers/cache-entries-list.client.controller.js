'use strict';

angular.module('asymmetrik.access-checker').controller('CacheEntriesListController',
	[ '$scope', '$location', '$log', '$modal',
		'cacheEntriesService', 'Alerts',

		function( $scope, $location, $log, $modal,
				   cacheEntriesService, Alerts) {

			// Store our global objects in the scope
			$scope.alertService = Alerts;
			$scope.alertService.clearAll();

			$scope.cacheEntries = [];

			// Search phrase
			$scope.search = '';

			// Sort options for the page
			$scope.sort = cacheEntriesService.sort.map;

			// Metadata about the currently displayed set of data
			$scope.results = {
				pageNumber: 0, // The current page number
				pageSize: 0,   // The number of elements in the current page
				totalPages: 0, // The total number of pages
				totalSize: 0,   // The total number of elements in the set
				resolved: false // indicates if search query has completed or is running
			};

			// The current configuration of the paging/sorting options
			$scope.options = {
				pageNumber: 0,
				pageSize: 50,
				sort: $scope.sort.key
			};


			/**
			 * Paging/Sorting Results
			 */

			// Go to specific page number
			$scope.goToPage = function(pageNumber) {
				$scope.options.pageNumber = pageNumber;
				$scope.applySearch();
			};

			// Set the sort order
			$scope.setSort = function(sort){
				$scope.options.sort = sort;
				$scope.applySearch();
			};


			/**
			 * Searching the cache entries
			 */

			// Method handler for return keypress in the search box
			$scope.applySearchKeypress = function(keyEvent) {
				if(keyEvent.which === 13) {
					$scope.options.pageNumber = 0;
					$scope.applySearch();
				}
			};

			// Contains search for Cache Entry keys
			$scope.applySearch = function() {
				var search = $scope.search;

				return cacheEntriesService.match({ /* open search */ }, search, {
					page: 0,
					size: 20,
					sort: $scope.options.sort.sort,
					dir: $scope.options.sort.dir
				}).then(function(result){
					if(null != result){
						$scope.cacheEntries = result.elements;
						$scope.results.pageNumber = result.pageNumber;
						$scope.results.pageSize = result.pageSize;
						$scope.results.totalPages = result.totalPages;
						$scope.results.totalSize = result.totalSize;
					} else {
						$scope.cacheEntries = [];
					}

					$scope.results.resolved = true;
				}, function(error) {
					$scope.alertService.add(error.message);
					$log.error(error);
					$scope.results.resolved = true;
				});
			};

			$scope.refreshCacheEntry = function(cacheEntry) {
				// Refresh the cache entry

				// temporary flag to show that the entry is refreshing
				cacheEntry.isRefreshing = true;
				cacheEntriesService.refreshEntry(cacheEntry.key).then(
					function(result) {
						// Show the "entry refreshed" confirmation
						$scope.alertService.add('Refreshed cache entry: ' + cacheEntry.key, 'success');

						// remove temporary flag to disable button
						delete cacheEntry.isRefreshing;

						// reapply the search
						$scope.applySearch();
					},
					function(error){
						// remove temporary flag to enable button
						delete cacheEntry.isRefreshing;
						$scope.alertService.add(error.message);
					}
				);
				$log.debug('refresh cache entry: %s', cacheEntry.key);
			};

			$scope.viewCacheEntry = function(cacheEntry) {
				$modal.open({
					templateUrl: 'app/access-checker/views/view-cache-entry.client.view.html',
					controller: 'ViewCacheEntryController',
					size: 'lg',
					backdrop: 'static',
					resolve: {
						cacheEntry: function() { return cacheEntry; }
					}
				});
			};

			$scope.deleteCacheEntry = function(cacheEntry) {
				var params = {
					message: 'Are you sure you want to delete entry: "' + cacheEntry.key + '" ?',
					title: 'Delete cache entry?',
					ok: 'Delete',
					cancel: 'Cancel'
				};

				var dialog = $modal.open({
					templateUrl: 'app/util/views/confirm.client.view.html',
					controller: 'ConfirmController',
					$scope: $scope,
					backdrop: 'static',
					resolve: {
						params: function () { return params; }
					}
				});

				dialog.result.then(function() {
					// Delete cache entry
					cacheEntriesService.deleteEntry(cacheEntry.key).then(
						function(result) {
							// Show the "entry deleted" confirmation
							$scope.alertService.add('Deleted cache entry: ' + cacheEntry.key, 'success');
							$scope.applySearch();
						},
						function(error){
							// remove temporary flag to enable button
							$scope.alertService.add(error.message);
						}
					);
					$log.debug('delete cache entry: %s', cacheEntry.key);
				});

			};

			$scope.applySearch();

		}
	]);