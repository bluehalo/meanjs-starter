'use strict';

angular.module('asymmetrik.users').controller('ListEuasController',
		[ '$scope', '$location', '$log', '$modal', 
		  'euaService', 'Authentication', 'Alerts', 

	function( $scope, $location, $log, $modal, 
			  euaService, Authentication, Alerts) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();

		$scope.euas = [];

		// Search phrase
		$scope.search = '';

		// Sort options for the page
		$scope.sort = euaService.sort.map;

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
			sort: $scope.sort.published
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
		 * Searching the euas
		 */

		// Method handler for return keypress in the search box
		$scope.applySearchKeypress = function(keyEvent) {
			if(keyEvent.which === 13) {
				$scope.options.pageNumber = 0;
				$scope.applySearch();
			}
		};

		// Search method that actually executes the search and updates the euas list
		$scope.applySearch = function() {

			$scope.results.resolved = false;

			euaService.search(undefined, $scope.search, {
				page: $scope.options.pageNumber,
				size: $scope.options.pageSize,
				sort: $scope.options.sort.sort,
				dir: $scope.options.sort.dir
			}).then(function(result){
				if(null != result){
					$scope.euas = result.elements;
					$scope.results.pageNumber = result.pageNumber;
					$scope.results.pageSize = result.pageSize;
					$scope.results.totalPages = result.totalPages;
					$scope.results.totalSize = result.totalSize;
				} else {
					$scope.euas = [];
				}

				$scope.results.resolved = true;
			}, function(error) {
				$scope.alertService.add(error.message);
				$log.error(error);
				$scope.results.resolved = true;
			});
		};



		$scope.deleteEua = function(eua){
			var params = {
				message: 'Are you sure you want to delete eua: "' + eua.title + '" ?',
				title: 'Delete eua?',
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
				// Delete the eua
				euaService.remove(eua._id).then(
					function(result) {
						// Show the "eua deleted" confirmation thing
						$scope.alertService.add('Deleted eua: ' + eua.title, 'success');
						$scope.applySearch();
					},
					function(error){
						$scope.alertService.add(error.message);
					}
				);
				$log.debug('delete eua: %s', eua.title);
			});
		};

		$scope.publishEua = function(eua){
			euaService.publish(eua._id).then(function(result){
				$scope.applySearch();
				$scope.alertService.add('Published ' + eua.title, 'success');
			}, function(error){
				$scope.alertService.add(error.message);
			});
		};

		$scope.applySearch();

	}
]);