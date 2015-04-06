'use strict';

angular.module('asymmetrik.reports').controller('ManageReportController',
		[ '$scope', '$location', '$log', '$stateParams', '$state', 
		  'reportService', 'groupService', 'Authentication', 'Alerts',

	function( $scope, $location, $log, $stateParams, $state, 
			  reportService, Authentication, Alerts ) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.mode = $state.current.data.mode;
		$scope.periods = reportService.periods;

		/**
		 * Create a user based on the current state of the controller
		 */
		function createReport() {
			$log.info('Create report: ' + $scope.report.title );

			reportService.create($scope.report).then(
				function(result) {
					$state.go('report.list');
				},
				function(error) {
					$scope.error = error.message;
				}
			);
		}

		/**
		 * Admin-mode update eua
		 */
		function updateReport() {
			$log.info('Edit report: ' + $scope.report.title );

			reportService.update($scope.report).then(
				function(result) {
					$state.go('report.list');
				},
				function(error) {
					$scope.error = error.message;
				}
			);
		}

		/**
		 * Initialization code. 
		 * Determine which mode the controller is in and configure accordingly.
		 */
		if($scope.mode === 'create') {
			// Admin create mode
			$scope.title = 'Create Report';
			$scope.subtitle = 'Provide the required information to create a new report';
			$scope.okButtonText = 'Create';
			$scope.okAction = createReport;

			// Initialize the report object
			$scope.report = {
				period: $scope.periods.map.day.value
			};

		} else if($scope.mode === 'edit') {
			// Admin edit a user mode
			$scope.title = 'Edit Report';
			$scope.subtitle = 'Make changes to the report\'s information';
			$scope.okButtonText = 'Save';
			$scope.okAction = updateReport;

			// Editing the user with the specified id
			reportService.get($stateParams.reportId).then(function(result){
				$scope.report = result;
			}, function(error){
				$log.error('Report with id: ' + $stateParams.reportId + ' does not exist.');
			});

		} else {
			// Invalid mode
			$scope.report = {};
			$log.error('Invalid mode');
		}
	}
]);