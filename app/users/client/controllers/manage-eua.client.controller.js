'use strict';

angular.module('asymmetrik.users').controller('ManageEuaController',
		[ '$scope', '$location', '$log', '$stateParams', '$state', 
		  'euaService', 'Authentication', 'Alerts',

	function( $scope, $location, $log, $stateParams, $state, 
			  euaService, Authentication, Alerts ) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.mode = $state.current.data.mode;

		/**
		 * Create a user based on the current state of the controller
		 */
		function createEua() {
			$log.info('Create eua: ' + $scope.eua.title );

			euaService.create({
				title: $scope.eua.title,
				text: $scope.eua.text
			}).then(
				function(result) {
					$state.go('admin.eua.list');
				},
				function(error) {
					$scope.error = error.message;
				}
			);
		}

		/**
		 * Admin-mode update eua
		 */
		function updateEua() {
			$log.info('Edit user: ' + $scope.eua.title );

			euaService.update({
				_id: $scope.eua._id,
				title: $scope.eua.title, 
				text: $scope.eua.text, 
				published: $scope.eua.published
			}).then(
				function(result) {
					$state.go('admin.eua.list');
				},
				function(error) {
					$scope.error = error.message;
				}
			);
		}

		/**
		 * Initialization code. 
		 * Determine which mode the controller is in and configure accordingly.
		 */
		if($scope.mode === 'create') {
			// Admin create mode
			$scope.title = 'Create EUA';
			$scope.subtitle = 'Provide the required information to create a new eua';
			$scope.okButtonText = 'Create';
			$scope.okAction = createEua;

		} else if($scope.mode === 'edit') {
			// Admin edit a user mode
			$scope.title = 'Edit EUA';
			$scope.subtitle = 'Make changes to the eua\'s information';
			$scope.okButtonText = 'Save';
			$scope.okAction = updateEua;

			// Editing the user with the specified id
			euaService.get($stateParams.euaId).then(function(result){
				$scope.eua = result;
			}, function(error){
				$log.error('EUA with id: ' + $stateParams.euaId + ' does not exist.');
			});

		} else {
			// Invalid mode
			$scope.user = {};
			$log.error('Invalid mode');
		}
	}
]);