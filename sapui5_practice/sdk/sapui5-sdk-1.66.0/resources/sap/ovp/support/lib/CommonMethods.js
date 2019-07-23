sap.ui.define([],function(){"use strict";var A={UNKNOWN:"Unknown",FAILED:"Failed",LOADING:"Loading",RENDERED:"Rendered"};var o=A.UNKNOWN;var c={};function g(P){var k=1;if(P[0]==="-"){k=-1;P=P.substr(1);}return function(a,b){if(!a[P]){return(k===1?1:-1);}else if(!b[P]){return(k===1?-1:1);}var r=0;if(a[P]<b[P]){r=-1;}else if(a[P]>b[P]){r=1;}return r*k;};}function G(P){if(P){return jQuery.getJSON(P);}return undefined;}function i(a){for(var I in A){if(A[I]===a){return true;}}return false;}function f(){return o;}function s(a){o=i(a)?a:A.UNKNOWN;}function d(){return c;}function S(a){c=a;return true;}function p(a,E,D){jQuery.sap.log.info("Global event '"+E+"' published on channel '"+a+"'");sap.ui.getCore().getEventBus().publish(a,E,D);}function C(a){if(!a||a.length<1){return"";}var b="";for(var I=0;I<a.length;I++){if(!a[I]||!(typeof a[I]==="string")){continue;}if(b){b+=", ";}b+=a[I];}return b;}function h(O){if(!O){return false;}return Object.keys(O).length>0;}function e(u){if(!u){return"";}var P=u.split("#");if(P.length<2){return"";}else{var H=P[1];var a=H.indexOf("~");var b=H.indexOf("?");var k=H.indexOf("/");var l=H.indexOf("&");if(a&&a!==-1&&(a<b||b===-1)&&(a<k||k===-1)&&(a<l||l===-1)){return H.substr(0,a);}else if(b&&b!==-1&&(b<a||a===-1)&&(b<k||k===-1)&&(b<l||l===-1)){return H.substr(0,b);}else if(k&&k!==-1&&(k<a||a===-1)&&(k<b||b===-1)&&(k<l||l===-1)){return H.substr(0,k);}else if(l&&l!==-1&&(l<a||a===-1)&&(l<b||b===-1)&&(l<k||k===-1)){return H.substr(0,l);}else{return H;}}}function j(u){if(!u){return"";}var P=u.split("#");if(P.length<=0){return"";}else if(P.length===1){return P[0];}else{return P[0]+"#"+e(u);}}return{mApplicationStatus:A,getDynamicComparator:g,getFileFromURI:G,isValidApplicationStatus:i,getApplicationStatus:f,setApplicationStatus:s,getAppComponent:d,setAppComponent:S,publishEvent:p,concatStrings:C,hasObjectContent:h,getApplicationName:e,shortenURL:j};});
