'use strict';

angular.module('asymmetrik.users').controller('ManageAllNotificationPreferencesController',
		[ '$scope', '$location', '$log', '$stateParams', '$state', 'AborterList',
		  'userService', 'adminService', 'authService', 'userNotificationPreferencesService', 'configService', 'alertService',

	function( $scope, $location, $log, $stateParams, $state, AborterList,
			  userService, adminService, authService, userNotificationPreferencesService, configService, alertService) {

		var aborters = new AborterList();
		$scope.$on('$destroy', function() {
			aborters.abortAll();
		});

		// initialize here, and update by the user choosing different notification types to view
		$scope.currentNotificationType = 'alert';
		
		$scope.alertVolumeSensitivities = alertService.getVolumeSensitivityValueMap();
		
		$scope.notificationPreferences = [];

		$scope.results = {
			pageNumber: 0,
			pageSize: 0,
			totalPages: 0,
			totalSize: 0,
			resolved: false
		};

		// The current configuration of the paging/sorting options
		$scope.options = {
			pageNumber: 0,
			pageSize: 10,
			sort: '_id',
			dir: 'DESC'
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

		$scope.toggleNotificationPreference = function(referenceId, notificationType) {
			
			// Update the scoped value in the array, then persist to the service
			$scope.notificationPreferences.some(function(n) {
				
				if(referenceId === n._id) {
					
					var oldValue = n.notificationPreferences[notificationType];
					var newValue = !oldValue;
					n.notificationPreferences[notificationType] = newValue;
					
					// save to service
					userNotificationPreferencesService.save(referenceId, $scope.currentNotificationType, n.notificationPreferences);
					
					return true; // break
				}
				
			});
			
		};
		
		/**
		 * Retrieve the latest values of the Notification Preferences
		 * from the service, and set those to the proper scope attribute
		 */
		var applySearch = function() {

			aborters.onceWithTimeout('search', 10).then(function(aborter) {
				var query = {type: $scope.currentNotificationType};

				$scope.results.resolved = false;

				userNotificationPreferencesService.search(query, $scope.currentNotificationType, {
					page: $scope.results.pageNumber,
					size: $scope.options.pageSize,
				}, aborter.promise).then(function(result){
					if(null != result && null != result.elements && result.elements.length > 0){
						$scope.notificationPreferences = result.elements;
						$scope.results.pageNumber = result.pageNumber;
						$scope.results.pageSize = result.pageSize;
						$scope.results.totalPages = result.totalPages;
						$scope.results.totalSize = result.totalSize;
						$scope.results.streamMap = result.streamMap;
					} else {
						$scope.results = {};
					}
					$scope.results.resolved = true;
				}, function(error){
					$log.error(error);
					$scope.results.resolved = true;
				});
			});
		};
		
		$scope.$watchGroup(['currentNotificationType', 'results.pageNumber'], applySearch);

		$scope.hasTotalCountThreshold = function(pref) {
			return (null != pref &&
					null != pref.criteria &&
					null != pref.criteria.volume &&
					null != pref.criteria.volume.totalCountThreshold &&
					pref.criteria.volume.totalCountThreshold > 0);
		};

		// initialize
		applySearch($scope.currentNotificationType);
		
	}
]);