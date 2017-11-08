define([
    "dojo/_base/declare",
	"GridSearch/widget/Core",
    "dojo/dom-class",
    "dojo/_base/lang",
    "dojo/query",
	"dojo/aspect",
	"dojo/dom-construct",
	//"mxui/widget/SearchInput",
    "dojo/text!GridSearch/widget/template/GridSearchMX.html"
], function(declare, Core, dojoClass, dojoLang, dojoQuery, aspect, domConstruct, /*searchInput,*/ widgetTemplate) {
    "use strict";

    return declare("GridSearch.widget.GridSearchMX", [Core], {

        templateString: widgetTemplate,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _searchEntity: null,
		_searchAttribute: null,

        //modeler
        gridEntity: null,
		minCharacters: 0,

		operators: {
			gt: ">",
			gte: ">=",
			lt: "<",
			lte: "<=",
			eq: "=",
			neq: "!=",
			contains: "contains",
			startswith: "startswith"
		},

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");

			//set up parameters for the Mendix SearchInput widget
			var parameters = {
				searchInputName:this.id.toString(),
				defaults:"",
				defaultsParser:"Simple",
				caption: this.caption,
				path: this.pathToAttribute,
				operator: this.operators[this.searchType]
			};


			this._getAttributeDetails();

			if(this.getState("searchValue")) {
				parameters.defaults = this.getState("searchValue");
			}

			if(this._type === "comparison") {
				//check if the attribute is a date
				if(this._attributeType === "date") {
					parameters.defaultsParser = "Date";
					parameters.queryBuilder = {
		                name: "Date"
		            };
					parameters.widget = {
			            type: "mxui.widget.DatePicker",
						params: {
			            	placeholder: "",
			                format: ""
			            }
					};
				}
			} else if (this._type === "dropdown") {
				if (this._searchEntity === this.gridEntity) {
					if (this._attributeType === "boolean") {
						parameters.retriever = "Bool";
					} else if (this._attributeType === "enum") {
						parameters.retriever = "Enum";
					}
				} else {
					parameters.datasource = {
						params:{},
						type:"xpath"
					};
				}

				if(this.multiSelect) {
					parameters.widget = {
						type: "mxui.widget.SelectBox"
					};
				}
			} else {
				console.error("GridSearchMX type not set correctly. This is a JavaScript issue.");
			}

			this.searchWidget = new mxui.widget.SearchInput(dojoLang.mixin({
                entity: this.gridEntity,
                mxcontext: this.mxcontext
            }, parameters));
			//single select dropdown
			this.connect(this.searchWidget._input, "onchange", this._fireSearch.bind(this));
			//date selector
			this.searchWidget.onChange = this._fireSearch.bind(this);
			//multi-select dropdown
			if(this.searchWidget._widget) {
				aspect.after(this.searchWidget._widget, "_selectItem", this._fireSearch.bind(this));
			}
			//input
			this.searchWidget.onKeyUp = this._fireSearch.bind(this);
			this.domNode.appendChild(this.searchWidget.domNode);

			//remove the label if it's not wanted
			if(!this.showLabel) {
				dojoQuery(".mx-grid-search-label", this.searchContainer).forEach(domConstruct.destroy);
			}

			this.searchWidget.startup();
        },

        update: function(obj, callback) {


			this._setupGrid();
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
			var currentVal = this.searchWidget.get("value");
			if(currentVal && this._attributeType==="date") {
				currentVal = currentVal.getTime();
			}
			t("searchValue", currentVal);
		},
		_getAttributeDetails: function() {
			var pathSections = this.pathToAttribute.split("/");
			var searchEntity, searchAttribute;
			if (pathSections.length > 1) {
				searchEntity = pathSections[pathSections.length-2];
				searchAttribute = pathSections[pathSections.length-1];
			} else {
				searchEntity = this.gridEntity;
				searchAttribute = this.pathToAttribute;
			}

			var attributeType;
			var metaModel = mx.meta.getEntity(searchEntity);
			if (metaModel.isEnum(searchAttribute)) {
				attributeType =  "enum";
			} else if (metaModel.isDate(searchAttribute)) {
				attributeType = "date";
			} else if (metaModel.isBoolean(searchAttribute)) {
				attributeType = "boolean";
			} else {
				attributeType = "other";
			}

			this._searchEntity = searchEntity;
			this._searchAttribute = searchAttribute;
			this._attributeType = attributeType;
		},
		_getSearchConstraint: function() {
			var query = this.searchWidget._getQueryAttr();
			var outvalue;
			if (query) {
				outvalue =  "[" + query + "]";
			} else {
				outvalue = "";
			}
			if (outvalue) {
				this._currentFilter = this._searchWidget._getValueAttr();
			} else {
				this._currentFilter = null;
			}
			this.onSearchChanged();
			return outvalue;
		},
        _clear: function() {
			this.searchWidget.reset();

            this._currentFilter = null;
			this._fireSearch();
		}
    });
});
