'use strict';

angular.module('asymmetrik.util')
	.directive('wfGeoAreaSummary',
		[ 'leafletUtilService', function(leafletUtilService) {
			return {
				restrict: 'A',
				templateUrl: 'app/util/views/geo-area-summary.client.view.html',
				scope: {
					geo: '=wfGeoAreaSummary'
				},
				controller: function ($scope) {
					$scope.$watch('geo.coordinates', function(n, o) {
						if (null != n) {
							$scope.filter = leafletUtilService.geoJsonToLeafletJson($scope.geo);
							$scope.area = leafletUtilService.leafletJsonToArea($scope.filter);

							// Get the type, title-cased
							$scope.geoType = $scope.filter.type.replace(/^([a-z])/, function(ch) {
								return ch.toUpperCase();
							});
						}
					});
				}
			};
		}]);