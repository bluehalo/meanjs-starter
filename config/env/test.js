'use strict';

module.exports = {
	assets: 'test',

	db: {
		admin: 'mongodb://localhost/wildfire-test',
		data: 'mongodb://localhost/wildfire-test',
		locations: 'mongodb://localhost/wildfire-test'
	},

	port: 3001,

	/**
	 * Logging Settings
	 */

	// Bunyan settings
	bunyan: {
		// Sets the console level, defaults to environment variable if present
		consoleLevel: 'warn'
	},


	metrics: {
		'volume': {
			label: 'Overall Volume',
			position: -1
		},
		'sentimentPositive': {
			label: 'Positive Sentiment',
			position: 1
		},
		'sentimentNegative': {
			label: 'Negative Sentiment',
			position: 0
		}
	}
};