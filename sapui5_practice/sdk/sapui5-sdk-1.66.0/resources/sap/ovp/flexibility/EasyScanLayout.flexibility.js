sap.ui.define(["sap/ovp/changeHandler/HideCardContainer","sap/ovp/changeHandler/UnhideCardContainer","sap/ovp/changeHandler/UnhideControl","sap/ovp/changeHandler/RemoveCardContainer","sap/ui/dt/OverlayRegistry","sap/ui/core/ComponentContainer","sap/m/MessageToast","sap/ovp/cards/rta/SettingsDialogConstants","sap/ovp/cards/SettingsUtils","sap/ovp/cards/CommonUtils","sap/ovp/app/resources"],function(H,U,a,R,O,C,M,S,b,c,d){"use strict";return{"moveControls":{"changeHandler":"default","layers":{"CUSTOMER_BASE":true,"CUSTOMER":true,"USER":true}},"unhideControl":a,"unhideCardContainer":U,"hideCardContainer":H,"removeCardContainer":R,"editCardSettings":{changeHandler:{applyChange:function(o,e,p){var m=p.appComponent.getRootControl(),f=m.getController(),g=o.getContent(),h=g.newAppDescriptor,i=m.byId(h.id);o.setRevertData(g.oldAppDescriptor);if(i){if(h.settings.tabs){var D=h.settings.selectedKey;if(!D||D<1){D=1;}S.tabFields.forEach(function(k){var v=h.settings.tabs[D-1][k];if(k!=='entitySet'||(k==='entitySet'&&v)){delete h.settings[k];}if(v){h.settings[k]=v;}});}var j=i.getComponentInstance();j.destroy();}f.recreateRTAClonedCard(h);return true;},revertChange:function(o,e,p){var m=p.appComponent.getRootControl(),f=m.getController(),g=o.getRevertData(),h=m.byId(g.id);if(h){var i=h.getComponentInstance();i.destroy();}f.recreateRTAClonedCard(g);o.resetRevertData();return true;},completeChangeContent:function(o,s,p){return;}},layers:{"CUSTOMER_BASE":true,"CUSTOMER":true,"USER":true}},"newCardSettings":{changeHandler:{applyChange:function(o,e,p){var m=p.appComponent.getRootControl(),f=m.getController(),g=o.getContent();o.setRevertData(g.id);var n=new C(m.getId()+"--"+g.id),A=p.appComponent,u=f.getUIModel(),h=u.getProperty("/cards"),j=f.getLayout(),N=(g.id.indexOf("newStaticLinkListCard_N")!==-1)&&!b.checkClonedCard(g.id),k=(g.id.indexOf("newKPICard_N")!==-1)&&!b.checkClonedCard(g.id),l=(g.id.indexOf("newCard_N")!==-1)&&!b.checkClonedCard(g.id);if(k){var s=g.settings.selectedKPI,q=new sap.ui.model.odata.v2.ODataModel(s.ODataURI,{'annotationURI':s.ModelURI,'defaultCountMode':sap.ui.model.odata.CountMode.None}),r=g.model;if(g.settings["sAnnoKey"]){b.setDataSources(g.settings["sAnnoKey"],s.ModelURI);}m.setModel(q,r);A.setModel(q,r);}g.settings.baseUrl=f._getBaseUrl();if(N||k||l){g.settings.newCard=true;}else{g.settings.cloneCard=true;}var I=-1,i;for(i=0;i<h.length;i++){if(g.id.lastIndexOf(c._getLayerNamespace()+"."+h[i].id,0)===0){I=i;break;}}h.splice(I+1,0,g);u.setProperty("/cards",h);j.insertContent(n,I+1);setTimeout(function(){var t=O.getOverlay(n);t.setSelected(true);t.focus();var v=(N||k||l)?d.getText("OVP_KEYUSER_TOAST_MESSAGE_FOR_NEW"):d.getText("OVP_KEYUSER_TOAST_MESSAGE_FOR_CLONE");M.show(v,{duration:10000});},0);f.recreateRTAClonedCard(g);return true;},revertChange:function(o,e,p){var m=p.appComponent.getRootControl(),A=p.appComponent,f=m.getController(),s=o.getRevertData(),g=o.getContent();var h=m.byId(s),u=f.getUIModel(),j=u.getProperty("/cards"),k=f.getLayout();var I=-1,i;for(i=0;i<j.length;i++){if(s===j[i].id){I=i;break;}}j.splice(I,1);u.setProperty("/cards",j);if(h){var l=h.getComponentInstance(),n=l.getComponentData(),N=(n.cardId.indexOf("newKPICard_N")!==-1)&&!b.checkClonedCard(s);if(N){var q=n.modelName,r=m.getModel(q);r.destroy();if(g.settings["sAnnoKey"]){b.removeDataSources(g.settings["sAnnoKey"]);}m.setModel(null,q);A.setModel(null,q);}l.destroy();}k.removeContent(I);h.destroy();o.resetRevertData();return true;},completeChangeContent:function(o,s,p){return;}},layers:{"CUSTOMER_BASE":true,"CUSTOMER":true,"USER":true}},"dragAndDropUI":{changeHandler:{applyChange:function(o,p,P){var m=P.appComponent.getRootControl().getController(),e=o.getContent(),f=jQuery.extend(true,{},e),u=m.getUIModel(),g=u.getProperty("/cards"),h=m.getLayout(),v;v=f.position;f.position=f.oldPosition;f.oldPosition=v;o.setRevertData(f);v=g[e.position];g[e.position]=g[e.oldPosition];g[e.oldPosition]=v;u.setProperty("/cards",g);var t=h.getContent()[e.position],i=h.getContent()[e.oldPosition];h.removeContent(i);h.insertContent(i,e.position);h.removeContent(t);h.insertContent(t,e.oldPosition);setTimeout(function(){var j=O.getOverlay(i);j.setSelected(true);j.focus();},0);return true;},revertChange:function(o,e,p){var m=p.appComponent.getRootControl().getController(),f=o.getRevertData(),u=m.getUIModel(),g=u.getProperty("/cards"),h=m.getLayout(),v;v=g[f.position];g[f.position]=g[f.oldPosition];g[f.oldPosition]=v;u.setProperty("/cards",g);var t=h.getContent()[f.position],i=h.getContent()[f.oldPosition];h.removeContent(i);h.insertContent(i,f.position);h.removeContent(t);h.insertContent(t,f.oldPosition);setTimeout(function(){var j=O.getOverlay(i);j.setSelected(true);j.focus();},0);o.resetRevertData();return true;},completeChangeContent:function(o,s,p){return;}},layers:{"CUSTOMER_BASE":true,"CUSTOMER":true,"USER":true}},"manageCardsForEasyScanLayout":{changeHandler:{applyChange:function(o,p,P){var m=P.appComponent.getRootControl().getController();m.storeIncomingDeltaChanges(o.getContent());return true;},completeChangeContent:function(o,s,p){o.setContent(s.content);return;},revertChange:function(o,e,p){return;}},layers:{"USER":true}},"viewSwitch":{changeHandler:{applyChange:function(o,p,P){var m=P.appComponent.getRootControl().getController();m.appendIncomingDeltaChange(o);return true;},completeChangeContent:function(o,s,p){return;},revertChange:function(o,e,p){return;}},layers:{"CUSTOMER_BASE":true,"CUSTOMER":true,"USER":true}},"visibility":{changeHandler:{applyChange:function(o,p,P){var m=P.appComponent.getRootControl().getController();m.appendIncomingDeltaChange(o);return true;},completeChangeContent:function(o,s,p){return;},revertChange:function(o,e,p){return;}},layers:{"USER":true}},"position":{changeHandler:{applyChange:function(o,p,P){var m=P.appComponent.getRootControl().getController();m.appendIncomingDeltaChange(o);return true;},completeChangeContent:function(o,s,p){return;},revertChange:function(o,e,p){return;}},layers:{"CUSTOMER_BASE":true,"CUSTOMER":true,"USER":true}}};},true);