'use strict';

angular.module('asymmetrik.util')
	.directive('wfConstrainedQuery', function($log) {
		return {
			restrict: 'A',
			templateUrl: 'app/util/views/constrained-query.client.view.html',
			scope: {
				'queryJson': '=wfConstrainedQuery',
				'readonly': '=wfReadonly',
				'placeholder': '=wfPlaceholder',
				'allowedValues': '=wfAllowedValues'
			},
			/**
			 * Default values if not provided in the elements
			 */
			compile: function(element, attrs){
				if (typeof attrs.wfReadonly === 'undefined') {
					attrs.wfReadonly = 'false';
				}
				if (typeof attrs.wfConstrainedQuery === 'undefined') {
					attrs.wfConstrainedQuery = '{}';
				}
				if (typeof attrs.wfPlaceholder === 'undefined') {
					attrs.wfPlaceholder = '"Enter image label criteria..."';
				}
				if (typeof attrs.wfAllowedValues === 'undefined') {
					attrs.wfAllowedValues = [];
				}
			},
			controller: ['$scope', function($scope) {
				
				$scope.items = [];
				
				var isValid = function(queryString) {
					// Check if the query string is valid
					if ($scope.allowedValues.indexOf(queryString) === -1) {
						return false;
					}

					return true;
				};

				var getQueryJson = function(queryStringList) {
					if (queryStringList.length === 0) {
						return null;
					}

					return {
						'or': queryStringList
					};
				};

				// Method handler for return keypress in the input form
				$scope.addToQueryKeypress = function (keyEvent) {
					if (keyEvent.which === 13) {
						$scope.addToQuery($scope.queryString);
					}
				};

				// Method handler for selection in typeahead list
				$scope.addToQuerySelect = function($item, $model, $label) {
					$scope.addToQuery($item);
				};

				$scope.addToQuery = function(queryString) {
					// Check that the query string is valid
					if (isValid(queryString)) {
						// Check if the query string has already been added
						if ($scope.items.indexOf(queryString) === -1) {
							$scope.items.push(queryString);
							$scope.queryJson = getQueryJson($scope.items);
						}
					}
					$scope.queryString = '';
				};

				$scope.removeFromQuery = function(queryString) {
					if (isValid(queryString)) {
						var index = $scope.items.indexOf(queryString);
						if (index !== -1) {
							$scope.items.splice(index,1);
							$scope.queryJson = getQueryJson($scope.items);
							$scope.queryString = '';
						}

					}
				};

				$scope.$watch('queryJson', function(newValue, oldValue) {
					var getQueryList = function(queryJson) {
						if (null == queryJson || null == queryJson.or) {
							return [];
						}

						return queryJson.or;
					};
					
					$scope.items = getQueryList($scope.queryJson);
				});
			}]
		};
	});
