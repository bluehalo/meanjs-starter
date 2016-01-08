'use strict';

angular.module('asymmetrik.users').controller('ListUsersController',
		[ '$scope', '$location', '$log', '$modal', 
		  'userService', 'adminService', 'Authentication', 'authService', 'cacheEntriesService', 'UserConfig', 'Alerts', 

	function( $scope, $location, $log, $modal, 
			  userService, adminService, Authentication, authService, cacheEntriesService, UserConfig, Alerts) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.config = UserConfig;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();

		$scope.users = [];
		$scope.roles = $scope.auth.roles.array;

		// Search phrase
		$scope.search = '';

		// Sort options for the page
		$scope.sort = userService.sort.map;

		$scope.columns = {
 			'name': true,
 			'username': true,
 			'email': false,
 			'phone': false,
 			'acceptedEua': false,
 			'lastLogin': true,
 			'created': false,
 			'updated': false,
 			'roles': true,
 			'bypassAccessCheck': false,
 			'externalRoles': false,
 			'externalGroups': false,
 			'_id': false,
		};

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
			sort: $scope.sort.name
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
		 * Searching the users
		 */

		$scope.filters = {
			bypassAC: false,
			noUserRole: false,
			editorRole: false,
			auditorRole: false,
			adminRole: false
		};

		function getQuery() {
			var query;
			var elements = [];

			if($scope.filters.bypassAC) {
				elements.push({ bypassAccessCheck: true });
			}

			if($scope.filters.noUserRole) {
				elements.push({ 'roles.user': false });
				elements.push({ 'roles.user': { '$exists': false } });
			}

			if($scope.filters.editorRole) {
				elements.push({ 'roles.editor': true });
			}

			if($scope.filters.auditorRole) {
				elements.push({ 'roles.auditor': true });
			}

			if($scope.filters.adminRole) {
				elements.push({ 'roles.admin': true });
			}

			if(elements.length > 0) {
				query = { $or: elements };
			}
			return query;
		}

		// Method handler for return keypress in the search box
		$scope.applySearchKeypress = function(keyEvent) {
			if(keyEvent.which === 13) {
				$scope.options.pageNumber = 0;
				$scope.applySearch();
			}
		};

		// Search method that actually executes the search and updates the streams list
		$scope.applySearch = function() {

			$scope.results.resolved = false;

			adminService.search(getQuery(), $scope.search, {
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
		
		$scope.exportUserData = function() {
			var dialog = $modal.open({
				templateUrl: 'app/users/views/report/get-user-field.client.view.html',
				controller: 'GetUserFieldController',
				backdrop: 'static',
				size: 'lg'
			});
			
			// No need to do anything on dialog.result
		};

		$scope.refreshUserCredentials = function(user) {
			// Refresh the user

			// temporary flag to show that the user is refreshing
			user.isRefreshing = true;
			cacheEntriesService.refreshEntry(user.providerData.dnLower).then(
				function(result) {
					// Show the "user refreshed" confirmation thing
					$scope.alertService.add('Refreshed user: ' + user.username, 'success');

					// remove temporary flag to disable button
					delete user.isRefreshing;
				},
				function(error){
					// remove temporary flag to enable button
					delete user.isRefreshing;
					$scope.alertService.add(error.message);
				}
			);
			$log.debug('refresh user: %s', user.username);
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
				$log.debug('delete user: %s', user.username);
			});
		};

		$scope.applySearch();

	}
]);