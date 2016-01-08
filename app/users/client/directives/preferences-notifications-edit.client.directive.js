/*global d3:false */
'use strict';

angular
	.module('asymmetrik.users')
	.directive('wfNotificationPreferencesEdit', function($log, $modal) {
		return {
			restrict: 'A',
			scope: {
				notificationType: '=wfNotificationType',
				referenceId: '=wfReferenceId'
			},
			templateUrl: 'app/users/views/preferences/notification-manage-icon.client.view.html',
			controller: function($scope) {
				
				var modalInstance;
				
				// Modal close action
				$scope.closeAction = function(){
					modalInstance.dismiss();
				};
				
				$scope.editNotificationPreferences = function() {
					
					modalInstance = $modal.open({
						templateUrl: 'app/users/views/preferences/notification.client.view.html',
						controller: 'ManageNotificationPreferenceController',
						backdrop: 'static',
						scope: $scope
					});
					modalInstance.result.then(function(result){
						// Don't need to do anything
					});
					
				};
				
			}
		};
	});