'use strict';

/**
 * Copy this file to 'development.js' and selectively pull in first-level properties
 * to override the properties in 'default.js'.
 */
module.exports = {

	/**
	 * System Settings
	 */


	/**
	 * Environment Settings
	 */

	// Basic title and instance name
	app: {
		title: 'Wildfire Lambda UI (Development Settings)',
		instanceName: 'Wildfire Lambda UI'
	},

	// Classification header/footer
	classification: {
		// Show/hide the banner
		showBanner: true,

		// The classification string to display in this environment
		string: 'DEVELOPMENT WILDFIRE LAMBDA UI SETTINGS',

		// Code that determines applied header/footer style ('U' - unclass, 'S' - secret, 'K' - ts)
		code: 'S'
	},

	// Configuration for outgoing mail server
	mailer: {
		from: process.env.MAILER_FROM || 'USERNAME@GMAIL.COM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'gmail',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'USERNAME@GMAIL.COM',
				pass: process.env.MAILER_PASSWORD || 'PASSWORD'
			}
		}
	},

	/**
	 * Development/debugging settings
	 */


	/**
	 * Logging Settings
	 */


	/**
	 * Not So Environment-Specific Settings
	 */


};