'use strict';

angular.module('asymmetrik.audit').controller('AuditListController',
		[ '$scope', '$location', '$state', '$stateParams', '$log', '$modal', 'moment',
		  'Authentication', 'authService', 'auditService', 'userService',

	function( $scope, $location, $state, $stateParams, $log, $modal, moment,
			  Authentication, authService, auditService, userService ) {

		/**
		 * Page scope setup
		 */

		// store the authentication object in the scope
		$scope.auth = Authentication;

		// The list of events
		$scope.auditEntries = [];

		// Search phrase
		$scope.search = '';

		// Sort options for the page
		$scope.sort = auditService.sort;

		// Query options exposed to UI elements
		$scope.query = {
			action: '',
			auditType: ''
		};

		// Metadata about the currently displayed set of data
		$scope.results = {
			pageNumber: 0, // The current page number
			pageSize: 0,   // The number of elements in the current page
			totalPages: 0, // The total number of pages
			totalSize: 0,   // The total number of elements in the set
			resolved: false // indicates if search query has completed or is running
		};

		// The current configuration of the paging/sorting options
		$scope.options = {
			pageNumber: 0,
			pageSize: 50,
			sort: $scope.sort.created
		};

		$scope.actionOptions = []; // to be loaded from the server
		$scope.auditTypeOptions = []; // to be loaded from the server

		$scope.timeOptions = [
			{ value: -1, display: 'Last 24 Hours' },
			{ value: -3, display: 'Last 3 Days' },
			{ value: -7, display: 'Last 7 Days' },
			{ value: 'everything', display: 'Everything' },
			{ value: 'choose', display: 'Choose' }
		];
		$scope.selectedTimeFilter = $scope.timeOptions[0].value;

		/**
		 * Paging/Sorting Results
		 */

		// Go to specific page number
		$scope.goToPage = function(pageNumber) {
			$scope.options.pageNumber = pageNumber;
			$scope.applySearch();
		};

		// Set the sort order
		$scope.setSort = function(name) {
			if(null != $scope.options.sort.sort && $scope.options.sort.sort === name) {
				// Same column, so reverse direction
				$scope.options.sort.dir = ($scope.options.sort.dir === 'ASC') ? 'DESC' : 'ASC';
			}
			else {
				$scope.options.sort = {
					sort: name,
					dir: 'ASC'
				};
			}
			$scope.applySearch();
		};

		function isOptionSelected(opt) {
			return opt.selected;
		}

		function getDisplay(opt) {
			return opt.display;
		}

		/**
		 * Builds a search query object from the scope variable values
		 */
		function buildSearchQuery() {
			var query = {};

			if(null != $scope.query.actor && null != $scope.query.actor._id) {
				query['audit.actor._id'] = {
					$obj: $scope.query.actor._id
				};
			}

			var selectedActions = $scope.actionOptions.filter(isOptionSelected);
			if(selectedActions.length > 0) {
				query['audit.action'] = {
					$in: selectedActions.map(getDisplay)
				};
			}

			var selectedAuditTypes = $scope.auditTypeOptions.filter(isOptionSelected);
			if(selectedAuditTypes.length > 0) {
				query['audit.auditType'] = {
					$in: selectedAuditTypes.map(getDisplay)
				};
			}

			var created = getTimeFilterQueryObject();
			if(null != created) {
				query.created = created;
			}

			return query;
		}

		/**
		 * Based on the input scope variables, constructs a
		 * time-based query with start and end parameters, if applicable.
		 * 
		 * May return undefined if no valid dates are set.
		 */
		function getTimeFilterQueryObject() {
			var timeQuery;

			if($scope.selectedTimeFilter === 'choose') {
				// at least one of start or end must be selected for us to set a 'created' query attribute
				if( null != $scope.query.startDate || null != $scope.query.endDate ) {
					timeQuery = {};
					if( null != $scope.query.startDate ) {
						$log.debug('Start: %s', $scope.query.startDate);
						timeQuery.$gte = moment.utc($scope.query.startDate).startOf('day');
					}
					if( null != $scope.query.endDate ) {
						$log.debug('End: %s', $scope.query.endDate);
						timeQuery.$lt = moment.utc($scope.query.endDate).endOf('day');
					}
				}
			}
			else if($scope.selectedTimeFilter === 'everything') {
				// do not set a time query, in order to return results over the entire data set
				timeQuery = null;
			}
			else {
				timeQuery = {
					$gte: moment.utc().add($scope.selectedTimeFilter, 'days'),
					$lt: moment.utc()
				};
			}

			return timeQuery;
		}

		/**
		 * Searching the events
		 */

		// Method handler for return keypress in the search box
		$scope.applySearchKeypress = function(keyEvent) {
			if(keyEvent.which === 13){
				$scope.refresh();
			}
		};

		$scope.refresh = function() {
			$scope.options.pageNumber = 0;
			$scope.applySearch();
		};

		// Search method that actually executes the search and updates the events list
		$scope.applySearch = function() {

			var query = buildSearchQuery();

			$scope.results.resolved = false;

			auditService.search(query, $scope.search, {
				page: $scope.options.pageNumber,
				size: $scope.options.pageSize,
				sort: $scope.options.sort.sort,
				dir: $scope.options.sort.dir
			}).then(function(result){
				if(null != result && null != result.elements && result.elements.length > 0){
					$scope.auditEntries = result.elements;
					$scope.results.pageNumber = result.pageNumber;
					$scope.results.pageSize = result.pageSize;
					$scope.results.totalPages = result.totalPages;
					$scope.results.totalSize = result.totalSize;
				} else {
					$scope.auditEntries = [];
					$scope.results = {};
				}

				$scope.results.resolved = true;
			}, function(error){
				$log.error(error);
				$scope.results.resolved = true;
			});
		};

		// Search for users for the typeahead control
		$scope.searchUsers = function(search) {
			return userService.match({ /* open user search */ }, search, {
				page: 0,
				size: 20,
				sort: 'username',
				dir: 'ASC'
			}).then(function(result){
				if(null != result){
					return result.elements;
				} else {
					return [];
				}
			}, function(error) {
				$log.error(error);
				return [];
			});
		};

		/**
		 * Toggles the selected attribute of the input object
		 * and refreshes the listing with the updated query
		 */
		$scope.toggleValue = function(value) {
			value.selected = !value.selected;
			$scope.refresh();
		};

		/**
		 * When the user wants to see more details about an update
		 * to an audited object, pop-up a modal with the details
		 * of the change
		 */
		$scope.viewChanges = function(entry) {
			$modal.open({
				templateUrl: 'app/audit/views/audit-view-change.client.view.html',
				controller: 'AuditViewChangeController',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					auditEntry: function() { return entry; }
				}
			});
		};


		/**
		 * When the user wants to see more details an audited object,
		 * pop-up a modal with the details of the change
		 */
		$scope.viewDetails = function(entry) {
			$modal.open({
				templateUrl: 'app/audit/views/audit-view-details.client.view.html',
				controller: 'AuditViewChangeController',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					auditEntry: function() { return entry; }
				}
			});
		};
		/**
		 * Translate the server response of audit values to the UI schema
		 */
		function mapAuditValues(r) {
			return {
				selected: false,
				display: r
			};
		}

		/*
		 * Load distinct 'action' options from the server for the user to select
		 */
		auditService.getDistinctAuditValues('audit.action').then(function(results) {
			$scope.actionOptions = results.sort().map(mapAuditValues);
		}, function(error) {
			$log.error(error);
		});

		/*
		 * Load distinct 'auditType' options from the server for the user to select
		 */
		auditService.getDistinctAuditValues('audit.auditType').then(function(results) {
			$scope.auditTypeOptions = results.sort().map(mapAuditValues);
		}, function(error) {
			$log.error(error);
		});

		/**
		 * Configure the page
		 */

		// Apply the search to start with some data
		$scope.applySearch();

		/*
		 * Whenever the user changes the start or end date, refresh the listing
		 */
		$scope.$watchGroup(['query.startDate', 'query.endDate'], $scope.refresh);
	}
]);