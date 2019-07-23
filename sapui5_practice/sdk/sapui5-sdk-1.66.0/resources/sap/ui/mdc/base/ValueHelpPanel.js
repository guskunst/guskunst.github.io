/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/XMLComposite","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/base/ManagedObjectObserver","sap/m/Tokenizer"],function(X,J,F,M,T){"use strict";var V=X.extend("sap.ui.mdc.base.ValueHelpPanel",{metadata:{properties:{showTokenizer:{type:"boolean",group:"Data",defaultValue:true},showFilterbar:{type:"boolean",group:"Data",defaultValue:true},conditions:{type:"object[]",group:"Data",defaultValue:[],byValue:true},filterConditions:{type:"object[]",group:"Data",defaultValue:[]},formatOptions:{type:"object",defaultValue:{}}}},fragment:"sap.ui.mdc.base.ValueHelpPanel",init:function(){if(!this._oTokenizer){this._oTokenizer=this.byId("VHPTokenizer");this._oTokenizer.updateTokens=function(){T.prototype.updateTokens.apply(this,arguments);this.invalidate();};}var s=this.byId("SearchField2");s.getFieldPath=a.bind(this);this._oObserver=new M(_.bind(this));this._oObserver.observe(this,{properties:["formatOptions"]});},exit:function(){if(!this.getShowTokenizer()){this._oTokenizer.destroy();}if(this._oDefineConditionPanel&&!this._oDefineConditionPanel.getParent()){this._oDefineConditionPanel.destroy();}this._oObserver.disconnect();this._oObserver=undefined;},setFilterbar:function(f){var s=this.byId("filterbarSplitter");if(this._oFilterbar){if(this._bFilterbarParentSet){this._oFilterbar.setParent();delete this._bFilterbarParentSet;}}this._oFilterbar=f;if(f){f.addStyleClass("sapMdcValueHelpPanelFilterbar");f.setLayoutData(new sap.ui.layout.SplitterLayoutData({size:"280px"}));this._updateFilterbarVisibility(this.getShowFilterbar());if(!f.getParent()){f.setParent(this);this._bFilterbarParentSet=true;}}s.invalidate();var i=this.byId("iconTabBar");i.getItems()[0].setVisible(i.getItems()[0].getContent().length>0);i.setSelectedKey("selectFromList");this._updateITBHeaderVisiblity();},setTable:function(t){var s=this.byId("filterbarSplitter");if(this._oTable){if(this._bTableParentSet&&this._oTable.getParent()){this._oTable.setParent();}delete this._bTableParentSet;}this._oTable=t;if(t){t.setLayoutData(new sap.ui.layout.SplitterLayoutData({size:"auto"}));if(!t.getParent()){t.setParent(this);this._bTableParentSet=true;}}s.invalidate();var i=this.byId("iconTabBar");i.getItems()[0].setVisible(i.getItems()[0].getContent().length>0);i.setSelectedKey("selectFromList");this._updateITBHeaderVisiblity();},getTable:function(){if(this._oTable){return this._oTable;}else{return;}},setDefineConditions:function(d){var i=this.byId("iconTabBar");if(this._oDefineConditionPanel){i.getItems()[1].removeContent(this._oDefineConditionPanel);this._oDefineConditionPanel.destroy();}this._oDefineConditionPanel=d;i.getItems()[1].setVisible(!!this._oDefineConditionPanel);this._updateITBHeaderVisiblity();},_updateITBHeaderVisiblity:function(){var i=this.byId("iconTabBar");if(i.getItems()[0].getVisible()&&i.getItems()[1].getVisible()){i.removeStyleClass("sapMdcNoHeader");}else{i.addStyleClass("sapMdcNoHeader");}if(i.getItems()[1].getVisible()&&i.getSelectedKey()!=="selectFromList"){b.call(this);}},onBeforeRendering:function(){var s=this.byId("filterbarSplitter");s._oValueHelpPanel=this;s.getContentAreas=function(){var c=[];if(this._oValueHelpPanel._oFilterbar){if(this._oValueHelpPanel.getShowFilterbar()){var t=this._oValueHelpPanel.byId("AdvancedFilter");if(t.getPressed()){c.push(this._oValueHelpPanel._oFilterbar);}}}if(this._oValueHelpPanel._oTable){c.push(this._oValueHelpPanel._oTable);}return c;};},_handleTokenUpdate:function(e){if(e.getParameter("type")==="removed"){var r=e.getParameter("removedTokens");var c=this.getConditions();var i;for(i=0;i<r.length;i++){var R=r[i];var p=R.getBindingContext("$this").sPath;var I=parseInt(p.slice(p.lastIndexOf("/")+1));c[I].delete=true;}for(i=c.length-1;i>=0;i--){if(c[i].delete){c.splice(i,1);}}this.setProperty("conditions",c,true);}},setShowFilterbar:function(v){var o=this.getShowFilterbar();this.setProperty("showFilterbar",v);if(o!==this.getShowFilterbar()){this._oAdvButton=this.byId("AdvancedFilter");this._oAdvButton.setPressed(v);this._updateFilterbarVisibility(v);}return this;},_handleToggleFilterVisibility:function(e){var p=e.getParameter("pressed");this._updateFilterbarVisibility(p);},_updateFilterbarVisibility:function(v){if(!this._oFilterbar){return;}var s=this.byId("filterbarSplitter");s.invalidate();},setShowTokenizer:function(v){var o=this.getShowTokenizer();this.setProperty("showTokenizer",v);v=this.getShowTokenizer();if(o!==v){var s=this.byId("rootSplitter");var l=this._oTokenizer.getBinding("tokens");if(v){l.resume();s.insertContentArea(this._oTokenizer,1);}else{l.suspend();s.removeContentArea(this._oTokenizer);}}return this;},iconTabSelect:function(e){var k=e.getParameter("key");if(k==="defineCondition"){b.call(this);}}});function _(c){if(c.name==="formatOptions"){var B=this._oTokenizer.getBindingInfo("tokens");if(B&&B.template){B=B.template.getBindingInfo("text");if(B&&B.type){B.type.setFormatOptions(c.current);}}}}function a(){var B=this.getBindingPath("filterConditions");if(B&&B.startsWith("/conditions/")){return B.slice(12);}else{return"";}}function b(){if(this._oDefineConditionPanel){if(!this._oDefineConditionPanel.getModel("$VHP")){var m=this._getManagedObjectModel();this._oDefineConditionPanel.setModel(m,"$VHP");var o=this._oDefineConditionPanel.getMetadata();if(o.hasProperty("formatOptions")&&!this._oDefineConditionPanel.getBindingPath("formatOptions")&&this._oDefineConditionPanel.isPropertyInitial("formatOptions")){this._oDefineConditionPanel.bindProperty("formatOptions",{path:"$VHP>/formatOptions"});}if(o.hasProperty("conditions")&&!this._oDefineConditionPanel.getBindingPath("conditions")&&this._oDefineConditionPanel.isPropertyInitial("conditions")){this._oDefineConditionPanel.bindProperty("conditions",{path:"$VHP>/conditions"});}}var i=this.byId("iconTabBar");i.getItems()[1].addContent(this._oDefineConditionPanel);}}return V;},true);
