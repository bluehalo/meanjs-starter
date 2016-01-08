'use strict';

/*
 * Module dependencies.
 */
var _ = require('lodash'),
	glob = require('glob'),
	path = require('path'),
	runSequence = require('run-sequence'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	plugins = gulpLoadPlugins(),

	pkg = require('./package.json'),
	defaultAssets = require('./config/assets/default'),
	testAssets = require('./config/assets/test');

/*
 * Helper Variables
 */

// Banner for the top of generated artifacts
var banner = '/*! ' + pkg.name + ' Version: ' + pkg.version + ' Copyright Asymmetrik, Ltd. 2015 - All Rights Reserved.*/\n';


/*
 * Helper Tasks
 */


// Set NODE_ENV to 'test'
gulp.task('env:test', function (done) {
	process.env.NODE_ENV = 'test';
	done();
});



/*
 * Running/Monitoring/Watching Tasks
 */

// Nodemon task
gulp.task('nodemon', function () {
	var config = require('./config/config');

	var nodeArgs = ['--debug=' + config.devPorts.debug];
	if(plugins.util.env.debugBrk) {
		nodeArgs.push('--debug-brk');
	}

	plugins.nodemon({
		script: 'server.js',
		nodeArgs: nodeArgs,
		ext: 'js,html',
		watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
	});
});

// Nodemon test task
gulp.task('nodemon-test-server', function () {
	var config = require('./config/config');

	var nodeArgs = ['--debug=' + config.devPorts.debug];
	if(plugins.util.env.debugBrk) {
		nodeArgs.push('--debug-brk');
	}

	plugins.nodemon({
		script: 'test-server.js',
		nodeArgs: nodeArgs,
		ext: 'js',
		env: { 'NODE_ENV': 'test' },
		watch: _.union(testAssets.tests.server, defaultAssets.server.allJS, defaultAssets.server.config)
	});
});

gulp.task('nodemon-test-client', function () {
	var config = require('./config/config');

	var nodeArgs = ['--debug=' + config.devPorts.debug];
	if(plugins.util.env.debugBrk) {
		nodeArgs.push('--debug-brk');
	}

	plugins.nodemon({
		script: 'test-client.js',
		nodeArgs: nodeArgs,
		ext: 'js',
		env: { 'NODE_ENV': 'test' },
		watch: _.union(testAssets.tests.client, defaultAssets.client.lib.js, defaultAssets.client.lib.tests, defaultAssets.client.js)
	});
});


// Node Inspector, runs the debug inspector
gulp.task('nodeInspector', function() {
	var config = require('./config/config');

	gulp.src([]).pipe(plugins.nodeInspector({
		debugPort: config.devPorts.debug,
		webHost: '0.0.0.0',
		webPort: config.devPorts.nodeInspector,
		saveLiveEdit: false,
		preload: !!(plugins.util.env.debugBrk),
		hidden: [ new RegExp('node_modules') ],
		stackTraceLimit: 50
	}));
});


//Watch Files For Changes and reloads node when changes happen
gulp.task('test-watch', function() {
	// Add watch rules
	gulp.watch(_.union(defaultAssets.server.allJS, testAssets.tests.server), ['jshint']);
	gulp.watch(_.union(testAssets.tests.client, defaultAssets.client.lib.js, defaultAssets.client.lib.tests, defaultAssets.client.js), ['jshint']);
});


// Watch Files For Changes and reloads node when changes happen
gulp.task('watch', function() {
	var config = require('./config/config');

	// Start livereload
	plugins.livereload.listen(config.devPorts.liveReload);

	// Add watch rules
	gulp.watch(defaultAssets.server.views).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.server.allJS, ['jshint']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.views).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.js, ['jshint']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.css, ['csslint']).on('change', plugins.livereload.changed);
});


/*
 * Linting and Minifying
 */

//Lint CSS and JavaScript files.
gulp.task('lint', function(done) {
	runSequence(['csslint', 'jshint'], done);
});

// CSS linting task
gulp.task('csslint', function (done) {
	return gulp.src(defaultAssets.client.css)
		.pipe(plugins.csslint('.csslintrc'))
		.pipe(plugins.csslint.reporter())
		.pipe(plugins.csslint.reporter(function (file) {
			if (!file.csslint.errorCount) {
				done();
			}
		}))
		.on('error', plugins.util.log);
});

// JS linting task
gulp.task('jshint', function () {
	return gulp.src(_.union(defaultAssets.server.allJS, defaultAssets.client.js, testAssets.tests.server, testAssets.tests.client, testAssets.tests.e2e))
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('jshint-stylish'))
		.on('error', plugins.util.log);
});

// JS minifying task
gulp.task('uglify', function () {
	var jsFiles = [];
	defaultAssets.client.js.forEach(function(f) {
		jsFiles = jsFiles.concat(glob.sync(f).sort());
	});

	return gulp.src(jsFiles)
		.pipe(plugins.ngAnnotate())
		.pipe(plugins.uglify({
			mangle: false
		}))
		.pipe(plugins.concat('application.min.js'))
		.pipe(plugins.insert.prepend(banner))
		.pipe(gulp.dest('public/dist'))
		.on('error', plugins.util.log);
});

// CSS minifying task
gulp.task('cssmin', function () {
	return gulp.src(defaultAssets.client.css)
		.pipe(plugins.cssmin())
		.pipe(plugins.sort())
		.pipe(plugins.concat('application.min.css'))
		.pipe(gulp.dest('public/dist'))
		.on('error', plugins.util.log);
});


/*
 * Testing Tasks
 */

/**
 * Mocha tests for local environment (omits the log reporter and coverage report)
 */
gulp.task('mocha', ['env:test'], function (done) {
	var sequence = ['nodemon-test-server'];

	// Only load nodeInspector if we're trying to debug tests
	if(plugins.util.env.debugBrk) {
		sequence.push('nodeInspector');
	}

	runSequence(sequence, done);
});

/**
 * Mocha tests task for continuous integration.
 * This task uses the coverage instrumentation and also uses the file reporters.
 */
gulp.task('mocha-ci', ['env:test'], function (done) {
	// Open mongoose connections
	var mongoose = require('./config/lib/mongoose.js');

	var error;
	mongoose.connect().then(function() {
		gulp.src(testAssets.tests.server)
			.pipe(plugins.coverage.instrument({
				pattern: ['app/*/server/**/*server*.js'],
				debugDirectory: 'reports/debug'
			}))
			.pipe(plugins.mocha({
				reporter: 'mocha-jenkins-reporter',
				reporterOptions: {
					"junit_report_name": "Wildfire Mocha Tests",
					"junit_report_path": "reports/mocha-tests.xml",
					"junit_report_stack": 1
				}
			}))
			.pipe(plugins.coverage.gather())
			.pipe(plugins.coverage.format({ reporter: 'json', outFile: 'mocha-coverage.json' }))
			.pipe(plugins.coverage.format({ reporter: 'html', outFile: 'mocha-coverage.html' }))
			.on('error', function (err) {
				error = err;
			})
			.on('end', function() {
				mongoose.disconnect().then(function() {
					done(error);
				}).done();
			})
			.pipe(gulp.dest('reports'));
	});
});

//Karma test runner task
gulp.task('karma', ['env:test'], function (done) {
	var Server = require('karma').Server;

	new Server({
		configFile: __dirname + '/karma.conf.js'
	}, function(exitStatus) { 
		done(exitStatus); 
	}).start();
});

//Karma test runner task for continuous integration
gulp.task('karma-ci', ['env:test'], function (done) {
	var Server = require('karma').Server;

	new Server({
		configFile: __dirname + '/karma-ci.conf.js'
	}, function(exitStatus) { 
		done(exitStatus); 
	}).start();
});


/*
 * Main Tasks - These are the only tasks you should ever run directly
 */


/**
 * Validate and generate artifacts, but do not run tests or run the app
 */
gulp.task('build', function(done) {
	runSequence('lint', ['uglify', 'cssmin'], done);
});

/**
 * Build and run the project with the debugger enabled and node inspector started.
 * Also runs watch to reload the app on changes to files.
 * 
 * --debugBrk: break on first line. Running in this mode, node inspector might take 
 *   about 10-15 seconds to initially load.
 */
gulp.task('debug', function(done) {
	runSequence('build', ['nodemon', 'watch', 'nodeInspector'], done);
});

/**
 * Run the project tests for continuous integration.
 * This task calls the mocha task that includes test coverage and report output for tests
 */
gulp.task('test', ['env:test'], function(done) {
	runSequence('build', 'mocha-ci', 'karma-ci', function(err) { process.exit(); });
});

/**
 * Run the server tests in local mode. This uses a console-only reporter and skips code coverage.
 * 
 *  --debugBrk: debug tests
 *   This will launch the tests with the break on the first line option. Also,
 *   it will launch node inspector with the preload=true option. Running in this mode,
 *   node inspector might take about 10-15 seconds to initially load.
 */
gulp.task('test-server-local', ['env:test'], function(done) {
	runSequence('build', ['mocha', 'test-watch'], done);
});

/**
 * Run the karma tests in local mode
 */
gulp.task('test-client-local', ['env:test'], function(done) {
	runSequence('build', ['karma', 'test-watch'], done);
});


gulp.task('default', function(done) {
	runSequence('debug', done);
});