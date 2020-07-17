/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["jquery.sap.global"],function(q){"use strict";var H={"changeHandler":{},"layers":{"VENDOR":true,"CUSTOMER_BASE":true,"CUSTOMER":true,"USER":true}};H.changeHandler.applyChange=function(c,C,p){var m=p.modifier,M=p.appComponent.getRootControl(),o=M.getController(),u=o.getUIModel(),l=o.getLayout(),s=c.getContent().id,a=p.appComponent,S={id:s,isLocalId:false},b=m.bySelector(S,a,M);c.setRevertData(s);m.setVisible(b,false);if(u.getProperty('/containerLayout')==='resizable'){var L=l.getDashboardLayoutUtil();if(L.aCards){L.updateCardVisibility([{id:L.getCardIdFromComponent(s),visibility:false}]);}o.appendIncomingDeltaChange(c);}l.rerender();return true;};H.changeHandler.revertChange=function(c,C,p){var m=p.modifier,M=p.appComponent.getRootControl(),o=M.getController(),u=o.getUIModel(),l=o.getLayout(),s=c.getRevertData(),a=m.byId(s);m.setVisible(a,true);c.resetRevertData();if(u.getProperty('/containerLayout')==='resizable'){var L=l.getDashboardLayoutUtil();L.updateCardVisibility([{id:L.getCardIdFromComponent(s),visibility:true}]);}l.rerender();return true;};H.changeHandler.completeChangeContent=function(c,s,p){c.setContent(s.removedElement);};return H;},true);