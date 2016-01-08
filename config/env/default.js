'use strict';

module.exports = {

	/**
	 * System Settings
	 */

	// The assets to use ('production' | 'development')
	assets: 'development',

	// Auth system
	auth: {
		/*
		 * The API Access List grants token/secret-based access to specific endpoints in the application
		 */
//		apiAccessList: {
//			locationUpdate: [{ token: '', secret: ''}]
//		},

		/*
		 * 'local' strategy uses a locally managed username/password and user profile
		 */
		strategy: 'local',

		/*
		 * 'proxy-pki' strategy assumes that the Node app is behind an SSL terminating
		 * proxy server. The proxy is responsible for passing the DN of the incoming 
		 * user in the the 'x-ssl-client-dn' header.
		 */
//		strategy: 'proxy-pki',
//
//		accessChecker: {
//			provider: {
//				file: 'app/access-checker/tests/server/providers/example-provider.server.service.js',
//				config: {
//					'/c=us/st=maryland/o=asymmetrik ltd./ou=client/cn=asymmetrikclient': {
//						name: 'Ryan Blace',
//						organization: 'Asymmetrik',
//						email: 'reblace@gmail.com',
//						username: 'reblace'
//					}
//				}
//			},
//			cacheExpire: 1000*60*60*24 // expiration of cache entries
//		},
//
//		autoLogin: true,
//		autoCreateAccounts: true,
//		requiredRoles: ['WILDFIRE'],

		defaultRoles: { user: true },
//		defaultGroups: [ { _id: mongoose.Types.ObjectId('ID') } ],


		/*
		 * Session settings are required regardless of auth strategy
		 */

		// Session Expiration controls how long sessions can live (in ms)
		sessionCookie: {
			maxAge: 24*60*60*1000
		},

		// Session secret is used to validate sessions
		sessionSecret: 'AJwo4MDj932jk9J5jldm34jZjnDjbnASqPksh4',

		// Session mongo collection
		sessionCollection: 'sessions'

	},

	// Scheduled task runner
//	scheduler: {
//		services: [
//			{
//				file: 'app/access-checker/server/services/cache-refresh.server.service.js',
//				interval: 5000,
//				config: {
//					refresh: 8*3600000 // 8 Hours
//				}
//			},
//			{
//				file: '...',
//				interval: 10000,
//				config: {}
//			}
//		],
//		interval: 10000
//	},

	// MongoDB
	db: {
		admin: 'mongodb://localhost/lambda-ui-dev'
	},

	/**
	 * Environment Settings
	 */

	// Basic title and instance name
	app: {
		title: 'Wildfire Lambda UI (Default Settings)',
		instanceName: 'Wildfire Lambda UI'
	},

	// Classification header/footer
	classification: {
		// Show/hide the banner
		showBanner: true,

		// The classification string to display in this environment
		string: 'DEFAULT WILDFIRE LAMBDA UI SETTINGS',

		// Code that determines applied header/footer style ('U' - unclass, 'S' - secret, 'K' - ts)
		code: 'K'
	},

	// Copyright footer (shown above the classification footer)
	copyright: {
		// Show/hide the banner
		showBanner: true,

		// HTML-enabled contents of the banner
		string: 'Copyright © 2015 <a href="http://www.asymmetrik.com" target="_blank">Asymmetrik, Ltd</a>. All Rights Reserved.'
	},

	// Map settings
	map: {
		// Maximum bounds to allow the map to pan to
		maxbounds: { southWest : {lat: -90, lng: -250}, northEast: {lat: 90, lng: 250} },

		// Default min zoom level
		defaults: { minZoom: 1 },

		// Set the available base layers for the map
		baselayers: {
			// Example slippy maps Leaflet configuration
			osm: {
				name: 'Map',
				type: 'xyz',
				url: 'https://{s}.tiles.mapbox.com/v3/reblace.k8gdh2dh/{z}/{x}/{y}.png',
				layerOptions: {
					subdomains: ['a', 'b', 'c'],
					attribution: '© OpenStreetMap contributors'
				}
			},

			mapquest: {
				name: 'MapQuest Open',
				type: 'xyz',
				url: 'http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
				layerOptions: {
					subdomains: ['a', 'b', 'c'],
					attribution: 'MapQuest Open'
				}
			}

//			// Example WMS Leaflet Configuration
//			wms: {
//				name: 'Open Street Map - WMS',
//				url: 'http://irs.gis-lab.info/',
//				type: 'wms',
//				layerOptions: {
//					layers: 'osm',
//					format: 'image/png',
//					transparent: true,
//					attribution: ''
//				}
//			},

		}
	},

	// Show the Twitter images as embedded images
	showTwitterImages: true,

	// Configuration for outgoing mail server
//	mailer: {
//		from: process.env.MAILER_FROM || 'USERNAME@GMAIL.COM',
//		options: {
//			service: process.env.MAILER_SERVICE_PROVIDER || 'gmail',
//			auth: {
//				user: process.env.MAILER_EMAIL_ID || 'USERNAME@GMAIL.COM',
//				pass: process.env.MAILER_PASSWORD || 'PASSWORD'
//			}
//		}
//	},


	/**
	 * Development/debugging settings
	 */

	// Enable client (AngularJS) debug level logging
	clientDebugEnabled: true,

	// Expose server errors to the client (500 errors)
	exposeServerErrors: true,

	// Enable mongoose query logging
	mongoose: {
		debug: false
	},

	// Enable automatically reloading the client on changes
	liveReload: {
		enabled: true,
		port: 35729
	},

	// Set debugger and node inspector ports
	devPorts: {
		karma: 9876,
		nodeInspector: 1337,
		debug: 5858
	},


	/**
	 * Logging Settings
	 */

	// Bunyan settings
	bunyan: {
		// Sets the console level, defaults to environment variable if present
		consoleLevel: process.env.BUNYAN_LEVEL || 'info'
	},

	// Application logging and logstash
	log: {
		application: {
			file: '/usr/local/var/log/lambda-ui/application.log',
			logstash: {
				host: 'localhost',
				port: 4561
			}
		},
		audit: {
			file: '/usr/local/var/log/lambda-ui/audit.log',
			logstash: {
				host: 'localhost',
				port: 4562
			}
		}
	},


	/**
	 * Not So Environment-Specific Settings
	 */

	// The port to use for the application (defaults to the environment variable if present)
	port: process.env.PORT || 3000,

	// Template engine to use for rendering sever-side templates
	templateEngine: 'swig',

	// SocketIO Settings
	socketio: {
		ignoreOlderThan: 600
	},

	// CSV Export Settings
	csv: {
		delayMs: 0
	},

	/*
	 * The maximum number of records allowed to be scanned by a mongo query
	 */
	maxScan: 30000,

	/*
	 * The maximum number of records allowed to be exported to csv
	 */
	maxExport: 1000

};