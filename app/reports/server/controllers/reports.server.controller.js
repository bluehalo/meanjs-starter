'use strict';

var mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	stomp = deps.stomp,
	logger = deps.logger,
	auditLogger = deps.auditLogger,
	util = deps.utilService,

	groups = require(path.resolve('./app/groups/server/controllers/groups.server.controller.js')),

	Report = mongoose.model('Report'),
	User = mongoose.model('User');


function copyMutableFields(dest, src) {
	dest.title = src.title;
	dest.description = src.description;
	dest.group = src.group;
}

//Given a report save to mongo
function save(report, res, audit) {
	report.save(function(err) {
		util.catchError(res, err, function() {
			res.json(report);
			audit();
		});
	});
}


// Create
exports.create = function(req, res) {
	var report = new Report(req.body);
	report.creator = req.user;
	report.created = Date.now();
	report.updated = Date.now();
	report.creatorName = req.user.name;

	save(report, res, function() {
		// Audit creation of report
		auditLogger.audit('report created', 'report', 'create',
			User.auditCopy(req.user),
			{ report: Report.auditCopy(report) });
	});
};


// Read
exports.read = function(req, res) {
	res.json(req.report);

	// Audit report view
	auditLogger.audit('report viewed', 'report', 'view', 
		User.auditCopy(req.user),
		{ report: Report.auditCopy(req.report) });
};

// Update
exports.update = function(req, res) {
	// Retrieve the report from persistence
	var report = req.report;

	// Make a copy of the original report for a "before" snapshot
	var originalReport = Report.auditCopy(report);

	// Update the updated date
	report.updated = Date.now();

	// Copy in the fields that can be changed by the user
	copyMutableFields(report, req.body);

	// Save
	save(report, res, function() {
		// Audit the save action
		auditLogger.audit('report updated', 'report', 'update',
			User.auditCopy(req.user),
			{ before: originalReport, after: Report.auditCopy(report) });
	});
};

// Delete
exports.delete = function(req, res) {
	var report = req.report;

	report.remove(function(err) {
		util.catchError(res, err, function() {
			res.json(report);
		});
	});

	// Audit the report delete attempt
	auditLogger.audit('report deleted', 'report', 'delete',
		User.auditCopy(req.user),
		{ report: Report.auditCopy(req.report) });
};

// Search - with paging and sorting
exports.search = function(req, res) {
	var query = req.body.q;
	var search = req.body.s;

	var page = req.query.page;
	var size = req.query.size;
	var sort = req.query.sort;
	var dir = req.query.dir;

	// Limit has to be at least 1 and no more than 100
	if(null == size){ size = 20; }
	size = Math.max(1, Math.min(100, size));

	// Page needs to be positive and has no upper bound
	if(null == page){ page = 0; }
	page = Math.max(0, page);

	// Sort can be null, but if it's non-null, dir defaults to DESC
	if(null != sort && dir == null){ dir = 'ASC'; }

	// Create the variables to the search call
	var limit = size;
	var offset = page*size;
	var sortArr;
	if(null != sort){
		sortArr = [{ property: sort, direction: dir }];
	}

	Report.search(query, search, limit, offset, sortArr).then(function(result){
		// success
		var toReturn = {
			totalSize: result.count,
			pageNumber: page,
			pageSize: size,
			totalPages: Math.ceil(result.count/size),
			elements: result.results
		};

		// Serialize the response
		res.jsonp(toReturn);
	}, function(error){
		// failure
		logger.error({err: error, req: req}, 'Error searching for reports');
		return util.send400Error(res, error);
	});
};

/**
 * Report middleware
 */
exports.reportById = function(req, res, next, id) {
	Report.findOne({ _id: id }).populate('creator', 'name').exec(function(err, report) {
		if (err) return next(err);
		if (!report) return next(new Error('Failed to load report ' + id));
		req.report = report;
		next();
	});
};

/**
 * Report authorization middleware
 */
exports.hasViewAuthorization = function(req, res, next) {
	if (!groups.hasGroup(req.report.group, req.user)) {
		return util.send403Error(res);
	}

	next();
};

exports.hasEditAuthorization = function(req, res, next) {
	var group;
	if (null != req.report && null != req.report.group) {
		group = req.report.group.id;
	} else if (null != req.body && null != req.body.group) {
		group = req.body.group;
	}

	if (!groups.hasGroupEdit(group, req.user)) {
		return util.send403Error(res);
	}

	next();
};
