'use strict';

module.exports = {

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

	db: 'mongodb://localhost/meanjs-dev',

	log: {
		application: {
			file: '/usr/local/var/log/meanjs.log',
			logstash: {
				host: 'localhost',
				port: 4561
			}
		},
		audit: {
			file: '/usr/local/var/log/meanjs.audit.log',
			logstash: {
				host: 'localhost',
				port: 4562
			}
		}
	}

};