/* global moment */
'use strict';

angular.module('asymmetrik.util').filter('areaFilter', ['$filter', function($filter) {

	return function(metersSquaredDistance) {

		var areakm = metersSquaredDistance / 1000000;

		if(null != metersSquaredDistance) {
			if(areakm >= 1000000) {
				return $filter('number')(areakm / 1000000, 1) + ' M';
			} else {
				return $filter('number')(areakm, 0);
			}
		}

		return '';
	};
}]);