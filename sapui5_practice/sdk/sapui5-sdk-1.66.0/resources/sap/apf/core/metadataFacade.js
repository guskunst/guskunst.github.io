/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(['sap/apf/utils/utils','sap/apf/core/metadataProperty'],function(u,M){'use strict';var a=function(I,A){this.type="metadataFacade";var m=I.constructors.MetadataProperty;var b=I.instances.messageHandler;var c=I.instances.metadataFactory;var p;var d;var e={};this.getAllProperties=function(f){var h;var j;var k=0;var i;var l=[];if(p){f(p);}else{h=g();j=h.length;for(i=0;i<j;i++){c.getMetadata(h[i]).done(n);}}function n(o){k++;l=l.concat(o.getAllProperties());if(j==k){p=u.eliminateDuplicatesInArray(b,l);f(p);}}};this.getAllParameterEntitySetKeyProperties=function(f){var h;var j;var k=0;var i;var l=[];if(d){f(d);}else{h=g();j=h.length;for(i=0;i<j;i++){c.getMetadata(h[i]).done(n);}}function n(o){k++;l=l.concat(o.getParameterEntitySetKeyPropertiesForService());if(j==k){d=sap.apf.utils.eliminateDuplicatesInArray(b,l);f(d);}}};this.getPropertyMetadataByEntitySet=function(s,f,h){var i=jQuery.Deferred();c.getMetadata(s).done(function(j){var k=j.getPropertyMetadata(f,h);i.resolve(new M.constructor(k));});return i.promise();};this.getProperty=function(f){var h;var j;var k;var l=jQuery.Deferred();if(e[f]){l.resolve(e[f]);}else{h=g();k=h.length;for(var i=0;i<k;i++){c.getMetadata(h[i]).done(function(n){j=n.getAttributes(f);if(j.name){if(n.getParameterEntitySetKeyPropertiesForService().indexOf(f)>-1){j.isParameterEntitySetKeyProperty=true;}if(n.getAllKeys().indexOf(f)>-1){j.isKey=true;}for(var o in j){if(o==="dataType"){for(var q in j.dataType){j[q]=j.dataType[q];}}}e[f]=new M.constructor(j);l.resolve(e[f]);}});}}return l.promise();};function g(){if(typeof A==="string"){return[A];}return c.getServiceDocuments();}};sap.apf.core.MetadataFacade=a;return a;},true);
