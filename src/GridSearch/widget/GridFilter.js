define([
    "dojo/_base/declare",
	"GridSearch/widget/Core",
    "dojo/_base/lang",
    "dojo/query",
	"dojo/dom-construct",

    "dojo/text!GridSearch/widget/template/GridFilter.html"
], function(declare, Core, dojoLang, dojoQuery, domConstruct, widgetTemplate) {
    "use strict";

    return declare("GridSearch.widget.GridFilter", [Core], {

        templateString: widgetTemplate,

        // Internal variables.
        _handles: null,
        _contextObj: null,

        //modeler
		searchOptions: null,
		blankOptionLabel: "",

        postCreate: function() {
            logger.debug(this.id + ".postCreate");

			this.blankOption.text = this.blankOptionLabel;

			for (var i=0; i<this.searchOptions.length; i++) {
				var optionLabel,tempOptionNode;
				optionLabel = this.searchOptions[i].optionLabel;
				tempOptionNode = domConstruct.toDom("<option value=" + i + ">" + optionLabel + "</option>");
				domConstruct.place(tempOptionNode, this.selectNode);
			}

			//get dynamic options
			if(this.useDynamicOptions) {
				debugger;
				this._populateDynamicOptions();
			}

			//retrieve state (if available)
			this.selectNode.value = this.getState("selection", "");
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

			this._setupGrid();
            if (this._grid) {
                this.connect(this.selectNode, "onchange", "_optionSelected");
				if (!this._grid.gridSearchWidgets) {
					this._grid.gridSearchWidgets = {};
				}
				this._grid.gridSearchWidgets[this.id] = this;

				//if the grid is set to wait for search, ensure we set the "_searchFilled" flag
				if(this._grid.config && this._grid.config.gridpresentation && this._grid.config.gridpresentation.waitforsearch && this.selectNode.value) {
					this._grid._searchFilled = true;
				}
			}

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
			t("selection", this.selectNode.value);
		},

		_populateDynamicOptions: function() {
			var args = {
				xpath: this.dynamicOptionEntity,// + '[' + this.dynamicOptionXPath + ']',
				callback: this._addDynamicOption
			};
			mx.data.get(args, this);
		},
		_addDynamicOption: function(obj) {
			if(obj) {
				var nextIndex = this.searchOptions.length,
				optionLabel,tempOptionNode;
				optionLabel = obj.getCaption(this.dynamicOptionAttribute);
				optionValue = obj.get(this.dynamicOptionAttribute);
				tempOptionNode = domConstruct.toDom("<option value=" + nextIndex + ">" + optionLabel + "</option>");

				domConstruct.place(tempOptionNode, this.selectNode);
			}
		},
		_optionSelected: function() {
			var grid = this._grid,
                datasource = grid._datasource

            if (!datasource) {
                datasource = grid._dataSource;
            }

            var newConstraint = this._getSearchConstraintAllSearchBoxes();
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

			this._reloadGrid();
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
			this.onSearchChanged();
			return outvalue;
		},
        _clear: function() {
            this.searchNode.value = "";
			this._optionSelected();
			this._currentFilter = null;
			//TODO: figure out how clearing should function across widgets
        },
    });
});

require(["GridSearch/widget/GridFilter"]);
