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

        //modeler
		pathToAttribute: "",

		constructor: function() {
			this._enumOptions = [];
		},

    postCreate: function() {
        logger.debug(this.id + ".postCreate");

			//for version 1, we'll just be getting the options of an enumeration and presenting them here
			//in a later version, we'll support selecting data over an association as well

			//get static options
			this._populateAssociationFilterOptions();

			//retrieve state (if available)
			//not supported in v1
			//implement this.getState and the saveState function to store and retrieve selections
			//this.selectNode.value = this.getState("selection", "");
        },

        update: function(obj, callback) {
          logger.debug(this.id + ".update");
          this._setupGrid();
            if (this._grid) {
                //this.connect(this.selectNode, "onchange", "_optionSelected");
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
    			//TODO: implement for v1
    			//t("selection", this.selectNode.value);
    		},

		_populateAssociationFilterOptions: function() {

      var splitPath = this.pathToAttribute.split("/");
      var attrPart = splitPath[splitPath.length-1]; //this will get you the attribute name like "Name"
      var myXPath = "//" + splitPath[splitPath.length-2]; //this will get you an XPath string like "//TestSuite.Category"


      var categoryArgs = {
       xpath:myXPath,
       callback: dojoLang.hitch(this, function(objs) {
              for(var i=0; i<objs.length; i++) {
                     this._addLabels(objs[i], attrPart);
      }})
      };

      mx.data.get(categoryArgs);

		},

    _addLabels: function(filterLabels) {
			if(filterLabels) {

				var inputLabel, inputValue, tempInputNode, tempLabelNode, wrapperNode;
				inputLabel = filterLabels.jsonData.attributes.Name.value;
				wrapperNode = document.createElement("div");
				tempInputNode = domConstruct.toDom("<label class = 'filterCategory'>" + inputLabel + "</label>");

        wrapperNode.appendChild(tempInputNode);



        var splitFilterPath = this.pathToFilter.split("/");
        var filterPart = splitFilterPath[splitFilterPath.length-1]; //this will get you the attribute name like "Name"
        var myFilterXPath = "//" + splitFilterPath[splitFilterPath.length-2]; //this will get you an XPath string like "//TestSuite.Category"


        var filterArgs = {
         xpath:myFilterXPath,
         callback: dojoLang.hitch(this, function(objs) {
                for(var i=0; i<objs.length; i++) {
                       this._addCheckbox(objs[i], wrapperNode,inputLabel);
                }
         })
        };

        mx.data.get(filterArgs);
        domConstruct.place(wrapperNode, this.filterContainer);
		    }
		},

		//Creates a single checkbox given an enumeration mapping
		_addCheckbox: function(singleEnumMap,wrapperNode,inputLabel) {
			if(singleEnumMap) {

				var inputLabel, inputValue, tempInputNode, tempLabelNode, wrapperNode;

        inputValue = singleEnumMap.jsonData.attributes.Name.value;

				tempInputNode = domConstruct.toDom("<input type='checkbox' value='" + inputLabel +"/"+ inputValue+"'>");
				tempLabelNode = domConstruct.toDom("<label>" + inputValue + "</label>");

				wrapperNode.appendChild(tempInputNode);
				wrapperNode.appendChild(tempLabelNode);

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

			var constraint = "[";
      var indicator = false;

      for(var i=0; i<this._enumOptions.length; i++) {
				var currentInput = this._enumOptions[i];

				if (currentInput.checked) {
          indicator = true;
          var checkBoxValue,filter1,filter2;
           var xPath = "(";
          checkBoxValue = currentInput.value
          if(checkBoxValue){
            filter1 = checkBoxValue.split("/")[0]
            filter2 = checkBoxValue.split("/")[1]
          }
					xPath = xPath + this.pathToAttribute + "='" + filter1 + "' and "+ this.pathToFilter + "='" + filter2+ "')";
          if(xPath){
            constraint = constraint+xPath +"or";
          }
				}

			}

      if(indicator){
        constraint = constraint.substring(0,constraint.length -2)+"]";
      }else{
        constraint = "";
      }

			return constraint;

		},
    _clear: function() {
            //this.searchNode.value = "";
			//TODO: figure out how clearing should function across widgets
        },
    });
});

require(["GridSearch/widget/AssociationCheckbox"]);
