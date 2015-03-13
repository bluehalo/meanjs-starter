'use strict';

angular.module('asymmetrik.help').service('Help', ['$modal', '$log',
	function ($modal, $log) {

		/**
		 * Public methods to be exposed through the service
		 */

		function modal(id) {

			// Open a modal with the help page inside
			$modal.open({
				templateUrl: 'app/help/views/templates/modal.client.view.html',
				backdrop: 'true',
				controller: function($scope, $state, $modalInstance, template) {
					$scope.template = template;
					$scope.ok = function() {
						$modalInstance.close();
					};
					$scope.help = function() {
						$modalInstance.close();
						$state.go('help.overview');
					};
				},
				resolve: {
					template: function() { return 'app/help/views/' + id + '.client.view.html'; }
				}
			});

		}


		/**
		 * Private methods
		 */


		// Return the public API
		return ({
			modal : modal
		});
	}
]);
