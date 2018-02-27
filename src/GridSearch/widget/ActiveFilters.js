define([
    "dojo/_base/declare",
	"GridSearch/widget/Core",
    "dojo/_base/lang",
    "dojo/query",
	"dojo/dom-construct",

    "dojo/text!GridSearch/widget/template/ActiveFilters.html"
], function(declare, Core, dojoLang, dojoQuery, domConstruct, widgetTemplate) {
    "use strict";

    return declare("GridSearch.widget.ActiveFilters", [Core], {

        templateString: widgetTemplate,

        // Internal variables.
        _handles: null,
        _contextObj: null,

        //modeler
		searchOptions: null,
		blankOptionLabel: "",

        postCreate: function() {
            logger.debug(this.id + ".postCreate");

			//retrieve state (if available)
			//this.selectNode.value = this.getState("activeFilters", "");

			if(!this._activeFilterWidgets[this.mxform.id]) {
				this._activeFilterWidgets[this.mxform.id] = {};
			}
			this._activeFilterWidgets[this.mxform.id][this.targetGridName] = this;
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

			//this._setupGrid();

            this._contextObj = obj;
            if(callback) {callback()};
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },
        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },
		storeState: function(t) {
			//t("selection", this.selectNode.value);
		},

		_getSearchConstraint: function() {
			var constraint,
			outvalue = "";
			if (this.selectNode.value === "") {
				outvalue =  "";
			} else {
				outvalue = this.searchOptions[this.selectNode.value].optionXPath.replace(/\r\n/g, ' ');
			}

			if (outvalue) {
				this._currentFilter = this.selectNode.value;
			} else {
				this._currentFilter = null;
			}
			//this.onSearchChanged();
			return outvalue;
		},
        _clear: function() {
            //this.searchNode.value = "";
			//TODO: figure out how clearing should function across widgets
        },
    });
});

require(["GridSearch/widget/ActiveFilters"]);
