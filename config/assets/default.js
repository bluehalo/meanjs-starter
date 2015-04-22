'use strict';

module.exports = {
	client: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/fontawesome/css/font-awesome.css',
				'public/lib/textAngular/src/textAngular.css',
				'public/lib/nvd3/build/nv.d3.css'
			],
			js: [
				'public/lib/moment/moment.js',

				'public/lib/d3/d3.js',
				'public/lib/nvd3/build/nv.d3.js',

				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',

				'public/lib/angular-nvd3/dist/angular-nvd3.js',

				'public/lib/rangy/rangy-core.js',
				'public/lib/rangy/rangy-selectionsaverestore.js',
				'public/lib/textAngular/src/textAngular-sanitize.js',
				'public/lib/textAngular/src/textAngularSetup.js',
				'public/lib/textAngular/src/textAngular.js'

			],
			tests: [ 'public/lib/angular-mocks/angular-mocks.js' ]
		},
		css: [
			'app/*/client/css/*.css'
			],
		js: [
			// Standard initial includes
			'app/core/client/app/config.js',
			'app/core/client/app/init.js',

			'app/*/client/*.js',
			'app/*/client/**/*.js'
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