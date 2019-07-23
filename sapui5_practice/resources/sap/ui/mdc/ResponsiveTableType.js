/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/mdc/TableTypeBase","./library"],function(T,l){"use strict";var I,a,b;var G=l.GrowingMode;var R=T.extend("sap.ui.mdc.ResponsiveTableType",{metadata:{properties:{growingMode:{type:"sap.ui.mdc.GrowingMode",defaultValue:G.Basic}}}});R.prototype.updateRelevantTableProperty=function(t,p,v){if(t&&t.isA("sap.m.Table")&&p==="growingMode"){t.setGrowingScrollToLoad(v===G.Scroll);}};R.updateDefault=function(t){if(t){t.setGrowing(true);t.setGrowingScrollToLoad(false);}};R.loadTableModules=function(){if(!I){return new Promise(function(r,c){sap.ui.require(["sap/m/Table","sap/m/Column","sap/m/ColumnListItem"],function(d,e,C){I=d;a=e;b=C;r();},function(){c("Failed to load some modules");});});}else{return Promise.resolve();}};R.createTable=function(i,s){return new I(i,s);};R.createColumn=function(i,s){return new a(i,s);};R.createTemplate=function(i,s){return new b(i,s);};return R;});
