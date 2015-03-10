'use strict';

module.exports = {
	app: {
		title: 'Blaze (Development)',
		instanceName: 'Blaze'
	},

	classification: {
		showBanner: true,
		string: 'DEVELOPMENT ENVIRONMENT',
		code: 'S'
	},

	auth: {
		// 'local' uses locally stored username/password sessions
		strategy: 'local',

		sessionSecret: 'MASs1f349062j3sHjSDhkl7n824nhfufdjn1z383i1345',
		sessionCollection: 'blaze.sessions'
	},

	mongoose: {
		debug: true
	},

	db: 'mongodb://localhost/wildfire',

	log: {
		application: {
			file: '/usr/local/var/log/blaze/blaze.log',
			logstash: {
				host: 'localhost',
				port: 4561
			}
		},
		audit: {
			file: '/usr/local/var/log/blaze/audit.log',
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