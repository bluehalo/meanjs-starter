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

	scheduler: {
		services: [
			{
				file: 'app/reports/server/services/report.server.service.js',
				interval: 30000,
				config: {
					apiKey: 'oR33Tx6zZwvBGHqJgcuv5hUoI',
					apiSecret: 'qpvF4ffaLG6P6N3BiTwXaTh6Pn1B7Geg5mjsf5retiRPusvAZz',
					tokenKey: '3152922241-X6HVQ77I4kKVcBfmeU36WVAur8xCNOqNGUqYh5i',
					tokenSecret: 'Am5T9om0aN7sMqUfPkwWlMGKbMkYcrUOJwYkohUjnPpPA'
				}
			}
		],
		interval: 10000
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
