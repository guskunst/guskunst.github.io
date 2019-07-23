/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['./DialogUtil'],function(D){'use strict';var r=sap.ui.getCore().getLibraryResourceBundle('sap.ui.mdc.odata.v4.designtime');return{actions:{settings:{changeCreationMode:{icon:'sap-icon://table-row',name:r.getText('TABLE_CREATIONMODE_SETTINGS'),isEnabled:function(s){var c=s.getActions().filter(function(a){return a.getId().indexOf('::Create')>-1;})[0];return!!c||s.data("creationMode")==='CreationRow'||!!s.getCreationRow();},handler:function(s){return D.createSettingsDialog('changeCreationMode',s.data('creationMode'),s.data('createAtEnd')).then(function(c){var C=c.selectedOption,b=c.checked;return C!==undefined?[{selectorControl:s,changeSpecificData:{changeType:'changeCreationMode',content:{creationMode:C,createAtEnd:b}}}]:[];});}},changeTableType:{icon:'sap-icon://table-view',name:r.getText('TABLE_TABLETYPE_SETTINGS'),handler:function(s){var t=s.getType().getMetadata().getName().split('.').pop();return D.createSettingsDialog('changeTableType',t).then(function(T){return T!==undefined?[{selectorControl:s,changeSpecificData:{changeType:'changeTableType',content:{tableType:T,previousTableType:t}}}]:[];});}}}}};},false);
