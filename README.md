# Grid Search

Add an interactive search box to all of your grids! Online only!

The  widgets support searching across multiple fields (including associations), similar to the built-in list view search capabilities. They also support all of the same functions as the built-in search fields in data grids and template grids, plus they perform live searching, so you don't have to click a "search" button after entering your criteria.

## Description

This Mendix widget package offers a number of widgets:

### Desktop/Online Mobile
 - Multifield Search: Offers multi-column live searching from a single search box to data grids and template grids. Also works on list views, and has more customization options than the built-in list view search field.
 - Comparison Search: Renders an input box with live searching on a single attribute. Also supports a calendar selector for dates. The calendar will render automatically when you select a date field.
 - Dynamic Dropdown Search: Renders a dropown with a dynamic list of dropdown options for local booleans or enumerations, or a list of options over one or more associations.
 - Static Dropdown Search: Renders a dropdown with hard-coded dropdown options. Write your own XPath constraints and apply them using the dropdown.
 - Reset Button: Resets all of the search boxes connected to a given grid. 
 
![Not Searching](https://github.com/tieniber/GridSearch/blob/master/assets/DG_Normal.png)

![Searching](https://github.com/tieniber/GridSearch/blob/master/assets/DG_Searching.png)

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

## Configuration

To use this widget package, simply drop it on a page with a data grid, template grid, or list view and set up a few properties:

* Online Widget:
   * Grid Name: the "name" property of the list widget you want to search in
   * Grid Entity: the entity show in the data grid.
   * Search Method: choose from "contains" or "starts-with" searching
   * Search Attributes: a list of attributes to search
      * Path to search entity: a path to the entity which contains the attribute you want to search. You can choose the same entity as the grid entity, or follow a path over association to another entity.
      * Search attribute: the attribute on the search entity to be searched
* Offline Widget:
   * Grid Name: the "name" property of the list widget you want to search in
   * Grid Entity: the entity show in the data grid. NOTE: this is a text field in the offline widget. You must enter the value as: ModuleName.EntityName
   * Search Attribute: the attribute on the grid entity to be searched. NOTE: this is a text field in the offline widget. You must enter the name of the attribute manually, exactly as it appears in the domain model.

## Supported Data Types

The following data types are supported:
 - String
 - Integer
 - Long
 - Decimal
 - Enumeration
 - AutoNumber

## Supported Mendix versions and browsers

Testing was completed in Mendix 5.21.4 and Mendix 6.10.3, and Mendix 7.1.1 on Chrome, IE, Firefox, Edge, and Safari on iOS.
