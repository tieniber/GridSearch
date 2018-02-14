define([
    "dojo/_base/declare",
	"GridSearch/widget/Core",
    "dojo/dom-class",
    "dojo/_base/lang",
    "dojo/query",

    "dojo/text!GridSearch/widget/template/GridSearch.html"
], function(declare, Core, dojoClass, dojoLang, dojoQuery, widgetTemplate) {
    "use strict";

    return declare("GridSearch.widget.GridSearch", [Core], {

        templateString: widgetTemplate,

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
			this.connect(this.searchNode, "keyup", "_clearOnEscape");

			//retrieve state (if available)
			this.searchNode.value = this.getState("searchValue", "");
			this._updateClearButtonRendering();
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");
			this._setupGrid(this._finishGridSetup.bind(this));
            this._contextObj = obj;
            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },
		storeState: function(t) {
			t("searchValue", this.searchNode.value);
		},
        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

           if(callback) {callback()};
		},
		_finishGridSetup: function() {
			if (this._grid) {
                this.connect(this.searchNode, "keyup", "_searchKeyDown");
				if (!this._grid.gridSearchWidgets) {
					this._grid.gridSearchWidgets = {};
				}
				this._grid.gridSearchWidgets[this.id] = this;
				//if the grid is set to wait for search, ensure we set the "_searchFilled" flag
				if(this._grid.config && this._grid.config.gridpresentation && this._grid.config.gridpresentation.waitforsearch && this.searchNode.value) {
					this._grid._searchFilled = true;
				}
            }
		},
        _getSearchConstraint: function() {
            var value = this.searchNode.value.replace(/''/g, '\'\''),
                searchParams = [],
                attributes = this.searchAttributes,
				outvalue = "";
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
							var searchPath = attr.searchAttributeParam.substring(0, attr.searchAttributeParam.lastIndexOf("/"));
							var searchAttribute = attr.searchAttributeParam.substring(attr.searchAttributeParam.lastIndexOf("/") + 1, attr.searchAttributeParam.length);

							if(searchPath) {
								searchParams.push(searchPath + "[" + attr._searchMethod + "(" + searchAttribute + ",'" + value + "')]");
							} else {
								searchParams.push(attr._searchMethod + "(" + searchAttribute + ",'" + value + "')");
							}
							outvalue =  "[" + searchParams.join(" or ") + "]";
						} else {
						//advanced search
							searchParams.push(attr.customSearchPath + "[" + attr._searchMethod + "(" + attr.customSearchAttribute + ",'" + value + "')]");
							outvalue =  "[" + searchParams.join(" or ") + "]";
						}
	                }
				} else {
					//expert search
					outvalue = this.expertQuery.replace(/{\[1\]}/g, value).replace(/\r\n/g, ' ').replace(/''/g, '\'\'');
				}
			} else {
            	outvalue = "";
        	}

			if (outvalue) {
				this._currentFilter = value;
			} else {
				this._currentFilter = null;
			}
			this.onSearchChanged();
			return outvalue;
        },
        _updateClearButtonRendering: function() {
        	if (this.searchNode.value === "") {
                dojoClass.add(this.buttonNode, "hidden");
            } else {
                dojoClass.remove(this.buttonNode, "hidden");
            }
        },
        _searchKeyDown: function() {
			this._updateClearButtonRendering();
			this._fireSearch();
        },
		_clearOnEscape: function(e) {
		 if (e.keyCode == 27) {
			 this._clearAllSearchBoxes();
		 }
		},
        _clear: function() {
            this.searchNode.value = "";
            dojoClass.add(this.buttonNode, "hidden");
			this._currentFilter = null;
			this._fireSearch();
		},
        _reloadGrid: function() {
			if (this._grid.update) {
        		this._grid.update();
        	} else if (this._grid.reload) {
				this._grid.reload();
        	} else {
        		console.log("Could not find the grid refresh/reload function");
        	}
        }
    });
});

require(["GridSearch/widget/GridSearch"]);
