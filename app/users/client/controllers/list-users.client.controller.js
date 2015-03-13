'use strict';

angular.module('asymmetrik.users').controller('ListUsersController',
		[ '$scope', '$location', '$log', '$modal', 
		  'userService', 'adminService', 'Authentication', 'authService', 'UserConfig', 'Alerts', 

	function( $scope, $location, $log, $modal, 
			  userService, adminService, Authentication, authService, UserConfig, Alerts) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.config = UserConfig;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();

		$scope.users = [];
		$scope.roles = $scope.auth.roles.list;

		// Search phrase
		$scope.search = '';

		// Sort options for the page
		$scope.sort = userService.sort;

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
			pageSize: 20,
			sort: $scope.sort.name
		};


		/**
		 * Paging/Sorting Results
		 */

		// Go to specific page number
		$scope.goToPage = function(pageNumber){
			$scope.options.pageNumber = Math.min($scope.results.totalPages-1, Math.max(pageNumber, 0));
			$scope.applySearch();
		};

		// Set the page size
		$scope.setPageSize = function(pageSize){
			$scope.options.pageSize = pageSize;
			$scope.applySearch();
		};

		// Set the sort order
		$scope.setSort = function(sort){
			$scope.options.sort = sort;
			$scope.applySearch();
		};


		/**
		 * Searching the subscriptions
		 */

		// Method handler for return keypress in the search box
		$scope.applySearchKeypress = function(keyEvent) {
			if(keyEvent.which === 13){
				$scope.applySearch();
			}
		};

		// Search method that actually executes the search and updates the subscriptions list
		$scope.applySearch = function() {

			$scope.results.resolved = false;

			adminService.search(undefined, $scope.search, {
				page: $scope.options.pageNumber,
				size: $scope.options.pageSize,
				sort: $scope.options.sort.sort,
				dir: $scope.options.sort.dir
			}).then(function(result){
				if(null != result){
					$scope.users = result.elements;
					$scope.results.pageNumber = result.pageNumber;
					$scope.results.pageSize = result.pageSize;
					$scope.results.totalPages = result.totalPages;
					$scope.results.totalSize = result.totalSize;
				} else {
					$scope.users = [];
				}

				$scope.results.resolved = true;
			}, function(error) {
				$scope.alertService.add(error.message);
				$log.error(error);
				$scope.results.resolved = true;
			});
		};



		$scope.deleteUser = function(user){
			var params = {
				message: 'Are you sure you want to delete user: "' + user.username + '" ?',
				title: 'Delete user?',
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
				// Delete the user
				adminService.remove(user._id).then(
					function(result) {
						// Show the "user deleted" confirmation thing
						$scope.alertService.add('Deleted user: ' + user.username, 'success');
						$scope.applySearch();
					},
					function(error){
						$scope.alertService.add(error.message);
					}
				);
				$log.info('delete user: ' + user.username);
			});
		};

		$scope.applySearch();

	}
]);