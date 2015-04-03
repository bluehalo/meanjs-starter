'use strict';

angular.module('asymmetrik.groups').controller('ManageGroupUsersController',
	[ '$scope', '$state', '$log', '$modal', '$stateParams', '$q', 
	  'userService', 'groupService', 'Help', 'Alerts', 'Authentication',

	function ($scope, $state, $log, $modal, $stateParams, $q, 
			  userService, groupService, Help, Alerts, Authentication) {

		var groupId = $stateParams.groupId;
		$scope.auth = Authentication;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();
		$scope.help = Help;

		// State logic
		$scope.addingUser = false;

		// Controller models
		$scope.roles = groupService.roles;
		$scope.group = {};

		/**
		 * Group Members and Paging
		 */
		$scope.members = {
			sort: userService.sort,
			results: {
				pageNumber: 0,	// The current page number
				pageSize: 0,	// The number of elements in the current page
				totalPages: 0,	// The total number of pages
				totalSize: 0,	// The total number of elements in the set
				elements: []
			},
			options: {
				pageNumber: 0,
				pageSize: 25,
				sort: userService.sort.name
			}
		};

		// Go to specific page number
		$scope.goToPage = function(pageNumber) {
			$scope.options.pageNumber = Math.min($scope.results.totalPages-1, Math.max(pageNumber, 0));
			$scope.applySearch();
		};

		$scope.applyMemberSearch = function() {
			groupService.searchMembers(groupId, undefined, undefined, {
				page: $scope.members.options.pageNumber,
				size: $scope.members.options.pageSize,
				sort: $scope.members.options.sort.sort,
				dir: $scope.members.options.sort.dir
			}).then(function(result){
				if(null != result) {
					$scope.members.results = result;
				} else {
					$scope.members.results = {};
				}
			}, function(error) {
				$scope.alertService.add(error.message);
				$log.error(error);
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
				sort: userService.sort.name.sort,
				dir: userService.sort.name.dir
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

		// Add the user to the current group
		$scope.addUser = function(user) {
 
			if(null != groupId && null != user) {

				// Update the state
				$scope.addingUser = true;

				// Try to add the user to the group
				groupService.addUser(groupId, user._id).then(function(result) {

					// Clear the user
					$scope.user = null;
					$scope.addingUser = false;
					$log.info('Added user: ' + user.name + ' to group: ' + groupId);

					// Refresh the state of the UI
					$scope.applyMemberSearch();

				}, function(error){

					// Log the error and leave the user
					$log.error(error);
					$scope.alertService.add('Add user operation failed: ' + error, 'error');
					$scope.addingUser = false;

				});
			}
		};

		function doToggleRole(user, role) {
			var fn = (user.groups[0].roles[role])? groupService.removeUserRole : groupService.addUserRole;
			user.groups[0].roles[role] = !user.groups[0].roles[role];

			return fn(groupId, user._id, role).then(function(result) {
				$log.info('Toggled role: ' + role + ' for user: ' + user.name);
				// Should probably reload the roles for the user
				return result;

			}, function(error) {
				$log.error('Error while toggling role: ' + error);
				$scope.alertService.add('Error while toggling role: ' + error);
				user.groups[0].roles[role] = !user.groups[0].roles[role];
				$q.reject(error);
			});
		}

		$scope.toggleRole = function(user, role) {
			// Initialize the roles if they don't already exist
			if(null == user.groups[0].roles) {
				user.groups[0].roles = {};
			}

			// Are we adding or removing the role
			var remove = (user.groups[0].roles[role]);

			// If we're removing our own admin, we want to verify that they know what they're doing
			if(remove && role === 'admin' && user._id === $scope.auth.user._id && !$scope.auth.isAdmin()) {
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

					dialog.result.then(function(){
						doToggleRole(user, role).then(function(result){
							// If the toggle roll was successful and we were removing the role from ourself, redirect away
							$state.go('group.list');
						});
					});
			} else {
				doToggleRole(user, role);
			}
		};

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
						$log.info('removed user: ' + user.username);
						$scope.applyMemberSearch();
					},
					function(error){
						$log.error('Failed to remove user from group: ' + error);
						$scope.alertService.add(error);
					}
				);
			});
		};

		/**
		 * Initialization
		 */

		// Load the group
		groupService.get(groupId).then(function(result){
			$scope.group = result;
		}, function(error){
			$log.error('There was an error getting the group: ' + error);
		});

		// Get the members of the group
		$scope.applyMemberSearch();
	}
]);