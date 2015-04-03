'use strict';

angular.module('asymmetrik.reports').filter('reportTypeaheadFilter', function() {

	return function(report) {
		if(null != report) {
			return report.title;
		}

		return '';
	};
});