sap.ui.define([],function(){"use strict";function g(t){var A=t.oNavigationControllerProxy.getActiveComponents();var r=[];for(var i=0;i<A.length;i++){var c=A[i];var R=t.componentRegistry[c];var v=R.viewLevel;if(v>0){var C=R.oComponent.getBindingContext();if(C){r[v]=C.getPath();}}}return r;}function a(t,T){var A=t.oNavigationControllerProxy.getActiveComponents();for(var i=0;i<A.length;i++){var c=A[i];var r=t.componentRegistry[c];var v=r.viewLevel;if(v===T){return r;}}}function d(t,o){var r=a(t,0);if(r&&r.methods.displayNextObject){return r.methods.displayNextObject(o);}return Promise.reject();}function G(t,i){var I=t.oFlexibleColumnLayoutHandler&&t.oFlexibleColumnLayoutHandler.isNextObjectLoadedAfterDelete();if(I){var r=a(t,0);if(r){if(i){return[t.oApplicationProxy.getPathOfLastShownDraftRoot()];}return r.methods.getItems&&r.methods.getItems();}}return null;}function n(t,k){if(k===0){t.oNavigationControllerProxy.navigateBackToAncestorComponent();}else{var r=a(t,k+1);if(r&&r.methods.navigateUp){r.methods.navigateUp();}else{t.oNavigationControllerProxy.navigateToRoot(true);}}}function p(t,s,i,o){var O=[];var c;var C=[];var e;for(var k=0;k<i.length;k++){e=i[k].getBindingContextPath();C.push(e);}for(var j=0;j<C.length;j++){if(C[j]===s){O.push(C[j]);c=j;break;}}if(c>=0){var I=C.slice(c+1,C.length);var f;if(c>0){f=C.slice(0,c);f.reverse();}O=O.concat(I,f);}else{O=C;}o.then(function(){var N=d(t,O);N.catch(function(){n(t,0);});});}function b(t){return function(){var f=t.oTemplatePrivateGlobalModel.getProperty("/generic/forceFullscreenCreate");if(f){t.oNavigationControllerProxy.navigateBack();}else{var o=G(t,true);if(o){d(t,o);}else{n(t,0);}}};}function P(t,o){var c=g(t);var D=[];var s=null;var I;var e;var f;var C;var r;for(C in t.componentRegistry){r=t.componentRegistry[C];var E=r.oComponent.getComponentContainer().getElementBinding();e=E&&E.getPath();f=e&&o[e];if(f){var u=t.oViewDependencyHelper.unbindChildren.bind(null,r.oComponent,true);f.then(u);}}var A=Object.create(null);var h=function(k,j){if(j){A[j]=true;}return{deleted:!!j,position:k};};for(e in o){var j=e.substring(1,e.indexOf("("));f=o[e];t.oApplicationProxy.prepareDeletion(e,f);var k=c.indexOf(e);if(k===1){I=G(t);if(I){s=e;}}var l=f.then(h.bind(null,k,j),h.bind(null,k,null));D.push(l);}if(s){p(t,s,I,o[s]);}else{Promise.all(D).then(function(R){var K=-1;for(var i=0;i<R.length;i++){var m=R[i];if(m.deleted&&m.position>0){if(K<0||K>=m.position){K=m.position-1;}}}if(K>=0){n(t,K);}});}Promise.all(D).then(function(R){for(C in t.componentRegistry){r=t.componentRegistry[C];var m=r.mRefreshInfos;jQuery.extend(m,A);if(r.utils.isComponentActive()){r.utils.refreshBinding();}}});}return{prepareDeletion:P,getNavigateAfterDeletionOfCreateDraft:b};});