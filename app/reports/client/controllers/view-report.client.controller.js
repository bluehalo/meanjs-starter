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
		reportService.recentActivity($stateParams.reportId).then(function(result){
			var report = result.report;
			var reportInstances = result.reportInstances;
			var profileMetadata = result.profileMetadata;

			// Figure out which is the current and which is the previous
			var currentInstance, previousInstance;
			if(reportInstances.length > 0) {
				currentInstance = reportInstances[0];
			}
			if(reportInstances.length > 1) {
				previousInstance = reportInstances[1];
			}

			// Build a map of screen names to profile data
			var usersMap = {};
			profileMetadata.forEach(function(element) {
				if(null == element) return;

				var sn = element.screenName;
				if(null == usersMap[sn]) {
					usersMap[sn] = {};
				}

				if(null != currentInstance && currentInstance._id === element.reportInstance) {
					usersMap[sn].current = element;
				} else if(null != previousInstance && previousInstance._id === element.reportInstance){
					usersMap[sn].previous = element;
				}

			});

			// convert the map to an array
			var users = [];
			for(var key in usersMap) {
				var element = usersMap[key];
				element.screenName = key;

				users.push(element);
			}

			$scope.users = users;
			$scope.report = report;
			$scope.current = currentInstance;
			$scope.previous = previousInstance;

		}, function(error){
			$log.error('Report with id: ' + $stateParams.reportId + ' does not exist.');
		});
	}
]);