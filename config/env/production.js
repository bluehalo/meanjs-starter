'use strict';

module.exports = {
	assets: 'production',

	db: 'mongodb://username:password@server/meanjs',

	log: {
		application: {
			file: '/var/log/meanjs.log',
			logstash: {
				host: 'server',
				port: 4561
			}
		},
		audit: {
			file: '/var/log/meanjs.audit.log',
			logstash: {
				host: 'server',
				port: 4562
			}
		}
	}

};
