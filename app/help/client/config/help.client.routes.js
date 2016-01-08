'use strict';

// Setting up route
angular.module('asymmetrik.help').value(
	'helpWindowName', 'wildfireHelp'
).config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		// Topics are added to the menu and routes
		var topics = [
			{ title: 'Getting Started', id: 'overview' },
			{ title: 'Groups' }
		];

		topics.forEach(function(topic) {
			topic.id = topic.id || topic.title.toLowerCase();
			topic.state = 'help.' + topic.id;
			topic.url = '/help/' + topic.id;
			topic.templateUrl = 'app/help/views/' + topic.id + '/' +  topic.id + '.client.view.html';
		});


		$stateProvider

		// Abstract help state
		.state('help', {
			abstract: true,
			templateUrl: 'app/help/views/help.client.view.html',
			controller: function($scope, $state, config) {
				$scope.topics = $state.current.data.topics;
				$scope.config = config;
			},
			resolve: {
				config: function(configService) {
					return configService.getConfig();
				}
			},
			data: {
				topics: topics,
				requiresAuthentication: true
			}
		})

		// About state
		.state('about', {
			url: '/help/about',
			templateUrl: 'app/help/views/about.client.view.html',
			controller: function($scope, $state, config) {
				$scope.version = config.version;
			},
			resolve: {
				config: function(configService) {
					return configService.getConfig();
				}
			},
			data: {
				requiresAuthentication: true
			}
		})

		.state('help.topic', {
			url: '/help/topic/{id:.*}',
			template: '<div data-ng-include="template"></div>',
			controller: function($scope, $stateParams) {
				$scope.template = 'app/help/views/' + $stateParams.id + '.client.view.html';
			},
			resolve: {
				config: function(configService) {
					return configService.getConfig();
				}
			},
			data: {
				requiresAuthentication: true
			}
		});

		// Topic states are generated based on the contents of the topic list
		function addTopic(topic) {
			$stateProvider.state(topic.state, {
				url: topic.url,
				templateUrl: topic.templateUrl,
				controller: function($scope) {
				},
				resolve: {
					config: function(configService) {
						return configService.getConfig();
					}
				}
			});
		}
		topics.forEach(function(topic){
			addTopic(topic);
		});

	}
]).run(['$rootScope', '$window', 'helpWindowName', function($rootScope, $window, helpWindowName) {
	var p = /help\.(.+)/;

	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
		// When transitioning from a help page to a non-help page, unname the window.
		// Subsequent clicks on the help icon will open a new window rather than reusing this one.
		if (p.test(fromState.name) && !p.test(toState.name) && $window.name === helpWindowName) {
			$window.name = 'wildfire' + Date.now();
		}
	});
}]);
