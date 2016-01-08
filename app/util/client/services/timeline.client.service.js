'use strict';

angular.module('asymmetrik.util').factory('Timeline', [
	'$q', '$timeout', 'configService', 'streamService',

	function( $q, $timeout, configService, streamService ) {

		/**
		 * Constructs a new container for timeline configuration data.
		 *
		 * @param {Function=} payloadMapFunction Optionally, a map function to apply to every data point.
		 * @constructor
		 */
		function Timeline(payloadMapFunction) {
			var self = this;

			this._payloadMapFunction = payloadMapFunction;

			this.streamId = null;
			this.controllers = {};

			this.stacked = true;
			this.series = {};

			this._lastData = null;
			this._initialized = false;
			this._timelineType = 'stacked';

			// Start with all the series enabled by default
			Timeline.metrics.then(function(metrics) {
				if (!self._initialized) {
					metrics.forEach(function(metric) {
						self.series[metric.value] = true;
					});
				}
			});
		}

		/**
		 * Adds a controller to this timeline.
		 *
		 * @param {string} metric The metric to use for the controller.
		 * @param {Sentio.Controller} controller The sentio controller to use.
		 */
		Timeline.prototype.addController = function(metric, controller) {
			this.controllers[metric] = controller;
		};

		/**
		 * Returns true if the given metric has been made active.
		 *
		 * @param {string} metric The name of the metric
		 * @returns {boolean} True if it's active, false otherwise
		 */
		Timeline.prototype.isSeriesActive = function(metric) {
			return !!this.series[metric];
		};

		/**
		 * @returns {string} Returns 'stacked' or 'overlay', depending on the stacked parameter.
		 */
		Timeline.prototype.getTimelineType = function() {
			return this._timelineType;
		};

		Timeline.prototype.updateTimelineType = function() {
			this._timelineType = (this.stacked ? 'stacked' : 'overlay');
		};

		/**
		 * Reads timeline options from user preferences and re-renders the timeline with the previous data.
		 *
		 * @param {ObjectId} streamId The ID of the stream
		 * @param {(Number|Promise)=} timeout Optionally, a timeout or aborter to use for the HTTP call.
		 * @returns {Promise} A promise that returns this object when its preferences have been updated.
 		 */
		Timeline.prototype.loadPreferences = function(streamId, timeout) {
			var self = this;

			if (null != streamId) {
				self.streamId = streamId;
			}
			if (null == self.streamId) {
				return $q.reject();
			}

			return streamService.loadUserPrefs(self.streamId, timeout).then(function(result) {
				// Prevent the default config from running, if it hasn't already
				self._initialized = true;

				if (null != result && null != result.timeline) {
					self.stacked = result.timeline.stacked;

					if (null != result.timeline.series && result.timeline.series.length > 0) {
						self.series = {};
						result.timeline.series.forEach(function(metric) {
							self.series[metric] = true;
						});
					}
				}
				// Now that the preferences may have changed, re-render the timeline
				return self.render();
			});
		};

		// Map the payload into the correct format, if possible
		Timeline.prototype._mapPayload = function(payload) {
			if (angular.isFunction(this._payloadMapFunction)) {
				return payload.map(this._payloadMapFunction);
			}
			return payload;
		};

		/**
		 * Renders a payload of data.  The data should have a key for each of the defined metrics.
		 *
		 * @param {Object=} data A complete set of data for the timeline to render. If not specified,
		 *   the timeline will be redrawn with the previous set of data.
		 *
		 * @returns {Promise} A promise that is resolved when all of the controllers are updated.
		 */
		Timeline.prototype.render = function(data) {
			var self = this;

			if (null == data) {
				data = this._lastData;
			}
			else {
				this._lastData = data;
			}

			// Clear the controllers and add new payloads.
			return Timeline.metrics.then(function(metrics) {

				var stackedPayloads = [];

				// Construct a model with the binned data
				var model = [];
				var stackedModel = [];

				// Iterate through the metrics in stacking order
				metrics.forEach(function(metric) {
					if (self.controllers.hasOwnProperty(metric.value)) {
						var controller = self.controllers[metric.value];

						// Clear the controller's previous values
						controller.clear();

						// If we have data for the metric...
						if (null != data && data.hasOwnProperty(metric.value)) {
							var payload = data[metric.value];

							// If this series is active and there is data, add it to the controller
							if (self.isSeriesActive(metric.value) && payload.length > 0) {
								// Convert the payload if necessary
								payload = self._mapPayload(payload);

								// If we're in overlay mode or this series should be overlaid, add it to the controller
								if (!self.stacked || metric.position < 0) {
									controller.add(payload);
								}
								// Otherwise, we're in stack mode so add the payload to the stack
								else {
									stackedPayloads.push(payload);

									// Now add all the stacked data to the controller
									stackedPayloads.forEach(function (p) {
										controller.add(p);
									});
								}
							}
						}
						
						// Now add the controller bins to the model, whether or not there is data.
						// If the series is not stacked, add it to the model in order.
						if (!self.stacked || metric.position < 0) {
							model.push({
								key: metric.value,
								cssClass: metric.value,
								data: controller.bins()
							});
						}
						// Otherwise, add the stacked series to the model in reverse order.
						else {
							stackedModel.unshift({
								key: metric.value,
								cssClass: metric.value,
								data: controller.bins()
							});
						}
					}
				});

				// Now add any stacked models to the main model in reverse order, so smaller series
				// are visible on top of larger ones.
				if (stackedModel.length > 0) {
					model = model.concat(stackedModel);
				}

				// Once we've redrawn the data, change the timeline type.  This prevents the browser from
				// changing its styling before the data has been shifted.
				$timeout(self.updateTimelineType.bind(self), 0);

				return model;
			});
		};

		/**
		 * @type {Promise{Array}} A static that will return a sorted list of the metrics to display in the
		 * timeline. These will include all of the configured properties and be sorted by position.
		 */
		Timeline.metrics = configService.getConfig().then(function(config) {
			var metrics = [];

			angular.forEach(config.metrics, function(data, key) {
				data.value = key;
				metrics.push(data);
			});

			// Sort the metrics based on position
			metrics.sort(function(a, b) {
				return a.position - b.position;
			});

			return metrics;
		});

		return Timeline;
	}
]);
