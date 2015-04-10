'use strict';

angular.module('asymmetrik.reports').controller('ViewReportController',
		[ '$scope', '$location', '$log', '$stateParams',
		  'Authentication', 'authService', 'Alerts', 
		  'reportService', 

	function( $scope, $location, $log, $stateParams,
			  Authentication, authService, Alerts,
			  reportService ) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();

		// Get the recent activity for the report of interest
		reportService.recentActivity($stateParams.reportId).then(function(result) {
			var processedActivity = reportService.processUserActivitySummary(result);

			$scope.report = result.report;
			$scope.users = processedActivity.users;
			$scope.current = processedActivity.current;
			$scope.previous = processedActivity.previous;

		}, function(error){
			$log.error('Report with id: ' + $stateParams.reportId + ' does not exist.');
		});
	}
]);