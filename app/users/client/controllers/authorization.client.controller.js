'use strict';

angular.module('asymmetrik.users').controller('AuthorizationController',
		[ '$rootScope', '$scope', '$log', '$location', '$state',
		  'Authentication', 'authService', 'UserConfig', 'Alerts', 'userService',

	function( $rootScope, $scope, $log, $location, $state,
			  Authentication, authService, UserConfig, Alerts, userService) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.config = UserConfig;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();

	}
]);