'use strict';

module.exports = {
	client: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/font-awesome/css/font-awesome.css',
				'public/lib/leaflet/dist/leaflet.css',
				'public/lib/leaflet.draw/dist/leaflet.draw.css',
				'public/lib/sentio-js/dist/sentio.css',
				'public/lib/textAngular/src/textAngular.css',
				'public/lib/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
				'public/lib/angular-loading-bar/build/loading-bar.css',

				'public/lib/jquery-emoji-picker/css/jquery.emojipicker.css',
				'public/lib/jquery-emoji-picker/css/jquery.emojipicker.tw.css'
			],
			js: [
				// angular is now included via npm TODO: investigate better way to get angular2 modules loaded
				'node_modules/es6-shim/es6-shim.min.js',
				'node_modules/systemjs/dist/system-polyfills.js',
				'node_modules/angular2/es6/dev/src/testing/shims_for_IE.js',

				'node_modules/angular2/bundles/angular2-polyfills.js',
				'node_modules/systemjs/dist/system.src.js',
				'node_modules/rxjs/bundles/Rx.js',
				'node_modules/angular2/bundles/angular2.dev.js',
				'node_modules/angular2/bundles/router.js',
				'node_modules/angular2/bundles/http.js',

				'public/lib/lodash/lodash.js',
				'public/lib/moment/moment.js',
				'public/lib/socket.io-client/socket.io.js',
				'public/lib/jquery/dist/jquery.js',

				'public/lib/d3/d3.js',
				'public/lib/d3-plugins/hexbin/hexbin.js',

				'public/lib/leaflet/dist/leaflet-src.js',
				'public/lib/leaflet.draw/dist/leaflet.draw-src.js',
				'public/lib/leaflet-d3/dist/leaflet-d3.js',

				// 'public/lib/angular-socket-io/socket.js',
				// 'public/lib/angular-moment/angular-moment.js',

				'public/lib/rangy/rangy-core.js',
				'public/lib/rangy/rangy-selectionsaverestore.js',
				// 'public/lib/textAngular/src/textAngular-sanitize.js',
				// 'public/lib/textAngular/src/textAngularSetup.js',
				// 'public/lib/textAngular/src/textAngular.js',

				// 'public/lib/angular-leaflet-directive/dist/angular-leaflet-directive.js',
				// 'public/lib/angular-leaflet-directive-ext/dist/angular-leaflet-directive-ext.d3.js',
				'public/lib/Leaflet.awesome-markers/dist/leaflet.awesome-markers.js',

				'public/lib/sentio-js/dist/sentio.js',
				// 'public/lib/sentio-js/dist/sentio-angular.js',

				'public/lib/twemoji/twemoji.js',
				'public/lib/jquery-emoji-picker/js/jquery.emojipicker.js',
				'public/lib/jquery-emoji-picker/js/jquery.emojipicker.tw.js',
				'public/lib/string-format/string-format.js',
				// 'public/lib/angular-loading-bar/build/loading-bar.js',
				// 'public/lib/ngDraggable/ngDraggable.js'

			],
			tests: [ 'public/lib/angular-mocks/angular-mocks.js' ]
		},
		ts: ['app/**/*.ts'],
		css: [
			'app/*/client/css/*.css'
			],
		js: [
			// Standard initial includes
			'tsc/core/main.js',

			'tsc/*/client/*.js',
			'tsc/*/client/**/*.js'
		],
		views: ['app/*/client/views/**/*.html']
	},
	server: {
		allJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/*/server/**/*.js'],
		models: 'app/*/server/models/**/*.js',
		routes: ['app/!(core)/server/routes/**/*.js', 'app/core/server/routes/**/*.js'],
		sockets: 'app/*/server/sockets/**/*.js',
		config: 'app/*/server/config/*.js',
		policies: 'app/*/server/policies/*.js',
		views: 'app/*/server/views/*.html'
	}
};