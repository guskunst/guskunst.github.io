/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
(function(){'use strict';sap.ui.jsfragment("sap.apf.ui.reuse.fragment.stepGallery",{createContent:function(c){var s=this;this.contentWidth=jQuery(window).height()*0.6+"px";this.contentHeight=jQuery(window).height()*0.6+"px";this.oCoreApi=c.oCoreApi;this.oUiApi=c.oUiApi;var o=function(E){var l=[];var S=E.getSource().getValue();var L=s.oStepGalleryHierarchicalDialog.getContent()[0].getCurrentPage().getContent()[0];if(S&&S.length>0){var F=new sap.ui.model.Filter("title",sap.ui.model.FilterOperator.Contains,S);l.push(F);}var i=L.getBinding("items");i.filter(l);};var a=function(E){s.oUiApi.getLayoutView().setBusy(true);var i=E.getSource().getBindingContext().sPath.split('/');var j=i[2];var k=i[4];var r=i[6];var l=c.getStepDetails(j,k);c.onStepPress(l.id,l.representationtypes[r].representationId);};var A=sap.ui.Device.system.desktop?false:true;var b=new sap.m.List().bindItems({path:'representationtypes',template:new sap.m.StandardListItem({title:'{title}',adaptTitleSize:A,icon:'{picture}',tooltip:'{title}',type:"Active",press:a}).bindProperty("description","sortDescription",function(v){var S=[];if(v===undefined||v===null){return null;}S=v.length?v.join(", "):v;return s.oCoreApi.getTextNotHtmlEncoded("sortBy")+": "+S;})});var d=new sap.m.Page({id:this.createId("idStepGalleryRepresentationPage"),subHeader:new sap.m.Bar({contentLeft:[new sap.m.SearchField({liveChange:o})]}),content:b,showNavButton:true,navButtonPress:function(){s.oStepGalleryNavContainer.back();}});var e=new sap.m.List().bindItems({path:'stepTemplates',template:new sap.m.StandardListItem({title:'{title}',tooltip:'{title}',type:"Navigation",press:function(E){var B=E.getSource().getBindingContext();d.setBindingContext(B);d.setTitle(E.getSource().getTitle());s.oStepGalleryNavContainer.to(s.oStepGalleryNavContainer.getPages()[2]);if(sap.ui.Device.system.desktop){var r=s.oStepGalleryNavContainer.getPages()[2].getContent()[0].getItems();r.forEach(function(i){i.addStyleClass("repItem");});}}})});var f=new sap.m.Page({id:this.createId("idStepGalleryStepPage"),subHeader:new sap.m.Bar({contentLeft:[new sap.m.SearchField({liveChange:o})]}),content:e,showNavButton:true,navButtonPress:function(){s.oStepGalleryNavContainer.back();}});var g=new sap.m.List().bindItems({path:'/GalleryElements',template:new sap.m.StandardListItem({title:'{title}',tooltip:'{title}',type:"Navigation",press:function(E){var B=E.getSource().getBindingContext();f.setBindingContext(B);f.setTitle(E.getSource().getTitle());s.oStepGalleryNavContainer.to(s.oStepGalleryNavContainer.getPages()[1]);}})});var h=new sap.m.Page({id:this.createId("idStepGalleryCategoryPage"),title:s.oCoreApi.getTextNotHtmlEncoded("category"),subHeader:new sap.m.Bar({contentLeft:[new sap.m.SearchField({liveChange:o})]}),content:g});this.oStepGalleryNavContainer=new sap.m.NavContainer({pages:[h,f,d]});this.oStepGalleryNavContainer.setModel(c.getView().getModel());this.oStepGalleryHierarchicalDialog=new sap.m.Dialog({contentWidth:s.contentWidth,contentHeight:s.contentHeight,showHeader:false,content:[this.oStepGalleryNavContainer],endButton:new sap.m.Button({text:s.oCoreApi.getTextNotHtmlEncoded("cancel"),press:function(){s.oStepGalleryHierarchicalDialog.close();s.oStepGalleryHierarchicalDialog.destroy();}}),afterClose:function(){s.oStepGalleryHierarchicalDialog.destroy();}});return this.oStepGalleryHierarchicalDialog;}});}());