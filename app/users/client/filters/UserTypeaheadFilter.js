/* global moment */
'use strict';

angular.module('wf.users').filter('userTypeaheadFilter', function() {

	return function(user) {
		if(null != user) {
			return user.name + ' [ ' + user.username + ' ]';
		}

		return '';
	};
});