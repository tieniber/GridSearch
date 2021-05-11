define([
	"dojo/_base/declare",
	"mxui/widget/_WidgetBase",
	"mxui/mixin/_Stateful",
	// "dijit/_TemplatedMixin",
	"dojo/query",
	"dojo/_base/lang",
	"dijit/registry",
	"dojo/promise/all",
	"dojo/Deferred",
	"dojo/aspect"

], function (declare, _WidgetBase, _StatefulMixin, dojoQuery, dojoLang, registry, all, Deferred, dojoAspect) {
	"use strict";

	return declare("GridSearch.widget.Core", [_WidgetBase, _StatefulMixin], {

		widgetBase: null,
		//searchMethodParam: "",

		// Internal variables.
		_searchWidgets: {},
		_activeFilterWidgets: {},
		_contextObj: null,
		_grids: null,
		_currentFilter: null,
		_activeFilterDiv: null,

		//modeler
		gridEntity: null,
		targetGridName: null,
		targetGridClass: null,
		filterLabel: null,

		constructor: function () {
			this._grids = [];
		},
		postCreate: function () {
			if (this.targetGridName !== '') {
				this.targetGridClass = "mx-name-" + this.targetGridName;
			}
		},
		superPostCreate: function () {
			if (this.targetGridName !== '') {
				this.targetGridClass = "mx-name-" + this.targetGridName;
			}
		},

		_getSearchConstraint: function () {
			console.error("Widget not implemented properly. A searching widget should implement a _getSearchContraint function.")
		},
		_getPagesize: function () {
			//override this function if the widget sets page size
			return null;
		},
		_getOffset: function () {
			//override this function if the widget sets offset
			return null;
		},
		_getSort: function () {
			//override this function if the widget sets sort
			return null;
		},
		_clear: function (shouldReload) {
			//this function should clear the search widget
			console.error("Widget not implemented properly. A searching widget should implement a _clear function.")
		},
		_setupGrid: function (callback) {
			setTimeout(this._setupGridNoDelay.bind(this, callback), 500);
		},

		_setupGridNoDelay: function (callback) {
			if (!this._searchWidgets[this.targetGridClass]) {
				this._searchWidgets[this.targetGridClass] = [];
			}
			if (this._searchWidgets[this.targetGridClass].indexOf(this) === -1) {
				this._searchWidgets[this.targetGridClass].push(this);
			}
			this._findSearchableLists(callback);

		},
		_findSearchableLists: function (callback) {
			var nodeList = dojoQuery("." + this.targetGridClass);

			var gridNodes = nodeList; // ? nodeList[nodeList.length-1]: null;
			var promises = [];
			for (var i = 0; i < gridNodes.length; i++) {
				promises.push(this._connectOneGrid(gridNodes[i]));
			}
			var self = this;
			all(promises).then(function (results) {
				self._grids = results;
				if (callback) callback();
			});
			if (!gridNodes) {
				console.log("Could not find the list node(s).");
			}
		},
		_connectOneGrid: function (gridNode, tries) {
			var deferred = new Deferred();

			var grid = dijit.registry.byNode(gridNode);
			if (grid) {
				//this._grids.push(grid);
				//Fix for 7.12+ where _datasource.setConstraints doesn't exist anymore
				if (grid._datasource && !grid._datasource.setConstraints) {
					grid._datasource.setConstraints = function (newConstraint) {
						this._constraints = newConstraint;
					}
				}
				// play nice with existing search widgets
				if (grid._searchGetConstraints && !grid._gridSearchPlayNiceHandler) {
					grid._gridSearchPlayNiceHandler = dojoAspect.after(grid, "_searchGetConstraints", function (result) {
						return result + this._getSearchConstraintAllSearchBoxes();
					}.bind(this));
				}
				if (!grid.gridSearchWidgets) {
					grid.gridSearchWidgets = {};
				}
				grid.gridSearchWidgets[this.id] = this;
				deferred.resolve(grid);
			} else {
				tries++;
				if (tries > 3) {
					console.log("Found a DOM node but could not find the grid widget. Tried 3 times");
					deferred.reject();
				} else { //set a timer to try again shortly
					setTimeout(this._connectOneGrid.bind(gridNode, tries), 500);
				}
			}
			return deferred.promise;

		},
		_fireSearchWithDelay: function () {
			clearTimeout(this._searchTimeout);
			var self = this;
			this._searchTimeout = setTimeout(function () {
				self._fireSearch();
			}, 250);
		},
		_fireSearch: function () {
			var constraints, pagesize, offset, sort;
			this._findSearchableLists();
			for (var i = 0; i < this._grids.length; i++) {
				// play nice (only data grids)
				if (this._grids[i]._gridSearchPlayNiceHandler) {
					constraints = this._grids[i]._searchGetConstraints();
				} else {
					constraints = this._getSearchConstraintAllSearchBoxes();
					pagesize = this._getPagesizeAllWidgets();
					offset = this._getOffsetAllWidgets();
					sort = this._getSortAllWidgets();
				}
				this._fireSearchOneGrid(this._grids[i], constraints, pagesize, offset, sort);
			}
			console.log("Fired search for " + this._grids.length + " grids.")
			if (this.cascadeKey) {
				this._cascadeToListeningWidgets();
			}
		},
		_fireSearchOneGrid: function (grid, constraints, pagesize, offset, sort) {
			var datasource = grid._datasource,
				self = this,
				constraintsChanged = false,
				pageSizeChanged = false,
				offsetChanged = false,
				sortChanged = false;

			if (!datasource) {
				datasource = grid._dataSource;
			}

			if (datasource._constraints !== constraints) {
				constraintsChanged = true;
			}
			if (pagesize !== null && datasource._pageSize !== pagesize) {
				pageSizeChanged = true;
			}
			if (offset !== null && datasource._offset !== offset) {
				offsetChanged = true;
			}
			if (JSON.stringify(JSON.parse(sort)) && JSON.stringify(datasource._sorting) !== sort) {
				sortChanged = true;
			}

			if (constraintsChanged || pageSizeChanged || offsetChanged || sortChanged) {
				if (grid.__customWidgetDataSourceHelper) {
					//Using ListViewControls
					grid.__customWidgetDataSourceHelper.store.constraints._none["GridSearch"] = constraints;
					if (pagesize !== null) {
						grid.__customWidgetDataSourceHelper.paging.pageSize = pagesize
						datasource.setPageSize(pagesize);
					}
					if (offset !== null) {
						grid.__customWidgetDataSourceHelper.paging.offset = offset;
						datasource.setOffset(offset);
					}
					if (sort) {
						grid.__customWidgetDataSourceHelper.sorting = JSON.parse(sort);
						datasource._sorting = JSON.parse(sort);
					}
				} else {
					//No ListViewControls
						datasource.setConstraints(constraints);
						//if the grid is set to wait for search, ensure we set the "_searchFilled" flag
						if (grid.config && grid.config.gridpresentation && grid.config.gridpresentation.waitforsearch) {
							if (constraints) {
								grid._searchFilled = true;
							} else {
								//grid._searchFilled = false; //grid doesn't refresh or empty if you do this
								datasource.setConstraints("[1=0]");
							}
						}
						if (pagesize !== null) {
							//set page size
							datasource.setPageSize(pagesize);
						}
						if (offset !== null) {
							//set offset
							datasource.setOffset(offset);
							//datasource._setSetSize(pagesize);
						}
						if (sort) {
							//set sort
							datasource._sorting = JSON.parse(sort);
						}
					}
					self.onSearchChanged();
					self._reloadOneGrid(grid, offsetChanged);
					console.log("set constraints for grid: " + grid.id)
			} else {
				console.log("did not set constraints for grid as they did not change: " + grid.id)
			}
		},
		_getSearchConstraintAllSearchBoxes: function () {
			var searchWidgets = this._searchWidgets[this.targetGridClass];
			var fullConstraint = "";
			for (var i = 0; i < searchWidgets.length; i++) {
				var searchWidget = searchWidgets[i];
				fullConstraint = fullConstraint + searchWidget._getSearchConstraint();
			}
			return fullConstraint;
		},
		_getPagesizeAllWidgets: function () {
			//only allow 1 widget to drive page size
			//first result wins
			var searchWidgets = this._searchWidgets[this.targetGridClass];
			for (var i = 0; i < searchWidgets.length; i++) {
				var searchWidget = searchWidgets[i];
				var pageSize = searchWidget._getPagesize();
				if (pageSize) {
					return pageSize;
				}
			}
			return null;
		},
		_getOffsetAllWidgets: function () {
			//only allow 1 widget to drive offset
			//first result wins
			var searchWidgets = this._searchWidgets[this.targetGridClass];
			for (var i = 0; i < searchWidgets.length; i++) {
				var searchWidget = searchWidgets[i];
				var offset = searchWidget._getOffset();
				if (offset !== null) {
					return offset;
				}
			}
			return null;
		},
		_getSortAllWidgets: function () {
			//only allow 1 widget to drive sort
			//first result wins
			var searchWidgets = this._searchWidgets[this.targetGridClass];
			for (var i = 0; i < searchWidgets.length; i++) {
				var searchWidget = searchWidgets[i];
				var sort = searchWidget._getSort();
				if (sort) {
					return sort;
				}
			}
			return null;
		},
		_clearAllSearchBoxes: function (e) {
			var searchWidgets = this._searchWidgets[this.targetGridClass];

			for (var i = 0; i < searchWidgets.length; i++) {
				searchWidgets[i]._clear(false);
			}
			this._fireSearch();
		},
		_reloadGrid: function (forceOffset) {
			for (var i = 0; i < this._grids.length; i++) {
				this._reloadOneGrid(this._grids[i], forceOffset);
			}
		},
		_reloadOneGrid: function (grid, forceOffset) {
			//if this grid has List View Controls connected, use its loader instead
			const callback = () => {
				grid.__customWidgetPagingLoading = false;
				this._stopProgressBar();
				this._setTotalCount(grid);
			}
			if (grid.reload) {
				this._startProgressBarDelay();
				grid.reload(callback);
			} else if (forceOffset) {
				//custom update call where we keep the offset for paging
				this._startProgressBarDelay();
				const listNode = grid.domNode.querySelector("ul");
				while (listNode.firstChild) {
					listNode.removeChild(listNode.firstChild);
				}
				grid.__customWidgetPagingLoading = true;
				grid.sequence([ "_sourceReload", "_renderData" ], callback);
			} else if (grid.__customWidgetDataSourceHelper) {
				//play nice with List View Controls searching
				var dsh = grid.__customWidgetDataSourceHelper
				dsh.requiresUpdate = true;
				dsh.updateDataSource(function() {});
			} else if (grid.update) {
				//raw reload/update call
				this._startProgressBarDelay();
				grid.update(undefined, callback);
				
			} else {
				console.log("Could not find the grid refresh/reload function");
			}
		},
		_startProgressBarDelay: function () {
			this._pendingLoaders = this._pendingLoaders || [];
			this._pendingLoaders.push(window.setTimeout(this._startProgressBar.bind(this), 250));
		},
		_startProgressBar: function () {
			this._loader = this._loader || mx.ui.showProgress(undefined, false);
		},
		_stopProgressBar: function () {
			if (this._pendingLoaders.length) {
				for(var i=0; i<this._pendingLoaders.length;i++){
					window.clearTimeout(this._pendingLoaders[i]);
				}
				this._pendingLoaders = [];
			}
			if (this._loader) {
				mx.ui.hideProgress(this._loader);
				this._loader = null;
			}
		},
		_setTotalCount: function(grid) {
			if(this.countAttribute) {
				var datasource = grid._datasource;
				if (!datasource) {
					datasource = grid._dataSource;
				}
				this._contextObj.set(this.countAttribute, datasource._setSize);
			}
		},
		onSearchChanged: function () {
			//this function exists so it can be fired when the search input changes. The Active Filters widget relies on it to update its rendering.

			var activeFilterWidget;
			if (this._activeFilterWidgets[this.mxform.id]) {
				activeFilterWidget = this._activeFilterWidgets[this.mxform.id][this.targetGridClass];
			}
			if (!activeFilterWidget && this.mxform.place === "custom") { //we have loaded these filters in a sub-form (like a sidebar), find the master form
				var parentWidget = registry.getEnclosingWidget(this.mxform.domNode);
				if (parentWidget && this._activeFilterWidgets[parentWidget.mxform.id]) {
					activeFilterWidget = this._activeFilterWidgets[parentWidget.mxform.id][this.targetGridClass];
				}
			}
			if (activeFilterWidget) {
				if (!this._activeFilterDiv) {
					this._activeFilterDiv = document.createElement("div");
					this._activeFilterDiv.addEventListener("click", dojoLang.hitch(this, function () {
						this._clear(false);
						this.onSearchChanged();
						this._fireSearch();
					}));
					activeFilterWidget.activeFilters.appendChild(this._activeFilterDiv);
				}
				this._activeFilterDiv.innerHTML = this.filterLabel + ": " + this._currentFilter;
				if (this._currentFilter) {
					this._activeFilterDiv.style.display = "inline-block";
				} else {
					this._activeFilterDiv.style.display = "none";
				}
			}
		},
		uninitialize: function () {
			var index = this._searchWidgets[this.targetGridClass].indexOf(this);
			if (index > -1) {
				this._searchWidgets[this.targetGridClass].splice(index, 1);
			}
		},
		/**
		 * Push the change to any listening widgets
		 * @author Conner Charlebois (Mendix)
		 * @since Aug 1, 2018
		 */
		_cascadeToListeningWidgets: function () {
			// refresh the listening dropdown
			var listenerWidget = this._searchWidgets[this.targetGridClass].find(function (w) {
				return w.listenPath && w.listenKey === this.cascadeKey
			}.bind(this));
			// if there's a listening widget
			if (listenerWidget) {
				/**
				 * upper filter
				 * lower option filter
				 * lower filter
				 * the upper filter affects the lower option filter
				 * if the filter on the listenerWidget dropdown needs to change, clear it
				 * if the filter on the listenerWidget doesn't need to change, do nothing
				 */
				var upperFilter = this._getSearchConstraint().split("/").slice(-1)[0]; // last item in path
				if (upperFilter) {
					var lowerOptionFilter = listenerWidget.searchWidget._datasource.getConstraints();
					var newLowerOptionFilter = "[(" + listenerWidget.listenPath + "/" + upperFilter;

					if (lowerOptionFilter != newLowerOptionFilter) {
						// set new constraint
						listenerWidget.searchWidget._datasource.setConstraints(newLowerOptionFilter);
						// reload
						listenerWidget.searchWidget._datasource.reload();
						// reinit
						listenerWidget.searchWidget.reinit();
						listenerWidget._clear(true);
					}
				} else {
					listenerWidget.searchWidget._datasource.setConstraints();
					// reload
					listenerWidget.searchWidget._datasource.reload();
					// reinit
					listenerWidget.searchWidget.reinit();
					listenerWidget._clear(true);
				}
			}
		}
	});
});
