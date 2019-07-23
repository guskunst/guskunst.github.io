/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/model/json/JSONModel"],function(J){"use strict";var T={setContexts:function(t,m,p,d,D){var s=t.getSelectedContexts();var a=false;var b=[];var u=[];var l=[];var L={};var M;var c="/$contexts/"+p;var C=t.getModel(m);if(!C){C=new J();t.setModel(C,"$contexts");}L.aUnsavedContexts=[];L.aLockedContexts=[];C.setProperty("/$contexts",{});C.setProperty(c,{selectedContexts:s,numberOfSelectedContexts:s.length,deleteEnabled:true,deletableContexts:[],unSavedContexts:[],lockedContexts:[]});for(var i=0;i<s.length;i++){var S=s[i];var o=S.getObject();for(var k in o){if(k.indexOf("#")===0){var A=k;A=A.substring(1,A.length);M=C.getProperty(c);M[A]=true;C.setProperty(c,M);}}M=C.getProperty(c);if(d!="undefined"){if(S.getProperty(d)){if(D!=="undefined"&&(o.IsActiveEntity===true&&o.HasDraftEntity===true)){L=g(o,S);}else{b.push(S);L.isDeletable=true;}}M["deleteEnabled"]=L.isDeletable;}else if(D!=="undefined"&&(o.IsActiveEntity===true&&o.HasDraftEntity===true)){L=g(o,S);}else{b.push(S);}}function g(o,S){if(o.DraftAdministrativeData.InProcessByUser){l.push(S);}else{u.push(S);a=true;}return{aLockedContexts:l,aUnsavedContexts:u,isDeletable:a};}M["deletableContexts"]=b;M["unSavedContexts"]=L.aUnsavedContexts;M["lockedContexts"]=L.aLockedContexts;C.setProperty(c,M);}};return T;},true);
