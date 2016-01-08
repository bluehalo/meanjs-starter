'use strict';

angular.module('asymmetrik.util').filter('agoDateFilter', ['moment', function(moment) {

	return function(date) {

		if(null != date) {
			// If it's not null, and it's either a number or a date 
			return moment(date).fromNow(true);
		}

		return 'unknown';
	};
}]);