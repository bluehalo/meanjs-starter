'use strict';

angular.module('asymmetrik.help').service('Help', ['$log', '$modal', '$state', '$window', 'helpWindowName',
	function ($log, $modal, $state, $window, helpWindowName) {

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
	
		function open(id) {
			if(null == id || '' === id) {
				return;
			}

			// See if there is already a state for this ID
			var url = $state.href('help.' + id);

			// Otherwise, get the generic topic state and append the ID
			if (null == url) {
				url = $state.href('help.topic') + '' + id;
			}
			// Open a the help page in a new window
			$window.open(url, helpWindowName);
		}

		/**
		 * Private methods
		 */


		// Return the public API
		return ({
			open : open,
			modal: modal
		});
	}
]);
