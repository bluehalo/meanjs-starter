/* global moment */
'use strict';

angular.module('asymmetrik.util').filter('agoDateFilter', function() {

	return function(date) {

		if(null != date) {
			// If it's not null, and it's either a number or a date 
			return moment(date).fromNow();
		}

		return 'unknown';
	};
});