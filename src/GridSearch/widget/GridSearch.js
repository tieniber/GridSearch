define( [
  "dojo/_base/declare",
  "GridSearch/widget/Core",
  "dojo/dom-class",
  "dojo/dom-style",
  "dojo/_base/lang",
  "dojo/query",
  "dojo/text!GridSearch/widget/template/GridSearch.html"
], function( declare, Core, dojoClass, dojoStyle, dojoLang, dojoQuery, widgetTemplate )
{
   "use strict";

   return declare( "GridSearch.widget.GridSearch", [ Core ],
   {

      templateString: widgetTemplate,

      // Internal variables.
      _handles: null,
      _searchNode: null,

      //modeler
      gridEntity: null,
      minCharacters: 0,
      ta_rows: 0,

      constructor: function()
      {
         this._handles = [];
      },

      postCreate: function()
      {
         logger.debug( this.id + ".postCreate" );

         this.connect( this.buttonNode, "click", "_clearAllSearchBoxes" );
         this.connect( this._searchNode, "keyup", "_clearOnEscape" );

         //retrieve state (if available)
         this.searchNodeSingle.value = this.getState( "searchValue", "" );
         this._updateClearButtonRendering( this.searchNodeSingle );
         this.searchNodeMulti.value = this.getState( "searchValue", "" );
         this._updateClearButtonRendering( this.searchNodeMulti );
      },

      startup: function()
      {
         if ( this.renderAsTextarea )
         {
            console.log( "rendering textareaaa" );
            this._searchNode = this.searchNodeMulti;
            dojoStyle.set( this.searchNodeMulti, "display", "" );
            if ( this.ta_rows > 0 )
            {
               dojoStyle.set( this.searchNodeMulti, "rows", this.ta_rows );
            }
            dojoStyle.set( this.searchNodeSingle, "display", "none" );
         }
         else
         {
            console.log( "rendering textbox" );
            this._searchNode = this.searchNodeSingle;
         }
      },

      update: function( obj, callback )
      {
         logger.debug( this.id + ".update" );
         this._setupGrid( this._finishGridSetup.bind( this ) );
         this._contextObj = obj;
         this._updateRendering( callback );
      },

      resize: function( box )
      {
         logger.debug( this.id + ".resize" );
      },

      uninitialize: function()
      {
         logger.debug( this.id + ".uninitialize" );
      },
      storeState: function( t )
      {
         t( "searchValue", this._searchNode.value );
      },
      _updateRendering: function( callback )
      {
         logger.debug( this.id + "._updateRendering" );

         if ( callback )
         {
            callback()
         };
      },
      _finishGridSetup: function()
      {
         if ( this._grid )
         {
            this.connect( this._searchNode, "keyup", "_searchKeyDown" );
            if ( !this._grid.gridSearchWidgets )
            {
               this._grid.gridSearchWidgets = {};
            }
            this._grid.gridSearchWidgets[ this.id ] = this;
            //if the grid is set to wait for search, ensure we set the "_searchFilled" flag
            if ( this._grid.config && this._grid.config.gridpresentation && this._grid.config.gridpresentation.waitforsearch && this._searchNode.value )
            {
               this._grid._searchFilled = true;
            }
         }
      },
      _getSearchConstraint: function()
      {
         var value = this._searchNode.value.replace( /''/g, '\'\'' ),
            searchValues = [],
            searchParams = [],
            attributes = this.searchAttributes,
            outvalue = "";
         if ( value && value.length >= this.minCharacters )
         {
            if ( !this.expertQuery )
            {
               //basic or advanced search
               if ( this.allowOrConditions )
               {
                  if ( this.useRegEx )
                  {
                     searchValues = value.trim().split( new RegExp( this.splitString ) );
                  }
                  else
                  {
                     searchValues = value.trim().split( this.splitString );
                  }
                  console.log( "split string: " + this.splitString );
                  console.log( searchValues );
               }
               else
               {
                  searchValues.push( value );
               }

               for ( var i = 0, attr; attr = attributes[ i ]; ++i )
               {
                  if ( attr.searchMethodParam === "startswith" )
                  {
                     attr._searchMethod = "starts-with";
                  }
                  else
                  {
                     attr._searchMethod = "contains";
                  }

                  if ( !attr.customSearchEntity )
                  {
                     //basic search
                     var searchPath = attr.searchAttributeParam.substring( 0, attr.searchAttributeParam.lastIndexOf( "/" ) );
                     var searchAttribute = attr.searchAttributeParam.substring( attr.searchAttributeParam.lastIndexOf( "/" ) + 1, attr.searchAttributeParam.length );

                     var curQuery = [];
                     if ( searchPath )
                     {
                        curQuery.push( searchPath + "[" );
                     }

                     for ( var j = 0; j < searchValues.length; j++ )
                     {
                        if ( j > 0 )
                        {
                           curQuery.push( " or " );
                        }
                        var curValue = searchValues[ j ];
                        curQuery.push( attr._searchMethod + "(" + searchAttribute + ",'" + curValue + "')" );
                     }

                     if ( searchPath )
                     {
                        curQuery.push( "]" );
                     }
                     searchParams.push( curQuery.join( " " ) );
                  }
                  else
                  {
                     //advanced search
                     searchParams.push( attr.customSearchPath + "[" + attr._searchMethod + "(" + attr.customSearchAttribute + ",'" + curValue + "')]" );
                  }
               }
               outvalue = "[" + searchParams.join( " or " ) + "]";
            }
            else
            {
               //expert search
               outvalue = this.expertQuery.replace( /{\[1\]}/g, value ).replace( /\r\n/g, ' ' ).replace( /''/g, '\'\'' );
            }
         }
         else
         {
            outvalue = "";
         }

         if ( outvalue )
         {
            this._currentFilter = value;
         }
         else
         {
            this._currentFilter = null;
         }
         //this.onSearchChanged();
         return outvalue;
      },
      _updateClearButtonRendering: function( node )
      {
         var f;
         if ( node )
         {
            f = ( node.value === "" )
         }
         else
         {
            f = ( this._searchNode.value === "" )
         }
         if ( f )
         {
            dojoClass.add( this.buttonNode, "hidden" );
         }
         else
         {
            dojoClass.remove( this.buttonNode, "hidden" );
         }
      },
      _searchKeyDown: function()
      {
         this._updateClearButtonRendering();
         this._fireSearch();
      },
      _clearOnEscape: function( e )
      {
         if ( e.keyCode == 27 )
         {
            this._clearAllSearchBoxes();
         }
      },
      _clear: function()
      {
         this._searchNode.value = "";
         dojoClass.add( this.buttonNode, "hidden" );
         this._currentFilter = null;
         this._fireSearch();
      },
      _reloadGrid: function()
      {
         if ( this._grid.update )
         {
            this._grid.update();
         }
         else if ( this._grid.reload )
         {
            this._grid.reload();
         }
         else
         {
            console.log( "Could not find the grid refresh/reload function" );
         }
      }
   } );
} );

require( [ "GridSearch/widget/GridSearch" ] );
