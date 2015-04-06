'use strict';

angular.module('asymmetrik.users').controller('ManageUserController',
		[ '$scope', '$location', '$log', '$stateParams', '$state', 
		  'userService', 'adminService', 'authService', 'configService', 'Authentication', 'UserConfig', 'Alerts',

	function( $scope, $location, $log, $stateParams, $state, 
			  userService, adminService, authService, configService, Authentication, UserConfig, Alerts ) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.roles = $scope.auth.roles;
		$scope.config = UserConfig;
		$scope.mode = $state.current.data.mode;

		/**
		 * Provides validation on the input form, returning false if
		 * any validation errors occur and setting the scoped 'error' field
		 */
		function validateInput() {
			// Check the password
			if($scope.user.password !== $scope.user.verifyPassword){
				$scope.error = 'Passwords do not match';
				return false;
			}

			return true;
		}


		/**
		 * Create a user based on the current state of the controller
		 */
		function createUserAdmin() {
			$log.info('Create user: ' + $scope.user.username );

			if(!validateInput()) return;

			adminService.create($scope.user).then(
				function(result) {
					$state.go('admin.user.list');
				},
				function(error) {
					$scope.error = error.message;
				}
			);
		}


		/**
		 * Admin-mode update user
		 */
		function updateUserAdmin() {
			$log.info('Edit user: ' + $scope.user.username );

			if(!validateInput()) return;

			adminService.update($scope.user).then(
				function(result) {
					$state.go('admin.user.list');
				},
				function(error) {
					$scope.error = error.message;
				}
			);
		}


		/**
		 * Request the creation of a new account
		 */
		function createUser() {
			$log.info('Signup user: ' + $scope.user.username );

			if(!validateInput()) return;

			authService.signup($scope.user).then(
				function(result) {
					// redirect to the base (the auth-based routing will take care of the rest)
					$location.path('/');
				},
				function(error) {
					$scope.error = error.message;
				}
			);
		}

		/**
		 * Update the current user
		 */
		function updateUser() {
			$log.info('Update user: ' + $scope.user.username );

			if(!validateInput()) return;

			userService.update($scope.user)
			.then(
				function(result) {
					$location.path('/');
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
		if($scope.mode === 'admin-create') {
			// Admin create mode
			$scope.title = 'Create User';
			$scope.subtitle = 'Provide the required information to create a new user';
			$scope.okButtonText = 'Create';
			$scope.okAction = createUserAdmin;

			// Creating a new user from scratch
			$scope.user = {};

		} else if($scope.mode === 'admin-edit') {
			// Admin edit a user mode
			$scope.title = 'Edit User';
			$scope.subtitle = 'Make changes to the user\'s information';
			$scope.okButtonText = 'Save';
			$scope.okAction = updateUserAdmin;

			// Editing the user with the specified id
			adminService.get($stateParams.userId).then(function(result){
				$scope.user = result;
			}, function(error){
				$log.error('User with id: ' + $stateParams.userId + ' does not exist.');
			});

		} else if($scope.mode === 'signup') {
			// Signup/Create mode
			$scope.title = 'New Account Request';
			$scope.subtitle = 'Provide the required information to request an account';
			$scope.okButtonText = 'Submit';
			$scope.okAction = createUser;

			// The user to edit is this user
			$scope.user = {};

		} else if($scope.mode === 'edit') {
			// Edit yourself mode
			$scope.title = 'Edit Profile';
			$scope.subtitle = 'Make changes to your profile information';
			$scope.okButtonText = 'Save';
			$scope.okAction = updateUser;

			// The user to edit is this user
			$scope.user = {
				name: $scope.auth.user.name,
				username: $scope.auth.user.username,
				email: $scope.auth.user.email
			};

		} else {
			// Invalid mode
			$scope.user = {};
			$log.error('Invalid mode');
		}
	}
]);