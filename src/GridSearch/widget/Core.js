define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
	"mxui/mixin/_Stateful",
	"dijit/_TemplatedMixin",
    "dojo/query",

], function(declare, _WidgetBase, _StatefulMixin, _TemplatedMixin, dojoQuery) {
    "use strict";

    return declare("GridSearch.widget.Core", [_WidgetBase, _StatefulMixin, _TemplatedMixin], {

        widgetBase: null,
        //searchMethodParam: "",

        // Internal variables.
        _contextObj: null,
		_grid: null,

        //modeler
        gridEntity: null,
		targetGridName: null,

        _getSearchConstraint: function() {
			console.error("Widget not implemented properly. A searching widget should implement a _getSearchContraint function.")
        },
		_clear: function() {
			//this function should clear the search widget
			console.error("Widget not implemented properly. A searching widget should implement a _clear function.")
		},

		_setupGrid: function() {
			var nodeList = dojoQuery(".mx-name-" + this.targetGridName)
            var gridNode = nodeList ? nodeList[nodeList.length-1]: null;
            if (gridNode) {
                this._grid = dijit.registry.byNode(gridNode);
                if (this._grid) {
					if (!this._grid.gridSearchWidgets) {
						this._grid.gridSearchWidgets = {};
					}
					this._grid.gridSearchWidgets[this.id] = this;
                } else {
                    console.log("Found a DOM node but could not find the grid widget.");
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
