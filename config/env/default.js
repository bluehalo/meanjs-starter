'use strict';

module.exports = {
	app: {
		title: 'MeanJS Starter App',
		instanceName: 'meanjsstarter'
	},

	assets: 'development',

	mongoose: {
		debug: false
	},

	karma: {
		port: 9876
	},

	liveReload: {
		enabled: false
	},

	classification: {
		// show/hide the classification header/footer
		showBanner: false

		// The classification string to display in this environment
		//string: 'DEFAULT SETTINGS',

		// Code that determines applied header/footer style ('U' - unclass, 'S' - secret, 'K' - ts)
		//code: 'K'
	},

	copyright: {
		showBanner: true,
		string: 'Copyright © 2015 Asymmetrik, Ltd. All Rights Reserved.'
	},

	auth: {
		strategy: 'local',

		// header setting is only required for proxy-pki
		//strategy: 'proxy-pki',
		//header: 'x-ssl-client-s-dn',

		// Session settings are required regardless of auth strategy
		sessionSecret: 'MASs1f349062j3sHjSDhkl7n824nhfufdjn1z383i1345',
		sessionCollection: 'sessions',
		sessionCookie: {
			maxAge: 60*60*24*1000	// 24 hours
		}

	},

//	scheduler: {
//		services: [
//			{
//				file: 'app/.../server/services/service.js',
//				interval: 30000,
//				config: {
//				}
//			}
//		],
//		interval: 10000
//	},

	mq: {
		server: 'localhost',
		port: 61613,
		username: undefined,
		password: undefined
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

	port: process.env.PORT || 3000,
	templateEngine: 'swig'

};