'use strict';

angular.module('asymmetrik.util').directive('wfLoadingAnimation', 
	function() {
		return {
			restrict: 'A',
			templateUrl: 'app/util/views/loading-animation.client.view.html',
			scope: { 
				loading: '=wfLoading'
			}
		};
	});