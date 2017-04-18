# Grid Search

Add an interactive search box to all of your grids, even offline!

The online widgets supports searching across multiple fields (including associations), similar to the built-in list view search capabilities. The offline widget supports searching on a single field.

## Description

This Mendix widget package offers two widgets:

 - Grid Search (online) for desktop and online mobile apps. Adds multi-column interactive searching from a single search box to data grids and template grids.
 - Grid Search (offline) for offline mobile apps. Adds a single-field search box to data grids, template grids, and list views!

![Not Searching](https://github.com/tieniber/GridSearch/blob/master/assets/DG_Normal.png)

![Searching](https://github.com/tieniber/GridSearch/blob/master/assets/DG_Searching.png)

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

## Configuration

To use this widget, simply drop it on a page with a data grid, template grid, or list view and set up a few properties:

 - Online Widget:
  - Grid Name: the "name" property of the list widget you want to search in
  - Grid Entity: the entity show in the data grid.
  - Search Method: choose from "contains" or "starts-with" searching
  - Search Attributes: a list of attributes to search
   - Path to search entity: a path to the entity which contains the attribute you want to search. You can choose the same entity as the grid entity, or follow a path over association to another entity.
   - Search attribute: the attribute on the search entity to be searched
 - Offline Widget:
  - Grid Name: the "name" property of the list widget you want to search in
  - Grid Entity: the entity show in the data grid. NOTE: this is a text field in the offline widget. You must enter the value as: ModuleName.EntityName
  - Search Attribute: the attribute on the grid entity to be searched. NOTE: this is a text field in the offline widget. You must enter the name of the attribute manually, exactly as it appears in the domain model.


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

## Limitations

Due to current platform constraints, the offline widget cannot search on multiple fields or over associations.
