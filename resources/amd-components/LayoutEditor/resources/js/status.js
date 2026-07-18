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

            prefix: "render_",

            status: {
                parameters: {},
                widgets: {}
            },

            history: {},

            dashboardChanged : false, 

            dashboard: null,
            editor: null,
            dashops: null,

            widgetsControl: {
                counter: null,
                widgetOrder: {},
                widgetsName: [],
                widgetParameter: {},
                parameterTypes: []

            },

            GroupWidgetControl: {
                groupCounter: 0,
                inactiveGroups: 0
            },

            widgetsCounter: 0,

            parameterTypes: [],

            setGroupWidgetControlCounter: function (value) {
                this.GroupWidgetControl.groupCounter = value;
            },

            setGroupWidgetControlInactive: function (value) {
                this.GroupWidgetControl.inactiveGroups = value;
            },

            getGroupWidgetControlCounter: function () {
                return this.GroupWidgetControl.groupCounter;
            },

            getGroupWidgetControlInactive: function () {
                return this.GroupWidgetControl.inactiveGroups;
            },            

            setStatus: function (status) {
                $.extend(true, this.status, Utils.ev(status));
            },

            getStatus: function () {
                return this.status;
            },

            setStatus: function (status) {
                $.extend(true, this.status, Utils.ev(status));
            },

            getStatus: function () {
                return this.status;
            },

            availableInStatus: function (group, key) {
                return !(this.status[group][key] == undefined);
            },

            addToStatus: function (group, key, value) {
                this.status[group][key] = value;
            },

            removeFromStatus: function (group, key) {
                //var elemDelete = "";
                //for( var elem in this.status[group])
                //{
                //    if (elem.indexOf(key)>=0)
                //        elemDelete = elem;
                //}
                delete this.status[group][key];
                if(this.widgetsControl.counter > 0) this.widgetsControl.counter -=1;
            },

            addToHistory: function (group, key, value) {
                this.status[group][key] = value;
            },

            removeFromHistory: function (group, key) {
                delete this.status[group][key];
            },

            hasChanges: function () {
                return _.isEmpty(this.history);
            },

            resetHistory: function () {
                this.history = {};
            },

            init: function (toolbox, component, dashboard, dashops) {
                this.toolbox = toolbox;
                this.component = component;
                this.dashboard = dashboard;
                this.dashops = dashops;
            },

            addWidgetsToDashboard: function () {
                var status = this;
                var widgetsToAdd = _.filter(this.status.widgets, function (value, key) {
                    return !value.rendered
                });
                _.each(widgetsToAdd, function (value, key) {
                    status.addSingleWidget(value);
                });
            },

            removeSingleWidget: function (id) {
                // remove widget by ID
            },

            addParameterType: function (name, type) {
                var x = 0;
                if (this.parameterTypes[name] == null) {
                    this.parameterTypes[name] = type;
                }
            },

            addSingleWidget: function (props) {
                var props = props;
                var myself = this;
                var parametersFromWidget = [];
                var success = function (data) {
                    
                    var paramsCollection = JSON.parse(data);
                    var parameterMapping = [];
                    //var a_listeners = [];
                    _.each(paramsCollection.parameters, function (value) {
                        var paramName = value.name;
                        var a_paramMap = [paramName, paramName];
                        //a_listeners.push(paramName);
                        if (myself.dashboard.parameters.indexOf(paramName) == -1) {
                            //myself.dashboard.addParameter(paramName, JSON.parse(value.value));
                            myself.dashboard.addParameter(paramName,value.value);
                            myself.addParameterType(paramName, value.type);

                            // TODO: add parameter to cdf structure
                            // myself.dashops.addComponent(props.id, props.link, parameterMapping, props.placeholder);
                        }
                        parametersFromWidget.push(paramName);
                        parameterMapping.push(a_paramMap);
                    });

                    var widget = new DashboardComponent({
                        type: "DashboardComponent",
                        name: props.id,
                        priority: 5,
                        dashboardPath: props.link,
                        parameterMapping: parameterMapping,
                        dataSourceMapping: [],
                        executeAtStart: true,
                        htmlObject: props.placeholder,
                        //listeners: a_listeners,
                        refreshPeriod: 0,
                        oneWayMap: false,
                        a_myself: myself,
                        postExecution: function () {

                            
                            /*
                            _.each($('#' + this.htmlObject).find('.clearfix'), function (item) {
                                $('#' + item.id).removeClass('row');
                                $('#' + item.id).removeClass('clearfix');
                            });
                            */
                            var $elem = $('#' + this.htmlObject);

                            // TODO: Review the Regular expression that grabs the bootstrap span classes
                            var element_length = $elem.find('.layoutEditorWidgetWrapper').length;

                            if( element_length > 0 ) {
                                var bootstrap_classes_Arr = $elem.find('.layoutEditorWidgetWrapper').parent().attr('class').match(/col-[a-z]+-\d+/g);

                                var bootstrap_classes = "";

                                for (var idx = 0; idx < bootstrap_classes_Arr.length; ++idx) {
                                    bootstrap_classes += bootstrap_classes_Arr[idx] + " ";
                                    $elem.find('.layoutEditorWidgetWrapper').parent().removeClass(bootstrap_classes_Arr[idx]);
                                }

                                //$elem.find('.widgetsize').parent().removeClass(a_class);
                                $elem.find('.layoutEditorWidgetWrapper').parent().addClass('col-xs-12');
                                var a_parent = $('#' + this.htmlObject + '_sizeDiv');
                                //a_parent.addClass(a_class);
                                a_parent.addClass(bootstrap_classes);
                            }
                            else {
                                // DO NOTHING?
                                var a_parent = $('#' + this.htmlObject + '_sizeDiv');
                                a_parent.addClass('col-xs-12');
                            }

                        }
                    });
                    myself.dashboard.addComponents([widget]);
                    widget.update();
                    window.dashops = myself.dashops;

                    // adding to cdfstructures 
                    myself.dashops.addPlaceholder(props.id);
                    myself.dashops.addComponent(props.id, props.link, parameterMapping, props.placeholder);

                    //myself.dashops.saveDashboard('/public/tests/test12345_.wcdf', '', '', myself.dashops.cdfstructure);

                    props.rendered = true;
                }

                var fail = function (error) {
                    return false;
                }
                endpoints.runRequest('list_parameters', { data: { paramfile: props.link } }, success, fail);
                //var $html = this.addWidgetPlaceholder(props.id, props.id, '');
                var $html = this.addWidgetPlaceholder(props.id, 'layoutEditorWidgetWrapper', '', parametersFromWidget);
                this.widgetsCounter += 1;
                props.placeholder = $html;
                return $html;
            },

            addWidgetPlaceholder: function (rowId, rowClass, rowSize, parametersFromWidget) {
                this.toolbox.addWidgetPlaceholder(rowId, rowClass, '');
                //add code here to attach the options button to the widget
                this.addWidgetOrder(rowId, rowClass, rowSize, parametersFromWidget);
                this.toolbox.attachEvents('widgetPlaceholder', this.toolbox.placeholders['widgetsPlaceholderWrapper']);
            },

            addWidgetOrder: function (rowId, rowClass, rowSize, parametersFromWidget) {
                this.widgetsControl.counter += 1;
                this.widgetsControl.widgetOrder[rowId] = this.widgetsControl.counter;
                this.widgetsControl.widgetsName.push(rowId);
                this.widgetsControl.widgetParameter[rowId] = parametersFromWidget;
            },

            removeWidgetsFromDashboard: function (rowId) {
                // TODO
                //widgets that have the same parameters as the one that is going to be removed
                var widgetParams = this.getWidgetFromParameter(rowId);
                var paramsToRemove = this.getParametersWidget(rowId);
                //remove from dashboard
                for (idx in paramsToRemove) {
                    delete this.dashboard.parameters[paramsToRemove[idx]];
                }
                //remove from dashops
                this.dashops.removeComponent(rowId);
                this.dashops.removePlaceholder(rowId);
                this.resetWidgetOrder(rowId);

                //props.rendered = false; 
            },

            // When a widget is removed, we need to know if we should or not display an alert saying if another widget uses the same parameters
            getWidgetFromParameter: function (widgetToRemove) {
                var paramsToRemove = this.getParametersWidget(widgetToRemove);
                var paramsList = {};
                for (var key in this.widgetsControl.widgetParameter) {
                    if (key != widgetToRemove) {
                        var params = this.widgetsControl.widgetParameter[key];
                        _.each(params, function (value) {
                            if (paramsToRemove.indexOf(value) != -1) {
                                if (paramsList[key] == null || typeof paramsList[key] == "undefined") paramsList[key] = "";
                                paramsList[key] += value + ";";
                            }
                        });
                    }
                }
                return paramsList;
            },

            getParametersWidget: function (widget) {
                return this.widgetsControl.widgetParameter[widget];
            },

            resetWidgetOrder: function (widgetToRemove) {
                var widgetPosition = this.widgetsControl.widgetOrder[widgetToRemove];
                var counter = 1;
                this.widgetsControl.counter -= 1;
                delete this.widgetsControl.widgetOrder[widgetToRemove];
                for (var key in this.widgetsControl.widgetOrder) {
                    this.widgetsControl.widgetOrder[key] = counter;
                    ++counter;
                }
                var idx = this.widgetsControl.widgetsName.indexOf(widgetToRemove);
                this.widgetsControl.widgetsName.splice(idx, 1);
                delete this.widgetsControl.widgetParameter[widgetToRemove];

            },

            resetWidgetOrderAll: function () {

            },
            hasParameter: function () {
                // TODO
            },

            addParameter: function () {
                // TODO
            },

            removeParameter: function () {
                // TODO
            },

            addComponent: function () {
                // TODO
            },

            removeComponent: function () {
                // TODO
            },

            // myself.dashops.saveDashboard('/public/tests/test12345_.wcdf', '', '', myself.dashops.cdfstructure);
            saveDashboard: function (filename, title, description, widgetsOrder, cdfstructure) {
                return this.dashops.saveDashboard(filename, title, description, widgetsOrder, this.dashops.cdfstructure);
            }
        }

        return object;
    }
);