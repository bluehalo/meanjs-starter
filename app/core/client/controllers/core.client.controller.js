'use strict';

angular.module('app.core').controller('CoreController',
		[ '$scope', 'Authentication', 'Help', 'authService', 'configService',

	function( $scope, Authentication, Help, authService, configService) {

		$scope.auth = Authentication;
		$scope.help = Help;

		configService.getConfig().then(function(result){
			$scope.classification = result.classification;
			$scope.classification.css = 'classification-' + result.classification.code;

			$scope.copyright = result.copyright;

			$scope.pki = result.auth === 'proxy-pki';
		});

	}
]);