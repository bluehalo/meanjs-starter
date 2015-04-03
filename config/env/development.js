'use strict';

module.exports = {
	app: {
		title: 'Wildfire Ember (Development)',
		instanceName: 'Wildfire_Ember'
	},

	liveReload: {
		enabled: true,
		port: 35729
	},

	// Ports for development applications
	devPorts: {
		nodeInspector: 1337,
		debug: 5858,
		karma: 9876
	},

	db: 'mongodb://localhost/ember-dev',

	classification: {
		showBanner: true,
		string: 'DEVELOPMENT ENVIRONMENT',
		code: 'S'
	},

	log: {
		application: {
			file: '/usr/local/var/log/ember.log',
			logstash: {
				host: 'localhost',
				port: 4561
			}
		},
		audit: {
			file: '/usr/local/var/log/ember.audit.log',
			logstash: {
				host: 'localhost',
				port: 4562
			}
		}
	},

	mailer: {
		from: process.env.MAILER_FROM || 'USERNAME@GMAIL.COM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'gmail',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'USERNAME@GMAIL.COM',
				pass: process.env.MAILER_PASSWORD || 'PASSWORD'
			}
		}
	}

};