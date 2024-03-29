/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Element"],function(E){"use strict";var T=E.extend("sap.ui.mdc.TableTypeBase",{metadata:{properties:{}}});T.prototype.setProperty=function(p,v,s){E.prototype.setProperty.call(this,p,v,true);var t=this.getRelevantTable();if(t){this.updateRelevantTableProperty(t,p,v);}return this;};T.prototype.updateRelevantTableProperty=function(t,p,v){};T.prototype.getRelevantTable=function(){var t=this.getParent();if(t&&t.isA("sap.ui.mdc.Table")){t=t._oTable;}else{t=null;}return t;};T.prototype.updateTableSettings=function(){var p=this.getMetadata().getProperties(),P,t=this.getRelevantTable();if(t){for(P in p){this.updateRelevantTableProperty(t,P,this.getProperty(P));}}};return T;});
