'use strict';

// Setting up route
angular.module('asymmetrik.help').config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

		// Topics are added to the menu and routes
		var topics = [
			{ title: 'Getting Started', id: 'overview' }
		];

		topics.forEach(function(topic) {
			topic.id = topic.id || topic.title.toLowerCase();
			topic.state = 'help.' + topic.id;
			topic.url = '/help/' + topic.id;
			topic.templateUrl = 'app/help/views/' + topic.id + '.client.view.html';
		});


		$stateProvider

		// Abstract help state
		.state('help', {
			abstract: true,
			templateUrl: 'app/help/views/help.client.view.html',
			controller: function( $scope, $state, config) {
				$scope.version = config.version;
				$scope.topics = $state.current.data.topics;
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
			controller: function( $scope, $state, config) {
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
		});


		// Topic states are generated based on the contents of the topic list
		function addTopic(topic) {
			$stateProvider.state( topic.state, {
				url: topic.url,
				templateUrl: topic.templateUrl,
				controller: function($scope, config) {
					$scope.version = config.version;
				}
			});
		}
		topics.forEach(function(topic){
			addTopic(topic);
		});

	}
]);