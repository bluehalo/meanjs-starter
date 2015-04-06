'use strict';

angular.module('asymmetrik.groups').controller('ListGroupsController',
	[ '$scope', '$location', '$state', '$stateParams', '$log', '$modal',
	  'Authentication', 'authService', 'groupService', 'Alerts', 

	function ($scope, $location, $state, $stateParams, $log, $modal, 
			  Authentication, authService, groupService, Alerts) {

		/**
		 * Page scope setup
		 */
		$scope.title = 'Groups';
		$scope.subtitle = 'Manage group-based access control';

		// store the authentication object in the scope
		$scope.auth = Authentication;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();

		// The list of groups
		$scope.groups = [];

		// Search phrase
		$scope.search = '';

		// Sort options for the page
		$scope.sort = groupService.sort;

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
			pageSize: 12,
			sort: $scope.sort.map.title
		};

		/**
		 * Managing Groups
		 */

		$scope.remove = function(group) {

			var params = {
				message: 'Are you sure you want to delete the group: <strong>"' + group.title + '"</strong>?<br/>This action cannot be undone.',
				title: 'Delete group?',
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

			dialog.result.then(function(){
				// Remove the user
				groupService.remove(group._id).then(
					function(result) {
						$log.info('deleted group: ' + group._id);
						$scope.applySearch();
					},
					function(error){
						$log.error('Failed to delete group: ' + error);
						$scope.alertService.add('Error deleting group: ' + error);
					}
				);
			});
		};

		/**
		 * Paging/Sorting Results
		 */

			// Go to specific page number
		$scope.goToPage = function (pageNumber) {
			$scope.options.pageNumber = Math.min($scope.results.totalPages - 1, Math.max(pageNumber, 0));
			$scope.applySearch();
		};

		// Set the page size
		$scope.setPageSize = function (pageSize) {
			$scope.options.pageSize = pageSize;
			$scope.applySearch();
		};

		// Set the sort order
		$scope.setSort = function (sort) {
			$scope.options.sort = sort;
			$scope.applySearch();
		};

		/**
		 * Searching the groups
		 */

		// Method handler for return keypress in the search box
		$scope.applySearchKeypress = function (keyEvent) {
			if (keyEvent.which === 13) {
				$scope.applySearch();
			}
		};

		//Search method that actually executes the search and updates the groups list
		$scope.applySearch = function () {
			var query = {};

			$scope.results.resolved = false;

			groupService.search(query, $scope.search, {
				page: $scope.options.pageNumber,
				size: $scope.options.pageSize,
				sort: $scope.options.sort.sort,
				dir: $scope.options.sort.dir
			}).then(function (result) {
				if (null != result) {
					$scope.groups = result.elements;
					$scope.results.pageNumber = result.pageNumber;
					$scope.results.pageSize = result.pageSize;
					$scope.results.totalPages = result.totalPages;
					$scope.results.totalSize = result.totalSize;
				} else {
					$scope.groups = [];
				}

				$scope.results.resolved = true;
			}, function (error) {
				$log.error(error);
				$scope.results.resolved = true;
			});
		};

		// Apply the search to start with some data
		$scope.applySearch();
	}
]);