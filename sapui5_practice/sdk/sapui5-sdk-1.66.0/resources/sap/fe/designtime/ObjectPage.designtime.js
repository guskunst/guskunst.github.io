/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";return{actions:{settings:{"disableEditableObjectPageHeader":{name:sap.ui.getCore().getLibraryResourceBundle("sap.fe.designtime").getText('OBJECTPAGE_DISABLE_EDITABLE_HEADER'),isEnabled:function(o){return o.getBinding('showHeaderContent')!==undefined;},handler:function(o){return Promise.resolve().then(function(){return[{selectorControl:o,changeSpecificData:{changeType:"disableEditableObjectPageHeader",content:false}}];});}},"changeObjectPageLayout":{name:function(o){return sap.ui.getCore().getLibraryResourceBundle("sap.fe.designtime").getText('OBJECTPAGE_SET_ICON_TAB_BAR_FOR_LAYOUT',o.getProperty("useIconTabBar")?"Disable":"Enable");},handler:function(o){return Promise.resolve().then(function(){return[{selectorControl:o,changeSpecificData:{changeType:"changeObjectPageLayout",content:{useIconTabBar:!o.getProperty("useIconTabBar")}}}];});}}}}};},false);
