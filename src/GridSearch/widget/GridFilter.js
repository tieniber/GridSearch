define([
	"dojo/_base/declare",
	"GridSearch/widget/Core",
	"dojo/_base/lang",
	"dojo/query",
	"dojo/dom-construct",
	"dijit/_TemplatedMixin",
	"dojo/text!GridSearch/widget/template/GridFilter.html"
], function (declare, Core, dojoLang, dojoQuery, domConstruct, _TemplatedMixin, widgetTemplate) {
	"use strict";

	return declare("GridSearch.widget.GridFilter", [Core, _TemplatedMixin], {

		templateString: widgetTemplate,

		// Internal variables.
		_handles: null,
		_contextObj: null,

		//modeler
		searchOptions: null,
		blankOptionLabel: "",


		postCreate: function () {
			logger.debug(this.id + ".postCreate");
			this.superPostCreate();

			this.blankOption.text = this.blankOptionLabel;

			for (var i = 0; i < this.searchOptions.length; i++) {
				var optionLabel, tempOptionNode;
				optionLabel = this.searchOptions[i].optionLabel;
				tempOptionNode = domConstruct.toDom("<option data-default='" + this.searchOptions[i].isDefault + "' value=" + i + ">" + optionLabel + "</option>");
				domConstruct.place(tempOptionNode, this.selectNode);
			}

			//get dynamic options
			if (this.useDynamicOptions) {
				this._populateDynamicOptions();
			}

			//retrieve state (if available)
			if (this.getState("selection", "")) {
				this.selectNode.value = this.getState("selection", "");
			} else {
				// set to the default option
				var defaultOption = this.selectNode.querySelector("[data-default='true']");
				if (defaultOption && defaultOption.value) {
					this.selectNode.value = defaultOption.value;
				}
			}

		},

		update: function (obj, callback) {
			logger.debug(this.id + ".update");

			this._setupGrid(this._finishGridSetup.bind(this));

			this._contextObj = obj;
			if (callback) { callback() };
		},

		resize: function (box) {
			logger.debug(this.id + ".resize");
		},
		uninitialize: function () {
			logger.debug(this.id + ".uninitialize");
		},
		storeState: function (t) {
			t("selection", this.selectNode.value);
		},
		_finishGridSetup: function () {
			if (this._grids) {
				this.connect(this.selectNode, "onchange", "_fireSearch");
				//if the grid is set to wait for search, ensure we set the "_searchFilled" flag
				for (var i = 0; i < this._grids.length; i++) {
					var curGrid = this._grids[i];
					if (curGrid.config && curGrid.config.gridpresentation && curGrid.config.gridpresentation.waitforsearch && this.searchNode.value) {
						curGrid._searchFilled = true;
					}
				}
				if (this.searchOptions.find(function (opt) { return opt.isDefault })) {
					// there's a default search, so fire it.
					this._fireSearchWithDelay();
				}
			}
		},
		_populateDynamicOptions: function () {
			var args = {
				xpath: this.dynamicOptionEntity,// + '[' + this.dynamicOptionXPath + ']',
				callback: this._addDynamicOption
			};
			mx.data.get(args, this);
		},
		_addDynamicOption: function (obj) {
			if (obj) {
				var nextIndex = this.searchOptions.length,
					optionLabel, tempOptionNode;
				optionLabel = obj.getCaption(this.dynamicOptionAttribute);
				optionValue = obj.get(this.dynamicOptionAttribute);
				tempOptionNode = domConstruct.toDom("<option value=" + nextIndex + ">" + optionLabel + "</option>");

				domConstruct.place(tempOptionNode, this.selectNode);
			}
		},
		/*_optionSelected: function() {
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
		},*/
		_getSearchConstraint: function () {
			var constraint,
				outvalue = "";
			if (this.selectNode.value === "") {
				outvalue = "";
			} else {
				outvalue = this.searchOptions[this.selectNode.value].optionXPath.replace(/\r\n/g, ' ');
			}

			if (outvalue) {
				this._currentFilter = this.selectNode.querySelector("[value='" + this.selectNode.value + "']").innerText;

			} else {
				this._currentFilter = null;
			}
			//this.onSearchChanged();
			return outvalue;
		},
		_clear: function (shouldReload) {
			this.selectNode.value = "";
			this._currentFilter = null;
			
			if (shouldReload) {
				this.onSearchChanged();
			}
		},
	});
});

require(["GridSearch/widget/GridFilter"]);
