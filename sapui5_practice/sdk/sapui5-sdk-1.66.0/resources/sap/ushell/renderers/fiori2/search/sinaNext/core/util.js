// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sinaDefine(['./core'],function(c){"use strict";var m={};m.sampleProviderInstanceCounter=0;m.timeoutDecorator=function(o,t){var d=function(){var a=this;var b=arguments;return new c.Promise(function(r,e){var f=false;var g=setTimeout(function(){f=true;e(new c.Exception('timeout'));},t);return o.apply(a,b).then(function(h){if(f){return;}clearTimeout(g);r(h);},function(h){if(f){return;}clearTimeout(g);e(h);});});};return d;};m.refuseOutdatedResponsesDecorator=function(o){var a=0;var d=function(){var r=++a;return o.apply(this,arguments).then(function(b){return new c.Promise(function(e,f){if(r!==a){return;}e(b);});},function(e){return new c.Promise(function(b,f){if(r!==a){return;}f(e);});});};d.abort=function(){++a;};return d;};m.getUrlParameter=function(n,u){if(!u){u=window.location.href;}n=n.replace(/[\[\]]/g,"\\$&");var r=new RegExp("[?&]"+n+"(=([^&#]*)|&|#|$)"),a=r.exec(u);if(!a){return null;}if(!a[2]){return'';}return decodeURIComponent(a[2].replace(/\+/g," "));};m.filterString=function(t,r){for(var i=0;i<r.length;++i){var a=r[i];var b=0;while(b>=0){b=t.indexOf(a);if(b>=0){t=t.slice(0,b)+t.slice(b+a.length);}}}return t;};m.generateTimestamp=function(){var p=function(n,a){var s="000000000"+n;return s.substr(s.length-a);};var d=new Date();return''+d.getUTCFullYear()+p(d.getUTCMonth()+1,2)+p(d.getUTCDate(),2)+p(d.getUTCHours(),2)+p(d.getUTCMinutes(),2)+p(d.getUTCSeconds(),2)+p(d.getUTCMilliseconds(),3);};m.DelayedConsumer=c.defineClass({_init:function(p){p=p||{};this.timeDelay=p.timeDelay||1000;this.consumer=p.consumer||function(){};this.consumerContext=p.consumerContext||null;this.objects=[];},add:function(o){this.objects.push(o);if(this.objects.length===1){setTimeout(this.consume.bind(this),this.timeDelay);}},consume:function(){this.consumer.apply(this.consumerContext,[this.objects]);this.objects=[];}});m.dateToJson=function(d){return{type:'Timestamp',value:d.toJSON()};};m.dateFromJson=function(j){if(j.type!=='Timestamp'){throw new c.Exception('Not a timestampe '+j);}return new Date(j.value);};m.getBaseUrl=function(u){var b='';if(u){b=u;}else{u='/sap/ushell/renderers/fiori2/search/container/';var i=window.location.pathname.indexOf(u);if(i>-1){b=window.location.pathname.slice(0,i);}}return b;};m.addPotentialNavTargetsToAttribute=function(r){if(r.items){var a=r.items;for(var i=0;i<a.length;i++){var b=a[i];b=this.addGeoDataIfAvailable(b);var d=b.detailAttributes;for(var j=0;j<d.length;j++){var e=d[j];var s=e.sina;var v=e.value;var f=e.metadata;if(typeof v==='string'&&e.metadata.type!=="ImageUrl"){var g=v.match(/^[^\0-\x20,:;<>@\[\\\]^_`]+@[^\0-,.-@\[\\\]^_`\{\|\}~]+\.[^\0-,.-@\[\\\]^_`\{\|\}~]+$/g);var h=v.match(/^(?!\d*$)(?=(?:[()\[\]+\-\/ ]*\d[()\[\]+\-\/ ]*){9,15}$)\+?(?:\d+|\(\d+(?: \d+)*\)|\[\d+\]|[\/ ]|\d-\d)+$/g);var u=v.match(/^https?:\/\/(?=[^\/])\S+$/gi);if(f.semantics==s.AttributeSemanticsType.EmailAddress){e.defaultNavigationTarget=s._createNavigationTarget({label:v,targetUrl:'mailto:'+v});}else if(f.semantics==s.AttributeSemanticsType.PhoneNr){e.defaultNavigationTarget=s._createNavigationTarget({label:v,targetUrl:'tel:'+v});}else if(f.semantics==s.AttributeSemanticsType.HTTPURL){e.defaultNavigationTarget=s._createNavigationTarget({label:v,targetUrl:v,target:"_blank"});}else if(g!==null&&g.length===1){e.defaultNavigationTarget=s._createNavigationTarget({label:g[0],targetUrl:'mailto:'+g[0]});}else if(h!==null&&h[0].match(/\d\d\d/)!==null){e.defaultNavigationTarget=s._createNavigationTarget({label:h[0],targetUrl:'tel:'+h[0]});}else if(u!==null&&u[0].match(/\w\w\w/)!==null){e.defaultNavigationTarget=s._createNavigationTarget({label:u[0],targetUrl:u[0],target:"_blank"});}}}}}return r;};m.removePureAdvancedSearchFacets=function(r){var d=r.sina.getDataSource(r.query.filter.dataSource.id);for(var i=0;i<r.facets.length;i++){var a=r.facets[i].query.dimension;var b=d.attributeMetadataMap[a];if(b&&b.usage.AdvancedSearch&&b.usage.Facet===undefined){r.facets.splice(i,1);i=i-1;}}return r;};m.isMapsAttribute=function(a,r,i){var b=false;var l,d,n,v,e,f,g,h;n=a.id;v=a.value;if(n.match(/latitude/i)!==null){if(!isNaN(v)){g=n;l=v;e=i;}b=true;}else if(n.match(/longitude/i)!==null){if(!isNaN(v)){h=n;d=v;f=i;}b=true;}else if(n.match(/LOC_4326/)){f=i;e=i;var L=JSON.parse(v);var C=L.coordinates;if(C&&C.length>1){d=C[0];l=C[1];}b=true;}if(r===undefined||r===true){return b;}return{lat:l,lon:d,latAttribName:g,lonAttribName:h,latIndex:e,lonIndex:f};};m.addGeoDataIfAvailable=function(a){var r,b,l,d,e,f,g;b=a.detailAttributes;for(var i=0;i<b.length;i++){r=this.isMapsAttribute(b[i],false,i);l=r.lat?r.lat:l;d=r.lon?r.lon:d;f=r.latIndex?r.latIndex:f;g=r.lonIndex?r.lonIndex:g;if(l&&d){break;}}if(l&&d){if(f===g){b.splice(f,1);}else if(f>g){b.splice(f,1);b.splice(g,1);}else{b.splice(g,1);b.splice(f,1);}var n={sina:a.sina,type:"GeoJson",id:"LOC_4326",label:"LOC_4326",isCurrency:false,IsBoolean:false,IsKey:false,IsSortable:true,isUnitOfMeasure:false,semanticObjectType:[],isQuantity:"",usage:{"Map":"coordinates"}};var v='{ "type": "Point", "coordinates": ['+d+', '+l+', 0] }';var h={id:"LOC_4326",label:"LOC_4326",isHighlighted:false,value:v,valueFormatted:v,valueHighlighted:a.sina,metadata:n,sina:a.sina};b.push(h);e=a.sina.getDataSource(a.dataSource.id);if(!e.attributeMetadataMap.LOC_4326){e.attributesMetadata.push(n);e.attributeMetadataMap.LOC_4326=n;}else{e.attributeMetadataMap.LOC_4326.type="GeoJson";e.attributeMetadataMap.LOC_4326.usage={"Map":"coordinates"};}}return a;};m.cacheDecorator=function(o){var a={};return function(i){if(a.hasOwnProperty(i)){return a[i];}var v=o.apply(this,[i]);a[i]=v;return v;};};m.escapeRegExp=function(s){return s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&");};m.evaluateTemplate=function(t,o){var p=new RegExp('{{(.*)}}');var g=function(t){var a=p.exec(t);if(!a){return null;}return a[1];};var r=function(t,a,v){var b=new RegExp('{{'+m.escapeRegExp(a)+'}}','g');t=t.replace(b,v);return t;};var e=function(t){var a=g(t);if(!a){return t;}t=r(t,a,o[a]);return e(t);};return e(t);};m.extractRegExp=new RegExp('<b>(.*?)<\\/b>','g');m.extractHighlightedTerms=function(t){var a;var r=[];do{a=m.extractRegExp.exec(t);if(a){r.push(a[1]);}}while(a);return r;};m.appendRemovingDuplicates=function(l,a){for(var i=0;i<a.length;++i){var e=a[i];if(l.indexOf(e)<0){l.push(e);}}};return m;});
