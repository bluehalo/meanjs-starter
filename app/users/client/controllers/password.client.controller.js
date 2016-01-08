'use strict';

angular.module('asymmetrik.users').controller('PasswordController',
		[ '$scope', '$stateParams', '$state', '$location', '$log',
		  'Authentication', 'authService', 'UserConfig', 

	function( $scope, $stateParams, $state, $location, $log, 
			  Authentication, authService, UserConfig) {

		$scope.auth = Authentication;
		$scope.config = UserConfig;

		// messages
		$scope.error = null;
		$scope.success = null;
		$scope.pending = null;

		// token is valid?
		$scope.invalid = false;


		// If user is signed in then redirect back home
		if($scope.auth.isAuthenticated()) $location.path('/');

		// If we aren't running in local mode, users shouldn't be able to change passwords
		if($scope.config.auth !== 'local') $location.path('/');


		// If there is a token, validate it
		if(null != $stateParams.token) {
			authService.validateToken($stateParams.token).then(function(result) {
				// The token is valid
				$scope.invalid = false;

			}, function(error) {
				// The token is invalid
				$scope.invalid = true;

			});
		}


		// Ask for a password reset
		$scope.requestPasswordReset = function() {
			$scope.success = $scope.error = null;
			$scope.pending = 'Processing request...';

			if(null == $scope.username) {
				$scope.error = 'Missing username.';
				return;
			}

			$log.debug('Requesting password reset for user: %s', $scope.username);
			authService.forgotPassword($scope.username).then(function(result){
				$scope.username = null;
				$scope.success = result;
				$scope.pending = null;
			}, function(error){
				$scope.error = error.message;
				$scope.pending = null;
			});
		};


		// Change user password
		$scope.resetPassword = function() {
			$scope.success = $scope.error = null;

			// Check the password
			var validatePassword = authService.validatePassword($scope.password, $scope.verifyPassword);
			if(!validatePassword.valid) {
				$scope.alertService.add(validatePassword.message);
				return;
			}

			authService.resetPassword($stateParams.token, $scope.password).then(function(result){
				$scope.password = null;
				$scope.verifyPassword = null;

				$state.go('auth.password.reset-success');
			}, function(error){
				$scope.error = error.message;
			});

		};

	}
]);