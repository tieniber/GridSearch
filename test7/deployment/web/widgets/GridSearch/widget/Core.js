define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
	"mxui/mixin/_Stateful",
	"dijit/_TemplatedMixin",
    "dojo/query",
	"dojo/_base/lang",
	"dijit/registry",

], function(declare, _WidgetBase, _StatefulMixin, _TemplatedMixin, dojoQuery, dojoLang, registry) {
    "use strict";

    return declare("GridSearch.widget.Core", [_WidgetBase, _StatefulMixin, _TemplatedMixin], {

        widgetBase: null,
        //searchMethodParam: "",

        // Internal variables.
		_searchWidgets: {},
		_activeFilterWidgets: {},
        _contextObj: null,
		_grid: null,
		_currentFilter: null,
		_activeFilterDiv: null,
		_setupTries: 0,

        //modeler
        gridEntity: null,
		targetGridName: null,
		filterLabel: null,

        _getSearchConstraint: function() {
			console.error("Widget not implemented properly. A searching widget should implement a _getSearchContraint function.")
        },
		_clear: function() {
			//this function should clear the search widget
			console.error("Widget not implemented properly. A searching widget should implement a _clear function.")
		},
		onSearchChanged: function() {
			//this function exists so it can be fired when the search input changes. The Active Filters widget relies on it to update its rendering.

			var activeFilterWidget;
			if(this._activeFilterWidgets[this.mxform.id]) {
				activeFilterWidget = this._activeFilterWidgets[this.mxform.id][this.targetGridName];
			}
			if(!activeFilterWidget && this.mxform.place === "custom") { //we have loaded these filters in a sub-form (like a sidebar), find the master form
				var parentWidget = registry.getEnclosingWidget(this.mxform.domNode);
				if(parentWidget) {
					activeFilterWidget = this._activeFilterWidgets[parentWidget.mxform.id][this.targetGridName];
				}
			}
			if(activeFilterWidget) {
				if(!this._activeFilterDiv) {
					this._activeFilterDiv = document.createElement("div");
					this._activeFilterDiv.addEventListener("click", dojoLang.hitch(this, function() {
						this._clear();
						this.onSearchChanged();
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

		_setupGrid: function(callback) {
			if(!this._searchWidgets[this.mxform.id]) {
				this._searchWidgets[this.mxform.id] = {};
			}
			if(!this._searchWidgets[this.mxform.id][this.targetGridName]) {
				this._searchWidgets[this.mxform.id][this.targetGridName] = [];
			}
			this._searchWidgets[this.mxform.id][this.targetGridName].push(this);

			var nodeList = dojoQuery(".mx-name-" + this.targetGridName)
            var gridNode = nodeList ? nodeList[nodeList.length-1]: null;
            if (gridNode) {
                this._grid = dijit.registry.byNode(gridNode);
                if (this._grid) {
					
					//Fix for 7.12+ where _datasource.setConstraints doesn't exist anymore
					if(this._grid._datasource && !this._grid._datasource.setConstraints) {
						this._grid._datasource.setConstraints = function(newConstraint) {
							this._constraints = newConstraint;
						}
					}

					if (!this._grid.gridSearchWidgets) {
						this._grid.gridSearchWidgets = {};
					}
					this._grid.gridSearchWidgets[this.id] = this;
					if(callback) {callback();};
                } else {
					this._setupTries++;
					if (this._setupTries > 3) {
						console.log("Found a DOM node but could not find the grid widget. Tried 3 times");
					} else { //set a timer to try again shortly
						setTimeout(this._setupGrid.bind(this, callback), 500);
					}
                }
            } else {
                console.log("Could not find the list node.");
            }
		},
		_fireSearch: function() {
            var grid = this._grid,
                datasource = grid._datasource,
                self = this;

            if (!datasource) {
                datasource = grid._dataSource;
            }

			//this._updateClearButtonRendering();

            clearTimeout(this._searchTimeout);
            this._searchTimeout = setTimeout(function() {
				var newConstraint = self._getSearchConstraintAllSearchBoxes();
				datasource.setConstraints(newConstraint);				

				//if the grid is set to wait for search, ensure we set the "_searchFilled" flag
				if(grid.config && grid.config.gridpresentation && grid.config.gridpresentation.waitforsearch) {
					if(newConstraint) {
						grid._searchFilled = true;
					} else {
						//grid._searchFilled = false; //grid doesn't refresh or empty if you do this
						datasource.setConstraints("[1=0]");
					}
				}
				self.onSearchChanged();
				self._reloadGrid();
            }, 250);
        },
		_getSearchConstraintAllSearchBoxes: function() {
			var fullConstraint = "";
			for (var gridId in this._grid.gridSearchWidgets) {
			  fullConstraint = fullConstraint + this._grid.gridSearchWidgets[gridId]._getSearchConstraint();
			}
			return fullConstraint;
		},
		_clearAllSearchBoxes: function(e) {
			for (var gridId in this._grid.gridSearchWidgets) {
			  this._grid.gridSearchWidgets[gridId]._clear();
			}

			var grid = this._grid,
				datasource = grid._datasource;

			if (!datasource) {
				datasource = grid._dataSource;
			}

			datasource.setConstraints(this._getSearchConstraintAllSearchBoxes());
			this._reloadGrid();
		},
        _reloadGrid: function() {
        	if (this._grid.reload) {
        		this._grid.reload();
        	} else if (this._grid.update) {
        		this._grid.update();
        	} else {
        		console.log("Could not find the grid refresh/reload function");
        	}
        }
    });
});
