sap.ui.define(["jquery.sap.global","sap/ui/base/Object","sap/m/MessagePopover","sap/m/MessagePopoverItem","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/suite/ui/generic/template/lib/MessageUtils","sap/suite/ui/generic/template/lib/testableHelper"],function(q,B,M,a,F,b,c,t){"use strict";F=t.observableConstructor(F,true);var p=new F({path:"persistent",operator:b.EQ,value1:false});var v=new F({path:"validation",operator:b.EQ,value1:true});var I=new F({filters:[v,new F({path:"validation",operator:b.EQ,value1:false})],and:true});function g(C,h,d){var o=h.controller;var A=false;var m=o.byId("showMessages");function e(i){return!!(i&&C.getPositionableControlId(i));}var f;var j=C.getDialogFragment("sap.suite.ui.generic.template.fragments.MessagePopover",{beforeOpen:function(){if(h.prepareAllMessagesForNavigation){var O=f.getCurrentContexts();for(var i=0;i<O.length;i++){var P=O[i].getObject();if(!e(P.controlIds)){h.prepareAllMessagesForNavigation();return;}}}},isPositionable:e,titlePressed:function(i){c.navigateFromMessageTitleEvent(C,i);}});j.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),"msg");f=j.getBinding("items");var E;(function(){var i=o.getOwnerComponent();E=new F({path:"target",operator:b.EQ,value1:"/"+i.getEntitySet()});var T=i.getModel("_templPriv");T.setProperty("/generic/messageCount",0);var O=C.getText("MESSAGE_BUTTON_TOOLTIP_P",0);T.setProperty("/generic/messageButtonTooltip",O);f.attachChange(function(){var P=f.getLength();T.setProperty("/generic/messageCount",P);O=C.getText(P===1?"MESSAGE_BUTTON_TOOLTIP_S":"MESSAGE_BUTTON_TOOLTIP_P",P);T.setProperty("/generic/messageButtonTooltip",O);});})();var l=new F({filters:[v,new F({path:"controlIds",test:function(i){return!!C.getPositionableControlId(i);},caseSensitive:true})],and:true});var k=[];var s;var n=0;var N;var r;var u;function w(O){if(q.isArray(O)){var P=false;for(var i=0;i<O.length;i++){P=w(O[i])||P;}return P;}if(O instanceof Promise){O.then(N);return false;}u.push(O);return true;}function x(i){r=i;f.filter(r);}function y(){if(A){var i=new F({filters:u,and:false});var O=new F({filters:[i,p],and:true});x(new F({filters:[O,l],and:false}));}}function R(i,O){if(i===n&&w(O)){y();}}function z(P){var i=P();return w(i);}function D(){k.forEach(z);}function G(i){s=i;n++;N=R.bind(null,n);u=d?[new F({path:"fullTarget",operator:b.StartsWith,value1:s}),E]:[];D();y();}function H(P){k.push(P);if(s!==undefined&&z(P)){y();}}var S;function J(){S=S||function(){if(f.getLength()>0){j.openBy(m);}};setTimeout(S,0);}function K(i){A=i;if(i){if(u){y();}}else{u=null;x(I);}}function L(O){return O?l:r;}return{adaptToContext:G,toggleMessagePopover:j.toggle.bind(j,m),showMessagePopover:J,registerMessageFilterProvider:H,setEnabled:K,getMessageFilters:L};}return B.extend("sap.suite.ui.generic.template.lib.MessageButtonHelper",{constructor:function(C,h,i){q.extend(this,(t.testableStatic(g,"MessageButtonHelper"))(C,h,i));}});});
