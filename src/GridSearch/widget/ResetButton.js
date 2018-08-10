define([
    "dojo/_base/declare",
    "GridSearch/widget/Core",
    "dijit/_TemplatedMixin",
    "dojo/text!GridSearch/widget/template/ResetButton.html"
], function (declare, Core, _TemplatedMixin, widgetTemplate) {
    "use strict";

    return declare("GridSearch.widget.ResetButton", [Core, _TemplatedMixin], {

        templateString: widgetTemplate,
        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._setupGrid();
            this.connect(this.resetButton, "click", "_clearAllSearchBoxes");

            if (callback) { callback(); }
        },
        storeState: function () {

        },
        _getSearchConstraint: function () {
            return "";
        },
        _clear: function () {

        }
    });
});

require(["GridSearch/widget/ResetButton"]);
