'use strict';

angular.module('asymmetrik.groups').controller('ManageGroupUsersController',
	[ '$scope', '$state', '$log', '$modal', '$stateParams', '$q', 
	  'userService', 'groupService', 'Help', 'Alerts', 'Authentication',

	function ($scope, $state, $log, $modal, $stateParams, $q, 
			  userService, groupService, Help, Alerts, Authentication) {

		// Grab the group id from the state params
		$scope.group = {};
		var groupId = $stateParams.groupId;

		// Put some of the helper shared services into the scope
		$scope.auth = Authentication;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();
		$scope.help = Help;

		// Controller models
		$scope.roles = groupService.roles;


		/**
		 * Group Members and Paging
		 */
		$scope.members = {
			sort: userService.sort.map,
			results: {
				pageNumber: 0,	// The current page number
				pageSize: 0,	// The number of elements in the current page
				totalPages: 0,	// The total number of pages
				totalSize: 0,	// The total number of elements in the set
				elements: []
			},
			options: {
				pageNumber: 0,
				pageSize: 50,
				sort: userService.sort.map.name
			}
		};

		// Go to specific page number
		$scope.goToPage = function(pageNumber) {
			$scope.members.options.pageNumber = pageNumber;
			$scope.applyMemberSearch();
		};

		// Set the sort order
		$scope.setSort = function(sort){
			$scope.members.options.sort = sort;
			$scope.applyMemberSearch();
		};

		$scope.applyMemberSearch = function() {

			return groupService.searchMembers(groupId, undefined, undefined, {
					page: $scope.members.options.pageNumber,
					size: $scope.members.options.pageSize,
					sort: $scope.members.options.sort.sort,
					dir: $scope.members.options.sort.dir
				})
				.then(function(results){
					if(null != results) {
						$scope.members.results = results;
					} else {
						$scope.members.results = {};
					}

					// Reset the extra user state
					generateUserState(results);
				});

		};

		/**
		 * Typeahead stuff
		 */

		// Search for users for the typeahead control
		$scope.searchUsers = function(search) {
			return userService.match({ 'groups._id': { '$ne': groupId } }, search, {
				page: 0,
				size: 20,
				sort: $scope.members.sort.name.sort,
				dir: $scope.members.sort.name.dir
			}).then(function(result){
				if(null != result){
					return result.elements;
				} else {
					return [];
				}
			}, function(error) {
				$log.error(error);
				return [];
			});
		};

		// Method handler for return keypress in the user search box
		$scope.addUserKeypress = function (keyEvent) {
			if (keyEvent.which === 13) {
				$scope.addUser($scope.user);
			}
		};


		/**
		 * Main Controller logic methods
		 */


		/*
		 * Add the user to the current group
		 */
		$scope.addUser = function(user) {
 
			if(null == groupId || null == user) {
				$scope.alertService.add('Failed to add user. Missing user or groupId');
				return;
			}

			// Try to add the user to the group
			groupService.addUser(groupId, user._id)
				.then(function(result) {

					// Clear the user
					$scope.user = null;
					$log.debug('Added user: %s to group: %s', user.name, groupId);

					// Refresh the state of the UI
					return $scope.applyMemberSearch();

				}, function(error){

					// Log the error and leave the user
					$log.error(error);
					$scope.alertService.add('Failed to add user: ' + error);

				});

		};


		/*
		 * Remove user from current group
		 */
		$scope.removeUser = function(user) {
			var params = {
				message: 'Are you sure you want to remove user: "' + user.username + '" from this group?',
				title: 'Remove user from group?',
				ok: 'Remove User',
				cancel: 'Cancel'
			};

			var dialog = $modal.open({
				templateUrl: 'app/util/views/confirm.client.view.html',
				controller: 'ConfirmController',
				$scope: $scope,
				backdrop: 'static',
				resolve: {
					params: function () { return params; }
				}
			});

			dialog.result.then(function(){
				// Remove the user
				groupService.removeUser(groupId, user._id).then(
					function(result) {
						$log.debug('removed user: %s', user.username);
						$scope.applyMemberSearch();
					},
					function(error){
						$log.error('Failed to remove user: %s from group: %s, error: %s', user.username, groupId, error);
						$scope.alertService.add(error);
					}
				);
			});
		};


		/*
		 * Add the role to the user
		 */
		function addRole(user, role) {
			// If the user is only implicitly in the group, we need to add them to the group first
			var groupPermissions = groupService.getGroupPermissions(user, $scope.group);

			var addPromise;
			// If there is no group permissions object, the user isn't actually in the group yet
			if(null == groupPermissions) {
				addPromise = groupService.addUser(groupId, user._id);
			}
			else {
				var d = $q.defer();
				addPromise = d.promise;
				d.resolve();
			}

			return addPromise.then(function() {
				return doToggleRole(user, role, groupService.addUserRole);
			});
		}

		/*
		 * Remove the role from the user
		 */
		function removeRole(user, role) {

			// If we're removing our own admin, we want to verify that they know what they're doing
			if(role === 'admin' && user._id === $scope.auth.user._id && !$scope.auth.isAdmin()) {
				var params = {
					message: 'Are you sure you want to remove the "Group Admin" role from <strong>yourself</strong>?<br/>Once you do this, you will no longer be able to manage the members of this group. <strong>This also means you won\'t be able to give the role back to yourself</strong>.',
					title: 'Remove "Group Admin" role?',
					ok: 'Remove Role',
					cancel: 'Cancel'
				};

				var dialog = $modal.open({
					templateUrl: 'app/util/views/confirm.client.view.html',
					controller: 'ConfirmController',
					$scope: $scope,
					backdrop: 'static',
					resolve: {
						params: function () { return params; }
					}
				});

				// On the dialog decision, either proceed or bail
				return dialog.result
					.then(function() {
						// On accept, toggle the role
						return doToggleRole(user, role, groupService.removeUserRole);
					})
					.then(function() {
						// If we successfully removed the role from ourselves, redirect away
						$state.go('group.list');
					});

			}
			// Else, we're just removing someone else's role, so proceed
			else { 
				return doToggleRole(user, role, groupService.removeUserRole);
			}

		}

		/*
		 * Actually do the role toggle
		 */
		function doToggleRole(user, role, toggleFn) {
			// Toggle the role on the local user
			user.groups[0].roles[role] = !user.groups[0].roles[role];

			return toggleFn(groupId, user._id, role)
				.then(function(result) {
					return result;
				}, function(error) {
					// Undo the local change
					user.groups[0].roles[role] = !user.groups[0].roles[role];
					return $q.reject(error);
				});
		}


		/*
		 * Toggle the user's role
		 */
		$scope.toggleRole = function(user, role) {
			// Get the permissions of the user for this group
			var groupPermissions = groupService.getGroupPermissions(user, $scope.group);

			// Decide if this is an addRole action or a removeRole action
			var modifyRoleFn;

			// If the role exists and is true, it's a remove action
			if(null != groupPermissions && null != groupPermissions.roles && groupPermissions.roles[role] === true) {
				modifyRoleFn = removeRole;
			}
			// Else, it is an add action
			else {
				modifyRoleFn = addRole;
			}

			// Do the role change
			modifyRoleFn(user, role).then(function(result) {
				$log.debug('Toggled role: %s for user: %s', role, user.name);
			}, function(err) {
				$log.error('Error toggling role, error: %s', err );
				$scope.alertService.add(err);
			});

		};


		/**
		 * Given a list of users from the server, determine if a user is implicit/explicit and active/inactive
		 * @param results
		 */
		function generateUserState(results) {
			$scope.userState = {};

			results.elements.forEach(function(user) {
				// Is explicit if they are in the group
				var explicit = user.groups.length > 0;

				// Is active if they are bypassed or they meet the requirements of the group
				var active = groupService.userActiveInGroup(user, $scope.group);

				// Create an entry for this user by id
				$scope.userState[user._id] = {
					active: active,
					explicit: explicit
				};

			});
		}


		/**
		 * Initialization
		 */

		// Load the group
		groupService.get(groupId).then(function(result){
			$scope.group = result;
		}, function(error){
			$log.error('There was an error getting the group: %s, error: %s', groupId, error);
		});

		// Get the members of the group
		$scope.applyMemberSearch();
	}
]);