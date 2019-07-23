/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/base/util/deepEqual','sap/base/util/merge'],function(d,m){"use strict";var C={compareConditions:function(f,c,o){return d(c,o);},toExternal:function(c,t,f,o){var a=m({},c);var v=c.values[0],V;if(c.operator==="BT"){V=c.values[1];}switch(t){case"Edm.Date":case"sap.ui.model.type.Date":case"sap.ui.model.odata.type.Date":case"Edm.DateTime":case"sap.ui.model.odata.type.DateTime":case"Edm.TimeOfDay":case"sap.ui.model.type.Time":case"sap.ui.model.odata.type.TimeOfDay":if(v&&v instanceof Date){v=v.toJSON();if(v.indexOf('Z')===(v.length-1)){v=v.substr(0,v.length-1);}}if(V&&V instanceof Date){V=V.toJSON();if(V.indexOf('Z')===(V.length-1)){V=V.substr(0,V.length-1);}}break;case"Edm.DateTimeOffset":case"sap.ui.model.type.DateTime":case"sap.ui.model.odata.type.DateTimeOffset":if(v&&v instanceof Date){v=v.toJSON();}if(V&&V instanceof Date){V=V.toJSON();}break;default:break;}a.values[0]=v;if(V){a.values[1]=V;}return a;},toInternal:function(c,t,f,o){var a=m({},c);var v=c.values[0],V;if(c.operator==="BT"){V=c.values[1];}switch(t){case"Edm.Date":case"sap.ui.model.type.Date":case"sap.ui.model.odata.type.Date":case"Edm.DateTime":case"sap.ui.model.odata.type.DateTime":case"Edm.TimeOfDay":case"sap.ui.model.type.Time":case"sap.ui.model.odata.type.TimeOfDay":case"Edm.DateTimeOffset":case"sap.ui.model.type.DateTime":case"sap.ui.model.odata.type.DateTimeOffset":if(v){v=new Date(v);}if(V){v=new Date(v);}break;default:break;}a.values[0]=v;if(V){a.values[1]=V;}return a;}};return C;},true);