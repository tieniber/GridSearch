define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
	"mxui/mixin/_Stateful",
	"dijit/_TemplatedMixin",
    "dojo/query",
	"dojo/_base/lang",
	"dijit/registry",
	"dojo/promise/all",
	"dojo/Deferred"

], function(declare, _WidgetBase, _StatefulMixin, _TemplatedMixin, dojoQuery, dojoLang, registry, all, Deferred) {
    "use strict";

    return declare("GridSearch.widget.Core", [_WidgetBase, _StatefulMixin, _TemplatedMixin], {

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

		constructor: function() {
			this._grids = [];	
		},
		postCreate: function() {
			if(this.targetGridName !== '') {
				this.targetGridClass = "mx-name-" + this.targetGridName;
			}
		},
		superPostCreate: function() {
			if(this.targetGridName !== '') {
				this.targetGridClass = "mx-name-" + this.targetGridName;
			}
		},

        _getSearchConstraint: function() {
			console.error("Widget not implemented properly. A searching widget should implement a _getSearchContraint function.")
        },
		_clear: function() {
			//this function should clear the search widget
			console.error("Widget not implemented properly. A searching widget should implement a _clear function.")
		},
		_setupGrid: function(callback) {
			setTimeout(this._setupGridNoDelay.bind(this, callback), 500);
		},

		_setupGridNoDelay: function(callback) {
			if(!this._searchWidgets[this.targetGridClass]) {
				this._searchWidgets[this.targetGridClass] = [];
			}
			this._searchWidgets[this.targetGridClass].push(this);
			var nodeList = dojoQuery("." + this.targetGridClass);

            var gridNodes = nodeList; // ? nodeList[nodeList.length-1]: null;
			var promises = [];
			for (var i=0; i<gridNodes.length; i++) {
				promises.push(this._connectOneGrid(gridNodes[i]));
			} 
			var self = this;
			all(promises).then(function(results) {
				self._grids = results;
				if(callback) callback();
			});
			if (!gridNodes) {
                console.log("Could not find the list node(s).");
            }
		},
		_connectOneGrid: function(gridNode, tries) {
			var deferred = new Deferred();

			var grid = dijit.registry.byNode(gridNode);
			if (grid) {
				//this._grids.push(grid);
				//Fix for 7.12+ where _datasource.setConstraints doesn't exist anymore
				if(grid._datasource && !grid._datasource.setConstraints) {
					grid._datasource.setConstraints = function(newConstraint) {
						this._constraints = newConstraint;
					}
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
		_fireSearchWithDelay: function() {
			clearTimeout(this._searchTimeout);
			var self = this;
			this._searchTimeout = setTimeout(function() {
				self._fireSearch();
			}, 250);
		},
		_fireSearch: function() {
			var constraints = this._getSearchConstraintAllSearchBoxes();
			for (var i=0; i<this._grids.length; i++) {
				this._fireSearchOneGrid(this._grids[i], constraints);
			}
			console.log("Fired search for " + this._grids.length + " grids.")
		},
		_fireSearchOneGrid: function(grid, constraints) {
            var datasource = grid._datasource,
                self = this;

            if (!datasource) {
                datasource = grid._dataSource;
            }

			datasource.setConstraints(constraints);
			console.log("set constraints for grid: " + grid.id)		

			//if the grid is set to wait for search, ensure we set the "_searchFilled" flag
			if(grid.config && grid.config.gridpresentation && grid.config.gridpresentation.waitforsearch) {
				if(constraints) {
					grid._searchFilled = true;
				} else {
					//grid._searchFilled = false; //grid doesn't refresh or empty if you do this
					datasource.setConstraints("[1=0]");
				}
			}
			self.onSearchChanged();
			self._reloadGrid();

		},
		_getSearchConstraintAllSearchBoxes: function() {
			var searchWidgets = this._searchWidgets[this.targetGridClass];
			var fullConstraint = "";
			for (var i=0; i<searchWidgets.length; i++) {
				var searchWidget = searchWidgets[i];
			  fullConstraint = fullConstraint + searchWidget._getSearchConstraint();
			}
			return fullConstraint;
		},
		_clearAllSearchBoxes: function(e) {
			var searchWidgets = this._searchWidgets[this.targetGridClass];

			for (var i=0; i<searchWidgets.length; i++) {
			  searchWidgets[i]._clear();
			}

			this._fireSearch();
		},
        _reloadGrid: function() {
			for (var i=0; i<this._grids.length; i++) {
				this._reloadOneGrid(this._grids[i]);
			}
		},
		_reloadOneGrid: function(grid) {
        	if (grid.reload) {
        		grid.reload();
        	} else if (grid.update) {
        		grid.update();
        	} else {
        		console.log("Could not find the grid refresh/reload function");
        	}
		},
		onSearchChanged: function() {
			//this function exists so it can be fired when the search input changes. The Active Filters widget relies on it to update its rendering.

			var activeFilterWidget;
			if(this._activeFilterWidgets[this.mxform.id]) {
				activeFilterWidget = this._activeFilterWidgets[this.mxform.id][this.targetGridClass];
			}
			if(!activeFilterWidget && this.mxform.place === "custom") { //we have loaded these filters in a sub-form (like a sidebar), find the master form
				var parentWidget = registry.getEnclosingWidget(this.mxform.domNode);
				if(parentWidget && this._activeFilterWidgets[parentWidget.mxform.id]) {
					activeFilterWidget = this._activeFilterWidgets[parentWidget.mxform.id][this.targetGridClass];
				}
			}
			if(activeFilterWidget) {
				if(!this._activeFilterDiv) {
					this._activeFilterDiv = document.createElement("div");
					this._activeFilterDiv.addEventListener("click", dojoLang.hitch(this, function() {
						this._clear();
						this.onSearchChanged();
						this._fireSearch();
					}));
					activeFilterWidget.activeFilters.appendChild(this._activeFilterDiv);
				}
				this._activeFilterDiv.innerHTML = this.filterLabel + ": " + this._currentFilter;
				if(this._currentFilter) {
					this._activeFilterDiv.style.display = "inline-block";
				} else {
					this._activeFilterDiv.style.display = "none";
				}
			}
		},
		uninitialize: function() {
			var index = this._searchWidgets[this.targetGridClass].indexOf(this);
			if (index > -1) {
				this._searchWidgets[this.targetGridClass].splice(index, 1);
			}
		}
    });
});
