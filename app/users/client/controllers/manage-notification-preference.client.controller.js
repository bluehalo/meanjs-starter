'use strict';

angular.module('asymmetrik.users').controller('ManageNotificationPreferenceController',
		[ '$scope', '$location', '$log', '$q', '$stateParams', '$state',
		  'userNotificationPreferencesService', 'configService',

	function( $scope, $location, $log, $q, $stateParams, $state,
			  userNotificationPreferencesService, configService ) {

		$scope.preferences = {
			email: false,
			sms: false,
			ui: true
		};

		$scope.notificationOptions = [];
		configService.getConfig().then(function(config) {
			if (config.notifications.ui) {
				$scope.notificationOptions.push({ type: 'ui', display: 'Browser' });
			}
			if (config.notifications.email) {
				$scope.notificationOptions.push({ type: 'email', display: 'Email' });
			}
			if (config.notifications.sms) {
				$scope.notificationOptions.push({ type: 'sms', display: 'SMS' });
			}
		});

		// Create an API function to save the current state and pass back a promise to the caller.
		if (null != $scope.api) {
			$scope.submitUpdates = false;

			$scope.api.isInvalid = function() {
				// This is always valid, at least for now.
				return false;
			};

			$scope.api.save = function(referenceId) {
				var defer = $q.defer();

				// If a referenceId was passed in just now, use it.  This lets this function get called
				// before the $digest cycle has run.
				if (null != referenceId) {
					$scope.referenceId = referenceId;
				}
				// If we don't yet have a referenceId, there's nothing to do here
				if (null == $scope.referenceId) {
					defer.resolve(null);
				}
				userNotificationPreferencesService
					.save($scope.referenceId, $scope.notificationType, $scope.preferences)
					.then(function(result) {
						defer.resolve($scope.preferences);
					}, function(error) {
						defer.reject(error);
					});
				return defer.promise;
			};
		}
		// Otherwise, let changes be saved immediately, ignoring any parent directives
		else {
			$scope.submitUpdates = true;
		}

		$scope.toggleNotificationPreference = function(notifType) {
			var oldValue = $scope.preferences[notifType];
			$scope.preferences[notifType] = !oldValue;

			// Save to service
			save();
		};

		function save() {
			if ($scope.submitUpdates && null != $scope.referenceId) {
				userNotificationPreferencesService.save($scope.referenceId, $scope.notificationType, $scope.preferences);
			}
		}
		
		$scope.$watch('referenceId', function(n, o) {
			// If we're in edit mode, try to load the preferences from the database
			if (n != null && !$scope.create) {
				userNotificationPreferencesService.get($scope.referenceId, $scope.notificationType).then(function (data) {
					$scope.preferences = data;
				});
			}
		});
	}
]);