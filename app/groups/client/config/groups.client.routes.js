'use strict';

// Setting up route
angular.module('asymmetrik.groups').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

	$stateProvider

		// Abstract group route
		.state('group', {
			abstract: true,
			template: '<ui-view/>'
		})

		// List/search view for groups. Always user-focused, can see all that you're allowed to see.
		.state('group.list', {
			url: '/groups',
			controller: 'ListGroupsController',
			templateUrl: 'app/groups/views/list-groups.client.view.html'
		})

		// Create a group
		.state('group.create', {
			url: '/group/create',
			controller: 'ManageGroupController',
			templateUrl: 'app/groups/views/manage-group.client.view.html',
			resolve: {
				UserConfig: function(userService) {
					return userService.getAuthConfig();
				}
			},
			data: {
				roles: [ 'editor' ]
			}
		})

		// Edit group metadata
		.state('group.edit', {
			url: '/group:groupId/edit',
			controller: 'ManageGroupController',
			templateUrl: 'app/groups/views/manage-group.client.view.html'
		})

		// Manage the membership of a group
		.state('group.manage-users', {
			url: '/group:groupId/manage-users',
			controller: 'ManageGroupUsersController',
			templateUrl: 'app/groups/views/manage-group-users.client.view.html'
		});

	}
]);