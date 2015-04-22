'use strict';

// Setting up route
angular.module('asymmetrik.reports').config(['$stateProvider',
	function($stateProvider) {
		// Reports state routing
		$stateProvider

		// Abstract parent state
		.state('report', {
			abstract: true,
			template: '<ui-view/>'
		})

		/*
		 * States for managing and viewing reports
		 */

		/* List/search view for reports. */
		.state('report.list', {
			url: '/reports',
			templateUrl: 'app/reports/views/list-reports.client.view.html',
			controller: 'ListReportsController',
			data: {
				roles : [ 'user' ]
			}
		})

		/* Manage reports. Both Create and edit. */
		.state('report.create', {
			url: '/report/create',
			templateUrl: 'app/reports/views/manage-report.client.view.html',
			controller: 'ManageReportController',
			data: {
				roles : [ 'user' ],
				mode: 'create'
			},
			resolve: {
				Groups: function(groupService) {
					return groupService.list();
				}
			}
		})
		.state('report.edit', {
			url: '/report:reportId/edit',
			templateUrl: 'app/reports/views/manage-report.client.view.html',
			controller: 'ManageReportController',
			data: {
				roles : [ 'user' ],
				mode: 'edit'
			},
			resolve: {
				Groups: function(groupService) {
					return groupService.list();
				}
			}
		})


		/* View a report */
		.state('report.view', {
			url: '/report:reportId',
			templateUrl: 'app/reports/views/view-report.client.view.html',
			controller: 'ViewReportController',
			data: {
				requiresAuthentication: false
			}
		})

		/* View a user */
		.state('report.view-user', {
			url: '/report/user/:screenName',
			templateUrl: 'app/reports/views/view-user-activity.client.view.html',
			controller: 'ViewUserActivityController',
			data: {
				requiresAuthentication: false
			}
		});


	}
]);