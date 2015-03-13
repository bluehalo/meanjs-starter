'use strict';

angular.module('asymmetrik.util').controller('ConfirmController', [ '$scope', '$modalInstance', '$log', 'params', 
	function( $scope, $modalInstance, $log, params ) {

	$scope.title = params.title;
	$scope.message = params.message;
	$scope.okText = params.ok;
	$scope.cancelText = params.cancel;

	$scope.ok = function(){
		$modalInstance.close();
	};

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel');
	};

}]);
