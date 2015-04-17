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
		reportService.recentActivity($stateParams.reportId).then(function(result) {
			var processedActivity = reportService.processUserActivitySummary(result);

			$scope.report = result.report;
			$scope.users = processedActivity.users;
			$scope.current = processedActivity.current;
			$scope.previous = processedActivity.previous;

		}, function(error){
			$log.error('Report with id: ' + $stateParams.reportId + ' does not exist.');
		});

		var sort = {
			screenName: { id: 'screenName', value: 'screenName', dir: false },
			created: { id: 'created', value: 'current.p.createdDate', dir: true },
			friends: { id: 'friends', value: 'current.p.friendsCount', dir: true },
			friendsDelta: { id: 'friendsDelta', value: 'delta.friendsCount', dir: true },
			friendsDeltaPercent: { id: 'friendsDeltaPercent', value: 'delta.friendsPercent', dir: true },
			followers: { id: 'followers', value: 'current.p.followersCount', dir: true },
			followersDelta: { id: 'followersDelta', value: 'delta.followersCount', dir: true },
			followersDeltaPercent: { id: 'followersDeltaPercent', value: 'delta.followersPercent', dir: true },
			statuses: { id: 'statuses', value: 'current.p.statusesCount', dir: true },
			statusesDelta: { id: 'statusesDelta', value: 'delta.statusesCount', dir: true },
			statusesDeltaPercent: { id: 'statusesDeltaPercent', value: 'delta.statusesPercent', dir: true }
		};
		$scope.setSort = function(id) {
			if(null != $scope.sort && $scope.sort.id === id) {
				// Same sort again, so change dir
				$scope.sort.dir = !($scope.sort.dir);
			} else {
				$scope.sort = {};
				$scope.sort.id = sort[id].id;
				$scope.sort.value = sort[id].value;
				$scope.sort.dir = sort[id].dir;
			}
		};
		$scope.setSort(sort.screenName.id);
	}
]);