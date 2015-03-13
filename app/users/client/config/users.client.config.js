'use strict';

// Config HTTP Error Handling
angular.module('asymmetrik.users').config(['$httpProvider',
	function($httpProvider) {

		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push( [ '$q', '$location', '$injector', 'Authentication',
			function($q, $location, $injector, Authentication) {
				return {
					responseError: function(rejection) {
						var $state = $injector.get('$state');

						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.setUser(null);
	
								// Redirect to signin page
								$state.go('auth.signin');
								break;
							case 403:
								if(rejection.data.type === 'eua') {
									$state.go('user.eua');
								} else {
								// Add unauthorized behaviour
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

		$rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
			$log.info('routing to: ' + toState.name);

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
				$log.info('go to user.signin');
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
					$log.info('go to user.eua');
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
						if(toState.name !== 'user.pending') {
							event.preventDefault();
							$log.info('go to user.pending');
							$state.go('user.pending');
							return;
						}

					} else {

						// The user doesn't have the needed roles to view the page
						if(toState.name !== 'user.unauthorized') {
							event.preventDefault();
							$log.info('go to user.unauthorized');
							$state.go('user.unauthorized');
							return;
						}

					}

				}
			}
		});

	}
]);