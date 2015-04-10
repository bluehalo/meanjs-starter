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
	ReportInstance = mongoose.model('ReportInstance'),
	ProfileMetadata = mongoose.model('ProfileMetadata'),

	User = mongoose.model('User');


function copyMutableFields(dest, src) {
	dest.title = src.title;
	dest.description = src.description;
	dest.group = src.group;
	dest.criteriaUsers = src.criteriaUsers;
	dest.period = src.period;
}


function save(report, res) {
	var defer = q.defer();

	report.save(function(err) {
		util.catchError(res, err, function() {
			res.json(report);
			defer.resolve();
		});
	});

	return defer.promise;
}


// Create
exports.create = function(req, res) {
	var report = new Report(req.body);

	report.creator = req.user;
	report.created = Date.now();
	report.updated = Date.now();

	save(report, res).then(function() {
		// Audit creation of report
		auditLogger.audit('report created', 'report', 'create',
			User.auditCopy(req.user),
			{ report: Report.auditCopy(report) });
	});
};


// Read
exports.read = function(req, res) {
	res.json(req.report);
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
	save(report, res).then(function() {
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

exports.run = function(req, res) {
	// Update the nextRun property to now
	var report = req.report;
	report.state.nextRun = Date.now();

	// Save the report
	report.save(function(err, result) {
		util.catchError(res, err, function(){
			res.jsonp(report);
		});
	});
};

exports.setActive = function(req, res) {
	// Retrieve the report from persistence
	var report = req.report;

	// Copy in the fields that can be changed by the user
	Report.update({ _id: report._id }, { $set: { active: req.query.active} }, function(err) {
		util.catchError(res, err, function() {
			res.json(report);
		});
	});
};


exports.userActivity = function(req, res) {
	var report = req.report;

	// for the report, query the last two report instances for the user
	var findQuery = ReportInstance.find({ report: report._id, success: true }).sort({ completed: -1 }).limit(2);
	findQuery.exec(function(err, results){
		var reportInstances = results;

		util.catchError(res, err, function() {
			// Build an array of the reportInstance id's
			var ids = results.map(function(reportInstance) { return reportInstance._id; });

			// Now query for all of the profile metadata
			ProfileMetadata.find({ reportInstance: { $in: ids }}, function(err, results) {
				// Wrap the results up into a response
				var response = {
					report: report,
					reportInstances: reportInstances,
					profileMetadata: results
				};
				res.jsonp(response);
			});

		});
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
