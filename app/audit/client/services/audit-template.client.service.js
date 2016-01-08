'use strict';

angular.module('asymmetrik.audit').service('auditTemplate',
	['$http', '$templateCache',
		function ($http, $templateCache) {

			/**
			 * Loads a template and returns a promise for it.  If the template has already been loaded,
			 * it will simply be returned.
			 *
			 * @param key (e.g. 'user')
			 * @returns A promise for a template
			 */
			var getTemplate = function(key) {
				var templateKey = key || 'default';
				var template = $templateCache.get(templateKey);

				// Load the template if we haven't already
				if (null == template) {
					template = $http
						.get('/app/audit/views/templates/' + templateKey + '.audit.client.view.html')
						.then(function(result) {
							return result.data;
						}, function(err) {
							// If the file was not found, use the default instead
							return getTemplate(null);
						});
					$templateCache.put(templateKey, template);
				}
				return template;
			};

			return {
				getTemplate: getTemplate
			};
		}]);
