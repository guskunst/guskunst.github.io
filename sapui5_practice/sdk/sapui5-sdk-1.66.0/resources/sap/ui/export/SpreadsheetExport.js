/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global','sap/base/Log','sap/ui/Device'],function(q,L,D){'use strict';var a='sap/ui/thirdparty/jszip',b='sap/ui/export/js/XLSXExportUtils',c='sap/ui/export/js/XLSXBuilder';function d(p,C){function f(m){return C&&C(m);}function o(v){f({progress:v});}function g(e){f({error:e.message||e});}function h(A){f({finish:true,data:A});}function i(){var s;var e;var t;function l(X,w){e=X.oData.getConverter(p);s=new w(p.workbook.columns,p.workbook.context,p.workbook.hierarchyLevel);o(0);t=window.setTimeout(m,0);}function m(){if(s){var w=p.dataSource.data||[];var R=e(w.slice());s.append(R);o(50);t=window.setTimeout(r,0);}}function r(){if(s){s.build().then(u);}}function u(w){h(w);s=null;}function v(){window.clearTimeout(t);u();}sap.ui.require([b,c,a],l);return{cancel:v};}function n(u){if(!u){return u;}try{return new URL(u,document.baseURI).toString();}catch(e){return window.URI(u).absoluteTo(document.baseURI).toString();}}function j(){var s,r;function e(X,u){s=new u(p.workbook.columns,p.workbook.context,p.workbook.hierarchyLevel);r=X.oData.fetch(p,l);o(0);}function l(M){if(M.rows){s.append(M.rows);}if(M.progress){o(M.progress);}if(M.error||typeof M.error==='string'){s=null;return g(M.error);}return M.finished&&s.build().then(m);}function m(u){h(u);s=null;}function t(){r.cancel();h();s=null;}sap.ui.require([b,c,a],e);return{cancel:t};}function k(){var s;var l=q.extend(true,{},p);var w=typeof l.worker==='object'?l.worker:{};var m=function(){s.postMessage({cancel:true});h();};function r(x){var y=new Worker(x);y.onmessage=function(e){if(e.data.status){o(e.data.status);}else if(e.data.error||typeof e.data.error==='string'){g(e.data.error);}else{h(e.data);}};y.postMessage(l);return y;}function t(){L.warning('Direct worker is not allowed. Load the worker via blob.');var e=window.URI(w.base).absoluteTo("").search("").hash("").toString();w.src=e+w.ref;var x='self.origin = "'+e+'"; '+'importScripts("'+w.src+'")';var y=new Blob([x]);var z=window.URL.createObjectURL(y);return r(z);}function u(){L.warning('Blob worker is not allowed. Use in-process export.');m=j(l).cancel;}function v(X){try{s=r(w.src);s.addEventListener('error',function(e){s=t();s.addEventListener('error',function(e){u();e.preventDefault();});e.preventDefault();});}catch(x){try{s=t();}catch(y){u();}}}l.dataSource.dataUrl=n(l.dataSource.dataUrl);l.dataSource.serviceUrl=n(l.dataSource.serviceUrl);w.base=w.base||sap.ui.require.toUrl('sap/ui/export/js/','');w.ref=w.ref||'SpreadsheetWorker.js';w.src=w.base+w.ref;sap.ui.require([b],v);return{cancel:function(){m();}};}if(p.dataSource.type==='array'){return i();}else if(p.worker===false||sap.ui.disableExportWorkers===true||(D.browser.msie&&p.dataSource.dataUrl.indexOf('.')===0)){return j();}else{return k();}}return{execute:d};},true);
