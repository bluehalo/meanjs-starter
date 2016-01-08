'use strict';

// Setting up route
angular.module('app.core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise(function($injector) {
			var $state = $injector.get('$state');
			$state.go('dashboard');
		});

	}
]);