/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/
/******************************************************************************************************************
 * To manage the status of the dashboard
 ******************************************************************************************************************/

 define([
    'cdf/lib/jquery',
    'amd!cdf/lib/underscore',
    './endpoints',
    'cde/components/DashboardComponent'
    ],
    function ($, _, endpoints, DashboardComponent) {

        var object = {

            getGroupParameter: function () {
                var part = {
                    "id": "LAYOUTEDITORPARAMETERS",
                    "name": "Parameters",
                    "type": "Label",
                    "typeDesc": "<i>Group</i>",
                    "parent": "UnIqEiD",
                    "properties": [
                    {
                        "name": "Group",
                        "value": "Parameters",
                        "type": "Label"
                    }
                    ]
                };
                return part;
            },

            getParameter: function (type, id, value) {
                var part =
                {
                    ComponentsParameter: {
                        "id": id,
                        "type": "ComponentsParameter",
                        "typeDesc": "Simple parameter",
                        "parent": "LAYOUTEDITORPARAMETERS",
                        "properties": [
                        {
                            "name": "name",
                            "value": id,
                            "type": "Id"
                        },
                        {
                            "name": "propertyValue",
                            "value": value,
                            "type": "String"
                        },
                        {
                            "name": "parameterViewRole",
                            "value": "unused",
                            "type": "parameterViewRoleCustom"
                        },
                        {
                            "name": "bookmarkable",
                            "value": "false",
                            "type": "Boolean"
                        },
                        {
                            "name": "public",
                            "value": "true",
                            "type": "Boolean"
                        }
                        ],
                        "rowName": "Simple Parameter"
                    },
                    ComponentsJavascriptParameter: {
                        "id": id,
                        "type": "ComponentsJavascriptParameter",
                        "typeDesc": "Custom parameter",
                        "parent": "LAYOUTEDITORPARAMETERS",
                        "properties": [
                        {
                            "name": "name",
                            "value": id,
                            "type": "Id"
                        },
                        {
                            "name": "javaScript",
                            "value": value,
                            "type": "JavaScript"
                        },
                        {
                            "name": "parameterViewRole",
                            "value": "unused",
                            "type": "parameterViewRoleCustom"
                        },
                        {
                            "name": "bookmarkable",
                            "value": "false",
                            "type": "Boolean"
                        },
                        {
                            "name": "public",
                            "value": "true",
                            "type": "Boolean"
                        }
                        ],
                        "rowName": "Custom Parameter"
                    },
                    ComponentsDateParameter: {
                        "id": id,
                        "type": "ComponentsDateParameter",
                        "typeDesc": "Date parameter",
                        "parent": "LAYOUTEDITORPARAMETERS",
                        "properties": [
                        {
                            "name": "name",
                            "value": id,
                            "type": "Id"
                        },
                        {
                            "name": "propertyDateValue",
                            "value": value,
                            "type": "Date"
                        },
                        {
                            "name": "parameterViewRole",
                            "value": "unused",
                            "type": "parameterViewRoleCustom"
                        },
                        {
                            "name": "bookmarkable",
                            "value": "false",
                            "type": "Boolean"
                        },
                        {
                            "name": "public",
                            "value": "true",
                            "type": "Boolean"
                        }
                        ],
                        "rowName": "Date Parameter"
                    }
                };
                return part[type];
            },

            getGroupComponent: function () {
                var part = {
                    "id": "LAYOUTEDITORCOMPONENTS",
                    "name": "LayoutEditor",
                    "type": "Label",
                    "typeDesc": "<i>Group</i>",
                    "parent": "UnIqEiD",
                    "properties": [
                    {
                        "name": "Group",
                        "value": "LayoutEditor",
                        "type": "Label"
                    }
                    ]
                };
                return part;
            },

            getComponent: function (id, path, parameterMapping, htmlObject) {
                var obj = {
                    "id": id,
                    "parent": "LAYOUTEDITORCOMPONENTS",
                    "rowName": "Dashboard Component",
                    "type": "ComponentsDashboardComponent",
                    "typeDesc": "Dashboard Component",
                    "properties": [
                    {
                        "name": "name",
                        "type": "Id",
                        "value": id
                    },
                    {
                        "name": "dashboardPath",
                        "type": "String",
                        "value": path
                    },
                    {
                        "name": "parameterMapping",
                        "type": "ParameterMapping",
                        "value": JSON.stringify(parameterMapping)
                    },
                    {
                        "name": "htmlObject",
                        "type": "HtmlObject",
                        "value": "${h:" + htmlObject + "}"
                    },
                    {
                        "name": "listeners",
                        "type": "Listeners",
                        "value": "[]"
                    },
                    {
                        "name": "dataSourceMapping",
                        "type": "DataSourceMapping",
                        "value": "[]"
                    },
                    {
                        "name": "oneWayMap",
                        "type": "Boolean",
                        "value": "false"
                    },
                    {
                        "name": "priority",
                        "type": "Integer",
                        "value": 5
                    },
                    {
                        "name": "refreshPeriod",
                        "type": "Integer",
                        "value": ""
                    },
                    {
                        "name": "executeAtStart",
                        "type": "Boolean",
                        "value": "true"
                    },
                    {
                        "name": "preExecution",
                        "type": "JavaScript",
                        "value": ""
                    }
                    /*
                    {
                        "name": "postExecution",
                        "type": "JavaScript",
                        "value": "function() {\n    this.placeholder().parent().removeClass(\u0027col-xs-12\u0027);\n    this.placeholder().find(\u0027.row\u0027).removeClass(\u0027row clearfix\u0027);\n}"
                    }
                    */
                    ]
                };
                var part = $.extend({}, obj);
                return part;
            },

            getToolbox: function () {
                var obj = {
                    "id": "LayoutEditorToolbox",
                    "parent":"LAYOUTEDITORCOMPONENTS",
                    "rowName":"Layout Editor Component",
                    "type":"ComponentsLayoutEditorComponent",
                    "typeDesc":"Layout Editor Component",
                    "properties":[  
                    {  
                      "name":"name",
                      "type":"Id",
                      "value":"LayoutEditorToolbox"
                  },
                  {  
                      "name":"editModuleInnerClass",
                      "type":"String",
                      "value":"LayoutEditorWidget"
                  },
                  {  
                      "name":"priority",
                      "type":"Integer",
                      "value":0
                  },
                  {  
                      "name":"htmlObject",
                      "type":"HtmlObject",
                      "value":""
                  },
                  {  
                      "name":"executeAtStart",
                      "type":"Boolean",
                      "value":"true"
                  },
                  {  
                      "name":"preExecution",
                      "type":"JavaScript",
                      "value":""
                  },
                  {  
                      "name":"postExecution",
                      "type":"JavaScript",
                      "value":""
                  },
                  {  
                      "name":"postFetch",
                      "type":"JavaScript",
                      "value":""
                  },
                  {  
                      "name":"preChange",
                      "type":"JavaScript",
                      "value":""
                  },
                  {  
                      "name":"postChange",
                      "type":"JavaScript",
                      "value":""
                  },
                  {  
                      "name":"tooltip",
                      "type":"Html",
                      "value":""
                  }
                  ]

              };

              var part = $.extend({}, obj);
              return part;
          },

          getGroupPlaceholderRow: function () {
            var part = {
                "id": "LAYOUTEDITORROW",
                "parent": "UnIqEiD",
                "type": "LayoutRow",
                "typeDesc": "Row",
                "properties": [
                {
                    "name": "name",
                    "type": "Id",
                    "value": "LayoutEditorWrapper"
                },
                {
                    "name": "height",
                    "type": "Integer",
                    "value": ""
                },
                {
                    "name": "backgroundColor",
                    "type": "Color",
                    "value": ""
                },
                {
                    "name": "roundCorners",
                    "type": "RoundCorners",
                    "value": ""
                },
                {
                    "name": "textAlign",
                    "type": "TextAlign",
                    "value": ""
                },
                {
                    "name": "cssClass",
                    "type": "String",
                    "value": "layoutEditorWrapper"
                }
                ]
            };
            return part;
        },

        getGroupPlaceholderCol: function (id, xs, sm, md, lg) {
            var part = {
                "id": "LAYOUTEDITORCOL",
                "type": "LayoutBootstrapColumn",
                "typeDesc": "Column",
                "parent": "LAYOUTEDITORROW",
                "properties": [
                {
                    "name": "name",
                    "value": id,
                    "type": "Id"
                },
                {
                    "name": "bootstrapExtraSmall",
                    "value": xs || "",
                    "type": "String"
                },
                {
                    "name": "bootstrapSmall",
                    "value": sm || "",
                    "type": "String"
                },
                {
                    "name": "bootstrapMedium",
                    "value": md || "",
                    "type": "String"
                },
                {
                    "name": "bootstrapLarge",
                    "value": lg || "",
                    "type": "String"
                },
                {
                    "name": "bootstrapCssClass",
                    "value": "",
                    "type": "String"
                },
                {
                    "name": "height",
                    "value": "",
                    "type": "Integer"
                },
                {
                    "name": "backgroundColor",
                    "value": "",
                    "type": "Color"
                },
                {
                    "name": "roundCorners",
                    "value": "",
                    "type": "RoundCorners"
                },
                {
                    "name": "textAlign",
                    "value": "",
                    "type": "TextAlign"
                },
                {
                    "name": "cssClass",
                    "value": "layoutEditorWidgetWrapper",
                    "type": "String"
                }
                ]
            };
            return part;
        },

        getPlaceholder: function (id, xs, sm, md, lg) {
            return this.getGroupPlaceholderCol(id, xs, sm, md, lg);
        },

        getEmptyDashboard: function (filename) {
            var part = {
                "filename": filename || "",
                "layout": {
                    "rows": []
                },
                "components": {
                    "rows": []
                },
                "datasources": {}
            };
            return part;
        }

    };

    return object;
}
);