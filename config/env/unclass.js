'use strict';

module.exports = {
	app: {
		title: 'Wildfire Ember',
		instanceName: 'Wildfire_Ember'
	},

	assets: 'production',

	mongoose: {
		debug: false
	},

	classification: {
		showBanner: false
	},

	db: 'mongodb://localhost/ember',

	log: {
		application: {
			file: '/var/log/ember/ember.log',
			logstash: {
				host: 'server',
				port: 4561
			}
		},
		audit: {
			file: '/var/log/ember/ember.audit.log',
			logstash: {
				host: 'server',
				port: 4562
			}
		}
	},

	mailer: {
		from: process.env.MAILER_FROM || 'noreply@asymmetrik.com',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'gmail',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'noreply@asymmetrik.com',
				pass: process.env.MAILER_PASSWORD || 'PASSWORD'
			}
		}
	}

};
