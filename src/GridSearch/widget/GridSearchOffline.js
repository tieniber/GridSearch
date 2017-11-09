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

    return declare("GridSearch.widget.GridSearchOffline", [_WidgetBase, _TemplatedMixin], {

        templateString: widgetTemplate,


        widgetBase: null,
        searchMethodParam: "",

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _searchMethod: "starts-with",

        //modeler
        gridEntity: null,
        searchEntity: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            if (this.searchMethodParam === "startswith") {
                this._searchMethod = "starts-with";
            } else {
                this._searchMethod = "contains";
            }

            this.connect(this.buttonNode, "click", "_clear");
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            var gridNode = dojoQuery(".mx-name-" + this.targetGridName)[0];
            if (gridNode) {
                this._grid = dijit.registry.byNode(gridNode);
                if (this._grid) {
                    this.connect(this.searchNode, "keyup", "_searchKeyDown");
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
            if (callback) callback();
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
                self._updateConstraints();
            }, 500);
        },

        _updateConstraints: function() {
            var grid = this._grid,
                datasource = grid._datasource;

            if (!datasource) {
                datasource = grid._dataSource;
            }

            if (this.searchNode.value === "") {
                datasource._constraints = null;
            } else {
                datasource.setConstraints({ attribute: this.searchAttribute, operator: this.searchMethodParam, value: this.searchNode.value });
                // datasource._constraints = [{ attribute: this.searchAttribute, operator: this.searchMethodParam, value: this.searchNode.value }];
            }
            if (grid.reload) {
                //data grid and template grid
                grid.reload();
            } else {
                //list view
                grid.update();
            };
        },

        _clear: function(e) {
            this.searchNode.value = "";
            dojoClass.add(this.buttonNode, "hidden");

            this._updateConstraints();
        }
    });
});

require(["GridSearch/widget/GridSearchOffline"]);