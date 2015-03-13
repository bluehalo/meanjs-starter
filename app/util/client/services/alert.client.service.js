'use strict';

//Authentication Object
angular.module('asymmetrik.util').factory('Alerts', [ '$timeout', function( $timeout ) {
	var data = {
		id: 0,
		alerts: {
			list: [],
			map: {}
		},
		defaultType: 'danger'
	};

	function clearAllAlerts() {
		for(var i=0; i<data.alerts.list.length; i++){
			data.alerts.list.pop();
		}
		data.alerts.map = {};
	}

	function clearAlert(index) {
		var alert = data.alerts.list[index];
		data.alerts.list.splice(index, 1);
		delete data.alerts.map[alert.id];
	}

	function clearAlertById(id) {
		var alert = data.alerts.map[id];
		if(null != alert) {
			var index = data.alerts.list.indexOf(alert);
			clearAlert(index);
		}
	}

	function addAlert(msg, type, ttl) {
		var alert = {
			id: data.id++,
			type: type || data.defaultType, 
			msg: msg
		};

		data.alerts.list.push(alert);
		data.alerts.map[alert.id] = alert;

		// If they passed in a ttl parameter, age off the alert after said timeout
		if(null != ttl) {
			$timeout(function() {
				clearAlertById(alert.id);
			}, ttl);
		}
	}

	return {
		alerts: data.alerts.list,
		clearAll: clearAllAlerts,
		clear: clearAlert,
		add: addAlert
	};
}]);
