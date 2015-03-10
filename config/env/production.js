'use strict';

module.exports = {
	app: {
		title: 'Blaze',
		instanceName: 'Blaze'
	},

	deploymentMode: 'production',

	classification: {
		showBanner: false
	},

	auth: {
		// 'local' uses local username/password auth
		strategy: 'local',

		sessionSecret: 'MASs1f349062j3sHjSDhkl7n824nhfufdjn1z383i1345',
		sessionCollection: 'blaze.sessions'
	},

	mongoose: {
		debug: false
	},

	db: 'mongodb://username:password@server/blaze',

	log: {
		application: {
			file: '/var/log/blaze/blaze.log',
			logstash: {
				host: 'server',
				port: 4561
			}
		},
		audit: {
			file: '/var/log/blaze/audit.log',
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
