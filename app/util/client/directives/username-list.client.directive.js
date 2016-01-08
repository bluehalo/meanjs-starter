'use strict';

angular.module('asymmetrik.util')
	.directive('wfUsernameList', function($log) {
		return {
			restrict: 'A',
			templateUrl: 'app/util/views/username-list.client.view.html',
			scope: {
				users: '=wfUsernameList'
			},
			link: function ($scope, element, attrs) {

				$scope.$watch('users', function(n, o) {
					if (null != n) {
						$scope.atUsers = n.map(function(username) {
							if (username.indexOf('@') < 0) {
								return '@' + username;
							}
							return username;
						});
					}
				});
			}
		};
	});