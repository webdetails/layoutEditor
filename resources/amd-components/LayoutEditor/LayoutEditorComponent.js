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
define([
    'cdf/Logger',
    'cdf/dashboard/Utils',
    'cdf/lib/jquery',
    'amd!cdf/lib/underscore',
    'cdf/components/UnmanagedComponent',
    './LayoutEditor/resources/js/editor',
    './LayoutEditor/resources/js/status',
    'css!./LayoutEditor/resources/css/LayoutEditorComponent'
],
    function (Logger, Utils, $, _, UnmanagedComponent, editor, status) {

        var LayoutEditor = UnmanagedComponent.extend({

            defaults: {
                name: 'Layout Editor',
                messages: {
                    error: ''
                }
            },
            
            update: function () {
                $.extend(true, this.defaults, Utils.ev(this.extraOptions));
                _.bindAll(this, 'render');
                this.synchronous(this.render);
            },

            render: function () {
                this.dashboard.status = this.status = status;
                var a_status = status;
                this.dashboard.on("cdf:postInit", function(evt){
                    var editorWrapper = $($('.layoutEditorWrapper')[0]);
                    if(editorWrapper.children().length > 0){
                        var widgetWrappers = editorWrapper.find('.layoutEditorWidgetWrapper');
                        _.each(widgetWrappers, function(element, key) {

                            var $elem = $(element);

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
                                //var a_parent = $('#' + $elem.attr('id') + '_sizeDiv');
                                var a_parent = $elem.parent();
                                $(a_parent.children()).attr('data-id',$elem.attr('id'));
                                //a_parent.addClass(a_class);
                                a_parent.addClass(bootstrap_classes);
                            }
                            
                            else{
                                var a_parent = $('#' + $elem.attr('id') + '_sizeDiv');
                                (a_parent.children()).attr('data-id',$elem.attr('id'));
                                a_parent.addClass('col-xs-12');
                            }
                            
                        });
                        
                    }
                });
                $target = $('body').find('.container');
                this.htmlObject = editor.defaults['editorToolbox'].placeholder();
                editor.init(this.dashboard.status || {}, this, this.dashboard);
                editor.renderEditorToolbox($target, this, this.dashboard);
            }

        });
        return LayoutEditor;

    });
