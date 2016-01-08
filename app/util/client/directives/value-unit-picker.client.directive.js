'use strict';

angular.module('asymmetrik.util')
	.directive('valueUnitPicker', function() {
	return {
		restrict: 'AE',
		templateUrl: 'app/util/views/value-unit-picker.client.view.html',
		scope: { 
			units: '=asyUnits',
			value: '=ngModel'
		},
		controller: function( $scope, $log) {
			/*
			 * This function takes a value and searches the units array looking for the most suitable unit
			 * The ideal unit is defined as the largest unit that is smaller than the value, or the unit smaller
			 * than that if it can eliminate decimals.
			 */
			var getIdealUnit = function(val) {
				var unit = $scope.units[0];

				for(var i=0; i<$scope.units.length; i++) {
					var curr = $scope.units[i];

					// First check to see if the value is a multiple of one of our intervals
					if(val >= curr.multiplier && val % curr.multiplier === 0) {
						unit = curr;
					}
				}

				return unit;
			};

			// Accessor function for setting the unit
			$scope.setUnit = function(m) {
				$scope.unit = m;
			};

			// If the time value changes, we need to update the display time to match
			$scope.$watch('value', function(n, o) {
				// Initialize the unit if this is the first time value is being set (or its being set after being undefined)
				if(n === o || (null == o && null != n)) {
					$scope.unit = getIdealUnit($scope.value);
				}

				$scope.displayValue = (null != $scope.value && null != $scope.unit)? $scope.value/$scope.unit.multiplier : undefined;
			});

			// If the time display value changes, we need to update the time value to match
			$scope.$watch('displayValue', function(n, o) {
				if(n !== o) {
					$scope.value = (null != $scope.displayValue && null != $scope.unit)? $scope.displayValue*$scope.unit.multiplier : undefined;
				}
			});

			// If the time unit changes, we need to update the display time to match
			$scope.$watch('unit', function(n, o) {
				if(n !== o) {
					$scope.displayValue = (null != $scope.value && null != $scope.unit)? $scope.value/$scope.unit.multiplier : undefined;
				}
			});

		}
	};
});