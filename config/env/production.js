'use strict';

module.exports = {

	/**
	 * System Settings
	 */

	// The assets to use ('production' | 'development')
	assets: 'production',

	// Auth system
	auth: {

		/*
		 * 'local' strategy uses a locally managed username/password and user profile
		 */
		strategy: 'local',

		/*
		 * Session settings are required regardless of auth strategy
		 */

		// Session Expiration controls how long sessions can live (in ms)
		sessionCookie: {
			maxAge: 24*60*60*1000
		},

		// Session secret is used to validate sessions
		sessionSecret: 'AJwo4MDj932jk9J5jldm34jZjnDjbnASqPksh4',

		// Session mongo collection
		sessionCollection: 'sessions'

	},

	// MongoDB
	db: {
		admin: 'mongodb://localhost/lambda-ui'
	},


	/**
	 * Environment Settings
	 */

	// Basic title and instance name
	app: {
		title: 'Wildfire Lambda UI',
		instanceName: 'WildfireLambdaUI'
	},

	// Classification header/footer
	classification: {
		showBanner: false
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

	// Enable client (AngularJS) debug level logging
	clientDebugEnabled: false,

	// Enable mongoose query logging
	mongoose: {
		debug: false
	},

	// Enable automatically reloading the client on changes
	liveReload: {
		enabled: false
	},


	/**
	 * Logging Settings
	 */

	// Bunyan settings
	bunyan: {
		// Sets the console level, defaults to environment variable if present
		consoleLevel: process.env.BUNYAN_LEVEL || 'warn'
	},

	// Application logging and logstash
	log: {
		application: {
			file: '/var/log/lambda-ui/application.log',
			logstash: {
				host: 'localhost',
				port: 4561
			}
		},
		audit: {
			file: '/var/log/lambda-ui/audit.log'
		}
	}


	/**
	 * Not So Environment-Specific Settings
	 */

};
