'use strict';

angular.module('asymmetrik.util')
	.directive('addRemoveList', function() {
		return {
			restrict: 'AE',
			templateUrl: 'app/util/views/add-remove-list.client.view.html',
			scope: {
				items: '=ngModel',
				buttonText: '=',
				placeholder: '@ngPlaceholder',
				required: '@ngRequired',
				rows: '@rows'
			},
			controller: function( $scope, $element, $attrs) {
				$scope.addItem = function(item) {
					$scope.items.push(item);
					$scope.item = '';
				};

				$scope.isAddDisabled = function(item) {
					return !item || item === '' || $scope.items.indexOf(item) >= 0;
				};

				// watch for enter key
				$scope.handleInputKeypress = function(e) {
					if (e.keyCode === 13) {
						var value = e.currentTarget.value;
						if (!$scope.isAddDisabled(value)) {
							$scope.addItem(value);
						}
					}
				};

				$scope.deleteItemFn = function(index) {
					var newArr = $scope.items;
					newArr.splice(index, 1);
					$scope.items = newArr.concat();
				};
			}
		};
	});
