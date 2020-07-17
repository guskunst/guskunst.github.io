sap.ui.define(["jquery.sap.global","sap/ui/base/Object"],function(q,B){"use strict";function g(t,c,s){var e="none";function E(){e="none";}return{edit:function(C){if(!C){throw new Error("Nothing to edit provided");}if(e!=="none"){throw new Error("Attempt to edit multiple contexts ("+C+")");}if(c.getView().getModel().hasPendingChanges()){throw new Error("Attempt to edit while already pending changes exist");}e="editing";},cancel:function(){if(e!=="editing"){throw new Error("Nothing edited");}t.oServices.oTransactionController.resetChanges();E();},save:function(){var f=function(){if(e!=="editing"){throw new Error("Nothing edited");}e="saving";var P=t.oServices.oTransactionController.triggerSubmitChanges();P.then(E,function(){e="editing";});return P;};var p={};p=q.extend(true,{busy:{set:true,check:true},dataloss:{popup:false,navigation:false}},p);return t.oCommonUtils.securedExecution(f,p,s);},createEntry:function(p,a){a=a||c.getOwnerComponent().getEntitySet();if(!s.oMultipleViewsHandler.hasEntitySet(a)){throw new Error("Entity Set "+a+" is not available and thus cannot be used for create");}return t.oServices.oApplication.createNonDraft(a,p);}};}return B.extend("sap.suite.ui.generic.template.ListReport.extensionAPI.NonDraftTransactionController",{constructor:function(t,c,s){q.extend(this,g(t,c,s));}});});