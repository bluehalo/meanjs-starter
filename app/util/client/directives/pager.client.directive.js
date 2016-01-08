'use strict';

angular.module('asymmetrik.util').directive('asyPager', function() {
	return {
		restrict: 'A',
		templateUrl: 'app/util/views/pager.client.view.html',
		scope: {
			pageNumber: '=',
			pageSize: '=',
			maxPageSize: '=',
			currentSize: '=',
			totalSize: '=',
			onChange: '&',
			disableGoToEnd: '=?',
			showSortingControls: '=?',
			showCountWarning: '=?',
			countWarningMessage: '@?'
		},
		link: function($scope, element, attrs) {

			// Constrain the max page size and set a default
			if (null == $scope.maxPageSize) {
				$scope.maxPageSize = 100;
			}
			$scope.maxPageSize = Math.min(100, Math.max($scope.maxPageSize, 1));

			if (null == $scope.disableGoToEnd) {
				$scope.disableGoToEnd = false;
			}

			$scope.sortdir = 'DESC';

			function calculateTotalPages(n, o) {
				// Constrain the page size
				$scope.pageSize = Math.min($scope.maxPageSize, Math.max($scope.pageSize, 1));

				if (null != $scope.totalSize) {
					// Calculate the total number of pages
					$scope.totalPages = Math.ceil($scope.totalSize / $scope.pageSize);
				} else {
					$scope.totalPages = Number.MAX_SAFE_INTEGER;
				}
			}

			$scope.sort = function(direction) {
				$scope.sortdir = direction;
				$scope.onChange({pageNumber: $scope.pageNumber, pageSize: $scope.pageSize, sortdir: $scope.sortdir});
			};

			/*
			 * Use watchGroup to execute this function only once
			 * per digest cycle even if both variables change
			 */
			$scope.$watchGroup(['pageSize', 'totalSize'], calculateTotalPages);

			$scope.$watchGroup(['pageSize', 'pageNumber', 'currentSize', 'totalSize'], function() {
				$scope.startFormatted = (($scope.pageSize * $scope.pageNumber) + 1).toLocaleString();
				$scope.endFormatted = (($scope.pageSize * $scope.pageNumber) + $scope.currentSize).toLocaleString();

				if(null == $scope.totalSize){
					$scope.totalFormatted = 'unknown';
				} else {
					$scope.totalFormatted = $scope.totalSize.toLocaleString();
				}
			});

			// Go to specific page number
			$scope.goToPage = function(pageNumber) {
				$scope.pageNumber = Math.min($scope.totalPages - 1, Math.max(pageNumber, 0));
				// Allow callers to register for change events.
				// They could also just $watch for changes to pageNumber or pageSize.
				$scope.onChange({pageNumber: $scope.pageNumber, pageSize: $scope.pageSize, sortdir: $scope.sortdir});
			};

			// Set the page size
			$scope.setPageSize = function(pageSize) {
				// The page size can never exceed the max
				$scope.pageSize = Math.min($scope.maxPageSize, Math.max(pageSize, 0));
				// Since the size changed, go back to the first page
				$scope.pageNumber = 0;
				$scope.onChange({pageNumber: $scope.pageNumber, pageSize: $scope.pageSize, sortdir: $scope.sortdir});
			};
		}
	};
});