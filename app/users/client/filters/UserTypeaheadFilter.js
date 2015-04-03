/* global moment */
'use strict';

angular.module('asymmetrik.users').filter('userTypeaheadFilter', function() {

	return function(user) {
		if(null != user) {
			return user.name + ' [ ' + user.username + ' ]';
		}

		return '';
	};
});