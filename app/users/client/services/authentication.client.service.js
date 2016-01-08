'use strict';

//Authentication Object
angular.module('asymmetrik.users').factory('Authentication', [ '$rootScope', function($rootScope) {

	// Store the user object
	var data = {
		user: undefined,		// The raw user object
		eua: {},				// The latest end user agreement
		groups: {},				// Map of groupId to group information
		isAdminOfAGroup: false, // has any group admin role (for viewing groups menu option)
		isEditorOfAGroup: false // has any group editor role
	};

	// Define the system roles with labels and descriptions
	data.roles = {
		map: {
			user: { label: 'User', description: 'Account is enabled, has access to the system', role: 'user' },
			editor: { label: 'Editor', description: 'Can create and manage resources in the system', role: 'editor' },
			auditor: { label: 'Auditor', description: 'Has the ability to view auditing, logging, and metrics information', role: 'auditor' },
			admin: { label: 'Admin', description: 'Has full, unrestricted access to the system', role: 'admin' }
		}
	};
	data.roles.array = [ data.roles.map.user, data.roles.map.editor, data.roles.map.auditor, data.roles.map.admin ];


	// General auth methods
	data.isAuthenticated = function() {
		return (null != data.user && null != data.user.username);
	};
	data.isEuaCurrent = function() {
		return (null == data.eua) || (null == data.eua.published) || (null != data.user.acceptedEua && data.user.acceptedEua >= data.eua.published);
	};
	data.isActive = function() {
		return data.isAuthenticated() && (data.isAdmin() || data.isEuaCurrent());
	};
	data.hasRole = function(role) {
		return (null != data.user) && (null != data.user.roles) && (data.user.roles[role]);
	};
	data.isAdmin = function() {
		return data.hasRole('admin');
	};
	data.isNonAdmin = function() {
		return data.isAuthenticated() && data.isEuaCurrent() && !data.isAdmin();
	};
	data.isGroupEditor = function() {
		return data.hasRole('editor');
	};

	// Group roles
	data.hasGroupRole = function(groupId, role) {
		return (data.user) && (data.groups[groupId]) && (data.groups[groupId].roles) && (data.groups[groupId].roles[role]);
	};
	data.hasGroupAdmin = function(groupId) {
		return data.hasGroupRole(groupId, 'admin');
	};
	data.hasGroupEdit = function(groupId) {
		return data.hasGroupRole(groupId, 'editor');
	};
	data.hasGroup = function(groupId) {
		return null != data.groups[groupId] && null != data.groups[groupId]._id;
	};
	data.editableGroups = function() {
		return data.user.groups.filter(function(group){ return data.hasGroupEdit(group._id); });
	};

	// Action-specific checks
	data.canManageGroup = function(groupId) {
		return data.hasGroupAdmin(groupId) || data.isAdmin();
	};
	data.canManageGroups = function() {
		return data.isAdmin() || data.isGroupEditor() || data.isAdminOfAGroup;
	};
	data.canCreateGroups = function() {
		return data.isAdmin() || data.isGroupEditor();
	};
	data.hasEditableGroups = function() {
		return data.isEditorOfAGroup;
	};
	data.canEditGroup = function(groupId) {
		return data.isAdmin() || data.hasGroupEdit(groupId);
	};
	data.canEditAlert = function(alert) {
		return data.isAdmin() || data.isAlertCreator(alert);
	};
	data.isAlertCreator = function(alert) {
		return data.user._id === alert.creator;
	};
	data.canCreateDecks = function() {
		return data.isAdmin() || data.isEditorOfAGroup;
	};
	data.canEditDecks = function(groupId) {
		return data.canEditGroup(groupId);
	};
	data.canEditDeck = function(deck) {
		return (null != deck) ? data.canEditDecks(deck.group._id) : false;
	};
	data.canViewDecks = function(groupId) {
		return data.isAdmin() || data.hasGroup(groupId);
	};
	data.canViewDeck = function(deck) {
		return data.canViewDecks(deck.group._id);
	};

	data.setUser = function(user) {
		if (null == user || null == user.username) {
			user = null;
		}

		var wasActive = data.isActive();

		data.user = user;
		data.groups = {};

		if (null != data.user) {

			// Search the groups to see if we're an admin of any
			if (null != data.user.groups) {
				data.user.groups.forEach(function (group) {
					data.groups[group._id] = group;

					if(null != group.roles) {
						if(group.roles.admin) {
							data.isAdminOfAGroup = true;
						}
						if(group.roles.editor) {
							data.isEditorOfAGroup = true;
						}
					}
				});
			}
		}

		var isActive = data.isActive();

		if (!wasActive && isActive) {
			$rootScope.$broadcast('user:active', data);
		}
		else if (wasActive && !isActive) {
			$rootScope.$broadcast('user:inactive', data);
		}
	};

	data.setEua = function(eua) {
		data.eua = eua;
	};

	// We are going to store the user state in the window object
	data.setUser(window.user);

	return data;

}]);

// Authentication service for user variables
angular.module('asymmetrik.users').factory('authService', 
		[ '$http', '$q', '$log', 'Authentication', 
	function( $http, $q, $log, Authentication ) {

	/**
	 * Public methods to be exposed through the service
	 */

	// Retrieve Current EUA
	function getCurrentEua() {
		var request = $http ({
			method: 'get',
			url: 'eua'
		});
		return request.then(function(result) {
			Authentication.setEua(result.data);
			return result.data;
		}, handleFailure);
	}

	// Accept
	function acceptEua() {
		var request = $http({
			method: 'post',
			url: 'eua/accept'
		});

		return request.then(function(response){
			// The user will have a new euaAccepted date
			Authentication.setUser(response.data);
			return response.data;

		}, handleFailure);
	}

	// Signup
	function signup(user) {
		var request = $http({
			method: 'post',
			url: 'auth/signup',
			data: user
		});

		return request.then(function(response){
			Authentication.setUser(response.data);
			return response.data;
		}, handleFailure);
	}

	// Signin
	function signin(credentials) {
		var request = $http({
			method: 'post',
			url: 'auth/signin',
			data: credentials
		});

		return request.then(function(response) {
			Authentication.setUser(response.data);
			return response.data;
		}, handleFailure);
	}

	// Signout
	function signout() {
		var request = $http({
			method: 'get',
			url: 'auth/signout'
		});
		return request.then(function(response) {
			// Update the cached user
			Authentication.setUser(null);

			return null;
		}, handleFailure);
	}

	// Get the user who is currently logged in (or null if no one is logged in)
	function getCurrentUser() {
		var request = $http({
			method: 'get',
			url: 'user/me'
		});
		return request.then(function(response) {
			// Might as well cache this when we get the chance
			Authentication.setUser(response.data);
			return response.data;
		}, function(error) {
			// if 400, ignore, otherwise return error
		});
	}

	// Forgot Password
	function forgotPassword(username) {
		var request = $http({
			method: 'post',
			url: 'auth/forgot',
			data: { username: username }
		});
		return request.then(function(response) {
			// Update the cached user
			Authentication.setUser(response.data);

			return response.data;
		}, handleFailure);
	}

	function validateToken(token) {
		var request = $http({
			method: 'get',
			url: 'auth/reset/' + token
		});
		return request.then(function(response) {
			return response.data;
		}, handleFailure);
	}

	// Reset Password
	function resetPassword(token, password) {
		var request = $http({
			method: 'post',
			url: 'auth/reset/' + token,
			data: { password: password }
		});
		return request.then(function(response) {
			// Update the cached user
			Authentication.setUser(response.data);
			return response.data;
		}, handleFailure);
	}

	// Update Password
	function updatePassword(data) {
		var request = $http({
			method: 'post',
			url: '/auth/password',
			data: data
		});
		return request.then(function(response) {
			return response.data;
		}, handleFailure);

	}

	/**
	 * Validate a pair of passwords
	 * The server will perform full validation, so for now all we're really doing is
	 * verifying that the two passwords are the same.
	 */
	function validatePassword(p1, p2) {
		p1 = (angular.isString(p1) && p1 !== '')? p1 : undefined;
		p2 = (angular.isString(p2) && p2 !== '')? p2 : undefined;

		if(p1 !== p2) {
			return { valid: false, message: 'Passwords do not match' };
		}
		else {
			return { valid: true };
		}
	}

	/**
	 * Private methods
	 */
	function handleFailure(response) {
		if (!angular.isObject( response.data ) || null == response.data.message){
			return( $q.reject( { message: 'An unknown error occurred.' } ) );
		}

		return $q.reject(response.data);
	}

	/**
	 * Initialization
	 */

	// Initialize the user (we're doing this to make sure that we aren't dealing with stale user information)
	if(null != Authentication.user) {
		getCurrentUser();
		getCurrentEua();
	}


	// Return the public API
	return ({
		getCurrentUser: getCurrentUser,
		signup: signup,
		signin: signin,
		signout: signout,
		forgotPassword: forgotPassword,
		resetPassword: resetPassword,
		validateToken: validateToken,
		updatePassword: updatePassword,
		getCurrentEua: getCurrentEua,
		acceptEua: acceptEua,
		validatePassword: validatePassword
	});

}]);
