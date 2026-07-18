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
 * Manage operations over CDF Structure 
 ******************************************************************************************************************/

define([
    'cdf/lib/jquery',
    'amd!cdf/lib/underscore',
    './dashparts',
    './endpoints',
    'cde/components/DashboardComponent'
],
    function ($, _, parts, endpoints, DashboardComponent) {

        var object = {

            title: "",
            description: "",
            file: "",
            cdfstructure: {
                "filename": "",
                "layout": {
                    "rows": []
                },
                "components": {
                    "rows": []
                },
                "datasources": {}
            },

            getParameter: function (id) {
                var comp = null,
                    myself = this,
                    comps = this.cdfstructure.components.rows;
                _.each(comps, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if (compValue.type == "ComponentsJavascriptParameter" || compValue.type == "ComponentsDateParameter" || compValue.type == "ComponentsParameter") {
                        _.each(compValue.properties, function (pv, pk) {
                            if (pv.name == "name" && pv.type == "type" && pv.value == id) {
                                comp = { "index": compKey, "element": compValue };
                            }
                        });
                    }
                });
                return comp;
            },

            getGroupParameter: function () {
                var comp = null,
                    myself = this,
                    comps = this.cdfstructure.components.rows;
                _.each(comps, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if (compValue.type == "Label" && compValue.id == "LAYOUTEDITORPARAMETERS") {
                        comp = { "index": compKey, "element": compValue };
                    }
                });
                return comp;
            },

            addParameter: function (type, id, value) {
                var comps = this.cdfstructure.components;
                var param = parts.getParameter(type, id, value);
                if (!this.hasGroupParameter()) {
                    this.addGroupParameter();
                }
                var groupParams = this.getGroupParameter();
                comps.rows.splice(groupParams.index + 1, 0, param);
                return param;
            },

            removeParameter: function (id) {
                var comp = this.getParameter(id);
                this.cdfstructure.components.rows.splice(comp.index, 1);
            },

            listParameters: function () {
                var comp = null,
                    myself = this,
                    comps = this.cdfstructure.components.rows,
                    list = [];
                _.map(comps, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if ((compValue.parent != "UnIqEiD") && ((compValue.type == "ComponentsJavascriptParameter" || compValue.type == "ComponentsDateParameter" || compValue.type == "ComponentsParameter"))) {
                        var elem = { "element": compValue, "index": compKey, "type": compValue.type };
                        _.each(compValue.properties, function (pv, pk) {
                            if (pv.name == "name") {
                                elem.name = pv.value;
                            }
                            if (pv.type == "JavaScript" || pv.type == "Date" || pv.type == "String") {
                                elem.valueType = pv.type
                                elem.value = pv.value;
                            }
                        });
                        list.push(elem);
                    }
                });
                return list;
            },

            hasGroupParameter: function (id) {
                var result = false,
                    myself = this,
                    elems = this.cdfstructure.components.rows;
                _.each(elems, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if (compValue.parent == "UnIqEiD" && compValue.id == (id || "LAYOUTEDITORPARAMETERS")) {
                        result = true;
                        return;
                    }
                });
                return result;
            },

            addGroupParameter: function () {
                var elems = this.cdfstructure.components;
                var elem = parts.getGroupParameter();
                elems.rows.push(elem);
                return elem;
            },

            getComponent: function (id) {
                var comp = null,
                    myself = this,
                    comps = this.cdfstructure.components.rows;
                _.each(comps, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if (compValue.type == "ComponentsDashboardComponent") {
                        _.each(compValue.properties, function (pv, pk) {
                            if (pv.name == "name" && pv.type == "Id" && pv.value == id) {
                                comp = { "index": compKey, "element": compValue };
                                return;
                            }
                        });
                    }
                });
                return comp;
            },

            getGroupComponent: function () {
                var comp = null,
                    myself = this,
                    comps = this.cdfstructure.components.rows;
                _.each(comps, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if (compValue.type == "Label" && compValue.id == "LAYOUTEDITORCOMPONENTS") {
                        comp = { "index": compKey, "element": compValue };
                    }
                });
                return comp;
            },

            addComponent: function (id, path, parameterMapping, htmlObject) {
                var comps = this.cdfstructure.components;
                var comp = parts.getComponent(id, path, parameterMapping, htmlObject);
                if (!this.hasGroupComponent()) {
                    this.addGroupComponent();
                }
                var groupComps = this.getGroupComponent();
                comps.rows.splice(groupComps.index + 1, 0, comp);
                return comp;
            },

            addToolbox: function () {
                var comps = this.cdfstructure.components;
                var comp = parts.getToolbox();
                if (!this.hasGroupComponent()) {
                    this.addGroupComponent();
                }
                var groupComps = this.getGroupComponent();
                comps.rows.splice(groupComps.index + 1, 0, comp);
                return comp;
            },            

            removeComponent: function (id) {
                var comp = this.getComponent(id);
                this.cdfstructure.components.rows.splice(comp.index, 1);
            },

            listComponents: function () {
                var comp = null,
                    myself = this,
                    comps = this.cdfstructure.components.rows,
                    list = [];
                _.map(comps, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if ((compValue.parent != "UnIqEiD") && (compValue.type == "ComponentsDashboardComponent")) {
                        var elem = { "element": compValue, "index": compKey };
                        _.each(compValue.properties, function (pv, pk) {
                            if (pv.name == "name") {
                                elem.name = pv.value;
                            }
                            if (pv.name == "htmlObject") {
                                elem.placeholdder = pv.value;
                            }
                            if (pv.name == "dashboardPath") {
                                elem.dashpath = pv.value;
                            }
                        });
                        list.push(elem);
                    }
                });
                return list;
            },

            hasGroupComponent: function (id) {
                var result = false,
                    myself = this,
                    elems = this.cdfstructure.components.rows;
                _.each(elems, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if (compValue.parent == "UnIqEiD" && compValue.id == (id || "LAYOUTEDITORCOMPONENTS")) {
                        result = true;
                        return;
                    }
                });
                return result;
            },

            addGroupComponent: function () {
                var elems = this.cdfstructure.components;
                var elem = parts.getGroupComponent();
                elems.rows.push(elem);
                return elem;
            },

            getPlaceholder: function (id, parent) {
                var elem = {},
                    myself = this,
                    elems = this.cdfstructure.layout.rows;
                _.each(elems, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if (compValue.parent == (parent || "LAYOUTEDITORCOL")) {
                        _.each(compValue.properties, function (pv, pk) {
                            if (pv.type == "Id" && pv.value == id) {
                                elem = { "id": compValue.id, "name": pv.value, "index": compKey, "element": compValue };
                                return;
                            }
                        });
                    }
                });
                return elem;
            },

            getGroupPlaceholder: function () {
                var comp = null,
                    myself = this,
                    comps = this.cdfstructure.layout.rows;
                _.each(comps, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if (compValue.type == "LayoutRow" && compValue.id == "LAYOUTEDITORROW") {
                        comp = { "index": compKey, "element": compValue };
                    }
                });
                return comp;
            },

            addPlaceholder: function (id, xs, sm, md, lg) {
                var placeholders = this.cdfstructure.layout;
                var placeholder = parts.getPlaceholder(id, xs || "", sm || "", md || "", lg || "");
                if (!this.hasGroupPlaceholder()) {
                    this.addGroupPlaceholder();
                }
                var groupPlaceholders = this.getGroupPlaceholder();
                placeholders.rows.splice(groupPlaceholders.index + 1, 0, placeholder);
                return placeholder;
            },

            removePlaceholder: function (id) {
                var comp = this.getPlaceholder(id,'LAYOUTEDITORROW');
                this.cdfstructure.layout.rows.splice(comp.index, 1);
            },

            listPlaceholders: function (parent) {
                var comp = null,
                    myself = this,
                    comps = this.cdfstructure.layout.rows,
                    list = [];
                _.map(comps, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if ((compValue.parent != "LAYOUTEDITORROW") && (compValue.parent == (parent || "LAYOUTEDITORCOL"))) {
                        var elem = { "element": compValue, "index": compKey };
                        _.each(compValue.properties, function (pv, pk) {
                            if (pv.type == "Id") {
                                elem.name = pv.value;
                            }
                        });
                        list.push(elem);
                    }
                });
                return list;
            },

            hasGroupPlaceholder: function (id) {
                var result = false,
                    myself = this,
                    elems = this.cdfstructure.layout.rows;
                _.each(elems, function (cv, ck) {
                    var compValue = cv,
                        compKey = ck;
                    if (compValue.type == "LayoutRow" && compValue.id == (id || "LAYOUTEDITORROW")) {
                        result = true;
                        return;
                    }
                });
                return result;
            },

            addGroupPlaceholder: function () {
                var elems = this.cdfstructure.layout.rows;
                var elem = parts.getGroupPlaceholderRow();
                elems.push(elem);
                return elem;
            },

            getFilename(title) {
                return file;
            },

            setFilename(title) {
                this.file = file;
            },

            getTitle(title) {
                return title;
            },

            setTitle(title) {
                this.title = title;
            },

            getDescription(description) {
                return description;
            },

            setDescription(description) {
                this.description = description;
            },

            reOrderLayout: function (widgetsOrder, cdfStructure) {
                var order = 1;
                var layoutRows = [];
                layoutRows.push(cdfStructure.layout.rows[0]);
                for( var key in widgetsOrder){
                    var layoutElem = this.getPlaceholder(key,'LAYOUTEDITORROW');
                    if(layoutElem != null){
                        layoutRows.push(layoutElem.element);
                    }
                }
                return layoutRows;
            },
            hasPostInitFunction: function(cdfStructure){
                for (var elem in cdfStructure.components.rows){
                    if (cdfStructure.components.rows[elem].id == "dashboardPostInit") return true;
                };
                return false;
            },
            addPostInit: function(cdfStructure){
                cdfStructure.components.rows.push(JSON.parse('{  '+
                    '"id":"SCRIPT",'+
                    '"name":"Scripts",'+
                    '"type":"Label",'+
                    '"typeDesc":"\u003Ci\u003EGroup\u003C/i\u003E",'+
                    '"parent":"UnIqEiD",'+
                    '"properties":[  '+
                    '   {  '+
                    '      "name":"Group",'+
                    '      "value":"Scripts",'+
                    '      "type":"Label"'+ 
                    '   }'+
                    ']'+
                    '}'));
                    cdfStructure.components.rows.push(JSON.parse(JSON.stringify({  
                        "id":"dashboardPostInit",
                        "type":"ComponentsFunction",
                        "typeDesc":"JavaScript function",
                        "parent":"SCRIPT",
                        "properties":[  
                           {  
                              "name":"name",
                              "value":"postInit",
                              "type":"Id"
                           },
                           {  
                              "name":"javaScript",
                              "value":"dashboard.postInit = function(evt){\n                var editorWrapper = $($(\u0027.layoutEditorWrapper\u0027)[0]);\n        if(editorWrapper.children().length \u003E 0){\n                        var widgetWrappers = editorWrapper.find(\u0027.layoutEditorWidgetWrapper\u0027);\n            _.each(widgetWrappers, function(element, key) {\n\n                var $elem = $(element);\n\n                var element_length = $elem.find(\u0027.layoutEditorWidgetWrapper\u0027).length;\n\n                if( element_length \u003E 0 ) {\n\n                    var bootstrap_classes_Arr = $elem.find(\u0027.layoutEditorWidgetWrapper\u0027).parent().attr(\u0027class\u0027).match(/col-[a-z]+-\\d+/g);\n\n                    var bootstrap_classes = \u0022\u0022;\n\n                    for (var idx = 0; idx \u003C bootstrap_classes_Arr.length; ++idx) {\n                        bootstrap_classes += bootstrap_classes_Arr[idx] + \u0022 \u0022;\n                        $elem.find(\u0027.layoutEditorWidgetWrapper\u0027).parent().removeClass(bootstrap_classes_Arr[idx]);\n                    }\n\n                    //$elem.find(\u0027.widgetsize\u0027).parent().removeClass(a_class);\n                    $elem.find(\u0027.layoutEditorWidgetWrapper\u0027).parent().addClass(\u0027col-xs-12\u0027);\n                    //var a_parent = $(\u0027#\u0027 + $elem.attr(\u0027id\u0027) + \u0027_sizeDiv\u0027);\n                    var a_parent = $elem.parent();\n                    $(a_parent.children()).attr(\u0027data-id\u0027,$elem.attr(\u0027id\u0027));\n                    //a_parent.addClass(a_class);\n                    a_parent.addClass(bootstrap_classes);\n                }\n                \n                else{\n                    var a_parent = $(\u0027#\u0027 + $elem.attr(\u0027id\u0027) + \u0027_sizeDiv\u0027);\n                    (a_parent.children()).attr(\u0027data-id\u0027,$elem.attr(\u0027id\u0027));\n                    a_parent.addClass(\u0027col-xs-12\u0027);\n                }\n                \n            });\n            \n        }\n    } ",
                              "type":"JavaScript"
                           }
                        ],
                        "rowName":"Function"
                     })))
                //cdfstructure.push
                return cdfStructure;
            },

            saveDashboard: function (filename, title, description, widgetsOrder, cdfstructure) {
                
                var cdfStructure = cdfstructure || this.cdfstructure,
                    data = new FormData();
                var layoutRows = this.reOrderLayout(widgetsOrder, cdfStructure);
                cdfStructure.layout.rows = layoutRows;
                //add postInit
                if(!this.hasPostInitFunction(cdfStructure))
                    cdfStructure = this.addPostInit(cdfStructure);
                cdfStructure.filename = filename.replace(/wdcf/g, 'cdfde');
                // TODO: Use widgetOrder to change the order we use to save the layout of the dashboard
                //var ph = this.getPlaceholder('Filters_filterWidget2','LAYOUTEDITORROW');
                data.append("operation", "saveas");
                data.append("file", filename);
                data.append("title", title);
                data.append("description", description);
                data.append("cdfstructure", JSON.stringify(cdfStructure));
                var opts = {
                    data: data
                };
                var success = function (e) {
                    return true;
                };
                var fail = function (e) {
                    return false;
                };
                return endpoints.runRequest("save_dashboard", opts, success, fail);
            },

            loadDashboard: function (filename) {
                var opts = {
                    data: {
                        "paramfile": filename
                    }
                };
                var success = function (e) { };
                var fail = function (e) { };
                var data = null,
                    result = endpoints.runRequest("load_dashboard", opts, success, fail);
                if (result.status == 200) {
                    data = JSON.parse(result.responseText);
                }
                if (_.isObject(data) && data.status == "true") {
                    this.cdfstructure = data.result.data;
                    this.title = data.result.wcdf.title
                    this.description = data.result.wcdf.description;
                    this.file = data.result.data.filename;
                    return this.cdfstructure;
                }
                return {};
            },

            createNewFromTemplate: function (template, filename, title, description) {
                var opts = {
                    data: {
                        "paramfile": template
                    }
                };
                var success = function (e) { };
                var fail = function (e) { };
                var data = null,
                    result = endpoints.runRequest("load_dashboard", opts, success, fail);
                if (result.status == 200) {
                    data = JSON.parse(result.responseText);
                }
                data.result.data.filename = filename.replace('wcdf', 'cdfde');
                return this.saveDashboard(filename, title, description, data.result.data);
            },

            createNewEmpty: function (filename, title, description) {
                this.clearDashboard();
                this.saveDashboard(filename, title, description);
            },

            clearDashboard: function () {
                this.cdfstructure = parts.getEmptyDashboard();
                this.addToolbox();
                return this.cdfstructure;
            }

        };

        return object;
    }
);