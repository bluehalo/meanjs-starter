'use strict';

angular.module('asymmetrik.util').factory('AborterList', [
	'$q', '$timeout',

	function( $q, $timeout ) {

		/**
		 * Constructs a new AborterList.  Each controller should have its own so the keys can be unique within
		 * that controller and so all requests can be aborted when the controller goes out of scope.
		 *
		 * @param {Number} timeoutMs Optionally, the number of milliseconds to apply to every call to onceWithTimeout().
		 * @constructor
		 */
		function AborterList(timeoutMs) {
			this.aborters = {};
			this.timeoutMs = timeoutMs || 0;  // All we need in many cases is to run asynchronously after the digest cycle.
		}

		/**
		 * Wraps a function so only a single instance of it is running at a time.  Whenever the resulting
		 * function is called, any previous calls will be aborted before the function is called again.
		 *
		 * @param {String} aborterKey A unique key for this operation, that can be used to retrieve the same aborter at
		 *   a later point.
		 * @returns {Promise{Deferred}} A promise that returns a deferred object that can be used as an aborter.
		 *   To make an HTTP request abortable pass the promise from this deferred object into an $http call as the
		 *   timeout option.  To abort, resolve the promise, or call this.abort() with the same aborterKey.
		 */
		AborterList.prototype.once = function(aborterKey) {
			// Cancel any previous calls that haven't yet returned
			this.abort(aborterKey);

			// Get the new aborter and pass it to the function
			return this.get(aborterKey);
		};

		/**
		 * Wraps a function so only a single instance of it is running at a time after a short delay.
		 * Whenever the resulting function is called, any previous calls will be aborted before the function is
		 * called again. The delay ensures that multiple calls in rapid succession will result in a single call to
		 * the server.
		 *
		 * @param {String} aborterKey A unique key for this function, that can be used to retrieve the aborter promise.
		 * @param {Number=} timeoutMs The timeout, in milliseconds.
		 * @returns {Promise{Deferred}} A promise that returns a deferred object that can be used as an aborter.
		 *   To make an HTTP request abortable pass the promise from this deferred object into an $http call as the
		 *   timeout option.  To abort, resolve the promise, or call this.abort() with the same aborterKey.
		 */
		AborterList.prototype.onceWithTimeout = function(aborterKey, timeoutMs) {
			// Cancel any previous calls that haven't yet returned
			this.abort(aborterKey);

			// Get the default timeout if necessary
			timeoutMs = timeoutMs || this.timeoutMs;

			// Create a new aborter now
			return this.get(aborterKey).then(function(aborter) {

				// Call the function after a short delay
				var timeout = $timeout(function() {
					return aborter;
				}, timeoutMs);

				// If the request is aborted, cancel the timeout as well
				aborter.promise.then(function() {
					$timeout.cancel(timeout);
				});
				return timeout;
			});
		};

		/**
		 * Gets the aborter deferred object with the given key, creating a new one if one doesn't yet exist.
		 *
		 * @param {String} aborterKey A unique key representing an aborter promise.
		 * @returns {Promise{Deferred}} A promise that returns a deferred object that can be used as an aborter.
		 *   To make an HTTP request abortable pass the promise from this deferred object into an $http call as the
		 *   timeout option.  To abort, resolve the promise, or call this.abort() with the same aborterKey.
		 */
		AborterList.prototype.get = function(aborterKey) {
			if (null == this.aborters[aborterKey]) {
				this.aborters[aborterKey] = $q.defer();
			}
			return $q.when(this.aborters[aborterKey]);
		};

		/**
		 * Aborts a previous call with the given key.  It is assumed that the aborter promises are passed to the
		 * $http service as the timeout, so in order to abort the HTTP request the promise must be resolved.
		 *
		 * @param {String} aborterKey The key that was provided when the aborter promise was created.
		 */
		AborterList.prototype.abort = function(aborterKey) {
			// If we have an aborter for this key, resolve it to abort the request
			if (null != this.aborters[aborterKey]) {
				this.aborters[aborterKey].resolve();
				delete this.aborters[aborterKey];
			}
		};

		/**
		 * Aborts all of the promises registered with this AborterList instance.
		 * This should be done whenever a scope is destroyed in which aborters were registered.
		 */
		AborterList.prototype.abortAll = function() {
			angular.forEach(this.aborters, function(value, key) {
				value.resolve();
			});
			this.aborters = {};
		};

		return AborterList;
	}
]);
