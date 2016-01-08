'use strict';

// Setting up route
angular.module('asymmetrik.audit').config(['$stateProvider',
	function($stateProvider) {

	$stateProvider
		// Abstract route
		.state('admin.audit', {
			abstract: true,
			template: '<ui-view/>',
			data: {
				roles: [ 'admin' ]
			}
		})

		/* List/search view for Audit events */
		.state('admin.audit.list', {
			url: '/admin/audit',
			templateUrl: 'app/audit/views/audit-list.client.view.html',
			controller: 'AuditListController'
		});

	}
]);