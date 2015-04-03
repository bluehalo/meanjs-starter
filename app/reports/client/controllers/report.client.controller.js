'use strict';

angular.module('asymmetrik.reports').controller('ReportController',
		[ '$scope', '$location', '$log',
		  'Authentication', 'authService', 'Alerts', 

	function( $scope, $location, $log, 
			  Authentication, authService, Alerts) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();


	}
]);