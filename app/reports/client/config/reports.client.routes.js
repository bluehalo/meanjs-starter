'use strict';

// Setting up route
angular.module('asymmetrik.reports').config(['$stateProvider',
	function($stateProvider) {
		// Reports state routing
		$stateProvider

		/*
		 * States for managing and viewing reports
		 */

		/* List/search view for reports. */
		.state('report.list', {
			url: '/reports',
			templateUrl: 'app/reports/views/list-reports.client.view.html',
			controller: 'ListReportsController',
			roles : [ 'user' ]
		})

		/* Manage reports. Both Create and edit. */
		.state('report.create', {
			url: '/report/create',
			templateUrl: 'app/report/views/manage-report.client.view.html',
			controller: 'ManageReportController',
			roles : [ 'user' ]
		})
		.state('report.edit', {
			url: '/report:reportId/edit',
			templateUrl: 'app/reports/views/manage-report.client.view.html',
			controller: 'ManageReportController',
			roles : [ 'user' ]
		})


		/* View a report */
		.state('report.view', {
			url: '/report:reportId',
			templateUrl: 'app/reports/views/view-report.client.view.html',
			controller: 'ViewReportController',
			data: {
				requiresAuthentication: false
			}
		});


	}
]);