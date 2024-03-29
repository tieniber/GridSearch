define([
    "dojo/_base/declare",
    "GridSearch/widget/Core",
    "dojo/dom-class",
    "dojo/_base/lang",
    "dojo/query",
    "dojo/aspect",
    "dojo/dom-construct",
    //"mxui/widget/SearchInput",
    "dijit/_TemplatedMixin",
    "dojo/text!GridSearch/widget/template/GridSearchMX.html"
], function (declare, Core, dojoClass, dojoLang, dojoQuery, aspect, domConstruct, /*searchInput,*/ _TemplatedMixin, widgetTemplate) {
    "use strict";

    return declare("GridSearch.widget.GridSearchMX", [Core, _TemplatedMixin], {

        templateString: widgetTemplate,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _searchEntity: null,
        _searchAttribute: null,
        _renderingComplete: false,

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
            startswith: "starts-with"
        },

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            this.superPostCreate();

            this.pathToAttribute = this.pathToAttribute || this.stringPathToAttribute;
        },

        update: function (obj, callback) {

            this._setupGrid();
            if (!this._renderingComplete || this._contextObj !== obj) {
                this._contextObj = obj;
                this._currentFilter = null;
                this.onSearchChanged();
                this._updateRendering(callback);
            } else {
                if (callback) { callback() };
            }

        },
        _updateRendering: function (callback) {
            //clean up any old widget before building a new one
            if (this.searchWidget) {
                this.domNode.removeChild(this.searchWidget.domNode);
                this.searchWidget.uninitialize();
            }

            //set up parameters for the Mendix SearchInput widget
            var parameters = {
                searchInputName: this.id.toString(),
                defaults: "",
                defaultsParser: "Simple",
                caption: this.caption,
                path: this.pathToAttribute,
                operator: this.operators[this.searchType]
            };

            this._getAttributeDetails();

            if (this.getState("searchValue")) {
                parameters.defaults = this.getState("searchValue");
            }

            if (this._type === "comparison") {
                //check if the attribute is a date
                if (this._attributeType === "date") {
                    parameters.defaultsParser = "Date";
                    parameters.queryBuilder = {
                        name: "Date"
                    };
                    parameters.widget = {
                        type: "mxui.widget.DatePicker",
                        params: {
                            placeholder: "",
                            format: "",
                            mode: "date",
                            selector: "date"                            
                        }
                    };
                }
            } else if (this._type === "dropdown") {
                parameters.defaults = null;
                const dataSourceType = parseInt(mx.version) >= 9 ? "database" : "xpath";
                if (this._searchEntity === this.gridEntity) {
                    if (this._attributeType === "boolean") {
                        parameters.retriever = "Bool";
                    } else if (this._attributeType === "enum") {
                        parameters.retriever = "Enum";
                    }
                } else {
                    parameters.datasource = {
                        params: {},
                        type: dataSourceType,
                    };
                }

                if (parameters.datasource && parameters.datasource.type === dataSourceType) {
                    if (this.constraint) {
                        if (this._contextObj) {
                            this.constraint.replace("[%CurrentObject%]", this._contextObj.getGuid().toString());
                        }
                        parameters.datasource.params.constraint = this.constraint;
                    }
                }

                if (this.multiSelect) {
                    parameters.widget = {
                        type: "mxui.widget.SelectBox"
                    };
                }

                if (this.sort.length > 0) {
                    var sortArray = [];
                    for (var i = 0; i < this.sort.length; i++) {
                        var curSort = this.sort[i];
                        sortArray.push([curSort.attribute, curSort.direction]);
                    }
                    parameters.datasource.params.sort = sortArray;
                }
            } else {
                console.error("GridSearchMX type not set correctly. This is a JavaScript issue.");
            }

            this.searchWidget = new mxui.widget.SearchInput(dojoLang.mixin({
                entity: this.gridEntity,
                mxcontext: this.mxcontext
            }, parameters));
            //single select dropdown
            if (this.searchWidget._input) {
                this.connect(this.searchWidget._input, "onchange", this._fireSearch.bind(this));
            }
            //date selector
            this.searchWidget.onChange = this._fireSearch.bind(this);
            //multi-select dropdown
            if (this.searchWidget._widget) {
                aspect.after(this.searchWidget._widget, "_selectItem", this._fireSearch.bind(this));
            }
            //input
            this.searchWidget.onKeyUp = this._fireSearch.bind(this);
            this.domNode.appendChild(this.searchWidget.domNode);

            //remove the label if it's not wanted
            if (!this.showLabel) {
                dojoQuery(".mx-grid-search-label", this.searchContainer).forEach(domConstruct.destroy);
            }
            this._configEmptyCaption();

            this.searchWidget.startup();
            this.searchWidget.reinit(function () {
                // this.searchWidget._input ==> This is the select node, with options, but none are mendix widgets
            }.bind(this)); // CC hack fix for Mx 7

            this._renderingComplete = true;

            if (callback) { callback() };
        },
        storeState: function (t) {
            var currentVal = this.searchWidget.get("value");
            if (currentVal && this._attributeType === "date") {
                currentVal = currentVal.getTime();
            }
            if (currentVal) {
                t("searchValue", currentVal);
            }

        },
        _getAttributeDetails: function () {
            var pathSections = this.pathToAttribute.split("/");
            var searchEntity, searchAttribute;
            if (pathSections.length > 1) {
                searchEntity = pathSections[pathSections.length - 2];
                searchAttribute = pathSections[pathSections.length - 1];
            } else {
                searchEntity = this.gridEntity;
                searchAttribute = this.pathToAttribute;
            }

            var attributeType;
            var metaModel = mx.meta.getEntity(searchEntity);
            if (metaModel.isEnum(searchAttribute)) {
                attributeType = "enum";
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
        _getSearchConstraint: function () {
            var query = this.searchWidget._getQueryAttr();
            var outvalue;
            if (query) {
                outvalue = "[" + query + "]";
            } else {
                outvalue = "";
            }
            if (outvalue) {
                this._currentFilter = this.searchWidget._getValueAttr();
            } else {
                this._currentFilter = null;
            }
            //this.onSearchChanged();
            return outvalue;
        },
        _configEmptyCaption: function () {
            //set the empty label for single-select dropdowns
            if (this.emptyCaption && this.searchWidget._input) {
                window.setTimeout(this._updateEmptyCaptionSS.bind(this), 50);
                aspect.after(this.searchWidget, "_fillInput", this._updateEmptyCaptionSS.bind(this));
            }
            //set the empty label for multi-select dropdowns
            if (this.emptyCaption && this.multiSelect && this.searchWidget._widget && this.searchWidget._widget._textNode) {
                aspect.after(this.searchWidget._widget, "_updateCaption", this._updateEmptyCaptionMS.bind(this));
            }
        },
        _updateEmptyCaptionSS: function () {
            if (this.searchWidget._input && this.searchWidget._input.options[0]) {
                this.searchWidget._input.options[0].label = this.emptyCaption;
                this.searchWidget._input.options[0].innerText = this.emptyCaption; // fix for firefox
                this.searchWidget._input.selectedIndex = 0;
            }
        },
        _updateEmptyCaptionMS: function () {
            if (this.searchWidget._widget._textNode.nodeValue === "") {
                this.searchWidget._widget._textNode.nodeValue = this.emptyCaption;
            }
        },
        _clear: function (shouldReload) {
            this._currentFilter = null;
            this.onSearchChanged();
            this.searchWidget.reset();
            this._configEmptyCaption();

            if (shouldReload) {
                this._fireSearch();
            }
        }
    });
});
