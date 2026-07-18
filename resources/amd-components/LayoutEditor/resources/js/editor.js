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
 * Manages the toolbox bar and main options as adding widgets 
 ******************************************************************************************************************/

define([
    'cdf/Logger',
    'cdf/lib/jquery',
    'cdf/lib/mustache',
    'amd!cdf/lib/underscore',
    'cdf/lib/moment',
    './endpoints',
    './dashops',
    'pentaho/environment',
    'amd!layoutEditor/components/LayoutEditor/resources/libs/js/jqueryFileTree',
    'amd!cdf/lib/mustache-wax',
    'css!../css/widgets.css'
],
    function (Logger, $, Mustache, _, moment, endpoints, dashops, env) {

        //var pentahoServerURL = FULL_QUALIFIED_URL;
        var pentahoServerURL = env.server.root.href;

        var object = {

            defaults: {
                user_can_edit : true,
                editorToolbox: {
                    placeholder: function () { return this.model.colId },
                    model: {
                        rowId: 'layoutEditor_internal_Row',
                        rowIdClass: 'layoutEditor_internal_Row',
                        colId: 'layoutEditor',
                        colClass: 'layoutEditor'
                    },
                    template: '' +
                        '<div id="{{rowId}}" class="{{rowClass}} row clearfix">' +
                        '   <div class="col col-xs-12 last">' +
                        '       <div id="{{colId}}" class="{{colClass}}">' +
                        '           <div class="configComponentMainCont">' +
                        '               <div class="layoutEditorComponentToolbar">' +
                        '                   <div class="enterExitCont editCtrlGroupCont">' +
                        '                       <div class="buttonOptions editCtrlCont">' +
                        '                           <div class="optionsContainer editCtrlCont editor--bar--editMenu" id="optionsContainer">' +
                        '                               <div class="editMenu--item">' +
                        '                                   <div class="saveAsImg save"></div>' +
                        '                                   <div class="saveCont editCtrlCont saveDisabled">Save</div>' +
                        '                               </div>' +
                        '                               <div class="editMenu--item">' +
                        '                                   <div class="saveAsImg saveas"></div>' +
                        '                                   <div class="saveAsDash editCtrlCont saveDisabled">Save As</div>' +
                        '                               </div>' +
                        '                               <div class="editMenu--item">' +
                        '                                   <div class="newDashImg"></div>' +
                        '                                   <div class="createNewCont editCtrlCont">New Dashboard</div>' +
                        '                               </div>' +
                        '                           </div>' +
                        '                        </div>' +
                        '                       <div class="addWidgetCont editCtrlCont"> <button class="addWidgetButton"></button> </div>' +
                        '                       <div class="enableCont editCtrlCont pull-right"> <button class="enableButton" alt="Edit"></button> </div>' +
                        '                       <div class="cancelCont editCtrlCont pull-right"> <button class="cancelButton">Close</button> </div>' +
                        '                   </div>' +
                        '               <div class="insertCont editCtrlGroupCont">' +
                        '                   <div id="assetFilterObj" class="assetFilterObj editCtrlCont">' +
                        '                       <div>Hidden Assets</div>' +
                        '                   </div>' +
                        '                   <div id="settingsFilterObj" class="settingsFilterObj editCtrlCont">' +
                        '                       <div>Configure</div>' +
                        '                   </div>' +
                        '               </div>' +
                        '           </div>' +
                        '       </div>' +
                        '   </div>' +
                        '</div>',
                    events: {
                        openOptions: {
                            elemSelector: '.buttonOptions',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                $('#optionsContainer').toggleClass("show");
                            }
                        },
                        editDash: {
                            elemSelector: '.enableButton',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                event.stopPropagation();
                                Logger.info('Enable edit clicked');
                                $('body').removeClass('visualMode');
                                editor.defaults.editorToolbox.utils.toggleEdition($html);
                                if (!editor.isEmptyObject(status.widgetsControl.widgetOrder)) {
                                    _.each(status.widgetsControl.widgetsName, function (elementName) {
                                        var toPrepend = editor.prependOptionsButtonsWrapper(elementName);
                                        var wrapper = '#' + elementName;
                                        $(wrapper).wrapAll(toPrepend);
                                    });
                                    $('.layoutEditorWrapper').sortable();
                                    $('.layoutEditorWrapper').sortable('enable');
                                    
                                    if($('.saveAsDash').hasClass('saveDisabled')) $('.saveAsDash').removeClass('saveDisabled');
                                    
                                    editor.attachEvents('widgetPlaceholder', status.toolbox.placeholders['widgetsPlaceholderWrapper']);
                                }
                            }
                        },
                        cancelEditDash: {
                            elemSelector: '.cancelButton',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                event.stopPropagation();
                                Logger.info('Cancel clicked');
                                editor.placeholders['confirmClosePlaceHolder'] = $(editor.getView('confirmClosePlaceHolder'));
                                editor.placeholders['confirmClosePlaceHolder'].dialog(editor.defaults['confirmClosePlaceHolder'].modalOptions);
                               /*
                                if(editor.status.getGroupWidgetControlCounter() == 0)
                                {
                                    $('.buttonSaveClose').attr('disabled',true);
                                    $('.buttonNoSaveClose').attr('disabled',true);
                                }
                                else
                                {
                                    $('.buttonSaveClose').attr('disabled',false);
                                    $('.buttonNoSaveClose').attr('disabled',false);
                                }
                                */
                               $('body').addClass('visualMode');
                                editor.attachEvents('confirmClosePlaceHolder', editor.placeholders['confirmClosePlaceHolder']);
                            }
                        },
                        addWidgets: {
                            elemSelector: '.addWidgetCont',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                event.stopPropagation();
                                Logger.info('Add Widgets clicked');
                                var success = function (result) {
                                    result = JSON.parse(result);
                                    editor.renderWidgetsDialog('widgetSelector', result);
                                    status.setGroupWidgetControlCounter(result.groups.length);
                                    
                                }
                                var fail = function (result) {
                                    return false;
                                }
                                endpoints.runRequest('list_widgets', {}, success, fail);
                            }
                        },
                        revertChanges: {
                            elemSelector: '.restoreOrigCont',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                event.stopPropagation();
                                Logger.info('Restore clicked');
                                editor.defaults.editorToolbox.toggleEdition($html);
                                // TODO: revert changes
                            }
                        },
                        saveNewDashboard: {
                            elemSelector: '.saveAsDash',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                //TODO: pop up save window
                                
                                event.stopPropagation();
                                if( $('.saveAsDash').hasClass('saveDisabled') ) return;
                                Logger.info('Pop Up Save As clicked');
                                var result = {};
                                editor.saveDashboardDialog('saveDashboardPlaceHolder', result);
                            }
                        },
                        saveDashboard: {
                            elemSelector: '.saveCont',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                //TODO: pop up save window
                                event.stopPropagation();
                                Logger.info('Pop Up Save clicked');
                                if ($('.saveCont').hasClass('saveDisabled')) return;
                                var result = {};
                                var path = editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].selectedFolderToSave;
                                var fileName = editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].fileName;
                                var savedFlag = editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].isFileSaved;
                                var pathToFile = path + fileName;
                                var title = editor.defaults["saveDashboardPlaceHolder"]["savePath"].fileTitle,
                                    description = editor.defaults["saveDashboardPlaceHolder"]["savePath"].fileDescription;
                                //var title = $('#fileTitleText')[0].value,
                                //    description = $('#fileDescText')[0].value;
                                if (!savedFlag) {
                                    editor.saveDashboardDialog('saveDashboardPlaceHolder', result);
                                }
                                else {
                                    var savedResult = status.saveDashboard(pathToFile, title, description, status.widgetsControl.widgetOrder);
                                    editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].isFileSaved = savedResult;
                                    var message = savedResult ? "Dashboard saved successfully":"Dashboard not saved";
                                    if(savedResult) editor.successNotifyBar(message);
                                    else editor.errorNotifyBar(message,{});
                                    //proceed to save endpoint
                                }
                                $('.mainSaveButton').attr('disabled',true);
                                $('.saveCont').addClass('saveDisabled');
                            }
                        },
                        createNewDashboard: {
                            elemSelector: '.createNewCont',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                event.stopPropagation();
                                Logger.info('Create New Dashboard');
                                var templatesFolder = editor.config.templatespath,
                                    template = templatesFolder + editor.config.defaulttemplate,
                                    tmpFolder = editor.config.tmppath,
                                    dashboard = tmpFolder + editor.config.defaulttemplate;
                                // TODO: replace hardcoded values by values coming from config file or comming from user input
                                dashops.createNewFromTemplate(template, dashboard, 'New From Template', 'New From Template');
                                window.open(pentahoServerURL + 'api/repos/' + dashboard.replace(/\\|\//g, ':') + '/generatedContent');
                            }
                        },

                        editModeDashBoard: {
                            elemSelector: '.editDashModeButton',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                var myself = this
                                status = status;
                                event.stopPropagation();
                                Logger.info('Create New Dashboard');
                                //LOOP through status.widgetsOrder and add the options button
                                if ($(this.elemSelector).hasClass('editState')) {
                                    _.each(status.widgetsOrder.widgetsName, function (elementName) {
                                        var toPrepend = editor.prependOptionsButtonsWrapper(elementName);
                                        var wrapper = '#' + elementName + '_Wrapper';
                                        $(wrapper).prepend(toPrepend);
                                        $(myself.elemSelector).removeClass('editState')
                                        $(myself.elemSelector).text('Apply Mode');

                                    });
                                    editor.attachEvents('widgetPlaceholder', status.toolbox.placeholders['widgetsPlaceholderWrapper']);
                                }
                                else {
                                    _.each(status.widgetsOrder.widgetsName, function (elementName) {
                                        var optionsButtons = '#' + elementName + '_optionsButtonsWrapper';
                                        $(optionsButtons).remove();
                                        $(myself.elemSelector).addClass('editState')
                                        $(myself.elemSelector).text('Edit Mode');
                                    });
                                }

                            }
                        }
                    },
                    utils: {
                        toggleEdition: function ($html) {
                            //var $elem = $html.find('.configComponentMainCont');
                            var $elem = $('.configComponentMainCont');
                            if ($elem.hasClass('enabled')) {
                                //$html.find('.configComponentMainCont').removeClass('enabled');
                                $('.configComponentMainCont').removeClass('enabled');
                                // TODO: Change this to apply the class to the widgets wrapper
                                $('.container').removeClass('editDashboardEnabled');
                                //$('body').find('.layoutEditorWrapper').removeClass('editDashboardEnabled');
                            } else {
                                //$html.find('.configComponentMainCont').addClass('enabled');
                                $('.configComponentMainCont').addClass('enabled');
                                
                                // TODO: Change this to apply the class to the widgets wrapper
                                $('.container').addClass('editDashboardEnabled');
                                //$('body').find('.layoutEditorWrapper').addlass('editDashboardEnabled')
                            }
                        }
                    }
                },

                saveDashboardPlaceHolder: {
                    model: {
                        id: 'saveDashboardPlaceHolder',
                        class: 'saveDashboardPlaceHolder',
                        size: ''
                    },
                    template: '' +
                        '<div class="divTable">' +
                        '    <div class="divTableBody mainWidgetPopupWindow">' +
                        '        <div class="saveAsTitleContainer">' +
                        '           <div class="mainWidgetPopupWindowTitle">Save As </div>' +
                        '           <div class="mainWidgetPopupWindowSubTitle">Select folder to save</div>' +
                        '       </div>' +
                        '       <div class="folderExplorerContainer" id="folderExplorerContainer">' +
                        '           <div class="folderexplorer" id="divFolderExplorer"></div>' +
                        '       </div>' +
                        '       <div class="fileNameContainer">' +
                        '           <div class="mainWidgetPopupWindowSubTitle">File Name*</div>' +
                        '           <div class="fileNameInput">' +
                        '               <input type="text" name="fileNameText" id="fileNameText" size="50%" class="fileNameText" placeholder="Insert text">' +
                        '           </div>' +
                        '           <div class="mainWidgetPopupWindowSubTitle">Title</div>' +
                        '           <div class="fileNameInput">' +
                        '               <input type="text" name="fileTitleText" id="fileTitleText" size="50%" class="fileNameText" placeholder="Insert text">' +
                        '           </div>' +
                        '           <div class="mainWidgetPopupWindowSubTitle">Description</div>' +
                        '           <div class="fileNameInput">' +
                        '               <input type="text" name="fileDescText" id="fileDescText" size="50%" class="fileNameText" placeholder="Insert text">' +
                        '           </div>' +
                        '       </div>' +
                        '       <div class="mainWidgetsButtons">' +
                        '           <div class="widgetButtons saveAsButtons CancelButton"> <button class="saveAsActionButtons cancelButton">Cancel</button> </div>' +
                        '           <div class="widgetButtons saveAsButtons SaveButton"> <button class="saveAsActionButtons saveButton">Save</button> </div>' +
                        '       </div>' +
                        '   </div>' +
                        '</div>',
                    modalOptions: {
                        modal: true,
                        draggable: false,
                        resizable: false,
                        width: '45%',
                        closeOnEscape: false
                    },
                    events: {
                        add: {
                            elemSelector: '.saveButton',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                Logger.info('Save clicked');
                                var path = editor.defaults["saveDashboardPlaceHolder"]["savePath"].selectedFolderToSave;
                                var fileName = $('#fileNameText')[0].value;
                                fileName += fileName.indexOf('.wcdf') == -1 ? '.wcdf' : "";
                                editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].fileName = fileName;
                                editor.defaults["saveDashboardPlaceHolder"]["savePath"].fileTitle = $('#fileTitleText')[0].value;
                                editor.defaults["saveDashboardPlaceHolder"]["savePath"].fileDescription = $('#fileDescText')[0].value;
                                var title = $('#fileTitleText')[0].value,
                                    description = $('#fileDescText')[0].value;
                                var pathToFile = path + fileName;
                                var index = 1;
                                var widgetsOrder = {};
                                _.each($('.layoutEditorWrapper').children(), function (value) {
                                    widgetsOrder[index] = value.id;
                                    ++index;
                                });
                                
                                //editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].isFileSaved = status.saveDashboard(pathToFile, title, description, status.widgetsControl.widgetOrder);
                                
                                var savedResult = status.saveDashboard(pathToFile, title, description, status.widgetsControl.widgetOrder);
                                editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].isFileSaved = savedResult;
                                var message = savedResult ? "Dashboard saved successfully":"Dashboard not saved";
                                if(savedResult) editor.successNotifyBar(message);
                                else editor.errorNotifyBar(message,{});
                                
                                $('.mainSaveButton').attr('disabled',true);
                                $('.saveCont').addClass('saveDisabled');
                                $html.remove();
                            }
                        },
                        cancel: {
                            elemSelector: '.cancelButton',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                Logger.info('Cancel clicked');

                                $html.remove();
                            }
                        }
                    },
                    savePath: {
                        //*************************************************************************************************************************
                        //**isFileSaved flag should be set to true everytime the dashboard is saved. In the other actions, should be set to false**
                        //*************************************************************************************************************************
                        isFileSaved: false,
                        selectedFolderToSave: "",
                        fileName: "",
                        fileTitle: "",
                        fileDescription: ""
                    }
                },

                confirmClosePlaceHolder:{
                    model: {
                        id: 'confirmClosePlaceHolder',
                        class: 'confirmClosePlaceHolder'
                    },
                    template: ''+
                            '<div class="closeConfirmWrapper">'+
                            '        <div class="closeConfirmTitle">Close without saving</div>'+
                            '        <div class="closeConfirmDescription">'+
                            '            <p>You will lose all changes made on this dashboard.</p>'+
                            '            <p>Are you sure you want to close?</p>'+
                            '            <p>This cannot be undone.</p>'+
                            '        </div>'+
                            '        <div class="closeConfirmButtonsWrapper">'+
                            '                <div class=" buttonCancelWrapper">'+
                            '                    <button class="buttonActions buttonCancel">Cancel</button>'+ 
                            '                </div>'+
                            '                <div class=" buttonNoSaveCloseWrapper">'+
                            '                    <button class="buttonActions buttonNoSaveClose">Close without Save</button>'+
                            '                </div>'+
                            '                <div class=" buttonSaveCloseWrapper">'+
                            '                    <button class="buttonActions buttonSaveClose">Save and Close</button>'+
                            '                </div>'+
                            '        </div>'+
                            '</div>',
                    modalOptions: {
                        modal: true,
                        draggable: false,
                        resizable: false,
                        width: '460px',
                        dialogClass: "closeWithoutSaveDialog",
                        closeOnEscape: false
                    },
                    events: {
                        cancelClose: {
                            elemSelector: '.buttonCancel',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                var cancel = "";
                                event.stopPropagation();
                                $html.empty().remove();
                            }
                        },
                        saveAndClose: {
                            elemSelector: '.buttonSaveClose',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                var saveAndClose = "";
                                event.stopPropagation();
                                var result = {};
                                
                                for (key in status.widgetsControl.widgetOrder) {
                                    var wrapper = '#' + key;
                                    $(wrapper + '_optionsList').remove();
                                    $(wrapper + '_optionsButtonToggle').remove();
                                    $(wrapper + '_widgetOptionsToggle').remove();
                                    $(wrapper).unwrap();
                                }
                                editor.defaults.editorToolbox.utils.toggleEdition($html);
                                $html.empty().remove();
                                
                                var path = editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].selectedFolderToSave;
                                var fileName = editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].fileName;
                                var savedFlag = editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].isFileSaved;
                                var pathToFile = path + fileName;
                                
                                var title = editor.defaults["saveDashboardPlaceHolder"]["savePath"].fileTitle,
                                    description = editor.defaults["saveDashboardPlaceHolder"]["savePath"].fileDescription;
                                if (!savedFlag) {
                                    editor.saveDashboardDialog('saveDashboardPlaceHolder', result);
                                }
                                else {
                                    //editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].isFileSaved =  status.saveDashboard(pathToFile, title, description, status.widgetsControl.widgetOrder);
                                    var savedResult = status.saveDashboard(pathToFile, title, description, status.widgetsControl.widgetOrder);
                                    editor["defaults"]["saveDashboardPlaceHolder"]["savePath"].isFileSaved = savedResult;
                                    var message = savedResult ? "Dashboard saved successfully":"Dashboard not saved";
                                    if(savedResult) editor.successNotifyBar(message);
                                    else editor.errorNotifyBar(message,{});
                                    //proceed to save endpoint
                                }
                                $('.layoutEditorWrapper').sortable();
                                $('.layoutEditorWrapper').sortable('disable');
                                $('.mainSaveButton').attr('disabled',true);
                                $('.saveCont').addClass('saveDisabled');

                            }
                        },
                        noSaveAndClose: {
                            elemSelector: '.buttonNoSaveClose',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                var noSaveAndClose = "";
                                event.stopPropagation();
                                for (key in status.widgetsControl.widgetOrder) {
                                    var wrapper = '#' + key;
                                    $(wrapper + '_optionsList').remove();
                                    $(wrapper + '_optionsButtonToggle').remove();
                                    $(wrapper + '_widgetOptionsToggle').remove();
                                    $(wrapper).unwrap();
                                }
                                editor.defaults.editorToolbox.utils.toggleEdition($html);
                                $('.layoutEditorWrapper').sortable();
                                $('.layoutEditorWrapper').sortable('disable');
                                $html.empty().remove();
                            }
                        },
                    }
                },

                widgetsPlaceholderWrapper: {
                    model: {
                        id: 'layoutEditorWrapper',
                        class: 'layoutEditorWrapper',
                        size: ''
                    },
                    template: '' +
                        '<div id="{{id}}" class="{{class}} row clearfix">' +
                        '</div>',
                },

                widgetPlaceholder: {
                    model: {
                        id: 'layoutEditorWidgetWrapper',
                        class: 'layoutEditorWidgetWrapper',
                        size: 'col-xs-12',
                        widgetId: ''
                    },
                    //for="{{id}}_widgetOptionsToggle"
                    template: '' +
                        '<div class="{{size}}" id="{{id}}_sizeDiv" data-id="{{id}}">' +
                        '    <div class="widgetOptionsButtonsWrapper" data-id="{{id}}" id="{{id}}_optionsButtonsWrapper">' +
                        '       <input type="checkbox" id="{{id}}_widgetOptionsToggle" class="widgetOptionsToggle hidden"/>' +
                        '       <div id="{{id}}_optionsButtonToggle" class="{{id}}_optionsButtonToggle"></div>' +
                        '       <div class="optionsList" data-id="{{id}}" id="{{id}}_optionsList"> ' +
                        '           <div id="overlay1" class="overlay" data-id="{{id}}"></div>' +
                        '           <div class="closeButtonW" data-id="{{id}}"></div>'+
                        '       </div>' +
                        '       <div class="{{size}} {{class}}" id="{{id}}" data-id="{{id}}">' +
                        '       </div>' +
                        '   </div>' +
                        '</div>',

                    events: {
                        removeWidget: {
                            elemSelector: '.closeButtonW',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                event.stopPropagation();
                                Logger.info('Close widget clicked');
                                var widgetId = $(event.currentTarget).data('id');
                                editor.placeholders["widgetsPlaceholderWrapper"].find('div[data-id="' + widgetId + '"]').remove();
                                var widgetsIds = _.map(editor.dashboard.components, function (value, index) {
                                    return value.name;
                                });
                                // removeComponents from dashboard
                                editor.dashboard.components.splice(widgetsIds.indexOf(widgetId), 1);
                                editor.status.removeWidgetsFromDashboard(widgetId);
                                editor.status.removeFromStatus('widgets', widgetId);
                                $('.mainSaveButton').attr('disabled',false);
                                $('.saveCont').removeClass('saveDisabled');
                                $('.saveAsDash').removeClass('saveDisabled');
                                if (editor.status.getGroupWidgetControlCounter() == 0) {
                                    $('#newDashboardObj').removeClass('hide');
                                }
                            }
                        },

                        resetWidgetOrder: {
                            elemSelector: ".layoutEditorWrapper",
                            eventName: 'sortstop',
                            eventFunction: function (event, editor, status, $html) {
                                event.stopPropagation();
                                Logger.info('Close widget clicked');
                            }
                        }
                    }
                },

                widgetSelector: {
                    model: {
                        groups: [],
                        widgets: []
                    },
                    template: '' +
                        '<div class="mainWidgetPopupWindow">' +
                        '   <div class="mainWidgetPopupWindowTitle">Add widgets</div>' +
                        '   <div class="mainWidgetPopupWindowSubTitle">Select widget(s)</div>' +
                        '   <div class="mainWidgetPanelWrapper" >' +
                        '       <div class="widgetsGroupSelectorWrapper">' +
                        '           <div class="widgetsGroupSelector">' +
                        '               {{#groups}}' +
                        '                   <div class="widgetGroupButton {{.}}  active" data-group="{{.}}">{{.}}</div>' +
                        '               {{/groups}}' +
                        '               {{^groups}}' +
                        '                   <div>No groups available</div>' +
                        '               {{/groups}}' +
                        '           </div>' +
                        '       </div>' +
                        '	    <div class="widgetsSelectorWrapper">' +
                        '           <div class="widgetsSelectorHeader" >' +
                        '                       <div class="widgetItemHeader column1">Name</div>' +
                        '                       <div class="widgetItemHeader column2">Modified</div>' +
                        '                       <div class="widgetItemHeader column3">Select</div>' +
                        '           </div>' +
                        '           <div class="widgetsSelector" id="widgetsSelector">' +
                        '               {{#widgets}}' +
                        '                   <div class="widgetSelectorButton {{group}}" data-group="{{group}}" data-title="{{title}}" data-desc="{{desc}}" data-link="{{link}}">' +
                        '                       <div class="widgetItemImage {{getImageBackground}}" ></div>' +
                        '                       <div class="column1 widgetItemName" ><span class="widgetSelectorName">{{title}}</span></div>' +
                        '                       <div class="column2 widgetItemDate" ><span class="widgetSelectorModiifiedDate">{{formatModifiedDate}}</span></div>' +
                        '                       <div class="column3 widgetItemSelected" ><span class="widgetSelectorCheckbox"></span></div>' +
                        '                   </div>' +
                        '               {{/widgets}}' +
                        '               {{^widgets}}' +
                        '                   <div>No widgets available</div>' +
                        '               {{/widgets}}' +
                        '           </div>' +
                        '       </div>' +
                        '   </div>' +
                        '   <div class=" mainWidgetsButtons">' +
                        '       <div class="widgetButtons mainWidgetsCancelButton"> <button class="buttonActions cancelButton">Cancel</button> </div>' +
                        '       <div class="widgetButtons mainWidgetsAddButton"> <button class="buttonActions addButton disabled" disabled>Add</button> </div>' +
                        '   </div>' +
                        '</div>',

                    events: {
                        add: {
                            elemSelector: '.addButton',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                event.stopPropagation();
                                Logger.info('Add widget clicked');
                                //editor.placeholders['widgetSelector'].dialog('close');
                                
                                editor.status.addWidgetsToDashboard();
                                $('.mainSaveButton').attr('disabled',false);
                                $('.saveCont').removeClass('saveDisabled');
                                $('.saveAsDash').removeClass('saveDisabled');
                                //_.each($('#widgetsSelector').children(), function(element){
                                //    var a_element = $(element);
                                //    a_element.removeClass('active');
                                //});
                                $('.widgetSelectorButton').removeClass('active');
                                $('.widgetItemSelected').removeClass('active');
                                $('#addButton').addClass('disabled');
                                if (editor.status.getGroupWidgetControlCounter() > 0 && !$('#newDashboardObj').hasClass('hide')) {
                                    $('#newDashboardObj').addClass('hide');
                                }
                                status.setGroupWidgetControlInactive(0);
                                $html.empty().remove();
                            }
                        },

                        cancel: {
                            elemSelector: '.cancelButton',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                var editor = editor;
                                event.stopPropagation();
                                Logger.info('Cancel clicked');
                                var active_elems = $('.widgetSelectorButton.active');
                                _.each(active_elems, function(elem){
                                    var a_elem = $(elem).attr('data-group') +"_"+ $(elem).attr('data-title');
                                    editor.status.removeFromStatus('widgets',a_elem);
                                });
                                //$html.dialog('close'); -> this does not remove from DOM. Everytime we ask for widgets, a new dialog is attached to container.
                                status.setGroupWidgetControlInactive(0);
                                $html.empty().remove();
                            }
                        },

                        selectGroup: {
                            elemSelector: '.widgetGroupButton',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                event.stopPropagation();
                                Logger.info('Group selected clicked');
                                var $elem = $(event.currentTarget),
                                    group = $elem.data('group');
                                
                                //Trying to unselect group but at least one group must be selected.
                                if ($elem.hasClass('active')) {
                                    if((status.getGroupWidgetControlCounter() <= status.getGroupWidgetControlInactive()+1)) 
                                        return;
                                    status.setGroupWidgetControlInactive(status.getGroupWidgetControlInactive()+1);
                                    $elem.removeClass('active');
                                    var selectors = $('div[data-group="' + group + '"].widgetSelectorButton');
                                    $('div[data-group="' + group + '"].widgetSelectorButton').removeClass('active');
                                    _.each(selectors, function (value) {
                                        var selected = $(value);
                                        var key = selected.attr('widgetId');//selected.data('group') + '_' + selected.data('title');
                                        selected.children().eq(3).removeClass('active');
                                        editor.status.removeFromStatus('widgets', key);

                                    });
                                    $('div[data-group="' + group + '"].widgetSelectorButton').addClass('hideWidget');
                                    if (_.isEmpty(editor.status.getStatus()['widgets'])) {
                                        $('.addButton').prop('disabled', true);
                                        $('.addButton').addClass('disabled');
                                    }
                                } else {
                                    status.setGroupWidgetControlInactive(status.getGroupWidgetControlInactive()-1);
                                    $elem.addClass('active');
                                    $('div[data-group="' + group + '"].widgetSelectorButton').removeClass('hideWidget');
                                    if (!_.isEmpty(editor.status.getStatus()['widgets'])) {
                                        $('.addButton').prop('disabled', false);
                                        $('.addButton').removeClass('disabled');
                                    }
                                }
                            }
                        },

                        selectWidget: {
                            elemSelector: '.widgetSelectorButton',
                            eventName: 'click',
                            eventFunction: function (event, editor, status, $html) {
                                event.stopPropagation();
                                Logger.info('Widget selected clicked');
                                var $elem = $(event.currentTarget),
                                d = new Date(),
                                a_id = +d,
                                title = $elem.data('title'),
                                key = $elem.data('group').replace(/ /g, '_') + '_' + $elem.data('title').replace(/ /g, '_') + '_' + a_id.toString();
                                //a_widget = $elem.data('group').replace(/ /g, '_') + '_' + $elem.data('title').replace(/ /g, '_');
                                if ($elem.hasClass('active')) {
                                    var widgetId = $elem.attr('widgetId');
                                    editor.status.removeFromStatus('widgets', widgetId);
                                    $elem.children().eq(3).removeClass('active');
                                    $elem.removeClass('active');
                                    $elem.removeAttr('widgetId');
                                    if (_.isEmpty(editor.status.getStatus()['widgets'])) {
                                        $('.addButton').prop('disabled', true);
                                        $('.addButton').addClass('disabled');
                                    }
                                } 
                                else {
                                    var value = {
                                        id: $elem.data('group').replace(/ /g, '_') + '_' + $elem.data('title').replace(/ /g, '_') + '_' + a_id.toString(),
                                        group: $elem.data('group'),
                                        title: $elem.data('title'),
                                        desc: $elem.data('desc'),
                                        link: $elem.data('link'),
                                        placeholder: $elem.data('group').replace(/ /g, '_') + '_' + $elem.data('title').replace(/ /g, '_') + '_' + a_id.toString(),
                                        type: 'wcdf',
                                        rendered: false
                                    };
                                    editor.status.addToStatus('widgets', key, value);
                                    $('.addButton').prop('disabled', false);
                                    $('.addButton').removeClass('disabled');
                                    $elem.addClass('active');
                                    $elem.attr('widgetId',key);
                                    $elem.children().eq(3).addClass('active');
                                }
                            }
                        }
                    },

                    helpers: {
                        formatModifiedDate: function () {
                            return moment(this.modified).format('DD/MM/YY h:mm a')
                        },
                        getImageBackground: function () {
                            var descObj = "";
                            try {
                                descObj = JSON.parse(this.metadata);
                                if(descObj["type"] == "table") return "Tables";
                                return descObj["type"];
                            }
                            catch (e) {
                                return "unknown";
                            }
                        }
                    },

                    modalOptions: {
                        modal: true,
                        draggable: false,
                        resizable: false,
                        height: 400,
                        width: 700,
                        closeOnEscape: false
                    }
                }
            },

            widgetsDashboardOrder: [],
            status: null,
            component: null,
            dashboard: null,
            placeholders: {},
            config: {},

            //for="' + widgetName + '_widgetOptionsToggle"
            prependOptionsButtonsWrapper: function (widgetName) {
                var prependStr = '' +
                    //'<div class="{{size}}" id="{{id}}_sizeDiv" data-id="{{id}}">' +
                    '    <div class="widgetOptionsButtonsWrapper" data-id="' + widgetName + '" id="' + widgetName + '_optionsButtonsWrapper">' +
                    '       <input type="checkbox" id="' + widgetName + '_widgetOptionsToggle" class="widgetOptionsToggle hidden"/>' +
                    '       <div id="' + widgetName + '_optionsButtonToggle" class="' + widgetName + '_optionsButtonToggle"></div>' +
                    '       <div class="optionsList" data-id="' + widgetName + '" id="' + widgetName + '_optionsList"> ' +
                    '           <div id="overlay1" class="overlay" data-id="' + widgetName + '"></div>' +
                    '           <div class="closeButtonW" data-id="'+ widgetName +'"></div>'+
                    '       </div>' +
                    '       <div class="{{size}} {{class}}" id="' + widgetName + '" data-id="' + widgetName + '">' +
                    '       </div>' +
                    '   </div>' ;
                    //'</div>',
                    return prependStr;
            },
           

            appendNotifyBar: function() {
                var notifyBar = ''+
                '    <div id="notifyBar" class="notify-bar notify-bar-success" style="display: none;">'+
                '        <div class="notify-bar-icon"></div>'+
                '        <div class="notify-bar-message">Dashboard saved successfully</div>'+
                '    </div>';
                return notifyBar;
            },
            addWidgetPlaceholder: function (rowId, rowClass, rowSize) {
                this.setModel('widgetPlaceholder', $.extend(true, this.defaults, { id: rowId, class: rowClass, size: rowSize }));
                var $widgetContainer = $(this.getView('widgetPlaceholder'));
                this.placeholders['widgetsPlaceholderWrapper'].append($widgetContainer);
            },

            setDefaults: function (defaults) {
                $.extend(true, this.defaults, Utils.ev(defaults));
            },

            getDefaults: function (defaults) {
                return this.defaults;
            },

            setModel: function (id, model) {
                this.defaults[id].model = model;
            },

            getModel: function (id) {
                return this.defaults[id].model;
            },

            setPlaceholder: function (id, placeholder) {
                this.defaults[id] = placeholder;
            },

            getPlaceholder: function (id) {
                return this.defaults[id].placeholder;
            },

            setStatus: function (newstatus) {
                status = newstatus;
            },

            getStatus: function () {
                return status;
            },

            getView: function (id, model) {
                $.extend(true, this.defaults[id].model, model || {}, this.defaults[id].helpers);
                return Mustache.render(this.defaults[id].template, this.defaults[id].model);
            },

            attachEvents: function (id, $html) {
                var editor = this,
                    status = this.status;
                _.each(this.defaults[id].events, function (value, key) {
                    $html.find(value['elemSelector']).off(value['eventName']).on(value['eventName'], function (event) {
                        (value['eventFunction'])(event, editor, status, $html);
                    });
                });
            },

            renderWidgetsDialog: function (id, model) {
                this.placeholders['widgetSelector'] = $(this.getView(id, model));
                this.placeholders['widgetSelector'].dialog(this.defaults[id].modalOptions);
                this.attachEvents(id, this.placeholders['widgetSelector']);
            },

            renderEditorToolbox: function ($target) {
                if(this.defaults.user_can_edit){
                    var $layoutEditorView = $(this.getView('editorToolbox'));
                    $target.append($layoutEditorView);
                    this.placeholders['editorToolbox'] = $layoutEditorView;
                    var $widgetsView = $(this.getView('widgetsPlaceholderWrapper'));
                }

                var lEditorWidgetWrapper = $('.layoutEditorWidgetWrapper');
                //It's a blank dashboard
                if (lEditorWidgetWrapper.length == 0) {
                    $target.append($widgetsView);
                    $widgetsView.sortable();
                    //$widgetsView.sortable().disableSelection();
                    this.placeholders['widgetsPlaceholderWrapper'] = $widgetsView;
                    $target.append($widgetsView, $layoutEditorView);
                    $('.configComponentMainCont').addClass('enabled');
                }
                else {
                    // we need to know if the is an existing dasboard or a new one. 
                    //If widgetWrapper exists, at this point we can assure that is not a new dashboard 
                    $widgetsView = $target.find('.layoutEditorWrapper');
                    //$widgetsView.sortable().disableSelection();
                    $widgetsView.sortable();
                    $widgetsView.sortable('disable');
                    this.placeholders['widgetsPlaceholderWrapper'] = $widgetsView;
                }
                if(this.defaults.user_can_edit){
                    this.attachEvents('editorToolbox', this.placeholders['editorToolbox']);
                    this.attachEvents('widgetsPlaceholderWrapper', this.placeholders['widgetsPlaceholderWrapper']);
                }
                //Is an existing dashboard? Need to set the widgets order and count
                //var lEditorWidgetWrapper = $('.layoutEditorWidgetWrapper');
                for (var i = 0; i < lEditorWidgetWrapper.length; ++i) {
                    var theWidget = $(lEditorWidgetWrapper[i]);
                    this.status.addWidgetOrder(theWidget.attr('id'), theWidget.attr('id'), '');
                    var child = $(lEditorWidgetWrapper[i]);
                    child.parent().attr('data-id', child.attr('id'));
                    child.parent().attr('id', child.attr('id') + '_sizeDiv');

                }
                var myself = this;
                
                var a_notifyBar = this.appendNotifyBar();
                $(".layoutEditorWrapper").parent().append(a_notifyBar);
                
                // Will close the options pop  up when clicked
                $('html').click(function () {
                    $('#optionsContainer').removeClass("show");
                });
                //will stop the propagation of the previous event
                $('.enterExitCont').click(function (event) {
                    event.stopPropagation();
                });

                //SET SORT STOP EVENT TO RE-ORDER WIDGETS. DISCUSS WITH GASPAR OTHER OPTION
                $(".layoutEditorWrapper").sortable({
                    stop: function (event, ui, status, editor) {
                        var newOrderWidget = {};
                        var order = 1;
                        var lwrapper = $('.layoutEditorWrapper');
                        _.each(lwrapper.children(), function (child) {
                            var a_child = $(child);
                            if (typeof a_child.attr('data-id') != "undefined")
                                newOrderWidget[a_child.attr('data-id')] = order++;
                        });
                        myself.status.widgetsControl.widgetOrder = newOrderWidget;
                        $('.mainSaveButton').attr('disabled',false);
                        $('.saveCont').removeClass('saveDisabled');
                        $('.saveAsDash').removeClass('saveDisabled');
                        
                    }
                });

            },

            saveDashboardDialog: function (id, model) {
                this.placeholders['saveDashboardPlaceHolder'] = $(this.getView(id, {}));
                this.placeholders['saveDashboardPlaceHolder'].dialog(this.defaults[id].modalOptions);
                this.attachEvents(id, this.placeholders['saveDashboardPlaceHolder']);
                var myself = this;
                var selectedFolder = "";
                $('#divFolderExplorer').fileTree({
                    root: '/',
                    //script: FULL_QUALIFIED_URL + "plugin/pentaho-cdf-dd/api/resources/explore?fileExtensions=.wcdf&access=create",
                    script: pentahoServerURL + "plugin/pentaho-cdf-dd/api/resources/explore?fileExtensions=.wcdf&access=create",
                    expandSpeed: 1000,
                    collapseSpeed: 1000,
                    multiFolder: false,
                    folderClick: function (obj, folder) {
                        if ($(".selectedFolder").length > 0) $(".selectedFolder").attr("class", "");
                        $(obj).attr("class", "selectedFolder");
                        myself["defaults"]["saveDashboardPlaceHolder"]["savePath"].selectedFolderToSave = folder;
                    }
                }, function (file) {
                    var selectedFolder = myself["defaults"]["saveDashboardPlaceHolder"]["savePath"].selectedFolderToSave;
                    $("#fileNameText").val(file.replace(selectedFolder, ""));
                    myself["defaults"]["saveDashboardPlaceHolder"]["savePath"].fileName = $("#fileNameText").val();

                });
            },

            getParamsToDelete: function (widgetId, components) {
                for (var i = 0; i < components.length; ++i) {
                    if (components[i].name == widgetId) {
                        return components[i].publicParameters;
                    }
                }
            },

            prepareCdfStructure: function () {
                var originalFilename = this.dashboard.context.path,
                    filename = originalFilename.replace('wcdf', 'cdfde');
                var pathAndFilename = originalFilename.match('((?:[^/]*/)*)(.*)'),
                //plugin/layoutEditor
                    saveMetadata = this.defaults.saveDashboardPlaceHolder.savePath,
                    cdfstructure = this.dashops.loadDashboard(filename);
                    //&& filename.indexOf('/system/layoutEditor') == -1 
                if (pathAndFilename.length == 3 ) {
                    saveMetadata.selectedFolderToSave = pathAndFilename[1];
                    saveMetadata.fileName = pathAndFilename[2];
                    saveMetadata.isFileSaved = true;
                }

                if ( filename.indexOf('/system/layoutEditor') >= 0)  {
                    this.dashops.clearDashboard();
                    saveMetadata.selectedFolderToSave = "";
                    saveMetadata.fileName = "";
                    saveMetadata.isFileSaved = false;
                }
            },

            canEdit: function () {
                var canEdit = false;
                // TODO: if cannot edit, disable -> add widgets button this.placeholders.editorToolbox
                canEdit = endpoints.runRequest('can_edit', {});
                return canEdit;
            },
            
            init: function (status, component, dashboard) {
                //if (this.canEdit()) {
                    var editor = this;
                    this.status = status;
                    this.dashboard = dashboard;
                    this.component = dashboard.component;
                    this.config = JSON.parse((endpoints.runRequest('load_config')).responseText);
                    this.dashops = dashops;
                    status.init(editor, component, dashboard, this.dashops);
                    this.prepareCdfStructure();
                    this.defaults.user_can_edit = true;
                //}
                var can_edit = this.canEdit();
                if (can_edit.responseText=="true"){
                    this.defaults.user_can_edit = true;
                }
                else{
                    this.defaults.user_can_edit = false;
                }
                
            },
            isEmptyObject: function (obj) {
                for (var prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                        return false;
                    }
                }
                return true;
            },

            successNotifyBar: function(message) {
                this.notifyBar(message, 'success');
            },
            errorNotifyBar: function(message, error) {
                if (!!error) {
                    message += ": " + error;
                }
                this.notifyBar(message, 'error');
            },
            infoNotifyBar: function(message) {
                this.notifyBar(message, 'info');
            },
            notifyBar: function(message, type) {
                var notifyObject = $("#notifyBar");
                var notifyHtml = '<div class="notify-bar-icon"></div><div class="notify-bar-message">' + message + '</div>';
                if (!notifyObject.length) {
                    notifyObject = $('<div id="notifyBar" class="notify-bar"></div>');
                } else {
                    this.cleanStatus();
                }
                switch (type) {
                case 'success':
                    notifyObject.addClass('notify-bar-success');
                    break;
                case 'error':
                    notifyObject.addClass('notify-bar-error');
                    break;
                case 'info':
                    notifyObject.addClass('notify-bar-info');
                    break;
                }
                this.launchNotifyBar({
                    jqObject: notifyObject,
                    html: notifyHtml,
                    delay: 1500
                });
            },
            cleanStatus: function() {
                $("#notifyBar").removeClass('notify-bar-success').removeClass('notify-bar-error').removeClass('notify-bar-info')
            },

            launchNotifyBar: function(settings) {
                var bar = {};
                if (!settings) {
                    settings = {};
                }
                this.html = settings.html || "Your message here";
                this.delay = settings.delay || 2500;
                this.animationSpeed = settings.animationSpeed || "normal";
                this.jqObject = settings.jqObject;
                if (this.jqObject) {
                    bar = this.jqObject;
                } else {
                    bar = $("<div></div>").attr("id", "notifyBar").css("width", "100%").css("position", "absolute").css("top", "0px").css("left", "0px").css("z-index", "32768").css("background-color", "#BBBBBB").css("font-size", "18px").css("color", "#000").css("text-align", "center").css("font-family", "Arial, Helvetica, serif").css("padding", "30px 0px").css("border-bottom", "1px solid #000000");
                }
                bar.html(this.html).hide();
                var id = bar.attr("id");
                switch (this.animationSpeed) {
                case "slow":
                    asTime = 600;
                    break;
                case "normal":
                    asTime = 400;
                    break;
                case "fast":
                    asTime = 200;
                    break;
                default:
                    asTime = this.animationSpeed;
                }
                $("body").prepend(bar);
                bar.slideDown(asTime);
                //setTimeout("$('#" + id + "').slideUp(" + asTime + ");", this.delay + asTime);
                setTimeout(function(){$('#' + id ).slideUp(asTime);},this.delay + asTime);
                
            }
        }

        return object;

    }
);
