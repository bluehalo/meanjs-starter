'use strict';

angular.module('asymmetrik.groups').controller('ManageGroupController',
		[ '$scope', '$state', '$stateParams', '$log',
		  'Authentication', 'UserConfig', 'authService', 'groupService', 'Alerts',

	function( $scope, $state, $stateParams, $log,
			  Authentication, UserConfig, authService, groupService, Alerts) {

		// Store our global objects in the scope
		$scope.auth = Authentication;

		$scope.alertService = Alerts;
		$scope.alertService.clearAll();

		$scope.config = UserConfig;
		$scope.proxyPki = $scope.config.auth === 'proxy-pki';

		// Figure out what mode we're running in (create | edit)
		$scope.mode = {
			create: (null == $stateParams.groupId),
			edit: (null != $stateParams.groupId)
		};

		// Check to see if we need to enable externalGroups
		$scope.showExternalGroups = false;

		// We show the external groups when we're in proxy pki mode only
		if($scope.proxyPki) {
			$scope.$watch('group', function() {
				// Only shown when the user is admin or the user has group admin
				if(null != $scope.group && null != $scope.auth) {
					$scope.showExternalGroups = $scope.auth.canManageGroup($scope.group._id);
				}
			});
		}

		$scope.createFn = function(){
			$scope.error = '';
			groupService.create($scope.group).then(function(response) {
				$state.go('group.list');
			}, function(error) {
				$scope.error = error;
				$log.error(error);
			});
		};

		$scope.saveFn = function(){
			$scope.error = '';
			groupService.update($scope.group).then(function(response) {
				$state.go('group.list');
			}, function(error) {
				$scope.error = error;
				$log.error(error);
			});
		};

		// Configure the view based on our mode
		if($scope.mode.edit) {
			$scope.title = 'Edit Group';
			$scope.subtitle = 'Modify and save basic group metadata';
			$scope.okButtonText = 'Save';
			$scope.okAction = $scope.saveFn;

			// load the group
			groupService.get($stateParams.groupId).then(function(result){
				$scope.group = result;
			}, function(error){
				$log.error(error);
			});

		} else {
			$scope.title = 'Create Group';
			$scope.subtitle = 'Provide some basic metadata to create a new group';
			$scope.okButtonText = 'Create';
			$scope.okAction = $scope.createFn;
		}
	}
]);