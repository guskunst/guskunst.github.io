/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","sap/ui/core/Core","sap/ui/core/Component","sap/ui/core/mvc/Controller"],function(q,C,a,b){"use strict";return b.extend("sap.ui.demokit.explored.view.app",{onInit:function(){this._afterRenderingDone=false;this._component=a.getOwnerComponentFor(this.getView());this._component.getEventBus().subscribe("app","applyAppConfiguration",this._applyAppConfiguration,this);},onAfterRendering:function(){if(this.hasOwnProperty("_compactOn")){q('body').toggleClass("sapUiSizeCompact",this._compactOn).toggleClass("sapUiSizeCozy",!this._compactOn);}if(this.hasOwnProperty("_themeActive")&&!q.sap.getUriParameters().get("sap-theme")&&!q.sap.getUriParameters().get("sap-ui-theme")){sap.ui.getCore().applyTheme(this._themeActive);}this._afterRenderingDone=true;},_applyAppConfiguration:function(c,e,d){if(this._afterRenderingDone){sap.ui.getCore().applyTheme(d.themeActive);q('body').toggleClass("sapUiSizeCompact",d.compactOn).toggleClass("sapUiSizeCozy",!d.compactOn);var s=sap.ui.getCore().byId("sampleFrame");if(s&&s.$()[0]){var S=s.$()[0].contentWindow;if(S){S.sap.ui.getCore().applyTheme(d.themeActive);S.jQuery('body').toggleClass("sapUiSizeCompact",d.compactOn).toggleClass("sapUiSizeCozy",!d.compactOn);}}}else{this._themeActive=d.themeActive;this._compactOn=d.compactOn;}}});});
