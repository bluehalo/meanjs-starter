'use strict';

angular.module('asymmetrik.util').filter('twemojiFilter',
	['$window',
		function($window) {
			return function(stringOrDomElement) {
				return $window.twemoji.parse(stringOrDomElement, {
					size: 16,
					base: '/lib/twemoji/'
				});
			};
		}]);