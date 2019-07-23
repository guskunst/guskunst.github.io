/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./library","sap/ui/Device"],function(l,D){"use strict";var a={};a.render=function(r,d){r.write("<div ");r.writeControlData(d);r.addClass("drawerToolbar");if(!d.getExpanded()){r.addClass("drawerToolbarCollapsed");}else{r.addClass("drawerToolbarExpanded");}r.writeClasses();r.write(">");r.renderControl(d._container);r.write("</div>");};return a;},true);
