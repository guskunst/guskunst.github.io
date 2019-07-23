/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/documentation/sdk/controller/BaseController","sap/ui/Device","sap/ui/thirdparty/jquery"],function(B,D,q){"use strict";return B.extend("sap.ui.documentation.sdk.controller.TopicDetailInitial",{onInit:function(){B.prototype.onInit.call(this);this._onOrientationChange({landscape:D.orientation.landscape});this.handleDocumentationDisclaimer();},handleDocumentationDisclaimer:function(){q.ajax(this.getConfig().docuPath+"disclaimer.json",{dataType:"json"}).then(function(d){var v=this.getView();if(d.showDisclaimer&&d.message){v.byId("disclaimerBlock").setVisible(true);v.byId("disclaimerMessage").setText(d.message);}}.bind(this),function(){});},onBeforeRendering:function(){this._deregisterOrientationChange();},onAfterRendering:function(){this._registerOrientationChange();},onExit:function(){this._deregisterOrientationChange();},onDownloadButtonPress:function(){window.open(this._determineFileLocation(),"_blank");},_determineFileLocation:function(){var v=this.getModel("versionData"),i=v.getProperty('/isDevVersion'),I=v.getProperty('/isOpenUI5');if(I){return'https://help.sap.com/OpenUI5_PDF/OpenUI5.pdf';}return i?'https://help.sap.com/DRAFT/SAPUI5_Internal_PDF/SAPUI5_Internal.pdf':'https://help.sap.com/SAPUI5_PDF/SAPUI5.pdf';}});});
