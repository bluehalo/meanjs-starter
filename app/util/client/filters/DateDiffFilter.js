/* global moment */
'use strict';

angular.module('asymmetrik.util').filter('dateDiffFilter', function () {
	return function (toDate, fromDate) {
		if(null != toDate && null != fromDate){
			return moment(toDate).from(fromDate, true);
		} else {
			return 'unknown';
		}
	};
});