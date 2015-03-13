'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	runSequence = require('run-sequence'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	plugins = gulpLoadPlugins(),
	karma = require('karma').server,

	pkg = require('./package.json'),
	defaultAssets = require('./config/assets/default'),
	testAssets = require('./config/assets/test');

var config = {};
var banner = '/*! ' + pkg.name + ' Version: ' + pkg.version + ' Copyright Asymmetrik, Ltd. 2015 - All Rights Reserved.*/\n';

// Set NODE_ENV to 'test'
gulp.task('env:test', function (done) {
	process.env.NODE_ENV = 'test';
	done();
});

// Nodemon task
gulp.task('nodemon', function () {
	plugins.nodemon({
		script: 'server.js',
		nodeArgs: ['--debug=' + config.devPorts.debug],
		ext: 'js,html',
		watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
	});
});

// Node Inspector
gulp.task('nodeInspector', function() {
	gulp.src([ 'server.js' ]).pipe(plugins.nodeInspector({
		debugPort: config.devPorts.debug,
		webHost: '0.0.0.0',
		webPort: config.devPorts.nodeInspector,
		saveLiveEdit: false,
		preload: false,
		hidden: [ new RegExp('node_modules') ],
		stackTraceLimit: 50
	}));
});


// Watch Files For Changes
gulp.task('watch', function() {
	// Start livereload
	plugins.livereload.listen(config.devPorts.liveReload);

	// Add watch rules
	gulp.watch(defaultAssets.server.views).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.server.allJS, ['jshint']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.views).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.js, ['jshint']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.css, ['csslint']).on('change', plugins.livereload.changed);
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
	return gulp.src(defaultAssets.client.js)
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
		.pipe(plugins.concat('application.min.css'))
		.pipe(gulp.dest('public/dist'))
		.on('error', plugins.util.log);
});


// Mocha tests task
gulp.task('mocha', function (done) {
	// Open mongoose connections
	var mongoose = require('./config/lib/mongoose.js');

	var error;
	mongoose.connect(function() {
		gulp.src(testAssets.tests.server)
			.pipe(plugins.mocha({
				reporter: 'spec'
			}))
			.on('error', function (err) {
				error = err;
			})
			.on('end', function() {
				mongoose.disconnect(function() {
					done(error);
				});
			});
	});

});

// Karma test runner task
gulp.task('karma', function (done) {
	karma.start({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, function(exitStatus) { 
		done(exitStatus); 
	});
});


// Lint CSS and JavaScript files.
gulp.task('lint', function(done) {
	runSequence(['csslint', 'jshint'], done);
});

// Lint project files and minify them into two production files.
gulp.task('build', function(done) {
	runSequence('lint', ['uglify', 'cssmin'], done);
});

// Load the config given the node environment
gulp.task('config', function(done) {
	config = require('./config/config');
	done();
});

/*
 * These are the main targets of the build
 */

// Run the project tests
gulp.task('test', function(done) {
	runSequence('env:test', 'lint', 'mocha', done);
});

// Run the project in development mode
gulp.task('default', function(done) {
	runSequence('debug', done);
});

// Run the project in debug mode (you still need to manually set NODE_ENV)
gulp.task('debug', function(done) {
	runSequence('config', 'lint', ['nodemon', 'watch', 'nodeInspector'], done);
});

// Run the project in production mode (you still need to manually set NODE_ENV)
gulp.task('prod', function(done) {
	runSequence('config', 'lint', 'build', ['nodemon', 'watch'], done);
});

