'use strict';

angular.module('asymmetrik.users').controller('AuthenticationController',
		[ '$rootScope', '$scope', '$log', '$location', '$state',
		  'Authentication', 'authService', 'UserConfig', 'Alerts', 'userService',

	function( $rootScope, $scope, $log, $location, $state,
			  Authentication, authService, UserConfig, Alerts, userService) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.config = UserConfig;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();

		// If user is signed in then redirect back home
		if ($scope.auth.isAuthenticated()) {
			userService.goToLastRoute();
		}

		if ($scope.config.auth === 'proxy-pki') {
			authService.signin($scope.credentials).then(function(result) {
				userService.goToLastRoute();
			}, function(error) {
				// Will only happen when not configured to check access control
				if (error.message === 'New user') {
					$state.go('auth.signup');
				}
			});
		}

		$scope.signin = function() {
			authService.signin($scope.credentials).then(function(result) {
				userService.goToLastRoute();
			}, function(error){
				$scope.error = error.message;
			});
		};
	}
]);