'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$logProvider', 
	function($locationProvider, $logProvider) {
		// Add the custom prefix... crawlers and some such
		$locationProvider.hashPrefix('!');

		// Grab the config from the window object
		var config = (null != window.config)? window.config : null;

		// Opportunity to change logging levels
		$logProvider.debugEnabled((null != config)? config.clientDebugEnabled : false);
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});