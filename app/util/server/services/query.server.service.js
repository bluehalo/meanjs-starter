'use strict';

var mongoose = require('mongoose'),
	q = require('q');

function escapeRegex(str) {
	return (str+'').replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
}

function generateFind(query) {
	var find;

	// If the query is non-null, add the query terms
	if(null != query){
		find = find || {};
		for(var k in query){
			find[k] = query[k];
		}
	}

	return find;
}

function generateSort(sortArr) {
	var sort = {};

	// If the sort is non-null, extract the sort instructions
	if(null != sortArr){
		sortArr.forEach(function(d){
			sort[d.property] = (d.direction === 'ASC')? 1 : -1;
		});
	}

	return sort;
}

function pagingQuery(schema, find, projection, options, sort, limit, offset) {

	// Build the query
	var baseQuery = schema.find(find);
	var findQuery = schema.find(find, projection, options).sort(sort).skip(offset).limit(limit);

	// Build the promise response
	var countDefer = q.defer();
	baseQuery.count(function(error, results){
		if(null != error){
			countDefer.reject(error);
		} else {
			countDefer.resolve(results);
		}
	});
	var queryDefer = q.defer();
	findQuery.exec(function(error, results){
		if(null != error){
			queryDefer.reject(error);
		} else {
			queryDefer.resolve(results);
		}
	});

	var returnDefer = q.defer();
	q.all([countDefer.promise, queryDefer.promise]).then(function(results){
		returnDefer.resolve({ count: results[0], results: results[1] });
	}, function(error){
		returnDefer.reject(error);
	});

	return returnDefer.promise;
}

// Generic contains regex search
module.exports.containsQuery = function(schema, query, fields, search, limit, offset, sortArr) {
	// Initialize find to null
	var find = generateFind(query);
	var projection = {};
	var options = {};
	var sort = generateSort(sortArr);

	// Build the find
	if(null != search && '' !== search) {
		find = find || {};

		if(null != fields && fields.length > 1) {
			find.$or = [];

			fields.forEach(function(element){
				var constraint = {};
				constraint[element] = { $regex: new RegExp(escapeRegex(search), 'gim') };

				find.$or.push(constraint);
			});
		}
	}

	return pagingQuery(schema, find, projection, options, sort, limit, offset);
};

// Generic Full text search
module.exports.search = function(schema, query, searchTerms, limit, offset, sortArr) {
	// Initialize find to null
	var find = generateFind(query);
	var projection;
	var options = {};
	var sort = generateSort(sortArr);


	// If the searchTerms is non-null, then build the text search
	if(null != searchTerms && '' !== searchTerms){
		find = find || {};
		find.$text = { $search: searchTerms };

		projection = projection || {};
		projection.score = { $meta: 'textScore' };

		// Sort by textScore last if there is a searchTerms
		sort.score = { $meta: 'textScore' };
	}

	return pagingQuery(schema, find, projection, options, sort, limit, offset);
};


