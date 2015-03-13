'use strict';

angular.module('asymmetrik.users').controller('AuthenticationController',
		[ '$scope', '$location',
		  'Authentication', 'authService', 'UserConfig', 'Alerts', 

	function( $scope, $location,
			  Authentication, authService, UserConfig, Alerts) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.config = UserConfig;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();

		// If user is signed in then redirect back home
		if ($scope.auth.isAuthenticated()) $location.path('/');

		$scope.signup = function() {
			var password = null;

			// Check the password
			if($scope.newPassword !== $scope.verifyPassword) {
				$scope.alertService.addAlert('Passwords do not match.');
				return;
			}

			var user = {
				name: $scope.user.name,
				email: $scope.user.email,
				username: $scope.user.username,
				password: $scope.newPassword
			};

			authService.signup(user).then(function(result) {
				$location.path('/');
			}, function(error){
				$scope.alertService.addAlert(error.message);
			});
		};


		$scope.signin = function() {
			authService.signin($scope.credentials).then(function(result) {
				$location.path('/');
			}, function(error){
				$scope.error = error.message;
			});
		};
	}
]);