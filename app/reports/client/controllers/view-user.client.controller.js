'use strict';

angular.module('asymmetrik.reports').controller('ViewUserActivityController',
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

		var series = [{
			key: 'friends',
			seriesName: 'Friends',
			y: function(d) { return d.p.friendsCount; },
			color: '#2ca02c'
		},{
			key: 'followers',
			seriesName: 'Followers',
			y: function(d) { return d.p.followersCount; },
			color: '#ff7f0e'
		}, {
			key: 'tweets',
			seriesName: 'Tweets',
			y: function(d) { return d.p.statusesCount; },
			color: '#1f77b4'
		}];

		$scope.options = {
			chart: {
				type: 'lineChart',
				height: 200,
				margin : { top: 20, right: 80, bottom: 40, left: 80 },
				useInteractiveGuideline: true,
				xScale: d3.time.scale.utc(),
				xAxis: { tickFormat: d3.time.format('%Y-%m-%d') },
				yAxis: { tickFormat: d3.format(',d') }
			}
		};

		function generateData(profiles) {
			var data = {};
			series.forEach(function(s) {
				data[s.key] = {
					key: s.seriesName,
					color: s.color,
					values: []
				};
			});

			profiles.forEach(function(profile) {
				series.forEach(function(s) {
					data[s.key].values.push({ x: new Date(profile.md.ts), y: s.y(profile) });
				});
			});

			var toReturn = {};
			series.forEach(function(s) {
				toReturn[s.key] = [data[s.key]];
			});
			return toReturn;
		}

		// Get the recent activity for the report of interest
		reportService.userActivity($stateParams.screenName).then(function(result) {
			var processedActivity = reportService.processUserActivitySummary(result);

			$scope.profiles = processedActivity.profiles;
			$scope.user = processedActivity.user;

			var data = generateData($scope.profiles);
			$scope.friends = data.friends;
			$scope.followers = data.followers;
			$scope.tweets = data.tweets;

		}, function(error){
			$log.error('No data found for screenName: ' + $stateParams.screenName);
		});

	}
]);