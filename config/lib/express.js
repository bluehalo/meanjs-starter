'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	config = require(path.resolve('./config/config.js')),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),
	multer = require('multer'),
	favicon = require('serve-favicon'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	flash = require('connect-flash'),
	consolidate = require('consolidate'),
	path = require('path'),
	logger = require('./bunyan').logger,
	staticAsset = require('static-asset');

/**
 * Initialize local variables
 */
function initLocalVariables(app) {
	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.googleAnalyticsTrackingID = config.app.googleAnalyticsTrackingID;
	app.locals.jsFiles = config.files.client.js;
	app.locals.cssFiles = config.files.client.css;

	app.locals.liveReload = (config.liveReload != null && config.liveReload.enabled);
	app.locals.liveReloadPort = (config.liveReload != null) ? config.liveReload.port : undefined;

	// Passing the request url to environment locals
	app.use(function (req, res, next) {
		res.locals.host = req.protocol + '://' + req.hostname;
		res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
		next();
	});
}

/**
 * Initialize application middleware
 */
function initMiddleware(app) {
	// Showing stack errors
	app.set('showStackError', true);

	// Enable jsonp
	app.enable('jsonp callback');

	// Should be placed before express.static
	app.use(compress({
		filter: function (req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	// Initialize favicon middleware
	app.use(favicon('./app/core/client/img/brand/favicon.ico'));

	// Environment dependent middleware
	if (config.assets === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));

		// Disable views cache
		app.set('view cache', false);
	} else if (config.assets === 'production') {
		app.locals.cache = 'memory';
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// Add the cookie parser and flash middleware
	app.use(cookieParser(config.auth.sessionSecret));
	app.use(flash());

}

/**
 * Configure view engine
 */
function initViewEngine(app) {
	// Set swig as the template engine
	app.engine('server.view.html', consolidate[config.templateEngine]);

	// Set views path and view engine
	app.set('view engine', 'server.view.html');
	app.set('views', './app/core/server/views');
}

/**
 * Configure Express session
 */
function initSession(app, db) {
	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.auth.sessionSecret,
		cookie: config.auth.sessionCookie,
		store: new MongoStore({
			db: db.connection.db,
			collection: config.auth.sessionCollection
		})
	}));
}

/**
 * Configure passport
 */
function initPassport(app) {
	app.use(passport.initialize());
	app.use(passport.session());

	require(path.resolve('./config/lib/passport.js')).init();
}

/**
 * Invoke modules server configuration
 */
function initModulesConfiguration(app, db) {
	config.files.server.configs.forEach(function (configPath) {
		require(path.resolve(configPath))(app, db);
	});
}

/**
 * Configure Helmet headers configuration
 */
function initHelmetHeaders(app) {
	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');
}

/**
 * Configure the static asset library
 */
function initStaticAsset(app) {
	app.use('/', staticAsset(path.resolve('./public/')));
}

/**
 * Configure the modules static routes
 */
function initModulesClientRoutes(app) {
	/*
	 * Exposing the public directory (contains lib and min static resources)
	 * All of the files in here are cache-busted, so we are setting max age high
	 */
	app.use('/', express.static(path.resolve('./public'), { maxAge: 31536000000 }));

	/*
	 * Exposing the module static resources (js and html)
	 * These files are not cache-busted, so we are setting the cache time to 0
	 */
	config.folders.client.forEach(function (staticPath) {
		app.use(staticPath.replace('/client', ''), express.static(path.resolve('./' + staticPath), { maxAge: 0 }));
	});
}

/**
 * Configure the modules ACL policies
 */
function initModulesServerPolicies(app) {
	// Globbing policy files
	config.files.server.policies.forEach(function (policyPath) {
		require(path.resolve(policyPath)).invokeRolesPolicies();
	});
}

/**
 * Configure the modules server routes
 */
function initModulesServerRoutes(app) {
	// Globbing routing files
	config.files.server.routes.forEach(function (routePath) {
		require(path.resolve(routePath))(app);
	});
}

/**
 * Configure the modules sockets by simply including the files.
 * Do not instantiate the modules.
 */
function initModulesServerSockets(app) {
	// Globbing socket files
	config.files.server.sockets.forEach(function (socketPath) {
		require(path.resolve(socketPath));
	});
}

/**
 * Configure error handling
 */
function initErrorRoutes(app) {
	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function (err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// send server error
		res.status(500).json({ status: 500, type: 'server-error', message: 'Unexpected server error' });
	});

	// Assume 404 since no middleware responded
	app.use(function (req, res) {
		// Send 404 with error message
		res.status(404).json({ status: 404, type: 'not-found', message: 'The resource was not found' });
	});
}

/**
 * Configure Socket.io
 */
function configureSocketIO(app, db) {
	// Load the Socket.io configuration
	var server = require('./socket.io')(app, db);

	// Return server object
	return server;
}

/**
 * Initialize the Express application
 */
module.exports.init = function (db) {

	// Initialize express app
	logger.info('Initializing Express');
	var app = express();

	// Initialize local variables
	initLocalVariables(app);

	// Initialize Express middleware
	initMiddleware(app);

	// Initialize Express view engine
	initViewEngine(app);

	// Initialize static asset manager
	initStaticAsset(app);

	// Initialize modules static client routes
	initModulesClientRoutes(app);

	// Initialize Express session
	initSession(app, db);

	// Initialize passport auth
	initPassport(app);

	// Initialize Modules configuration
	initModulesConfiguration(app);

	// Initialize Helmet security headers
	initHelmetHeaders(app);

	// Initialize modules server authorization policies
	initModulesServerPolicies(app);

	// Initialize modules server routes
	initModulesServerRoutes(app);

	// Initialize modules sockets
	initModulesServerSockets(app);

	// Initialize error routes
	initErrorRoutes(app);

	// Configure Socket.io
	app = configureSocketIO(app, db);

	return app;
};