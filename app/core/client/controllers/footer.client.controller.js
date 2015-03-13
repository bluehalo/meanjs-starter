'use strict';

angular.module('app.core').controller('FooterController',
		[ '$scope', 'Authentication', 'authService',

	function( $scope, Authentication, authService ) {
		$scope.auth = Authentication;
	}
]);