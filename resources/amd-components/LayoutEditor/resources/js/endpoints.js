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
 * All the require requests to the server will are coded here. Callbacks functions should be from the origin
 ******************************************************************************************************************/

define([
    'cdf/lib/jquery',
    'amd!cdf/lib/underscore',
    'pentaho/environment'
],
    function ($, _, env) {

        if (!window.location.origin) {
            window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        }
       // var pentahoServerURL = window.location.origin + CONTEXT_PATH;
        var pentahoServerURL = env.server.root.href;
        var requests = {
            defaults: {
                endpoints: {
                    "load_config": {
                        url: pentahoServerURL + "plugin/layoutEditor/api/load_config",
                        async: false,
                        method: "GET",
                        data: {
                            "configName": null
                        }
                    },
                    "list_widgets": {
                        url: pentahoServerURL + "plugin/layoutEditor/api/list_widgets",
                        async: false,
                        method: "GET",
                        data: {
                            "configName": null
                        }
                    },
                    "can_edit": {
                        url: pentahoServerURL + "plugin/layoutEditor/api/can_edit",
                        async: false,
                        method: "GET"
                    },
                    "list_parameters": {
                        url: pentahoServerURL + "plugin/layoutEditor/api/list_parameters",
                        async: false,
                        method: "GET",
                        data: {
                            "paramfile": ""
                        }
                    },
                    "load_dashboard": {
                        url: pentahoServerURL + "plugin/layoutEditor/api/load_dashboard",
                        async: false,
                        method: "GET",
                        data: {
                            "paramfilename": null
                        }
                    },
                    "save_dashboard": {
                        url: pentahoServerURL + "plugin/pentaho-cdf-dd/api/syncronizer/saveDashboard",
                        async: false,
                        method: "POST",
                        processData: false,
                        contentType: false,
                        mimeType: "multipart/form-data",
                        data: null
                    },
                    "save_dashboard_settings": {
                        url: pentahoServerURL + "plugin/pentaho-cdf-dd/api/syncronizer/saveDashboard",
                        async: false,
                        method: "POST",
                        processData: false,
                        contentType: false,
                        mimeType: "multipart/form-data",
                        data: {
                            "operation": "saveSettings",
                            "file": "",
                            "author": "Layout Editor",
                            "description": "",
                            "rendererType": "bootstrap",
                            "require": true,
                            "style": "CleanRequire",
                            "title": "",
                            "widget": false
                        }
                    },
                    "list_folders": {
                        url: pentahoServerURL + "plugin/pentaho-cdf-dd/api/resources/explore?fileExtensions=.wcdf&access=create",
                        async: false,
                        method: "POST",
                        data: {
                            "dir": ""
                        }
                    }
                }
            },

            runRequest: function (request, options, success, fail) {
                var resultStatus = undefined;
                var a_jqXHR = undefined;
                var request = $.extend(true, {}, this.defaults.endpoints[request], options);
                if (!_.isUndefined(request)) {
                    var result = $.ajax(request)
                        .done(function (data, textStatus, jqXHR) {
                            resultStatus = jqXHR.status;
                            a_jqXHR = jqXHR;
                            if (_.isFunction(success)) {
                                success(data);
                            }
                        })
                        .fail(function (jqXHR, textStatus, errorThrown) {
                            a_jqXHR = jqXHR;
                            resultStatus = jqXHR.status;
                            if (_.isFunction(fail)) {
                                fail(jqXHR);
                            }
                        });
                    return result;
                }
            }
        }

        return requests;

    }
);
