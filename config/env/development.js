'use strict';

module.exports = {
	app: {
		title: 'Torch (Development)',
		instanceName: 'Torch'
	},

	assets: 'development',

	liveReload: {
		enabled: true,
		port: 35729
	},

	classification: {
		showBanner: true,
		string: 'DEVELOPMENT ENVIRONMENT',
		code: 'S'
	},

	auth: {
		// Token Auth Access List is used to grant token/secret based acces to specific endpoints
		apiAccessList: {
			cacheGet_example: [{ token: 'example1', secret: '0000000000'}]
		},

		// 'local' uses locally stored username/password sessions
		strategy: 'local',
		header: 'x-ssl-client-s-dn',

		sessionSecret: 'AJwo4MDj932jk9J5jldm34jZjnDjbnASqPksh4',
		sessionCollection: 'sessions'
	},

	db: {
		admin: 'mongodb://localhost/wildfire-dev',
		data: 'mongodb://localhost/wildfire-data',
		locations: 'mongodb://localhost/geonames'
	},

	kafka: {
		broker: 'localhost:9092',
		zookeeper: 'localhost:2181',
		zookeeperCommTimeoutMs: 1000,
		kafkaRetryMs: 3000
	},

	bunyan: {
		consoleLevel: 'debug'
	},

	log: {
		application: {
			file: '/usr/local/var/log/wildfire/wildfire.log',
			logstash: {
				host: 'localhost',
				port: 4561
			}
		},
		audit: {
			file: '/usr/local/var/log/wildfire/audit.log',
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
	},

	notifications: {
		email: true,
		sms: true,
		ui: true
	},

	socketio: {
		// ignoreOlderThan: null
	}
};