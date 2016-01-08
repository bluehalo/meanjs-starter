'use strict';

angular.module('asymmetrik.util')
	.directive('wfBooleanQuery', function($log) {
		return {
			restrict: 'A',
			templateUrl: 'app/util/views/boolean-query.client.view.html',
			scope: {
				'queryJson': '=wfBooleanQuery',
				'readonly': '=wfReadonly',
				'placeholder': '=wfPlaceholder',
				'prefixQueryJson': '=?wfPrefixQuery',
				'suffixQueryJson': '=?wfSuffixQuery'
			},
			/**
			 * Default values if not provided in the element
			 */
			compile: function(element, attrs){
				if (typeof attrs.wfReadonly === 'undefined') {
					attrs.wfReadonly = 'false';
				}
				if (typeof attrs.wfBooleanQuery === 'undefined') {
					attrs.wfBooleanQuery = '{}';
				}
				if (typeof attrs.wfPlaceholder === 'undefined') {
					attrs.wfPlaceholder = '"Enter term criteria..."';
				}
			},
			controller: ['$scope', '$filter', function($scope, $filter) {
				
				$scope.queryDisplay = '';
				
				if(typeof $scope.readonly === 'undefined') {
					$scope.readonly = false;
				}
				
				/**
				 * Based on whether a word has a negative indicator,
				 * return either the word or the negative JSON for the word
				 */
				var getWordOrNotWord = function(w) {
					if(typeof w === 'string' && w.length > 1 && w.charAt(0) === '-') {
						return { 'not': w.slice(1) };
					}
					
					return w;
				};
				
				/**
				 * Builds the query JSON from the input string
				 * in order to pass a parseable, interpretted 
				 */
				var getQueryJson = function(queryString) {
					if (queryString.length === 0)
						return null;

					var words = [];
					var word = '', inPhrase = false;
					for(var i=0; i < queryString.length; i++) {
						var c = queryString[i];
						if(c === ' ' && !inPhrase) {
							if(word.length > 0) {
								words.push(word);
								word = '';
							}
						}
						// open the phrase
						else if(c === '"' && !inPhrase) {
							inPhrase = true;
						}
						// close the phrase
						else if(c === '"' && inPhrase) {
							if(word.length > 0) {
								words.push(word);
								word = '';
							}
							inPhrase = false;
						}
						else {
							word += c;
						}
						
						// push any remaining in the word buffer if at the end
						if(i === queryString.length - 1 && word.length > 0) {
							words.push(word);
						}
					}
					
					// build the words into a JSON object with OR keyword handling
					var ands = [];
					var ors = [];
					wordLoop: for(var j=0; j < words.length; j++) {
						var w = words[j];
						var next = (j === words.length - 1) ? '' : words[j + 1];
						if(next.toUpperCase() === 'OR') {
							ors.push(getWordOrNotWord(w));
							j = j + 1; // fast-forward to next word
							continue wordLoop;
						}
						
						if( ors.length > 0 ) {
							ors.push(getWordOrNotWord(w));
							ands.push({ 'or': ors });
							ors = [];
						}
						else {
							ands.push(getWordOrNotWord(w));
						}
					}
					
					// final buffer push from the 'ors' object
					if(ors.length === 1) {
						ands.push(ors[0]);
					}
					else if(ors.length > 1) {
						ands.push({ 'or': ors });
					}
					
					return {
						'and': ands
					};
					
				};
				
				var setByStringUpdate = false, setByJsonUpdate = false;
				/**
				 * whenever the queryString is updated, parse the query json
				 * from the string in order to properly format it for persistence
				 */
				var handleQueryStringUpdate = function(newVal, oldVal) {
					if(newVal === oldVal || setByJsonUpdate) {
						setByJsonUpdate = false;
						return; // do nothing on no change
					}
					
					var q = $scope.queryString;
					
					// set without calling 
					setByStringUpdate = true;
					$scope.queryJson = getQueryJson(q);
				};
				
				$scope.$watch('queryString', handleQueryStringUpdate);
				
				$scope.$watch('queryJson', function(newValue, oldValue) {
					// do not update if set by string
					if(setByStringUpdate) {
						setByStringUpdate = false; // clear the flag
						return;
					}
					
					var getQueryString = function(queryJson) {
						if (null == queryJson) {
							return '';
						}
						else if(typeof queryJson === 'string') {
							/*
							 * if the string has a space in it,
							 * it is a phrase and should be surrounded
							 * with double quotes
							 */
							if(queryJson.indexOf(' ') !== -1) {
								return '"' + queryJson + '"'; 
							}
							// if no space, return the word itself
							return queryJson;
						}
						else if(typeof queryJson === 'object') {
							
							// initial values to be populated by specific query type
							var subQueryValue = [], joinValue = '';
							
							if(Array.isArray(queryJson)) {
								return queryJson.map(getQueryString);
							}
							else if(queryJson.hasOwnProperty('and')) {
								joinValue = ' ';
								subQueryValue = getQueryString(queryJson.and);
							}
							else if(queryJson.hasOwnProperty('or')) {
								joinValue = ' OR ';
								subQueryValue = getQueryString(queryJson.or);
							}
							else if(queryJson.hasOwnProperty('not')) {
								return '-' + getQueryString(queryJson.not);
							}
							//else,  malformed, so ignore
							
							return subQueryValue.join(joinValue);
						}
						else {
							// unknown, so skip. may be initial, empty value
							//console.log('Unexpected Query: ' + JSON.stringify(queryJson));
							return '';
						}
					};
					
					setByJsonUpdate = true;
					$scope.queryString = getQueryString($scope.queryJson);
					
				});

				$scope.$watchGroup(['prefixQueryJson', 'queryJson', 'suffixQueryJson'], function(n, o) {
					var parts = [];

					// Merge our JSON objects in order
					n.forEach(function(json) {
						if (null != json) {
							// If this is already an AND, we'll just merge all the ANDs together
							if (null != json.and && angular.isArray(json.and)) {
								json.and.forEach(function(item) {
									parts.push(item);
								});
							}
							// Otherwise, add the entire structure to our outer AND
							else {
								parts.push(json);
							}
						}
					});

					if (parts.length > 0) {
						$scope.compositeJson = { and: parts };
					}
					else {
						$scope.compositeJson = {};
					}
				});
			}]
		};
	})
	.filter('queryDisplay', ['$filter', function($filter) {
		
		var escapeHtml = function(unsafe) {
			return unsafe
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#039;');
		};
		var twemojiFilter = $filter('twemojiFilter');
		
		var getQueryDisplay = function(queryJson) {
			if (null == queryJson) {
				return null;
			}
			else if(typeof queryJson === 'string') {
				return '<span class="wfboolean term">' + twemojiFilter(escapeHtml(queryJson)) + '</span>';
			}
			else if(typeof queryJson === 'object') {
				var subQueryValue = [],
					joinValue = '';
				if(Array.isArray(queryJson)) {
					return queryJson.map(getQueryDisplay);
				}
				else if(queryJson.hasOwnProperty('and')) {
					joinValue = ' <span class="wfboolean operator and">AND</span> ';
					subQueryValue = getQueryDisplay(queryJson.and);
				}
				else if(queryJson.hasOwnProperty('or')) {
					joinValue = ' <span class="wfboolean operator or">OR</span> ';
					subQueryValue = getQueryDisplay(queryJson.or);
				}
				else if(queryJson.hasOwnProperty('not')) {
					return '<span class="wfboolean not"><span class="wfboolean operator">NOT</span>' + getQueryDisplay(queryJson.not) + '</span>';
				}
				
				return ' <span class="wfboolean group">' + subQueryValue.join(joinValue) + '</span> ';
			}
			else {
				// unknown, so skip. may be initial, empty value
				// console.log('Unknown query json: ' + JSON.stringify(queryJson));
				return null;
			}
		};
		
		return function(data) {
			return getQueryDisplay(data);
		};
			
	}]);