'use strict';

/**
 * Abbreviates large numbers, mapping them to 1K, 1M, 1B, etc.
 */
angular.module('asymmetrik.util').filter('bigNumberFilter', [ '$filter', function ($filter) {
	var scales = [{
			abbreviation: 'T',
			name: 'Trillion',
			multiplier: 1000000000000
		},{
			abbreviation: 'B',
			name: 'Billion',
			multiplier: 1000000000
		},{
			abbreviation: 'M',
			name: 'Million',
			multiplier: 1000000
		},{
			abbreviation: 'K',
			name: 'Thousand',
			multiplier: 1000
		},{
			abbreviation: '',
			name: '',
			multiplier: 1
		}
	];

	function getScale(number) {
		var scale = null;

		scales.some(function(element, index, array) {
			// Go through the scales, biggest first, searching for the first one that divides the number
			scale = element;
			return (number/scale.multiplier >= 1);
		});

		return scale;
	}

	return function (number, fractionSize) {
		var scale = getScale(number);
		var postfix = '';
		var fraction = number;

		if(null != scale) {
			fraction = number/scale.multiplier;
			postfix = scale.abbreviation;
		}

		// default behavior is 'smart'
		if(null == fractionSize || fractionSize ==='smart') {
			// Smart behavior is to maintain a minimum of 2 significant digits once the number is larger than 10
			if(fraction === 0) {
				fractionSize = 0;
			}
			else if(fraction < 1) {
				fractionSize = 2;
			}
			else if(Math.ceil(fraction) < 10 && number >= 1000) {
				fractionSize = 1;
			}
			else {
				fractionSize = 0;
			}
		}

		return $filter('number')(fraction, fractionSize) + postfix;
	};
}]);