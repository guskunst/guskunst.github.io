/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/mdc/TableTypeBase","./library"],function(T,l){"use strict";var I,a,b,c,d;var R=l.RowCountMode;var e=l.RowAction;var G=T.extend("sap.ui.mdc.GridTableType",{metadata:{properties:{rowCountMode:{type:"sap.ui.mdc.RowCountMode",defaultValue:R.Auto},rowCount:{type:"int",defaultValue:10}}}});G.prototype.updateRelevantTableProperty=function(t,p,v){if(t&&t.isA("sap.ui.table.Table")){if(p==="rowCountMode"){t.setVisibleRowCountMode(v);this._updateTableRowCount(t,v,this.getRowCount());}else if(p==="rowCount"){this._updateTableRowCount(t,this.getRowCountMode(),v);}}};G.prototype._updateTableRowCount=function(t,m,v){if(m===R.Fixed){t.setVisibleRowCount(v);}else{t.setMinAutoRowCount(v);}};G.updateDefault=function(t){if(t){t.setVisibleRowCountMode(R.Auto);t.setMinAutoRowCount(10);}};G.loadGridTableLib=function(){if(!this._oGridTableLibLoaded){this._oGridTableLibLoaded=sap.ui.getCore().loadLibrary("sap.ui.table",true);}return this._oGridTableLibLoaded;};G.loadTableModules=function(){if(!I){return new Promise(function(r,f){this.loadGridTableLib().then(function(){sap.ui.require(["sap/ui/table/Table","sap/ui/table/Column","sap/ui/table/RowAction","sap/ui/table/RowActionItem","sap/ui/table/plugins/MultiSelectionPlugin"],function(g,h,e,i,M){I=g;a=h;b=e;c=i;d=M;r();},function(){f("Failed to load some modules");});});}.bind(this));}else{return Promise.resolve();}};G.createTable=function(i,s){return new I(i,s);};G.createColumn=function(i,s){return new a(i,s);};G.createNavigationRowAction=function(i,E){return new b(i+"--rowAction",{items:new c(i+"--rowActionItem",{type:e.Navigation,press:E})});};G.createMultiSelectionPlugin=function(i,E){return new d(i+"--multiSelectPlugin",{limit:200,selectionChange:E});};return G;});
