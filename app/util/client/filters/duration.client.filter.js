'use strict';

angular.module('asymmetrik.util').filter('durationFilter', ['moment', function (moment) {
	function isNumeric(obj) {
		return (Object.prototype.toString.call( obj ) !== '[object Array]') && ( (obj - parseFloat(obj) + 1) >= 0 );
	}

	return function (duration) {

		if (null != duration && (isNumeric(duration) || null != duration.getTime)) {
			// If it's not null and its a number or it's a date

			if(null != duration.getTime) {
				duration = duration.getTime();
			}

			if(duration < 1000) {
				return duration + ' ms';
			}

			if(duration < 120000){
				return Math.floor(duration/1000) + ' seconds';
			}

			return moment.duration(duration).humanize();
		}

		return 'unknown';
	};
}]);