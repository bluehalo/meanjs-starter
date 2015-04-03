'use strict';

angular.module('asymmetrik.users').controller('SettingsController', 
		[ '$scope', '$location',
		  'Authentication', 'authService', 'userService', 

	function( $scope, $location,
			  Authentication, authService, userService ) {

		$scope.auth = Authentication;
		$scope.user = $scope.auth.user;

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid){

				$scope.success = $scope.error = null;
				userService.update($scope.user).then(function(response) {
					$scope.success = true;
					$scope.auth.setUser(response);
				}, function(error) {
					$scope.error = error.message;
				});

			} else {
				$scope.submitted = true;
			}
		};


		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			authService.updatePassword($scope.passwordDetails).then(function(result){
				$scope.success = true;
				$scope.passwordDetails = null;
			}, function(error){
				$scope.error = error.message;
			});

		};
	}
]);
