'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
	Mocha = require('mocha'),
	mongoose = require('./config/lib/mongoose');

console.info('Starting initialization of tests');

// Initialize mongoose
mongoose.connect().then(function (db) {
	console.info('Mongoose connected, proceeding with tests');

	process.on('exit', function () {
		mongoose.disconnect();
	});

	var mocha = new Mocha({
		reporter: 'spec'
	});


	config.files.server.tests.forEach(function(file) {
		mocha.addFile(file);
	});

	try {
		// Run the tests.
		mocha.run(function(failures) {
			process.exit();
		});
	} catch(ex) {
		console.error('Tests Crashed');
		console.error(ex.stack);
		process.exit();
	}

}, function(err) {
	console.error('Mongoose initialization failed, tests failed.');
}).done();