// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/comp/smartform/SmartForm","sap/ui/model/odata/ODataModel","sap/ui/comp/smartfield/SmartField","sap/ui/comp/valuehelpdialog/ValueHelpDialog"],function(S,O,a,V){"use strict";sap.ui.controller("sap.ushell.components.shell.UserSettings.DefaultParameters",{onInit:function(){this.oModelRecords={};this.oChangedParameters={};this.oBlockedParameters={};this.aDisplayedUserDefaults=[];this.DefaultParametersService=sap.ushell.Container.getService("UserDefaultParameters");},applyFocus:function(){var t=this;setTimeout(function(){if(!sap.ui.Device.phone){var e=jQuery.sap.byId(t.getView().getId()).firstFocusableDomRef();if(e){jQuery.sap.focus(e);}}},1);},overrideOdataModelValue:function(e){var u=e.getParameter('url'),m=e.getSource(),f,F,t=this;this.aDisplayedUserDefaults.forEach(function(r){if(r.editorMetadata&&r.editorMetadata.editorInfo){F=r.editorMetadata.editorInfo.odataURL+r.editorMetadata.editorInfo.bindingPath;if(F===u){f=r.editorMetadata.editorInfo.bindingPath+"/"+r.editorMetadata.editorInfo.propertyName;if(m.getProperty(f)!==r.valueObject.value){m.setProperty(f,r.valueObject.value);}t.oBlockedParameters[r.parameterName]=false;}}});},getOrCreateModelForODataService:function(u){if(!this.oModelRecords[u]){var p={metadataUrlParams:{"sap-documentation":"heading,quickinfo","sap-value-list":"none"},json:true};var m=new O(u,p);m.setDefaultCountMode("None");m.setDefaultBindingMode("TwoWay");m.attachRequestCompleted(this.overrideOdataModelValue.bind(this));this.oModelRecords[u]=m;}return this.oModelRecords[u];},constructControlSet:function(p){var u=[];for(var P in p){for(var n=0;n<u.length;n++){if(u[n].parameterName===P){u.splice(n,1);}}p[P].parameterName=P;u.push(p[P]);}this.sortParametersByGroupIdParameterIndex(u);this.aDisplayedUserDefaults=u;this.sForm=new S({editable:true}).addStyleClass("sapUshellShellDefaultValuesForm");this.getView().addContent(this.sForm);},getValue:function(){var d=jQuery.Deferred();var h=sap.ushell.Container.getService("UserDefaultParameters").hasRelevantMaintainableParameters();h.done(function(H){d.resolve({value:H?1:0,displayText:" "});});h.fail(function(e){d.reject(e);});return d.promise();},createPlainModel:function(g,r){r.modelBind.model=this.oMdlParameter;r.modelBind.extendedModel=this.oMdlParameter;g.setModel(r.modelBind.model);var m="/sUserDef_"+r.nr+"_";r.modelBind.sFullPropertyPath=m;r.modelBind.sPropertyName="{"+m+"}";r.modelBind.model.setProperty(r.modelBind.sFullPropertyPath,r.valueObject.value);},revertToPlainModelControls:function(g,r){jQuery.sap.log.error("Metadata loading for parameter "+r.parameterName+" failed"+JSON.stringify(r.editorMetadata));r.modelBind.isOdata=false;this.createPlainModel(g,r);this.createAppropriateControl(g,r);},getContent:function(){var t=this;var d=new jQuery.Deferred();this.DefaultParametersService.editorGetParameters().done(function(p){t.oMdlParameter=new sap.ui.model.json.JSONModel(p);t.oMdlParameter.setDefaultBindingMode("TwoWay");t.getView().setModel(t.oMdlParameter,"MdlParameter");t.oOriginalParameters=jQuery.extend(true,{},p);t.oCurrentParameters=jQuery.extend(true,{},p);t.constructControlSet(p);var l="nevermore";var g;t.aChangedParameters=[];t.oBindingContexts={};t.setPropValue=function(r){r.modelBind.model.setProperty(r.modelBind.sFullPropertyPath,r.valueObject.value);t.oBlockedParameters[r.parameterName]=false;};t.oMdlParameter.setProperty("/sUser");for(var i=0;i<t.aDisplayedUserDefaults.length;++i){var r=t.aDisplayedUserDefaults[i];r.nr=i;r.editorMetadata=r.editorMetadata||{};r.valueObject=r.valueObject||{value:""};var b=new sap.ui.comp.smartform.GroupElement({});if(l!=r.editorMetadata.groupId){var c=r.editorMetadata.groupTitle||undefined;g=new sap.ui.comp.smartform.Group({label:c,"editable":true,layoutData:new sap.ui.layout.GridData({linebreak:false})});l=r.editorMetadata.groupId;t.sForm.addGroup(g);}g.addGroupElement(b);r.modelBind={model:undefined,sModelPath:undefined,sPropertyName:undefined,sFullPropertyPath:undefined};r.valueObject.value=r.valueObject.value||"";if(r.editorMetadata.editorInfo&&r.editorMetadata.editorInfo.propertyName){r.modelBind.isOdata=true;var u=r.editorMetadata.editorInfo.odataURL;r.modelBind.model=t.getOrCreateModelForODataService(u);b.setModel(r.modelBind.model);if(!t.oBindingContexts[u]){b.bindElement(r.editorMetadata.editorInfo.bindingPath);t.oBindingContexts[u]=r.modelBind.model.getContext(r.editorMetadata.editorInfo.bindingPath);}else{b.setBindingContext(t.oBindingContexts[u]);}r.modelBind.sPropertyName="{"+r.editorMetadata.editorInfo.propertyName+"}";r.modelBind.sFullPropertyPath=r.editorMetadata.editorInfo.bindingPath+"/"+r.editorMetadata.editorInfo.propertyName;r.modelBind.extendedModel=t.oMdlParameter;}else{t.createPlainModel(b,r);}r.valueObject.value=r.valueObject.value||"";r.modelBind.model.setProperty(r.modelBind.sFullPropertyPath,r.valueObject.value);if(r.modelBind.isOdata){t.oBlockedParameters[r.parameterName]=true;r.modelBind.model.attachMetadataLoaded(t.createAppropriateControl.bind(t,b,r));r.modelBind.model.attachMetadataFailed(t.revertToPlainModelControls.bind(t,b,r));}else{t.createAppropriateControl(b,r);}r.modelBind.model.bindTree(r.modelBind.sFullPropertyPath).attachChange(t.storeChangedData.bind(t));}t.oMdlParameter.bindTree("/").attachChange(t.storeChangedData.bind(t));d.resolve(t.getView());});return d.promise();},createAppropriateControl:function(g,r){var s,l,e,b;if(r.editorMetadata.extendedUsage){var t=this;e=new sap.m.Button({text:sap.ushell.resources.i18n.getText("userDefaultsExtendedParametersTitle"),tooltip:sap.ushell.resources.i18n.getText("userDefaultsExtendedParametersTooltip"),type:{parts:['MdlParameter>/'+r.parameterName+'/valueObject/extendedValue/Ranges'],formatter:function(R){return R&&R.length?sap.m.ButtonType.Emphasized:sap.m.ButtonType.Transparent;}},press:function(o){t.openExtendedValueDialog(o,r);}}).addStyleClass('sapUshellExtendedDefaultParamsButton');}jQuery.sap.log.debug("Creating controls for parameter"+r.parameterName+" type "+r.modelBind.isOdata);var E=g.getElements().slice();E.forEach(function(o){g.removeElement(o);});var f=g.getFields().slice();f.forEach(function(o){g.removeField(o);});l=new sap.ui.comp.smartfield.SmartLabel({width:sap.ui.Device.system.phone?"auto":"12rem",textAlign:sap.ui.Device.system.phone?'Left':'Right'});if(r.modelBind.isOdata&&r.editorMetadata.editorInfo){s=new a({value:r.modelBind.sPropertyName,name:r.parameterName});s.attachInnerControlsCreated({},this.applyFocus,this);l.setLabelFor(s);}else{s=new sap.m.Input({name:r.parameterName,value:r.modelBind.sPropertyName,type:"Text"});s.addAriaLabelledBy(l);this.setPropValue(r);l.setText((r.editorMetadata.displayText||r.parameterName)+":");l.setTooltip(r.editorMetadata.description||r.parameterName);}s.attachChange(this.storeChangedData.bind(this));s.addStyleClass("sapUshellDefaultValuesSmartField");s.setLayoutData(new sap.m.FlexItemData({shrinkFactor:0}));var i=new sap.m.FlexBox({width:sap.ui.Device.system.phone?'100%':'auto',direction:(sap.ui.Device.system.phone&&!e)?'Column':'Row',items:[s,e]});l.setLayoutData(new sap.m.FlexItemData({shrinkFactor:0}));b=new sap.m.FlexBox({alignItems:sap.ui.Device.system.phone?'Start':'Center',direction:sap.ui.Device.system.phone?'Column':'Row',items:[l,i]});g.addElement(b);},openExtendedValueDialog:function(e,d){var t=this,p='/'+d.parameterName+'/valueObject/extendedValue/Ranges',m=d.modelBind.extendedModel,r=m.getProperty(p)||[],l,n;if(d.modelBind.isOdata){n=this._getMetadataNameSpace(d.editorMetadata.editorInfo.odataURL);var E=d.modelBind.model.getMetaModel().getODataEntityType(n+"."+d.editorMetadata.editorInfo.entityName);if(E){l=d.modelBind.model.getMetaModel().getODataProperty(E,d.editorMetadata.editorInfo.propertyName)["sap:label"];}}var v=new V({basicSearchText:d.editorMetadata.displayText||l||d.parameterName,title:d.editorMetadata.displayText||l||d.parameterName,supportRanges:true,supportRangesOnly:true,key:d.modelBind.sPropertyName,displayFormat:"UpperCase",descriptionKey:d.editorMetadata.displayText||l||d.parameterName,filterMode:true,stretch:sap.ui.Device.system.phone,ok:function(c){t.saveExtendedValue(c,d,m,v);},cancel:function(c){v.close();},afterClose:function(){v.destroy();}});v.setIncludeRangeOperations(this.getListOfSupportedRangeOperations());this.addTokensToValueHelpDialog(v,r,d.parameterName);var k=[];k.push({label:v.getTitle(),key:d.parameterName});v.setRangeKeyFields(k);v.open();},saveExtendedValue:function(c,d,m,v){this.aTokens=c.getParameters().tokens;var t=[],p='/'+d.parameterName+'/valueObject/extendedValue/Ranges',f,b={extendedValue:{"Ranges":[]}};jQuery.extend(this.oCurrentParameters[d.parameterName].valueObject,b);for(var e in this.aTokens){if(this.aTokens.hasOwnProperty(e)){t.push(this.aTokens[e].data("range"));}}f=t.map(function(e){return{Sign:e.exclude?'E':'I',Option:e.operation!=="Contains"?e.operation:"CP",Low:e.value1,High:e.value2||null};});if(!m.getProperty('/'+d.parameterName+'/valueObject/extendedValue')){m.setProperty('/'+d.parameterName+'/valueObject/extendedValue',{});}m.setProperty(p,f);this.oChangedParameters[d.parameterName]=true;v.close();},getListOfSupportedRangeOperations:function(){var s=Object.keys(sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation);return s.filter(function(o){return o!=="StartsWith"&&o!=='EndsWith'&&o!=='Initial';});},_getMetadataNameSpace:function(s){var b=s.split("/"),n;n=b[b.length-1];return n;},addTokensToValueHelpDialog:function(d,r,p){var t=[],f;r.forEach(function(R){if(R){f={};f.exclude=R.Sign==='E';f.keyField=p;f.operation=R.Option!=="CP"?R.Option:"Contains";f.value1=R.Low;f.value2=R.High;t.push(new sap.m.Token({}).data("range",f));}});d.setTokens(t);},sortParametersByGroupIdParameterIndex:function(u){function c(d,D){if(!(D.editorMetadata&&D.editorMetadata.groupId)){return-1;}if(!(d.editorMetadata&&d.editorMetadata.groupId)){return 1;}if(d.editorMetadata.groupId<D.editorMetadata.groupId){return-1;}if(d.editorMetadata.groupId>D.editorMetadata.groupId){return 1;}return 0;}function b(d,D){if(!(D.editorMetadata&&D.editorMetadata.parameterIndex)){return-1;}if(!(d.editorMetadata&&d.editorMetadata.parameterIndex)){return 1;}return d.editorMetadata.parameterIndex-D.editorMetadata.parameterIndex;}u.sort(function(d,D){var r=c(d,D);if(r===0){return b(d,D);}return r;});},storeChangedData:function(){var i=0,t=this,b=t.aDisplayedUserDefaults;for(i=0;i<b.length;++i){var p=b[i].parameterName;if(!t.oBlockedParameters[p]){var o={value:t.oCurrentParameters[p].valueObject&&t.oCurrentParameters[p].valueObject.value,extendedValue:t.oCurrentParameters[p].valueObject&&t.oCurrentParameters[p].valueObject.extendedValue&&t.oCurrentParameters[p].valueObject.extendedValue};if(b[i].modelBind&&b[i].modelBind.model){var m=b[i].modelBind.model;var M=b[i].modelBind.extendedModel;var P=b[i].modelBind.sFullPropertyPath;var A=m.getProperty(P);var n={value:m.getProperty(P),extendedValue:M.getProperty('/'+p+'/valueObject/extendedValue')};if(this.isValueDifferent(n,o)){t.oCurrentParameters[p].valueObject.value=A;if(n.extendedValue){jQuery.extend(t.oCurrentParameters[p].valueObject.extendedValue,n.extendedValue);}t.oChangedParameters[p]=true;}}}}},onCancel:function(){if(sap.ui.getCore().byId("saveButton")){sap.ui.getCore().byId("saveButton").setEnabled(true);}},isValueDifferent:function(v,o){var i=false,s=v?JSON.stringify(v):v,b=o?JSON.stringify(o):o,e,E;if(s===b){return false;}if(v===undefined){return false;}if(o===undefined){return false;}e=v.extendedValue?JSON.stringify(v.extendedValue):v.extendedValue;E=o.extendedValue?JSON.stringify(o.extendedValue):o.extendedValue;if((v.value===""&&o.value===undefined)||(o.value===""&&v.value===undefined)){i=true;}if(i&&(e===E)){return false;}return(!i&&(v.value!==o.value))||(e!==E);},onSave:function(){var t=this,d=new jQuery.Deferred(),i,c=Object.keys(this.oChangedParameters).sort(),s,p;for(i=0;i<c.length;i++){p=c[i];if(this.isValueDifferent(this.oOriginalParameters[p].valueObject,this.oCurrentParameters[p].valueObject)){if((this.oCurrentParameters[p].valueObject&&this.oCurrentParameters[p].valueObject.value===null)||(this.oCurrentParameters[p].valueObject&&this.oCurrentParameters[p].valueObject.value==="")){this.oCurrentParameters[p].valueObject.value=undefined;}if(this.oCurrentParameters[p].valueObject&&this.oCurrentParameters[p].valueObject.extendedValue&&jQuery.isArray(this.oCurrentParameters[p].valueObject.extendedValue.Ranges)&&(this.oCurrentParameters[p].valueObject.extendedValue.Ranges.length===0)){this.oCurrentParameters[p].valueObject.extendedValue=undefined;}s=sap.ushell.Container.getService("UserDefaultParameters").editorSetValue(p,this.oCurrentParameters[p].valueObject);s.done(function(P){t.oChangedParameters={};t.oOriginalParameters[P].valueObject.value=t.oCurrentParameters[P].valueObject.value;d.resolve();});s.fail(d.reject);}}return d.promise();}});},false);
