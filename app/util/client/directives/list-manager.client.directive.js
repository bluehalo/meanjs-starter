'use strict';

angular.module('asymmetrik.util')
	.directive('listManager', function() {
	return {
		restrict: 'AE',
		templateUrl: 'app/util/views/list-manager.client.view.html',
		scope: { 
			items: '=ngModel',
			placeholder: '@ngPlaceholder',
			required: '@ngRequired',
			rows: '@rows'
		},
		controller: function( $scope, $element, $attrs) {
			$scope.deleteItemFn = function(index) {
				var newArr = $scope.items;
				newArr.splice(index, 1);
				$scope.items = newArr.concat();
			};
		}
	};
});
