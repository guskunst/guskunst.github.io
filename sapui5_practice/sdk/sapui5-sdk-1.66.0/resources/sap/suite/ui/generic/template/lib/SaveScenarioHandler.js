sap.ui.define(["jquery.sap.global","sap/ui/base/Object","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(q,B,F,a){"use strict";var A=new F({filters:[new F({path:"type",operator:a.EQ,value1:sap.ui.core.MessageType.Warning}),new F({path:"type",operator:a.EQ,value1:sap.ui.core.MessageType.Error})],and:false});var e=new F({path:"type",operator:a.EQ,value1:sap.ui.core.MessageType.Error});var l="model";function g(t,c,C){var y,n;var f;var I;var s=(function(){var o=c.getOwnerComponent();var R=t.componentRegistry[o.getId()];return!!(R.methods.showConfirmationOnDraftActivate&&R.methods.showConfirmationOnDraftActivate());})();function b(k){var m=t.oNavigationControllerProxy.getActiveComponents();var R;for(var i=0;i<m.length&&!R;i++){var o=m[i];var u=t.componentRegistry[o];R=u.viewLevel&&(u.methods.getScrollFunction||q.noop)(k);}return R||null;}function d(S){var R,L,m;R=C.getDialogFragment("sap.suite.ui.generic.template.fragments.MessageInfluencingSave",{itemSelected:function(){L.setProperty("/backbtnvisibility",true);},onBackButtonPress:function(){m.navigateBack();L.setProperty("/backbtnvisibility",false);},onAccept:function(){f=y;R.close();},onReject:function(){f=n;R.close();},isPositionable:function(z){return!!(z&&b(z));},titlePressed:function(E){R.close();var M=E.getParameter("item");var z=M.getBindingContext("msg").getObject();f=b(z.controlIds);R.close();},afterClose:function(){y=null;n=null;(f||q.noop)();f=null;}},l,function(z){m=z.getContent()[0];z.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),"msg");I=z.getContent()[0].getBinding("items");});L=R.getModel(l);L.setProperty("/situation",S);L.setProperty("/backbtnvisibility",false);var k=[];var o=t.oNavigationControllerProxy.getActiveComponents();var O=(S<3);for(var i=0;i<o.length;i++){var u=o[i];var v=t.componentRegistry[u];if(v.oController===c||S!==2){var w=(v.methods.getMessageFilters||q.noop)(O);k=w?k.concat(w):k;}}if(k.length===0){return null;}var x=k.length===1?k[0]:new F({filters:k,and:false});if(S===3){e=new F({filters:[x,e],and:true});x=new F({filters:[x,A],and:true});if(I.filter(e).getLength()===0){L.setProperty("/situation",4);}}I.filter(x);return I.getLength()&&R;}function h(i){var v=d(i?1:2);if(v){v.open();return Promise.reject();}if(!(i&&s)){return Promise.resolve();}v=d(3);return v?new Promise(function(R,k){y=R;n=k;v.open();}):Promise.resolve();}function p(i,o){t.oApplicationProxy.performAfterSideEffectExecution(function(){if(!t.oBusyHelper.isBusy()){h(i).then(o);}});}function r(o,i){y=o;n=i;var w=d(3);if(w){w.open();}else{i();}}function H(S,P,i){if(S===4){r(P,i);}else{p((S===1),P);}}function j(){return!!d(1);}return{handleSaveScenario:H,hasValidationMessageOnDetailsViews:j};}return B.extend("sap.suite.ui.generic.template.lib.SaveScenarioHandler",{constructor:function(t,c,C){q.extend(this,g(t,c,C));}});});
