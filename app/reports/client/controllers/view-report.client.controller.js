'use strict';

angular.module('asymmetrik.reports').controller('ViewReportController',
		[ '$scope', '$location', '$log', '$stateParams',
		  'Authentication', 'authService', 'Alerts', 
		  'reportService', 

	function( $scope, $location, $log, $stateParams,
			  Authentication, authService, Alerts,
			  reportService ) {

		// Store our global objects in the scope
		$scope.auth = Authentication;
		$scope.alertService = Alerts;
		$scope.alertService.clearAll();

		// Get the recent activity for the report of interest
		reportService.reportActivity($stateParams.reportId).then(function(result) {
			var processedActivity = reportService.processReportActivitySummary(result);

			$scope.report = result.report;
			$scope.users = processedActivity.users;
			$scope.current = processedActivity.current;
			$scope.previous = processedActivity.previous;

		}, function(error){
			$log.error('Report with id: ' + $stateParams.reportId + ' does not exist.');
		});

		var sort = {
			screenName: { id: 'screenName', value: 'screenName', reverse: false },
			created: { id: 'created', value: '(null != current.p.createdDate)? current.p.createdDate : 0', reverse: true },
			friends: { id: 'friends', value: 'current.p.friendsCount', reverse: true },
			friendsDelta: { id: 'friendsDelta', value: 'delta.friendsCount', reverse: true },
			friendsDeltaPercent: { id: 'friendsDeltaPercent', value: 'delta.friendsPercent', reverse: true },
			followers: { id: 'followers', value: 'current.p.followersCount', reverse: true },
			followersDelta: { id: 'followersDelta', value: 'delta.followersCount', reverse: true },
			followersDeltaPercent: { id: 'followersDeltaPercent', value: 'delta.followersPercent', reverse: true },
			statuses: { id: 'statuses', value: 'current.p.statusesCount', reverse: true },
			statusesDelta: { id: 'statusesDelta', value: 'delta.statusesCount', reverse: true },
			statusesDeltaPercent: { id: 'statusesDeltaPercent', value: 'delta.statusesPercent', reverse: true }
		};
		$scope.setSort = function(id) {
			if(null != $scope.sort && $scope.sort.id === id) {
				// Same sort again, so change reverse
				$scope.sort.reverse = !($scope.sort.reverse);
			} else {
				$scope.sort = {};
				$scope.sort.id = sort[id].id;
				$scope.sort.value = sort[id].value;
				$scope.sort.reverse = sort[id].reverse;
			}
		};
		$scope.setSort(sort.screenName.id);
	}
]);