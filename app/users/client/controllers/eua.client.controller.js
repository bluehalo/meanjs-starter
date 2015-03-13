'use strict';

angular.module('asymmetrik.users').controller('EuaController',
		[ '$scope', '$location', '$log',
		  'Authentication', 'authService', 'Alerts', 'UserAgreement', 

	function( $scope, $location, $log, 
			  Authentication, authService, Alerts, UserAgreement) {

		$scope.agree = false;

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();
		$scope.eua = UserAgreement;

		$scope.accept = function() {
			authService.acceptEua().then(function(result) {
				$log.info('Accepted EUA for user.');
				$location.path('/');
			}, function(error){
				$scope.alertService.addAlert(error.message);
			});
		};

	}
]);