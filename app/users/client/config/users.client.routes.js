'use strict';

// Setting up route
angular.module('asymmetrik.users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider

		/*
		 * States for local authentication when user is unauthenticated
		 */

		// Abstract state for states that are unauthenticated
		.state('auth', {
			abstract: true,
			template: '<ui-view/>',
			resolve: {
				UserConfig: function(userService) {
					return userService.getAuthConfig();
				}
			},
			data: {
				requiresAuthentication: false
			}
		})

		// Sign up for an account
		.state('auth.signup', {
			url: '/auth/signup',
			controller: 'ManageUserController',
			templateUrl: 'app/users/views/manage-user.client.view.html',
			data: {
				mode: 'signup'
			}
		})

		// Sign into account
		.state('auth.signin', {
			url: '/auth/signin',
			controller: 'AuthenticationController',
			templateUrl: 'app/users/views/authentication/signin.client.view.html'
		})


		/*
		 * States for managing users and user information
		 */

		// Abstract user state that requires authentication
		.state('user', {
			abstract: true,
			template: '<ui-view/>',
			resolve: {
				UserConfig: function(userService) {
					return userService.getAuthConfig();
				}
			},
			data: {
				requiresAuthentication: true
			}
		})

		// Show the End-user Agreement page
		.state('user.eua', {
			url: '/auth/eua',
			controller: 'EuaController',
			templateUrl: 'app/users/views/eua/eua.client.view.html',
			resolve: {
				UserAgreement: function(authService) {
					return authService.getCurrentEua();
				}
			}
		})

		// Show unauthorized error
		.state('user.unauthorized', {
			url: '/auth/unauthorized',
			templateUrl: 'app/users/views/authentication/unauthorized.client.view.html'
		})

		// Show pending notice
		.state('user.pending', {
			url: '/auth/pending',
			templateUrl: 'app/users/views/authentication/pending.client.view.html'
		})

		// Edit user information
		.state('user.edit', {
			url: '/user',
			controller: 'ManageUserController',
			templateUrl: 'app/users/views/manage-user.client.view.html',
			data: {
				mode: 'edit'
			}
		})


		/*
		 * States for admin users
		 */

		// Abstract user state that requires authentication
		.state('admin', {
			abstract: true,
			templateUrl: 'app/users/views/admin.client.view.html',
			resolve: {
				UserConfig: function(userService) {
					return userService.getAuthConfig();
				}
			},
			data: {
				requiresAuthentication: true,
				roles: [ 'admin' ]
			}
		})

		// EUA management parent state
		.state('admin.eua', {
			abstract: true,
			template: '<ui-view/>',
			data: { roles: [ 'admin' ] }
		})

		.state('admin.eua.list', {
			url: '/admin/euas',
			controller: 'ListEuasController',
			templateUrl: 'app/users/views/eua/list-euas.client.view.html',
			data: { roles: [ 'admin' ] }
		})

		.state('admin.eua.create', {
			url: '/admin/eua',
			controller: 'ManageEuaController',
			templateUrl: 'app/users/views/eua/manage-eua.client.view.html',
			data: {
				mode: 'create',
				roles : [ 'admin' ]
			}
		})

		.state('admin.eua.edit', {
			url: '/admin/eua/:euaId',
			controller: 'ManageEuaController',
			templateUrl: 'app/users/views/eua/manage-eua.client.view.html',
			data: {
				mode: 'edit',
				roles : [ 'admin' ]
			}
		})

		// User Management parent state
		.state('admin.user', {
			abstract: true,
			template: '<ui-view/>',
			data: { roles: [ 'admin' ] }
		})

		// Admin page
		.state('admin.user.list', {
			url: '/admin/users',
			controller: 'ListUsersController',
			templateUrl: 'app/users/views/list-users.client.view.html',
			data: { roles: [ 'admin' ] }
		})

		// Admin create a new user
		.state('admin.user.create', {
			url: '/admin/user',
			controller: 'ManageUserController',
			templateUrl: 'app/users/views/manage-user.client.view.html',
			data: {
				mode: 'admin-create',
				roles : [ 'admin' ]
			}
		})

		// Admin edit user
		.state('admin.user.edit', {
			url: '/admin/user/:userId',
			controller: 'ManageUserController',
			templateUrl: 'app/users/views/manage-user.client.view.html',
			data: {
				mode: 'admin-edit',
				roles : [ 'admin' ]
			}
		})


		/*
		 * Password reset pages
		 */
		.state('auth.password', {
			abstract: true,
			template: '<ui-view/>',
			resolve: {
				UserConfig: function(userService) {
					return userService.getAuthConfig();
				}
			},
			data: {
				strategy: 'local'
			}
		})

		.state('auth.password.forgot', {
			url: '/auth/password/forgot',
			controller: 'PasswordController',
			templateUrl: 'app/users/views/password/forgot-password.client.view.html'
		})
		.state('auth.password.reset-invalid', {
			url: '/auth/password/reset/invalid',
			templateUrl: 'app/users/views/password/reset-password-invalid.client.view.html'
		})
		.state('auth.password.reset-success', {
			url: '/auth/password/reset/success',
			templateUrl: 'app/users/views/password/reset-password-success.client.view.html'
		})
		.state('auth.password.reset', {
			url: '/auth/password/reset/:token',
			controller: 'PasswordController',
			templateUrl: 'app/users/views/password/reset-password.client.view.html'
		});

	}
]);