'use strict';

module.exports = {
	app: {
		title: 'Blaze (Default Settings)',
		instanceName: 'Blaze'
	},

	deploymentMode: 'development',

	// Ports for development applications
	devPorts: {
		liveReload: 35729,
		nodeInspector: 1337,
		debug: 5858,
		karma: 9876
	},

	classification: {
		// show/hide the classification header/footer
		showBanner: true,

		// The classification string to display in this environment
		string: 'DEFAULT BLAZE SETTINGS',

		// Code that determines applied header/footer style ('U' - unclass, 'S' - secret, 'K' - ts)
		code: 'K'
	},

	auth: {
		strategy: 'local',

		// header setting is only required for proxy-pki
		//strategy: 'proxy-pki',
		//header: 'x-ssl-client-s-dn',

		// Session settings are required regardless of auth strategy
		sessionSecret: 'MASs1f349062j3sHjSDhkl7n824nhfufdjn1z383i1345',
		sessionCollection: 'blaze.sessions',
		sessionCookie: {
			maxAge: 60*60*24*1000	// 24 hours
		}

	},

	port: process.env.PORT || 4000,
	templateEngine: 'swig'

};