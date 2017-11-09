define([
    "dojo/_base/declare",
    "GridSearch/widget/Core",
    "dojo/_base/lang",
    "dojo/query",
    "dojo/dom-construct",
    "dojo/text!GridSearch/widget/template/AssociationCheckbox.html"
], function(declare, Core, dojoLang, dojoQuery, domConstruct, widgetTemplate) {
    "use strict";

    return declare("GridSearch.widget.AssociationCheckbox", [Core], {

        templateString: widgetTemplate,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _enumOptions: null,
		_pathToAttribute: "",
		//_pathPart:"",

        //modeler
		referenceToAttribute: "",
		referenceSetToAttribute: "",

        constructor: function() {
            this._enumOptions = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");



            //retrieve state (if available)
            //not supported in v1
            //implement this.getState and the saveState function to store and retrieve selections
            //this.selectNode.value = this.getState("selection", "");
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");
            this._setupGrid();
            if (this._grid) {
                //if the grid is set to wait for search, ensure we set the "_searchFilled" flag
                if (this._grid.config && this._grid.config.gridpresentation && this._grid.config.gridpresentation.waitforsearch && this.selectNode.value) {
                    this._grid._searchFilled = true;
                }
            }

            this._contextObj = obj;

			if (this._contextObj && this.filterLabelAttribute) {
				this.filterLabel = this._contextObj.get(this.filterLabelAttribute);
			}
			//get options
			this._populateAssociationFilterOptions();

			if (callback) {
                callback()
            };
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },
        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },
        storeState: function(t) {
            //TODO: implement for v1
            //t("selection", this.selectNode.value);
        },

        _populateAssociationFilterOptions: function() {
			var labelAttribute, xPathAttribute, filterLabelAttribute;
			if (this.filterType === "xpath") {
				labelAttribute = this.labelAttribute
				xPathAttribute = this.xPathAttribute;
				filterLabelAttribute = this.filterLabelItemAttribute;
			} else {
				if(this.filterType === "reference") {
					this._pathToAttribute = this.referenceToAttribute
				} else if (this.filterType === "referenceSet") {
					this._pathToAttribute = this.referenceSetToAttribute;
				}
				var splitPath = this._pathToAttribute.split("/");
	            labelAttribute = splitPath[splitPath.length - 1];
				filterLabelAttribute = labelAttribute;
			}

			var myXPath = "//" + this.filterEntity;
			if (this.constraint) {
				myXPath = myXPath + this.constraint;
			}
			if (this.mxcontext) {
				myXPath = window.mx.parser.replaceXPathTokens(myXPath, this.mxcontext);
			}
            var categoryArgs = {
                xpath: myXPath,
                callback: dojoLang.hitch(this, function(objs) {
                    for (var i = 0; i < objs.length; i++) {
                        this._addCheckbox(objs[i], labelAttribute, filterLabelAttribute, xPathAttribute);
                    }
                })
            };

            mx.data.get(categoryArgs);

        },

        //Creates a single checkbox given an object
        _addCheckbox: function(filterObj, labelAttribute, filterLabelAttribute, xPathAttribute) {
            if (filterObj) {

                var inputLabel, inputValue, inputFilterValue, tempInputNode, tempLabelNode, tempCountNode, wrapperNode, count;
                var xpath = '', escapedXPath;

                inputValue = filterObj.get(labelAttribute);
				inputFilterValue = filterObj. get(filterLabelAttribute)
                //if (singleEnumMap.jsonData.attributes.xpath.value != null)
                //    xpath = escape(singleEnumMap.jsonData.attributes.xpath.value);
				if (xPathAttribute) {
					xpath = filterObj.get(xPathAttribute);
				} else {
					xpath = this._pathToAttribute + " = '" + inputValue + "'";
				}
				escapedXPath = escape(xpath);
                //	tempInputNode = domConstruct.toDom("<input type='checkbox' value='" + inputLabel +"/"+ count+"/"+ xpath+"'>");
                tempInputNode = domConstruct.toDom("<input type='checkbox' value='" + escapedXPath + " 'label='" + inputValue + " 'filterlabel='" + inputFilterValue +"'>");
                tempLabelNode = domConstruct.toDom("<label>" + inputValue + "</label>");


                var childDiv;
                childDiv = document.createElement('div');
                childDiv.appendChild(tempInputNode);
                childDiv.appendChild(tempLabelNode);

                //var countDiv;
                //countDiv = document.createElement('div');
                //countDiv.appendChild(tempCountNode);
                //  childDiv.appendChild(tempCountNode);


                if (xpath != '') {
                    var countXpath = "//" + this.gridEntity + "[" + xpath + "]"

					//Add the grid's static constraints if there are any when getting counts.
					var grid = this._grid,
		                datasource = grid._datasource
		            if (!datasource) {
		                datasource = grid._dataSource;
		            }
					if (datasource._staticconstraint) {
						countXpath = countXpath + datasource._staticconstraint;
					}

                    var countArgs = {
                        xpath: countXpath,
						count: true,
                        callback: dojoLang.hitch(this, function(objs, agg) {
                            //var countDiv = document.createElement('div');
                            var tempCountNode = domConstruct.toDom("<label> (" + agg.count + ")</label>");
                            //  countDiv.appendChild(tempCountNode);
                            childDiv.appendChild(tempCountNode);
                        })
                    };
                    count = mx.data.get(countArgs);

                }

                this.filterContainer.appendChild(childDiv);
                //wrapperNode.appendChild(countDiv);
                this._enumOptions.push(tempInputNode);

                tempInputNode.addEventListener("click", dojoLang.hitch(this, function(event) {
                    this._optionSelected();
                }));
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
            if (grid.config && grid.config.gridpresentation && grid.config.gridpresentation.waitforsearch) {
                if (newConstraint) {
                    grid._searchFilled = true;
                } else {
                    //grid._searchFilled = false; //grid doesn't refresh or empty if you do this
                    datasource.setConstraints("[1=0]");
                }
            }

            this._reloadGrid();
        },
        _getSearchConstraint: function() {

            var constraint = "[";
            var indicator = false;
			var filterLabel = "";

            //[TestSuite.Category_Shade/TestSuite.Shade/name = '' and TestSuite.Category_Shade/TestSuite.Shade/TestSuite.Attributes_Shade/TestSuite.Attributes/name = '']
			var checkedOptions = [];

            for (var i = 0; i < this._enumOptions.length; i++) {
				var currentInput = this._enumOptions[i];

                if (currentInput.checked) {
					checkedOptions.push(currentInput);
					indicator = true;
				}
			}
			for (var j = 0; j < checkedOptions.length; j++) {
				var currentInput = checkedOptions[j];
		        var xPath = '';
                var checkBoxValue, filter1, filter2, filterXpath;
                xPath = "(";
                checkBoxValue = currentInput.value
                if (checkBoxValue) {
                    filterXpath = unescape(checkBoxValue);
                }
                xPath = xPath + filterXpath + ")";

                if (xPath) {
					constraint = constraint + xPath + "or";

					//Create a nice string of the selected options
					var appendLabel = "";
					if (checkedOptions.length > 2 && j !== 0) { //there are more than 2 options in the list and this isn't the first one.
						appendLabel = appendLabel + ", ";
						if (j === checkedOptions.length - 1) {
							appendLabel = appendLabel + "or ";
						}
					} else if (checkedOptions.length === 2 && j === 1) { //there's only 2 options in the list and this is the second one
						appendLabel = appendLabel + " or ";
					}

					filterLabel = filterLabel + appendLabel + currentInput.attributes.filterlabel.value;

                }
            }

            if (indicator) {
                constraint = constraint.substring(0, constraint.length - 2) + "]";
				//filterLabel = filterLabel.substring(0,filterLabel.length-4);
            } else {
                constraint = "";
            }
			if (constraint) {
				this._currentFilter = filterLabel;
			} else {
				this._currentFilter = null;
			}
			this.onSearchChanged();

            return constraint;

        },
        _clear: function() {
            //this.searchNode.value = "";
			for(var i=0; i<this._enumOptions.length; i++) {
				var currentInput = this._enumOptions[i];
				currentInput.checked = false;
			}
			this._currentFilter = null;
			this._fireSearch();
		},
    });
});

require(["GridSearch/widget/AssociationCheckbox"]);