'use strict';

angular.module('app.core').controller('BannerController',
		[ '$scope', 'Authentication', 'authService', 'configService',

	function( $scope, Authentication, authService, configService) {

		$scope.auth = Authentication;

		configService.getConfig().then(function(result){
			$scope.classification = result.classification;
			$scope.classification.css = 'classification-' + result.classification.code;

			$scope.copyright = result.copyright;
		});

	}
]);