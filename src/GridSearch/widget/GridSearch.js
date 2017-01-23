define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
	"dojo/query",

    "dojo/text!GridSearch/widget/template/GridSearch.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, dojoQuery, widgetTemplate) {
    "use strict";

    return declare("GridSearch.widget.GridSearch", [ _WidgetBase, _TemplatedMixin ], {

        templateString: widgetTemplate,


        widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
        },

        update: function (obj, callback) {
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
				console.log("Could not find the list view node.");
			}

            this._contextObj = obj;
            this._updateRendering(callback);
        },

        resize: function (box) {
          logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
          logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");

            mendix.lang.nullExec(callback);
        },
		_getSearchConstraint: function() {
	        var value = this.searchNode.value
	          , searchParams = []
	          , attributes = this.searchAttributes;
	        if (value) {
	            for (var i = 0, attr; attr = attributes[i]; ++i) {
	                searchParams.push("contains(" + attr.searchAttribute + ",'" + value + "')");
	            }
	            return "[" + searchParams.join(" or ") + "]";
	        }
		},
		_searchKeyDown: function () {
			var grid = this._grid
			  , datasource = grid._datasource
			  , self= this;

			if (!datasource) {
				 datasource = grid._dataSource;
			}
			clearTimeout(this._searchTimeout);
			this._searchTimeout = setTimeout(function() {
				datasource.setConstraints(self._getSearchConstraint());
				grid.reload();
			}, 500);
		}
    });
});

require(["GridSearch/widget/GridSearch"]);
