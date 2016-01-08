'use strict';

var mongoose = require('mongoose');

module.exports = {
	app: {
		title: 'Wildfire',
		instanceName: 'Wildfire'
	},

	assets: 'production',

	clientDebugEnabled: false,

	mongoose: {
		debug: false
	},

	classification: {
		showBanner: false
	},

	auth: {
		// 'local' uses local username/password auth
		strategy: 'local',
		header: 'x-ssl-client-s-dn',

		sessionSecret: 'AJwo4MDj932jk9J5jldm34jZjnDjbnASqPksh4',
		sessionCollection: 'sessions',

		accessControl: {
			host: 'localhost',
			port: 3001,
			path: '/role?username=',
			responseUsernamePath: '$.users[0].userInfo.username',
			//responseName: '$.users[0].userInfo.name',
			responseFirstNamePath: '$.users[0].userInfo.firstName',
			responseLastNamePath: '$.users[0].userInfo.lastName',
			responseOrganizationPath: '$.users[0].userInfo.organization',
			responseEmailPath: '$.users[0].userInfo.email',
			responseRolesPath: '$.users[0].roles',
			responseRole: 'role1',
			ssl: {
				key: '/path/to/key',
				cert: '/path/to/cert'
			}
		},

		defaultRoles: { user: true },
		defaultGroups: [ { _id: mongoose.Types.ObjectId('54eddbc0e8c820a32d19fd3f') } ]
	},

	db: {
		admin: 'mongodb://username:password@server/wildfire',
		data: 'mongodb://username:password@server/wildfire-data',
		locations: 'mongodb://username:password@server/geonames'
	},

	kafka: {
		broker: 'server:9092',
		zookeeper: 'server1:2181,server2:2181,server3:2181',
		zookeeperCommTimeoutMs: 1000,
		kafkaRetryMs: 3000
	},

	log: {
		application: {
			file: '/var/log/wildfire/wildfire.log',
			logstash: {
				host: 'server',
				port: 4561
			}
		},
		audit: {
			file: '/var/log/wildfire/audit.log',
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
	},

	notifications: {
		email: true,
		sms: true,
		ui: true
	}

};
