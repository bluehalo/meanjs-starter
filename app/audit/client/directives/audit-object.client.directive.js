'use strict';

angular.module('asymmetrik.audit').directive('asyAuditObject',
	['$compile', '$q', 'auditTemplate',
		function ($compile, $q, auditTemplate) {
			return {
				restrict: 'A',
				scope: {
					object: '=asyAuditObject',
					auditType: '=asyAuditType'
				},
				link: function(scope, element, attrs) {
					auditTemplate.getTemplate(scope.auditType).then(function(template) {
						element.html(template);

						// Compile the template for angular, passing in the current scope.
						$compile(element.contents())(scope);
					});
				},
			};
		}]);