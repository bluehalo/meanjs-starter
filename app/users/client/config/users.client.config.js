'use strict';

// Config HTTP Error Handling
angular.module('asymmetrik.users').config(['$httpProvider',
	function($httpProvider) {

		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push( [ '$rootScope', '$q', '$location', '$injector', 'Authentication',
			function($rootScope, $q, $location, $injector, Authentication) {
				return {
					responseError: function(rejection) {
						var $state = $injector.get('$state');
						var $log = $injector.get('$log');

						$rootScope.asyTargetState = undefined;
						if(null != $state.current) {
							$rootScope.asyTargetState = {
								state: $state.current.name,
								params: $state.current.params
							};
						}

						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.setUser(null);

								if(rejection.data.type === 'invalid-certificate') {
									// Redirect to invalid credentials page
									$log.debug('UserState: Server doesn\'t recognize the submitted cert, go to the invalid cert page');
									$state.go('auth.invalid-certificate');
								}
								else {
									// Redirect to signin page
									$log.debug('UserState: Server doesn\'t think the user is authenticated, go to auth.signin');
									$state.go('auth.signin');
								}

								break;
							case 403:
								if (rejection.data.type === 'eua') {
									$log.debug('UserState: Server thinks the user needs to accept eua, go to user.eua');
									$state.go('user.eua');
								}
								else if (rejection.data.type === 'inactive') {
									$log.debug('UserState: Server thinks the user is inactive, go to auth.inactive');
									$state.go('user.inactive');
								}
								else if (rejection.data.type === 'noaccess') {
									$log.debug('UserState: Server thinks the user does not have the required access, go to user.noaccess');
									$state.go('user.noaccess');
								}
								else {
									// Add unauthorized behavior
									$log.debug('UserState: Server thinks the user accessed something they shouldn\'t, go to user.unauthorized');
									$state.go('user.unauthorized', { 
										message: 'You are not authorized to access this resource.',
										rejection: rejection
									});
								}
								break;
						}
	
						return $q.reject(rejection);
					}
				};
			}
		]);
	
	}
]).run([ '$rootScope', '$state', '$location', '$log', 'Authentication', 
	function($rootScope, $state, $location, $log, Authentication){

		$rootScope.$on('$stateChangeError', function(event, toState, toParams) {
			$log.warn(event);
		});

		$rootScope.$on('$stateNotFound', function(event, toState, toParams) {
			$log.warn(event);
		});

		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
			$log.debug('UserState: State change from [%s] to [%s].', (null != fromState)? fromState.name : 'null', toState.name);
			$state.prevState = fromState;
			$state.prevParams = fromParams;

			// -----------------------------------------------------------
			// Setup
			// -----------------------------------------------------------

			// First, check to see if the state requires authentication (defaults to true)
			var requiresAuthentication = true;

			// Only set it to false if it is explicitly set
			if(null != toState.data && toState.data.requiresAuthentication === false) {
				requiresAuthentication = false;
			}

			// -----------------------------------------------------------
			// Does the user need to log in?
			// -----------------------------------------------------------

			// If the state requires authentication and the user is not authenticated, then go to the signin state
			if(requiresAuthentication && !Authentication.isAuthenticated()) {
				event.preventDefault();
				$rootScope.asyTargetState = { state: toState, params: toParams };
				$log.debug('UserState: User is not authenticated, go to user.signin');
				$state.go('auth.signin');
				return;
			}

			// -----------------------------------------------------------
			// Does the user need to accept the user agreement??
			// -----------------------------------------------------------

			// Check to see if the user needs to agree to the end user agreement
			if(Authentication.isAuthenticated() && !Authentication.isAdmin() && !Authentication.isEuaCurrent() ) {
				if(toState.name !== 'user.eua') {
					event.preventDefault();
					$rootScope.asyTargetState = { state: toState, params: toParams };
					$log.debug('UserState: User is authenticated, but needs to accept EUA, go to user.eua');
					$state.go('user.eua');
					return;
				}
			}

			if (!Authentication.isAdmin()) {
				// -----------------------------------------------------------
				// Check the role requirements for the route
				// -----------------------------------------------------------

				// compile a list of roles that are missing
				var requiredRoles = (null != toState.data && null != toState.data.roles)? toState.data.roles : [];
				var missingRoles = [];
				requiredRoles.forEach(function(role) {
					if(!Authentication.hasRole(role)) {
						missingRoles.push(role);
					}
				});

				// If there are roles missing then we need to do something
				if(missingRoles.length > 0) {

					if(Authentication.isAuthenticated() && !Authentication.hasRole('user')) {

						// If the user is missing the user role, they are pending
						if(toState.name !== 'user.inactive') {
							event.preventDefault();
							$rootScope.asyTargetState = { state: toState, params: toParams };
							$log.debug('UserState: User is authenticated, but account is not active, go to user.inactive');
							$state.go('user.inactive');
							return;
						}

					} else {

						// The user doesn't have the needed roles to view the page
						if(toState.name !== 'user.unauthorized') {
							event.preventDefault();
							$rootScope.asyTargetState = { state: toState, params: toParams };
							$log.debug('UserState: User is authenticated, but doesn\'t have the roles needed to view the page, go to user.unauthorized');
							$state.go('user.unauthorized');
							return;
						}

					}

				}
			}

		});

	}
]);