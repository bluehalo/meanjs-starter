/*global d3:false */
'use strict';

angular
	.module('asymmetrik.users')
	.directive('wfNotificationPreferences', function() {
		return {
			restrict: 'A',
			scope: {
				notificationType: '@wfNotificationType',
				referenceId: '=wfReferenceId',
				enabled: '=wfEnabled',
				api: '=?wfApi',
				create: '=wfCreate',
				preferences: '=?wfPreferences'
			},
			templateUrl: 'app/users/views/preferences/notification.client.view.html',
			controller: 'ManageNotificationPreferenceController'
		};
	});