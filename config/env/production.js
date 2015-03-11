'use strict';

module.exports = {
	app: {
		title: 'Application',
		instanceName: 'Application'
	},

	assets: 'production',

	mongoose: {
		debug: false
	},

	classification: {
		showBanner: false
	},

	db: 'mongodb://username:password@server/application',

	log: {
		application: {
			file: '/var/log/application.log',
			logstash: {
				host: 'server',
				port: 4561
			}
		},
		audit: {
			file: '/var/log/application.audit.log',
			logstash: {
				host: 'server',
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
