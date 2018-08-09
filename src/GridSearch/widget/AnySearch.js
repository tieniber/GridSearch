define([
    "dojo/_base/declare",
    "GridSearch/widget/Core"
], function (declare, Core) {
    "use strict";

    return declare("GridSearch.widget.AnySearch", [Core], {
        //modeler
        targetGridName: null,
        targetGridClass: null,
        // attribute: null,
        xpathAttribute: null,
        // microflow: null,
        // nanoflow: null,
        /**
         * maybe will implement these later? so that the microflow doesn't have to run every time
         */
        // gridEntity: null,
        // gridAttribute: null,
        _currentFilter: null,

        /**
         * @override
         * @todo [x] - set the value to be displayed in active filters in _currentFilter
         * @todo [x] - return the xpath to apply
         */
        _getSearchConstraint: function () {
            if (this._contextObj.getAttributeType(this.labelAttribute) === "Enum") {
                this._currentFilter = this._contextObj.getEnumCaption(this.labelAttribute, this._contextObj.get(this.labelAttribute))
            } else {
                this._currentFilter = this._contextObj.get(this.labelAttribute);
            }
            return this._contextObj.get(this.xpathAttribute);
        },
        /**
         * @override
         * @todo [x] - set the _currentFilter to null
         * @todo [x] - clear the inputs
         */
        _clear: function () {
            //this function should clear the search widget
            this._contextObj.set(this.xpathAttribute, null);
            this._currentFilter = null;
            if (this.onClearNf) {
                // execute nanoflow to clear
                mx.data.callNanoflow({
                    nanoflow: this.onClearNf,
                    origin: this.mxform,
                    context: this.mxcontext,
                    callback: function (result) {
                        console.log("Nanoflow run to clear inputs");
                        this._fireSearch();
                    }.bind(this),
                    error: function (error) {
                        console.error(error.message);
                    }
                });
            } else if (this.onClearMf) {
                // execute microflow to clear 
                mx.data.action({
                    params: {
                        applyto: "selection",
                        actionname: this.onClearMf,
                        guids: [this._contextObj.getGuid()]
                    },
                    origin: this.mxform,
                    callback: function (obj) {
                        // expect single MxObject
                        console.log("microflow run to clear inputs")
                        this._fireSearch();
                    }.bind(this),
                    error: function (error) {
                        console.error(error.message);
                    }
                });

            }
        },

        /** 
         * @override
         */
        update: function (obj, callback) {
            // call _setupgrid with a callback here
            if (obj) {
                this._contextObj = obj;
                this._setupGrid(this._finishGridSetup.bind(this));
            }


            if (callback) {
                callback()
            };
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

        _finishGridSetup: function () {
            this._resetSubscriptions();
            // this doesn't seem to work :()
            // if (this.getState("searchValue", "")) {
            //     this._contextObj.set(this.xpathAttribute, this.getState("searchValue", ""));
            //     this._fireSearch();
            // }
        },

        _resetSubscriptions: function () {
            this.unsubscribeAll();
            this.subscribe({
                guid: this._contextObj.getGuid(),
                attr: this.xpathAttribute,
                callback: this._fireSearch
            });
            this.subscribe({
                guid: this._contextObj.getGuid(),
                callback: this._fireSearch
            });
        },
    });
});
require(["GridSearch/widget/AnySearch"]);
