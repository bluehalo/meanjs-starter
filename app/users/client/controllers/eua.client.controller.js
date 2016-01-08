'use strict';

angular.module('asymmetrik.users').controller('EuaController',
		[ '$scope', '$location', '$log',
		  'Authentication', 'authService', 'Alerts', 'UserAgreement', 'userService', 

	function( $scope, $location, $log, 
			  Authentication, authService, Alerts, UserAgreement, userService) {

		$scope.agree = false;

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();
		$scope.eua = UserAgreement;

		$scope.accept = function() {
			authService.acceptEua().then(function(result) {
				$log.debug('Accepted EUA for user.');
				userService.goToLastRoute();
			}, function(error){
				$scope.alertService.add(error.message);
				$log.error('Error persisting EUA accept');
			});
		};

	}
]);