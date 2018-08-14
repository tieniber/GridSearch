# Grid Search
Add an interactive search capabilities to all of your grids using a series of widgets!

The concept behind this widget package is to greatly extend the built-in search capabilities of Mendix list and grid widgets: the Data Grid, the Template Grid, and the List View. You can also search on multiple lists/grids at the same time! These widgets can be placed anywhere on the page, including inside snippets or a sidebar. This widget has also been tested with the "Slide In" widget, which provides a custom sidebar.

The widgets offer features like multi-field searching, checkboxes, dropdowns, date filters, plus a fully customizable "Any Search" widget that allows you to create any search interface you like using Mendix widgets and microflows. Any search criteria that can be written in XPath is supported.

Finally, this package includes a widget called ActiveFilters that shows all of your current search terms in an interactive display.

## Description
This Mendix widget package offers a number of widgets:

 - Search widgets:
   - Multifield Search: Offers multi-column live searching from a single search box. Search on associated entities, or even build your own custom XPath string.
   - Comparison: Renders an input box with live searching on a single attribute. Also supports a calendar selector for dates. The calendar will render automatically when you select a date field.
   - Dynamic Dropdown: Renders a dropown with a dynamic list of dropdown options for local booleans or enumerations, or a list of options over one or more associations.
   - Static Dropdown: Renders a dropdown with hard-coded dropdown options. Write your own XPath constraints and apply them using the dropdown.
   - Enumeration Checkbox: Renders a set of checkboxes related to an enumeration (Like priority: High, Medium, Low)
   - Association Checkbox: Rendered a set of checkboxes based on associated objects (Like categories for products). Also includes the ability to count the number of results and display that value in both numeric and bar graph form.
   - Any Search: takes an xpath string from the context entity and applies it to the list/grid! Develop any kind of inputs you like, and use a microflow or nanoflow to create the XPath string that should be applied to the grid!
 - Utility Widgets:
   - Reset Button: Resets all of the search boxes connected to a given grid. 
   - Active Filters: shows a list of bubbles consisting of any searches currently applied to the grid. Clicking any of the bubbles remove that search criteria.

![Searching](https://github.com/tieniber/GridSearch/blob/master/assets/ScreenShot1.png)

## Contributing
For more information on contributing to this repository visit [Contributing to a GitHub repository](https://docs.mendix.com/howto/Contributing+to+a+GitHub+repository)

## Configuration
To use this widget package, drop one of the widgets on a page with a data grid, template grid, or list view. Below is a description of the widget, plus the available properties for each widget. There is also a fully functional test project in this respository, and published on the Mendix cloud [here] (https://gridsearch2.mxapps.io)

### Common properties
* Grid Name: the "name" property of the list widget you want to search in
* Grid Class: (Optional) Instead of a grid name, you can enter the CSS class of one or more grids here. Your search will be applied to any grids on the page with this class will be searched.
   
### Active Filters
Shows a set of bubbles consisting of any searches currently applied to the grid. Clicking any of the bubbles remove that search criteria. Besides common properties, there are no additional properties to configure.

### Multifield
This widget offers multi-column live searching from a single search box (like the default search available on a list view. Search on associated entities, or even build your own custom XPath string.

* Appearance
   * Filter Label: the label to be used by the Active Filters widget when this widget has an search applied to the grid. Not used when Active Filters widget is not used
   * Render as textarea: if true, the widget will render as a text area
   * Number of rows: when displayed as a text area, the number of lines/rows to display
* Behavior
   * Grid Entity: the entity shown in the data grid
   * Min Chars: the minimum number of characters that must be entered before a search will execute
   * Search Attributes
      * Basic
         * Search Attribute: the attribute to search. Can be the same entity as the grid, or over an association.
         * Search Method: choose from "contains" or "starts-with" searching
      * Advanced (if the basic search options don't meet your needs, look here)
         * Custom Search Entity: the entity that contains the attribute to search
         * Custom Search Attribute: the attribute to search on the custom search entity
         * Custom Search Path: a string that traverses from the object in the grid to the entity to be searched. Use this when you need to traverse more than 1 association or over a many-to-many association. Example:
         ``` MyModule.GridEntity_OtherEntity/MyModule.OtherEntity ```
* Expert Search
   * Query: an xpath query to use in the search. This query will be applied directly to your grid. Use {[1]} as a token that represents the search string. Anything that you can enter as a valid XPath constraint in the modeler is also usable here. A simple example:
   ``` [Description = '{[1]}']```      
* Boolean Logic
   * This widget supports boolean OR logic between values, using a configurable value for "OR"
   * Allow OR Conditions: Yes/No. (not compatible with Expert Search)
   * OR Condition string: the string used to split the search text into multiple parts. Each will become a condition on the search split by OR.
   * Interpret as RegEx: if true, the OR condition string will be interpreted as a regular expression. In this way, you can split by whitespace or newlines. This feature was developed so that values could be copy-pasted from Excel directly into this search box and be split properly.

### Comparison
Renders an input box with live searching on a single attribute. Also supports a calendar selector for dates. The calendar will render automatically when you select a date field.

* Appearance
   * Filter Label: the label to be used by the Active Filters widget when this widget has an search applied to the grid. Not used when Active Filters widget is not used
   * Show label: whether to display a label next to the search input (just like input boxes elsewhere in Mendix)
* Behavior
   * Grid Entity: The type of objects in the list/grid
   * Attribute: the attribute to use in the filter
   * Search Method: choose one of the following
      * Contains
      * Starts with
      * Equals
      * Not equals
      * Greater than
      * Greater than or equal to
      * Less than
      * Less than or equal to

### Dynamic Dropdown
Renders a dropown with a dynamic list of dropdown options for local booleans or enumerations, or a list of options over one or more associations.

* Appearance
   * Filter label: the label to be used by the Active Filters widget when this widget has an search applied to the grid. Not used when Active Filters widget is not used
   * Show label: whether to display a label next to the search input (just like input boxes elsewhere in Mendix)
   * Input label: the label to be used next to the search input
   * Empty caption: the caption for the empty option in the dropdown
* Behavior
   * Grid Entity: The type of objects in the list/grid
   * Search Method: choose 'equals or 'not equals'
   * Attribute: the attribute to use in the filter. For local attributes, enumerations and booleans are valid selections. When following a path, any attribute type is valid.
   * Attribute (manual): A manually written path from the list entity to the attribute you want to use. Only used when an attribute is not selected in the Attribute parameter. Example: 
   ```MyFirstModule.Product_Subcategory/MyFirstModule.Subcategory/Name```
   * Dropdown Entity: the entity to be shown in the dropdown list. This must be used if sorting is applied.
   * Sort Attributes: choose attributes and a direction to sort the dropdown list
   * XPath Constraint: When using a path to an entity, use this parameter to filter the list of available options. Both ```'[%currentObject%]'``` and ```'[%currentUser%]'``` work here.
   * Cascade Key: if you'd like other dynamic dropdowns to be constrained by the selection of this dropdown, set a key here. You'll reference this key from the other instance.
   * Listen Key: if you'd like values in this dynamic dropdown to be constrained by another one, enter the Cascade Key from the other widget here.
   * Path to Listen: the path from the Dropdown entity to the Entity in the Cascaded filter.

### Static Dropdown
Renders a dropdown with hard-coded dropdown options. Write your own XPath constraints and apply them using the dropdown.

* Appearance
   * Filter label: the label to be used by the Active Filters widget when this widget has an search applied to the grid. Not used when Active Filters widget is not used
   * Placeholder text: the caption for the empty option in the dropdown
* Behavior
   * Grid Entity: the type of objects in the grid
* Static Options
   * Search Attributes
      * Option Label: the label for this option in the dropdown. Will also be used in the active filters widget.
      * XPath: An XPath constraint to apply when this option is selected. Example: ```[Color='Blue']```
      * Default?: if selected, this filter will be applied when the widget loads
* *NOT IMPLEMENTED* Dynamic Options 
   * Enable dynamic options: yes/no, if you'd like to load a set of dynamic options from a entity at runtime
   * Entity: the entity containing filter options to retrieve
   * Attribute: the attribute to use in the filter
   * XPath: an XPath constraint limiting the available options in this dropdown list.


### Enumeration Checkbox
Renders a set of checkboxes related to an enumeration (Like priority: High, Medium, Low)

* Appearance
   * Filter label: the label to be used by the Active Filters widget when this widget has an search applied to the grid. Not used when Active Filters widget is not used
* Behavior
   * Grid Entity: the type of objects in the grid
   * Attribute: The attribute to use in the filter. For local attributes, only Enums and Booleans are value. When following a path, any attribute type is valid.

### Association Checkbox
Rendered a set of checkboxes based on associated objects (Like categories for products). Also includes the ability to count the number of results and display that value in both numeric and bar graph form.

You can also use this widget to dispay a set of custom filters at runtime. An administrator can create and modify lists of filters (such as product price ranges) using labels and XPath.

* Appearance
   * Display visualization: whether to display a bar chart of how many results each filter will return
   * Filter label: the label to be used by the Active Filters widget when this widget has an search applied to the grid. Not used when Active Filters widget is not used
   * Context entity: if this widget has a context entity, select it here
   * Filter label attribute: if this widget has context, you can select a string attribute here instead of using a static attribute. This can be used to, for example, show a list view of product categories, and then use this widget for each category to display a set of checkboxes for sub-categories.

* Behavior
   * Grid Entity: the type of objects in the grid
   * Filter Type: Choose reference, reference set, custom path, or xpath. Reference and reference set are simply filters over a path in the domain model. A custom path may be needed if you follow multiple types of associations before arriving at your destination entity. Use the XPath option to retrieve a list of filters defined at runtime.
      * When using the XPath option:
         * Filter Entity: The type of object used to create the list of checkbox filters
         * Label Attribute: the attribute of the filter entity used as the label next to the checkbox
         * Active Filter Label Attribute: the attribute of the filter entity containing the value to display in the Active Filters widget.
         * XPath Attribute: the attribute of the filter entity containing an xpath string, to be applied to the grid
         * Constraint: A filter for the options to be shown. Supports ```'[%currentObject%]'``` and ```'[%currentUser%]'```
      * When using the reference option:
         * Reference: the attribute to use in the filter over a reference
      * When using the reference set option:
         * Reference set: the attribute to use in the filter over a reference set 
      * When using the custom path option:
         * Custom Path: a path to the attribute over any kind of reference. Example:
         ```MyFirstModule.Product_Subcategory/MyFirstModule.Subcategory/MyFirstModule.Subcategory_Category/MyFirstModule.Category/Name```

### Reset Button
Resets all of the search boxes connected to a given grid.

### Active Filters
Shows a list of bubbles consisting of any searches currently applied to the grid. Clicking any of the bubbles remove that search criteria.

### Any Search
Takes an xpath string from the context entity and applies it to the list/grid! Develop any kind of inputs you like, and use a microflow or nanoflow to create the XPath string that should be applied to the grid!

Put this widget in a non-persistable context entity (a "search helper" entity) that contains an attribute that will hold XPath for the grid/list, as well as whatever else it needs for display purposes (references, other string or data inputs, enumerations).

There is an example of how to implement this widget in the test project in this respository.

The model:

![Model](https://github.com/tieniber/GridSearch/blob/master/assets/AnySearchConfig.png)

Using a dropdown box to select different date ranges:

![Basic Dropdown Scenario](https://github.com/tieniber/GridSearch/blob/master/assets/AnySearch1.png)

Using the "custom" option which makes a "Start" and "End" date input visible:

![Custom Dropdown Scenario](https://github.com/tieniber/GridSearch/blob/master/assets/AnySearch2.png)

* Appearance
   * Filter label name: the label to be used by the Active Filters widget when this widget has an search applied to the grid. Not used when Active Filters widget is not used
   * Filter label value: an attribute of the context entity to be used in the active filters widget
* Behavior
   * Xpath Attribute: an attribute on the context entity that this widget will monitor for changes. Whenever a change is applied, it will apply this xpath to the grid/list.
   * On Clear: a microflow to run when the widget is cleared by the Reset Button widget or the Active Filters widget. This should clear any inputs for this search as well as the xpath attribute.
   * On Clear Nanoflow: optionally use a nanoflow instead. If this is set, the microflow will not be used.


## Supported Mendix versions and browsers

Testing was completed in Mendix 7.13.1 on Chrome, IE, Firefox, Edge, and Safari on iOS.
