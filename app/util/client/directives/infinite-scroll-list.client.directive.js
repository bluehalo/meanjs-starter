'use strict';

/**
 * A transcluding directive that creates a region that supports infinite scrolling by invoking callbacks when
 * scroll events occur.  The container scope must do the queries and render the list of elements; this
 * directive only provides a scrolling container.
 *
 * To use it, do something like the following.  Each of the parameters is optional, but you should pass it at least
 * one callback function.
 *
 * <div data-infinite-scroll-list
 *      // When this collection changes, the height will be recalculated.
 *      data-ng-model="list"
 *      // The number of pixels to buffer the top and bottom detection by (default 20).
 *      data-scroll-distance="20"
 *      // If true, no scrolling events will be fired.
 *      data-ng-disabled="!scrollEnabled"
 *      // A function to be called when the user scrolls to the top.
 *      //   direction: > 0 if scrolling down, < 0 if scrolling up
 *      //   scrollTop: the scroll position relative to the top
 *      //   visibleHeight: the visible height of the scroll region
 *      //   scrollableHeight: the total height of all the content in the scroll region
 *      data-on-top-fn="onTopFn()"
 *      // A function to be called when the user scrolls to the bottom.
 *      //   direction: > 0 if scrolling down, < 0 if scrolling up
 *      //   scrollTop: the scroll position relative to the top
 *      //   visibleHeight: the visible height of the scroll region
 *      //   scrollableHeight: the total height of all the content in the scroll region
 *      data-on-bottom-fn="onBottomFn()"
 *      // A function to be called whenever the user is scrolling.
 *      //   direction: > 0 if scrolling down, < 0 if scrolling up
 *      //   scrollTop: the scroll position relative to the top
 *      //   visibleHeight: the visible height of the scroll region
 *      //   scrollableHeight: the total height of all the content in the scroll region
 *      data-on-scroll-fn="onScrollFn(direction, scrollTop, visibleHeight, scrollableHeight)"
 *      // A function to be called whenever the height changes
 *      //   scrollTop: the scroll position relative to the top
 *      //   visibleHeight: the visible height of the scroll region
 *      //   scrollableHeight: the total height of all the content in the scroll region*
 *      data-on-height-fn="onHeightFn(visibleHeight, scrollableHeight, scrollTop)
 *      // The container should have its height constrained in some way or scrolling won't work
 *      style="height: 350px;">
 *   <div data-ng-repeat="item in list">
 *     <div>{{item.title}}</div>
 *   </div>
 * </div>
 *
 * If you pass in a list model, the scroll region will automatically recalculate its size and fire the
 * onHeightFn() callback if elements are added to or removed from the list.  In addition, you can broadcast
 * the 'scroll:resize' event, like $scope.$broadcast('scroll:resize'), in order to force the region to
 * recalculate its size.
 *
 * You can also broadcast the 'scroll:returnToTop' event, like $scope.$broadcast('scroll:returnToTop') to
 * return the scroll region to the top.  This will trigger the onScrollFn() and onTopFn() callbacks as usual.
 *
 * In a typical use case:
 *
 * - Use onBottomFn() to enable the infinite scroll and attempt to load more records to add to the list.
 * - Use onTopFn() to turn on a live data subscription (and onScrollFn() to turn it back off).
 * - Use onScrollFn() to do something whenever a user is scrolling.  The direction parameter indicates whether
 *     the user is scrolling up or down.
 * - Use onHeightFn() to check whether there are enough records to cause the scroll bar to appear.
 *     If scrollableHeight < visibleHeight, attempt to load more records.
 */
angular.module('asymmetrik.util')
	.directive('infiniteScrollList', [
		'$window', '$timeout',

		function($window, $timeout) {
			return {
				restrict: 'AE',
				transclude: true,
				templateUrl: 'app/util/views/infinite-scroll-list.client.view.html',
				scope: {
					model: '=?ngModel',
					disabled: '=?ngDisabled',
					buffer: '=?scrollDistance',
					onTopFn: '&?',
					onBottomFn: '&?',
					onScrollFn: '&?',
					onHeightFn: '&?'
				},
				link: function($scope, element) {
					var scrollTimeout;
					var recalculateTimeout;

					// Set the number of pixels to use as buffer
					if (null == $scope.buffer) {
						$scope.buffer = 10;
					}
					element.addClass('infinite-scroll-list');
					var container = element.find('.scroll-container');

					// When changes occur, recalculate the height attributes
					function recalculate() {
						$scope.visibleHeight = container.height();
						$scope.scrollableHeight = container.prop('scrollHeight');

						if (null != recalculateTimeout) {
							$timeout.cancel(recalculateTimeout);
							recalculateTimeout = null;
						}
					}

					function recalculateWithDelay() {
						if (null == recalculateTimeout) {
							recalculateTimeout = $timeout(recalculate, 0);
						}
					}

					function applyRecalculateWithDelay() {
						$scope.$apply(recalculateWithDelay);
					}

					// If either the visible height or scrollable height change, notify listeners
					$scope.$watchGroup(['visibleHeight', 'scrollableHeight'], function() {
						var scrollTop = container.scrollTop();

						// Notify listeners that the height changed
						$scope.onHeightFn({
							scrollTop: scrollTop,
							visibleHeight: $scope.visibleHeight,
							scrollableHeight: $scope.scrollableHeight
						});
					});

					// If the window resizes, recalculate the height and notify listeners
					var win = angular.element($window);
					win.on('resize', applyRecalculateWithDelay);

					$scope.$on('$destroy', function() {
						win.off('resize', applyRecalculateWithDelay);
					});

					// If a parent scope triggers the scroll:resize event, recalculate the height
					$scope.$on('scroll:resize', function() {
						recalculateWithDelay();
					});

					// If the model changes, recalculate the height and notify listeners
					// once the DOM has finished rendering
					$scope.$watchCollection('model', recalculateWithDelay);

					// Calculate the height initially
					recalculate();

					// Get our initial scroll position
					var prevScrollTop = container.scrollTop();

					// When the user scrolls down, fetch the next set of items (infinite scroll)
					function onScroll() {
						if (!$scope.disabled) {
							// Reduce jitteriness by using a timeout
							if (null == scrollTimeout) {
								scrollTimeout = $timeout(function() {
									recalculate();
									var scrollTop = container.scrollTop();
									var hiddenContentHeight = $scope.scrollableHeight - $scope.visibleHeight;

									// Determine which direction we're scrolling
									var dir = scrollTop - prevScrollTop;
									if (dir !== 0) {
										prevScrollTop = scrollTop;

										var data = {
											direction: dir,
											scrollTop: scrollTop,
											visibleHeight: $scope.visibleHeight,
											scrollableHeight: $scope.scrollableHeight
										};

										// Fire the event that we're scrolling
										$scope.onScrollFn(data);

										// Are we scrolling toward the bottom?
										if (dir > 0 && hiddenContentHeight - scrollTop <= $scope.buffer) {
											$scope.onBottomFn(data);
										}
										// Are we scrolling toward the top?
										else if (dir < 0 && scrollTop <= $scope.buffer) {
											$scope.onTopFn(data);
										}
									}
									scrollTimeout = null;
								}, 100);
							}
						}
					}

					// Listen to scroll events
					container.on('scroll', function() {
						$scope.$apply(onScroll);
					});

					// Listen to requests to scroll back to the top
					$scope.$on('scroll:returnToTop', function() {
						container.scrollTop(0);

						// Behave as though the user scrolled and trigger the onTopFn() callback
						onScroll();
					});

					$scope.$on('scroll:setTop', function(event, data) {
						// Check that new top property is set
						if (data.hasOwnProperty('newTop')) {
							container.scrollTop(data.newTop);
						}
					});
				}
			};
		}
	]);
