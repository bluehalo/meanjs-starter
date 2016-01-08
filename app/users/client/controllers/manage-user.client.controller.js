'use strict';

angular.module('asymmetrik.users').controller('ManageUserController',
		[ '$scope', '$location', '$log', '$stateParams', '$state', 
		  'userService', 'adminService', 'authService', 'cacheEntriesService', 'configService', 'Authentication', 'UserConfig', 'Alerts',

	function( $scope, $location, $log, $stateParams, $state, 
			  userService, adminService, authService, cacheEntriesService, configService, Authentication, UserConfig, Alerts ) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.roles = $scope.auth.roles;
		$scope.config = UserConfig;
		$scope.mode = $state.current.data.mode;
		$scope.proxyPki = $scope.config.auth === 'proxy-pki';

		$scope.alertService = Alerts;

		$scope.phoneProviders = [
			{ label: 'AT&T', value: 'txt.att.net' },
			{ label: 'T-Mobile', value: 'tmomail.net' },
			{ label: 'Verizon', value: 'vtext.com' },
			{ label: 'Sprint', value: 'messaging.sprintpcs.com' },
			{ label: 'Virgin Mobile', value: 'vmobl.com' },
			{ label: 'Tracfone', value: 'mmst5.tracfone.com' },
			{ label: 'Metro PCS', value: 'mymetropcs.com' },
			{ label: 'Boost Mobile', value: 'myboostmobile.com' },
			{ label: 'Cricket', value: 'sms.mycricket.com' },
			{ label: 'Nextel', value: 'messaging.nextel.com' },
			{ label: 'Alltel', value: 'message.alltel.com' },
			{ label: 'Ptel', value: 'ptel.com' },
			{ label: 'Suncom', value: 'tms.suncom.com' },
			{ label: 'Qwest', value: 'qwestmp.com' },
			{ label: 'U.S. Cellular', value: 'email.uscc.net' }
		];

		$scope.smsEnabled = false;
		configService.getConfig().then(function(config) {
			if (null != config && null != config.notifications && config.notifications.sms) {
				// only enable SMS if the notification setting is set to true
				$scope.smsEnabled = true;
			}
		});

		/**
		 * Sorting method provided for the Phone Provider select input
		 */
		$scope.orderByLabel = function(provider) {
			return provider.label;
		};

		/**
		 * Watch method for the input phoneNumber and phoneProvider fields
		 * in order to conditionally format and persist their values to the
		 * scoped user.phone attribute
		 */
		var watchPhoneFields = function(newValue, oldValue){
			if(null != $scope.user) {
				$scope.user.phone = formatPhoneNumberForPersistence({
					number: $scope.phoneNumber,
					provider: $scope.phoneProvider
				});
			}
		};

		/*
		 * Set up watches on the input phone fields in order to
		 * format and persist their values to the scoped user.phone attribute
		 */
		$scope.$watch('phoneNumber', watchPhoneFields);
		$scope.$watch('phoneProvider', watchPhoneFields);

		/**
		 * When either of the phone number fields are updated, this function will be used
		 * to properly convert those fields into a format that can be saved to the service
		 */
		function formatPhoneNumberForPersistence(userPhone) {
			if(null != userPhone.number && null != userPhone.provider && null != userPhone.provider.value) {
				return userPhone.number + '@' + userPhone.provider.value;
			}
			return null;
		}

		/**
		 * Detects whether the input phoneNumber and phoneProvider fields are valid,
		 * since the phoneProvider is conditionally required based on the existence
		 * of the phoneNumber field.
		 */
		function phoneValid() {
			var hasPhoneNumber = (typeof $scope.phoneNumber === 'number') && !isNaN($scope.phoneNumber);
			if(hasPhoneNumber) {
				// phone number set to 10 characters and provider selected
				return $scope.phoneNumber.toString().length === 10 && (null != $scope.phoneProvider);
			}
			// no phone number is valid since it's an optional field
			return true;
		}

		/**
		 * Provides validation on the input form, returning false if
		 * any validation errors occur and setting the scoped 'error' field
		 */
		function validateInput() {
			// Check the phone number and provider.
			if( !phoneValid() ){
				$scope.error = 'If Phone is provided, it must be a 10-digit number with a wireless provider';
				return false;
			}

			// Validate that the passwords match
			var validatePassword = authService.validatePassword($scope.user.password, $scope.user.verifyPassword);
			if(!validatePassword.valid) {
				$scope.error = validatePassword.message;
				return;
			}

			return true;
		}

		/**
		 * Whenever data is reloaded from the user service, either for the Admin or User view,
		 * extract the two input 'phone' fields from the single persisted string and set those
		 * values to the scoped input variables, phoneNumber and phoneProvider
		 */
		function setScopePhoneFieldsFromSavedData(phoneWithProvider) {
			var phoneParts = (null != phoneWithProvider) ? phoneWithProvider.split('@') : ['', ''];

			var phoneNumber = phoneParts[0],
				phoneProvider = phoneParts[1];

			// Find the index with the value match in the phoneProvider options
			var matches = $scope.phoneProviders.filter(function(p) {
				if(p.value === phoneProvider) {
					return true;
				}
			});

			$scope.phoneNumber = parseInt(phoneNumber);
			$scope.phoneProvider = matches.length === 0 ? null : matches[0];
		}

		/**
		 * Load the current user into the controller user object
		 */
		function loadCurrentUser() {
			setScopePhoneFieldsFromSavedData($scope.auth.user.phone);

			// The user to edit is this user
			$scope.user = {
				name: $scope.auth.user.name,
				username: $scope.auth.user.username,
				email: $scope.auth.user.email,
				organization: $scope.auth.user.organization,
				bypassAccessCheck: $scope.auth.user.bypassAccessCheck
			};

			if($scope.proxyPki) {
				$scope.user.externalRoles = $scope.auth.user.externalRoles;
				$scope.user.externalGroups = $scope.auth.user.externalGroups;
				$scope.user.providerData = { dn: (null != $scope.auth.user.providerData)? $scope.auth.user.providerData.dn : undefined };
			}

		}

		/**
		 * Refresh the user's cache entry
		 */
		$scope.refreshCredentials = function() {
			// Refresh the cache entry
			$scope.refreshing = true;
			cacheEntriesService.refreshCurrentUser().then(
				function(result) {
					// Show the "entry refreshed" confirmation
					$scope.alertService.add('Credentials successfully refreshed', 'success');
					$scope.refreshing = false;
					authService.signin($scope.credentials).then(function(result) {
						loadCurrentUser();
					}, function(error) {
						$scope.alertService.add(error.message);
					});
				},
				function(error){
					// remove temporary flag to enable button
					$scope.alertService.add(error.message);
					$scope.refreshing = false;
				}
			);
			$log.debug('refresh cache entry: %s', $scope.auth.user.providerData.dnLower);
		};

		/**
		 * Create a user based on the current state of the controller
		 */
		function createUserAdmin() {
			$log.debug('Create user: %s', $scope.user.username );

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
			$log.debug('Edit user: %s', $scope.user.username );

			if(!validateInput()) return;

			// Check the password
			var validatePassword = authService.validatePassword($scope.user.password, $scope.user.verifyPassword);
			if(!validatePassword.valid) {
				$scope.error = validatePassword.message;
				return;
			}

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
			$log.debug('Signup user: %s', $scope.user.username );

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
			$log.debug('Update user: %s', $scope.user.username );

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

		// Metadata is only unlocked when bypass is enabled (and you are in proxy-pki mode)
		$scope.metadataLocked = $scope.proxyPki;
		$scope.okDisabled = $scope.proxyPki;

		if($scope.proxyPki) {
			$scope.$watch('user.bypassAccessCheck', function(n, o) {
				$scope.metadataLocked = null != ($scope.user) && !$scope.user.bypassAccessCheck;
				$scope.okDisabled = $scope.mode === 'edit' && null != $scope.auth.user && !$scope.auth.user.bypassAccessCheck;
			});
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
				setScopePhoneFieldsFromSavedData(result.phone);
				$scope.user = result;
			}, function(error){
				$log.error('User with id: %s does not exist.', $stateParams.userId);
			});

		} else if($scope.mode === 'signup') {
			// Signup/Create mode
			$scope.title = 'New Account Request';
			$scope.subtitle = 'Provide the required information to request an account';
			$scope.okButtonText = 'Submit';
			$scope.okAction = createUser;

			// Signing up from scratch
			$scope.user = {};

		} else if($scope.mode === 'edit') {
			// Edit yourself mode
			$scope.title = 'Edit Profile';
			$scope.subtitle = 'Make changes to your profile information';
			$scope.okButtonText = 'Save';
			$scope.okAction = updateUser;

			loadCurrentUser();

		} else {
			// Invalid mode
			$scope.user = {};
			$log.error('Invalid mode');
		}
	}
]);