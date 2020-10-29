define([
    "dojo/_base/declare",
    "GridSearch/widget/Core"
], function (declare, Core) {
    "use strict";

    return declare("GridSearch.widget.ButtonFilter", [Core], {
        //modeler
        targetGridName: null,
        targetGridClass: null,
        gridEntity: null,
        filterLabel: null,
        groupedButtons: null,
        allowMultiselect: null,
        searchOptions: null, // {optionLabel, optionXPath, isDefault}
        xpathAttribute: null,
        activeClass: null,
        multiselectBehavior: null,
        _currentFilter: null,
        _currentFilterXpath: null,
        _clickedButtons: null,
        _defaultButton: null,
        _buttonEls: null,

        /**
         * @override
         * @todo [] - set the value to be displayed in active filters in _currentFilter
         * @todo [x] - return the xpath to apply
         */
        _getSearchConstraint: function () {
            return this._currentFilterXpath || "";
        },
        /**
         * @override
         * @todo [x] - set the _currentFilter to null
         * @todo [] - clear the inputs
         */
        _clear: function (shouldReload) {
            //this function should clear the search widget
            this._resetActiveClassOnAllButtons();
            this._clickedButtons = [];
            this._currentFilterXpath = "";
            this._currentFilter = null;

            if (shouldReload) {
                this._fireSearch();
            }
        },

        /**
         * render the buttons and setup the events
         */
        postCreate: function () {
            this._clickedButtons = [];
            this.superPostCreate();
            var anchor = this.domNode;
            this._buttonEls = [];
            for (var i = 0; i < this.searchOptions.length; i++) {
                var newButton = document.createElement("button");
                newButton.className = "btn btn-default btn-filter";
                newButton.innerText = this.searchOptions[i].optionLabel;
                newButton.dataset.filter = this.searchOptions[i].optionXPath;
                this._buttonEls.push(newButton);
                anchor.appendChild(newButton);
                this.connect(newButton, "click", function (e) {
                    this._onButtonClick(e.target);
                }.bind(this));
                if (this.searchOptions[i].isDefault) {
                    this._defaultButton = newButton;
                }
            }
            if (this.groupedButtons) {
                this.domNode.classList.add('btn-group')
            }
        },

        /** 
         * @override
         */
        update: function (obj, callback) {
            // call _setupgrid with a callback here
            this._setupGrid(this._finishGridSetup.bind(this));
            this._contextObj = obj;
            if (callback) { callback() };
        },

        /**
         * @override
         * This method is from the stateful plugin, so we need to implement it here.
         * this doesn't actually do anything useful, as far as I can tell. Unsure how to actually retrieve 
         *   this value from the store.
         */
        storeState: function (t) {
            t("searchValue", this._contextObj.get(this.xpathAttribute));
        },

        _finishGridSetup: function (callback) {
            if (this._grids) {
                //if the grid is set to wait for search, ensure we set the "_searchFilled" flag
                for (var i = 0; i < this._grids.length; i++) {
                    var curGrid = this._grids[i];
                    if (curGrid.config && curGrid.config.gridpresentation && curGrid.config.gridpresentation.waitforsearch && this.searchNode.value) {
                        curGrid._searchFilled = true;
                    }
                }
                if (this.showCounts) {
                    this._addCountsToAllButtons();
                }
                if (this._defaultButton) {
                    // there's a default search, so fire it.
                    this._onButtonClick(this._defaultButton);
                    // this._fireSearchWithDelay();
                }
            }
        },

        /**
         * On Button Click
         * @param {HTMLElement} button - the button that was clicked.
         * --
         * 1. Apply the filter from the button's dataset
         * 2. Toggle the active class on the clicked button
         * 3. Remove the active class from all other buttons
         */
        _onButtonClick: function (button) {
            // 1. Apply the filter
            var index = this._clickedButtons.indexOf(button)
            if (index > -1) {
                this._clickedButtons.splice(index, 1)
            } else {
                if (!this.allowMultiselect) {
                    this._clickedButtons = [button];
                } else {
                    this._clickedButtons.push(button);
                }
            }

            var newFilter = this._getCurrentXpathAndFilterLabel();
            this._currentFilter = newFilter.label;
            this._currentFilterXpath = newFilter.xpath;

            this._fireSearch();

            // 3. Remove all active classes from the buttons
            this._resetActiveClassOnAllButtons();
            if (this.showCounts) {
                this._addCountsToAllButtons();
            }


            // 2. Toggle the active class on this button
            for (var i = 0; i < this._clickedButtons.length; i++) {
                this._clickedButtons[i].classList.add(this.activeClass);
            }
        },

        /**
         * return the right xpath and label based on the checked buttons, and the
         * multiselect behavior
         * @returns {xpath, label} - {xpath, label}
         */
        _getCurrentXpathAndFilterLabel: function () {
            var ret = { xpath: "", label: "" };
            var separator = this.multiselectBehavior;
            for (var i = 0; i < this._clickedButtons.length; i++) {
                ret.xpath += this._clickedButtons[i].dataset.filter;
                ret.label += this._clickedButtons[i].innerText;
                if (i < this._clickedButtons.length - 1) {
                    ret.xpath += separator
                    ret.label += " " + separator + " "
                }
            }
            ret.xpath = ret.xpath.split("]" + separator + "[").join(" " + separator + " ");
            return ret;
        },

        _resetActiveClassOnAllButtons: function () {
            for (var i = 0; i < this._buttonEls.length; i++) {
                this._buttonEls[i].classList.remove(this.activeClass);
            }
        },

        _isEmptyObject: function (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key))
                    return false;
            }
            return true;
        },
        /**
         * countToTemplate
         * @param {number} count 
         */
        _countToTemplate: function (count) {
            return " (" + count + ")";
        },
        _addCountToOneButton: function (button) {
            var fullXpath = button.dataset.filter;
            mx.data.get({
                xpath: "//" + this.gridEntity + fullXpath,
                count: true,
                filter: { amount: 1 },
                callback: function (objs, count) {
                    button.dataset.badge = (this.countDisplay === "parens" ? this._countToTemplate(count.count) : count.count)
                }.bind(this),
                error: function (err) {
                    console.error(err);
                }
            });
        },
        _addCountsToAllButtons: function () {
            for (var i = 0; i < this._buttonEls.length; i++) {
                this._addCountToOneButton(this._buttonEls[i]);
            }
        }


    });
});
require(["GridSearch/widget/ButtonFilter"]);
