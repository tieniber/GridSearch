define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/_base/lang",
    "dojo/query",

    "dojo/text!GridSearch/widget/template/GridSearch.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoClass, dojoStyle, dojoLang, dojoQuery, widgetTemplate) {
    "use strict";

    return declare("GridSearch.widget.GridSearch", [_WidgetBase, _TemplatedMixin], {

        templateString: widgetTemplate,


        widgetBase: null,
        //searchMethodParam: "",

        // Internal variables.
        _handles: null,
        _contextObj: null,
        //_searchMethod: "starts-with",

        //modeler
        gridEntity: null,
		minCharacters: 0,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");

            this.connect(this.buttonNode, "click", "_clearAllSearchBoxes");
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            var gridNode = dojoQuery(".mx-name-" + this.targetGridName)[0];
            if (gridNode) {
                this._grid = dijit.registry.byNode(gridNode);
                if (this._grid) {
                    this.connect(this.searchNode, "keyup", "_searchKeyDown");
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

            this._contextObj = obj;
            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

            mendix.lang.nullExec(callback);
        },
		_getSearchConstraintAllSearchBoxes: function() {
			var fullConstraint = "";
			for (var gridId in this._grid.gridSearchWidgets) {
			  fullConstraint = fullConstraint + this._grid.gridSearchWidgets[gridId]._getSearchConstraint();
			}
			return fullConstraint;
		},
        _getSearchConstraint: function() {
            var value = this.searchNode.value,
                searchParams = [],
                attributes = this.searchAttributes;
            if (value && value.length >= this.minCharacters) {
				if(!this.expertQuery) {
					//basic or advanced search
					for (var i = 0, attr; attr = attributes[i]; ++i) {
						if (attr.searchMethodParam === "startswith") {
			                attr._searchMethod = "starts-with";
			            } else {
			                attr._searchMethod = "contains";
			            }

						if(!attr.customSearchEntity) {
						//basic search
							if (this.gridEntity === attr.searchEntity) {
								searchParams.push(attr._searchMethod + "(" + attr.searchAttribute + ",'" + value + "')");
							} else {
								searchParams.push(attr.searchEntity + "[" + attr._searchMethod + "(" + attr.searchAttribute + ",'" + value + "')]");
							}
						} else {
						//advanced search
							searchParams.push(attr.customSearchPath + "[" + attr._searchMethod + "(" + attr.customSearchAttribute + ",'" + value + "')]");
						}
	                }
				} else {
					//expert search
					return this.expertQuery.replace(/{\[1\]}/g, value).replace(/\r\n/g, ' ').replace(/''/g, '\'\'');
				}

                return "[" + searchParams.join(" or ") + "]";
            } else if (this._grid.config.gridpresentation.waitforsearch) {
				return "[1=0]"
			} else {
            	return "";
        	}
        },
        _searchKeyDown: function() {
            var grid = this._grid,
                datasource = grid._datasource,
                self = this;

            if (!datasource) {
                datasource = grid._dataSource;
            }

            if (this.searchNode.value === "") {
                dojoClass.add(this.buttonNode, "hidden");
            } else {
                dojoClass.remove(this.buttonNode, "hidden");
            }

            clearTimeout(this._searchTimeout);
            this._searchTimeout = setTimeout(function() {
                datasource.setConstraints(self._getSearchConstraintAllSearchBoxes());

				//if the grid is set to wait for search, ensure we set the "_searchFilled" flag
				if(grid.config.gridpresentation.waitforsearch && self.searchNode.value) {
					grid._searchFilled = true;
				}

				grid.reload();
            }, 500);
        },
		_clearAllSearchBoxes: function(e) {
			for (var gridId in this._grid.gridSearchWidgets) {
			  this._grid.gridSearchWidgets[gridId]._clear();
			}
		},
        _clear: function(e) {
            this.searchNode.value = "";
            dojoClass.add(this.buttonNode, "hidden");
            var grid = this._grid,
                datasource = grid._datasource;

            if (!datasource) {
                datasource = grid._dataSource;
            }

            datasource.setConstraints(this._getSearchConstraintAllSearchBoxes());
            grid.reload();

        }
    });
});

require(["GridSearch/widget/GridSearch"]);
