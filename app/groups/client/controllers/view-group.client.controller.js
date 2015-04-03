'use strict';

angular.module('asymmetrik.groups').controller('ViewGroupController',
	['$rootScope', '$scope', '$log', '$stateParams', '$timeout', '$q', '$modal',
		'Authentication', 'groupService',

		function ($rootScope, $scope, $log, $stateParams, $timeout, $q, $modal,
				  Authentication, groupService) {

			// Load the group
			groupService.get($stateParams.groupId).then(function(result) {
				$scope.group = result;
			}, function(error) {
				$log.error(error);
			});
		}
	]);
