'use strict';

angular.module('asymmetrik.reports').controller('ListReportsController',
		[ '$scope', '$location', '$log', '$modal', 
		  'reportService', 'Authentication', 'Alerts', 

	function( $scope, $location, $log, $modal, 
			  reportService, Authentication, Alerts) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();

		$scope.reports = [];

		// Search phrase
		$scope.search = '';

		// Sort options for the page
		$scope.sort = reportService.sort;

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
			sort: $scope.sort.map.title
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

		// Toggle Report
		$scope.toggleReport = function(report) {
			reportService.setActive(report._id, !report.active).then(
				function(result) {
					$log.info('Toggled report: ' + report._id);
					$scope.applySearch();
				},
				function(error){
					$log.error('Failed to toggle report: ' + error);
					$scope.alertService.add('Error toggling report: ' + error);
				}
			);
		};

		// Run Report
		$scope.runReport = function(report) {
			reportService.runReport(report._id).then(
				function(result) {
					$log.info('Ran report: ' + report._id);
					$scope.applySearch();
				},
				function(error){
					$log.error('Failed to run report: ' + error);
					$scope.alertService.add('Error running report: ' + error);
				}
			);
		};

		// Remove the group
		$scope.remove = function(report) {

			var params = {
				message: 'Are you sure you want to delete the report: <strong>"' + report.title + '"</strong>?<br/>This action cannot be undone.',
				title: 'Delete report?',
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
				reportService.remove(report._id).then(
					function(result) {
						$log.info('deleted report: ' + report._id);
						$scope.applySearch();
					},
					function(error){
						$log.error('Failed to delete report: ' + error);
						$scope.alertService.add('Error deleting report: ' + error);
					}
				);
			});
		};


		// Search method that actually executes the search and updates the subscriptions list
		$scope.applySearch = function() {

			$scope.results.resolved = false;

			reportService.search(undefined, $scope.search, {
				page: $scope.options.pageNumber,
				size: $scope.options.pageSize,
				sort: $scope.options.sort.sort,
				dir: $scope.options.sort.dir
			}).then(function(result){
				if(null != result){
					$scope.reports = result.elements;
					$scope.results.pageNumber = result.pageNumber;
					$scope.results.pageSize = result.pageSize;
					$scope.results.totalPages = result.totalPages;
					$scope.results.totalSize = result.totalSize;
				} else {
					$scope.reports = [];
				}

				$scope.results.resolved = true;
			}, function(error) {
				$scope.alertService.add(error.message);
				$log.error(error);
				$scope.results.resolved = true;
			});
		};

		$scope.toggleReportEnabled = function(report){
			reportService.setEnabled(report._id, !report.enabled).then(function(result){
				$scope.applySearch();
				$scope.alertService.add('Toggled enable for ' + report.title, 'success');
			}, function(error){
				$scope.alertService.add(error.message);
			});
		};

		$scope.applySearch();

	}
]);