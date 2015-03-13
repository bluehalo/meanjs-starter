'use strict';

// Setting up route
angular.module('app.core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise(function($injector) {
			var $state = $injector.get('$state');
			$state.go('entries.list');
		});

		// Creating a base, abstract state that will resolve the application config
		$stateProvider.state('entries', {
			abstract: true,
			template: '<ui-view/>',
			resolve: {
				Configuration: function(configService) {
					return configService.getConfig();
				}
			}
		})

		.state('entries.list', {
			templateUrl: '',
			controller: ''
		});

	}
]);