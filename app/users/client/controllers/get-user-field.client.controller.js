'use strict';

angular.module('asymmetrik.users').controller('GetUserFieldController',
		[ '$scope', '$log', '$modal', '$modalInstance', 
		  'adminService',

	function( $scope, $log, $modal, $modalInstance, 
			  adminService) {

		// Default delimiter, but users may change to any value (disabled trimming)
		$scope.delimiter = '; ';

		// Default query
		$scope.query = '{}';
		$scope.queryValid = true;

		$scope.fieldOptions = [
			{ value: 'username', display: 'Username' },
			{ value: 'email', display: 'Email' },
			{ value: 'name', display: 'Name' }
		];

		$scope.selectedField = $scope.fieldOptions[0];

		// Array containing the values that will be joined for display
		$scope.valuesArray = [];

		// Default empty value
		$scope.value = '';

		$scope.isJsonString = function(str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		};

		/**
		 * Updates the $scope.value variable based on the usernames and the delimiter
		 */
		function updateValue() {
			$scope.value = $scope.valuesArray.join($scope.delimiter || ';');
		}

		$scope.retrieveValues = function() {
			if(null != $scope.selectedField && null != $scope.selectedField.value && $scope.isJsonString($scope.query)) {
				// Get the proper values from the service
				adminService.getAll( JSON.parse($scope.query), $scope.selectedField.value ).then(function(results) {
					$scope.valuesArray = results;
				}, function(err) {
					$scope.value = 'Unable to retrieve field values: ' + err;
				});
			}
		};

		/**
		 * When the user has declared that they
		 * are done with this form, dismiss it
		 */
		$scope.done = function() {
			$modalInstance.dismiss();
		};

		// If the user changes either the usernames or the delimiter, update the displayed value
		$scope.$watchGroup(['valuesArray', 'delimiter'], updateValue);

		// When the user chooses a different field to load, retrieve it
		$scope.$watchGroup(['selectedField', 'query'], $scope.retrieveValues);

		$scope.$watch('query', function(n,o) {
			$scope.queryValid = $scope.isJsonString(n);
		});

	}
]);