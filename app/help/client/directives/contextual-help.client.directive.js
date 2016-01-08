'use strict';

angular.module('asymmetrik.help').directive('asyHelp',
	['$rootScope', 'Authentication', 'Help',
		function ($rootScope, Authentication, Help) {
			return {
				restrict: 'A',
				templateUrl: 'app/help/views/contextual-help.client.view.html',
				scope: {
					'topic': '@asyHelp'
				},
				controller: function($scope) {
					$scope.doAction = function() {
						Help.open($scope.topic);
					};
				}
			};
		}]);