sap.ui.define(["sap/ui/core/Control","sap/suite/ui/generic/template/AnalyticalListPage/controller/KpiTagController","sap/suite/ui/generic/template/AnalyticalListPage/util/KpiUtil","sap/suite/ui/generic/template/AnalyticalListPage/util/KpiAnnotationHelper","sap/suite/ui/generic/template/AnalyticalListPage/util/AnnotationHelper","sap/suite/ui/generic/template/AnalyticalListPage/util/FilterUtil","sap/suite/ui/generic/template/AnalyticalListPage/util/V4Terms","sap/ui/comp/odata/ODataModelUtil","sap/suite/ui/generic/template/AnalyticalListPage/control/KpiTag","sap/suite/ui/generic/template/AnalyticalListPage/control/KpiProvider","sap/ui/Device","sap/ui/generic/app/navigation/service/SelectionVariant","sap/ui/model/Filter","sap/ui/model/json/JSONModel","sap/ui/core/Locale","sap/m/ResponsivePopover","sap/m/MessageStrip","sap/ui/core/format/NumberFormat","sap/m/library","sap/ui/core/library","sap/base/Log","sap/m/GenericTag","sap/m/ObjectNumber"],function(C,K,a,b,A,F,V,O,c,d,D,S,e,J,L,R,M,N,f,g,h,G,l){"use strict";var T="Target",m="Maximize",n="Minimize";return G.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.SmartKpiTag",{metadata:{designTime:true,interfaces:["sap.m.IOverflowToolbarContent"],properties:{entitySet:{type:"string",defaultValue:"",bindable:false},qualifier:{type:"string",defaultValue:"",bindable:false},modelName:{type:"string",defaultValue:undefined,bindable:false},groupId:{type:"string",defaultValue:"AlpKpiGroup",bindable:false},smartFilterId:{type:"string",defaultValue:undefined,bindable:false},shortDescription:{type:"string",defaultValue:"",bindable:"bindable"},enabled:{type:"boolean",defaultValue:true,bindable:false},error:{type:"boolean",defaultValue:false,bindable:false},errorType:{type:"sap.ui.core.MessageType",defaultValue:g.MessageType.Error},errorMessage:{type:"string",defaultValue:"",bindable:"bindable"},kpivalue:{type:"string",defaultValue:"",bindable:"bindable"},kpiunit:{type:"string",defaultValue:"",bindable:"bindable"},indicator:{type:"sap.m.ValueColor",defaultValue:undefined}},events:{beforeRebindFilterableKPI:{}}},renderer:{},_isPercent:false,_unScaledValue:"",_sUnitofMeasure:"",_relativeToProperties:[],_bStopDataLoad:true,init:function(){h.setLevel(h.Level.WARNING,this);},_initCompositeSupport:function(s){a.addToKpiList(s,this);},propagateProperties:function(){C.prototype.propagateProperties.apply(this,arguments);this._initialiseMetadata();},_initialiseMetadata:function(){O.handleModelInit(this,this._onMetaDataInit);},_setDeferredGroups:function(){if(!this._oModel){return;}var i=this._oModel.getDeferredGroups();var s=this.getGroupId();if(i.indexOf(s)<0){i.push(s);this._oModel.setDeferredGroups(i);}},_onMetaDataInit:function(){var s=this.getModelName();if(!s){this._oModel=this.getModel();}else{this._oModel=this.getModel(s);}this._setDeferredGroups();this._oModel.getMetaModel().loaded().then(function(){this.kpiProvider=new d(this);if(!this.kpiProvider){this._kpiErrorHandler({},false);this._updateKpiList(true);return;}this.kpiSettings=this.kpiProvider.getConfig();if(!this.kpiSettings){h.error("KPI Error details: incorrect KPI configuration");this._updateKpiList(true);return;}var i=this.getSmartFilterId();if(i){if(i&&!this._oSmartFilter){this._oSmartFilter=this._findControl(i);this._oSmartFilter.attachSearch(this._createFilterableKpi,this);this._oSmartFilter.attachFilterChange(function(E){if(!this._oSmartFilter.isLiveMode()&&!this._oSmartFilter.isDialogOpen()){this.setEnabled(false);}}.bind(this));if(this._oSmartFilter.isInitialised()){this._createFilterableKpi();}else{this._oSmartFilter.attachInitialized(this._createFilterableKpi,this);}}}else{this._createGlobalKpi();}}.bind(this));},_createFilterableKpi:function(){try{this._updateKpiList(false);this.setBusy(true);this.setBusyIndicatorDelay(0);var I=false;if(this.getEntitySet()===this._oSmartFilter.getEntitySet()){I=true;if(!this._checkSearchAllowed()){this._mandatoryfieldsErrorHandler(false,false,true);return;}}var o=this.kpiSettings,s=o.selectOptions,p=A.resolveParameterStringValue(o.parameters),u=this._oSmartFilter.getUiState(),U=u.getProperty("selectionVariant"),q=U?U.SelectOptions:undefined,r=U?U.Parameters:undefined,t=this._oSmartFilter.getFilterData(true),v=new S(U),w=new S(),x=[],y,P,z,B,E=false,H,Q,W=this._oModel.getMetaModel(),X=W.getODataEntitySet(this.getEntitySet()),Y=W.getODataEntityType(X.entityType),Z=o.entitySet["Org.OData.Capabilities.V1.FilterRestrictions"],$=Z["RequiredProperties"];if(q){for(var i=0;i<q.length;i++){P=q[i].PropertyName;z=q[i].Ranges;var _=W.getODataProperty(Y,P),a1=_&&F.isPropertyNonFilterable(X,_.name);if(a1||F.isPropertyHidden(_)){continue;}if(_){if(z){for(var k=0;k<z.length;k++){if(z[k].Sign==="I"||z[k].Sign==="E"){if(z[k].Low!==undefined){B=a.getFilter(z[k],q[i],P);if(this._checkKPIMandatoryFields($,P)){if(!B.value1){this._mandatoryfieldsErrorHandler(false,false,true);return;}}if(_!==null&&_['type']==="Edm.DateTime"){if(B.value1&&!(B.value1.indexOf('Z')===(B.value1.length-1))){B.value1=B.value1.split('T')[0]+"T00:00:00Z";}if(B.value2&&!(B.value2.indexOf('Z')===(B.value2.length-1))){B.value2=B.value2.split('T')[0]+"T00:00:00Z";}}w.addSelectOption(B.path,B.sign,B.operator,B.value1,B.value2);}}}}}}}if(r){for(var i=0;i<r.length;i++){H=r[i];P=H.PropertyName;Q=H.PropertyValue;var b1=b.checkMandatoryParameter(this._oModel,X,P);if(b1){if(!Q){this._mandatoryfieldsErrorHandler(false,false,true);return;}}if(Q!==w.getParameter(P)){if(P&&Q&&(Q!=="")){var c1=b.checkParameterizedEntitySet(this._oModel,X,P);if(c1){if(b.checkForDateTimeParameter(this._oModel,this.getEntitySet(),P)){if(Q&&!(Q.indexOf('Z')===(Q.length-1))){Q=Q.split('T')[0]+"T00:00:00Z";}}w.addParameter(P,Q);}}}}}if(s){for(var i=0;i<s.length;i++){y=s[i];P=y.PropertyName.PropertyPath;z=y.Ranges;var _=W.getODataProperty(Y,P),a1=_&&F.isPropertyNonFilterable(X,_.name);if(a1){continue;}if(_&&t&&t[P]===undefined){E=true;if(!w.getSelectOption(P)){for(var k=0;k<z.length;k++){if(z[k].Sign.EnumMember===V.SelectionRangeSignType+"/I"||z[k].Sign.EnumMember===V.SelectionRangeSignType+"/E"){if(z[k].Low!==undefined){B=a.getFilter(z[k],y);if(this._checkKPIMandatoryFields($,P)){if(!B.value1){this._mandatoryfieldsErrorHandler(true,false,false);return;}}w.addSelectOption(B.path,B.sign,B.operator,B.value1,B.value2);}}}}}}}if(p){for(var i=0;i<p.length;i++){H=p[i];P=H.PropertyName&&H.PropertyName.PropertyPath;Q=v.getParameter(P)||H.PropertyValue.String;var b1=b.checkMandatoryParameter(this._oModel,X,P);if(b1){if(!Q){this._mandatoryfieldsErrorHandler(true,false,false);return;}}if(t&&t["$Parameter."+P]===undefined){E=true;if(!w.getParameter(P)){if(P&&Q&&(Q!=="")){w.addParameter(P,Q);}}}}}if(!I||!E){if(!this._checkSearchAllowed()){this._mandatoryfieldsErrorHandler(false,false,true);return;}}this.fireBeforeRebindFilterableKPI({selectionVariant:w,entityType:X.entityType});var d1=w.getSelectOptionsPropertyNames();for(var i=0;i<d1.length;i++){y=w.getSelectOption(d1[i]);for(var j=0;j<y.length;j++){z=y[j];if(z.Sign==="I"||z.Sign==="E"){if(z.Low!==undefined){B=a.getFilter(z,null,d1[i]);x.push(new e(B));}}}}this._filterableKPISelectionVariant=w;var e1=b.resolveParameterizedEntitySet(this._oModel,o.entitySet,w);this._applyFiltersToKpi.apply(this,[w,x,e1]);}catch(f1){this._updateKpiList(true);h.error("KPI Error details: "+f1);}},_createGlobalKpi:function(){try{this._updateKpiList(false);this.setBusy(true);this.setBusyIndicatorDelay(0);var k=this.kpiSettings;var s=k.selectOptions,o,r,p=[];if(s){for(var i=0;i<s.length;i++){o=s[i];for(var j=0;j<o["Ranges"].length;j++){r=o["Ranges"][j];if(r.Low){p.push(new e(a.getFilter(r,o)));}}}}var P=b.resolveParameterizedEntitySet(this._oModel,k.entitySet,k.selectionVariant);this._applyFiltersToKpi.apply(this,[k.selectionVariant,p,P]);}catch(E){this._updateKpiList(true);h.error("KPI Error details: "+E);}},_applyFiltersToKpi:function(s,i,p){this._relativeToProperties=[];var j=this.kpiSettings;var o=j.dataPoint,k;var q=this.getGroupId();this._getCriticalityRefProperties(o);this._oConfig={path:p,filterable:this.getSmartFilterId()?true:false,properties:{value:j.props.value,valueFormat:j.dataPoint.ValueFormat,title:j.props.title,unitOfMeasure:j.props.unitOfMeasure}};this._oConfig.properties.shortDescription=j.props.shortDescription;this._checkForPercent(this._oConfig.properties.unitOfMeasure);if(this._relativeToProperties.length!==0){k=(this._relativeToProperties.indexOf(this._oConfig.properties.value)===-1)?[this._oConfig.properties.value].concat(this._relativeToProperties).join(","):this._relativeToProperties;}else{k=[this._oConfig.properties.value];}if(this._oConfig){this._oModel.read(this._oConfig.path,{async:true,filters:i,urlParameters:{"$select":k,"$top":1},success:this._kpiSuccessHandler.bind(this),error:this._kpiErrorHandler.bind(this),groupId:q});}if(this.getSmartFilterId()){this._updateKpiList(!this._bStopDataLoad);}else{this._updateKpiList(true);}},_updateKpiList:function(p){Promise.resolve().then(function(){this._updateKpiListAsync(p);}.bind(this));},_updateKpiListAsync:function(p){var s=this.getGroupId();a.updateKpiList(this,p);if(!p){return;}var k=a.getKpiList(this.getModelName(),s);for(var i in k){if(!k[i].bProcessed){return;}}this._oModel.submitChanges({groupId:s});},_checkKPIMandatoryFields:function(k,p){if(k&&p){for(var i=0;i<k.length;i++){if(k[i].PropertyPath===p){return true;}}}},_mandatoryfieldsErrorHandler:function(i,I,j){this._kpiErrorHandler({},i,I,j);this._updateKpiList(true);},_checkSearchAllowed:function(){var k=this._oSmartFilter.determineMandatoryFilterItems(),o=this._oSmartFilter.getFiltersWithValues(),I=true,p=0;if(k.length){if(!o.length||(o.length<k.length)){I=false;}else{for(var i=0;i<k.length;i++){for(var j=0;j<o.length;j++){if(o[j].getName()===k[i].getName()){p++;}}}I=(p===k.length);}}if(I){var s=this._oSmartFilter.verifySearchAllowed.apply(this._oSmartFilter,arguments);if(s.hasOwnProperty("error")||s.hasOwnProperty("mandatory")){I=false;}}return I;},_checkKpiCriticality:function(){var i=this.kpiSettings;var o=i.dataPoint;var j;if(i.criticality){if(i.criticality.criticalityPath){j=i.criticality.criticalityPath;this._oConfig.criticality={criticalityPath:i.criticality.criticalityPath};}else if(i.criticality.criticalityType){j=this._getCriticalityFromEnum(i.criticality.criticalityType);this._oConfig.criticality={criticalityType:i.criticality.criticalityType};}}else if(i.criticalityCalculation){var I=i.criticalityCalculation.improveDirection,t=i.criticalityCalculation.toleranceHigh,s=i.criticalityCalculation.toleranceLow,k=i.criticalityCalculation.deviationLow,p=i.criticalityCalculation.deviationHigh;var q=[];if(this.getError()||(this.getSmartFilterId()&&this._checkCriticalityCalculationForNumber(o.CriticalityCalculation,I))){this._mCriticalityIndicator="None";}else{q.push(this._getPathForIndicatorParts(t));q.push(this._getPathForIndicatorParts(s));q.push(this._getPathForIndicatorParts(k));q.push(this._getPathForIndicatorParts(p));q.push({path:"/"+i.props.value});j={parts:q,formatter:function(r,u,v,w,x){var y=u?u:s,z=r?r:t,B=v?v:k,E=w?w:p;y=y&&Number(y);z=z&&Number(z);B=B&&Number(B);E=E&&Number(E);x=x&&Number(x);return this._getImproveDirection(y,z,B,E,x);}.bind(this)};this._oConfig.criticalityCalculation={improveDirection:i.criticalityCalculation.improveDirection,toleranceLow:i.criticalityCalculation.toleranceLow,toleranceHigh:i.criticalityCalculation.toleranceHigh,deviationLow:i.criticalityCalculation.deviationLow,deviationHigh:i.criticalityCalculation.deviationHigh};}}this._oConfig.criticalityProps={criticalityIndicator:j,relativeProperties:this._relativeToProperties};},_getCriticalityRefProperties:function(o){var i=o.CriticalityCalculation;var j=o.Criticality;if(j&&j.Path&&this._relativeToProperties.indexOf(j.Path)===-1){this._relativeToProperties.push(j.Path);}else if(i){if(i.DeviationRangeLowValue&&i.DeviationRangeLowValue.Path&&this._relativeToProperties.indexOf(i.DeviationRangeLowValue.Path)===-1){this._relativeToProperties.push(i.DeviationRangeLowValue.Path);}if(i.DeviationRangeHighValue&&i.DeviationRangeHighValue.Path&&this._relativeToProperties.indexOf(i.DeviationRangeHighValue.Path)===-1){this._relativeToProperties.push(i.DeviationRangeHighValue.Path);}if(i.ToleranceRangeLowValue&&i.ToleranceRangeLowValue.Path&&this._relativeToProperties.indexOf(i.ToleranceRangeLowValue.Path)===-1){this._relativeToProperties.push(i.ToleranceRangeLowValue.Path);}if(i.ToleranceRangeHighValue&&i.ToleranceRangeHighValue.Path&&this._relativeToProperties.indexOf(i.ToleranceRangeHighValue.Path)===-1){this._relativeToProperties.push(i.ToleranceRangeHighValue.Path);}}},_kpiSuccessHandler:function(i,r){this.setProperty("error",false);this.setProperty("errorMessage","");if((this.kpiProvider.kpiConfig.bIsKpiAnnotaion&&!this.kpiProvider.kpiConfig.hasOwnProperty("navigation"))||this.kpiProvider.kpiConfig.oDefaultPV===false){this._kpiErrorHandler(r);}try{var k=i.results[0];if(!k){throw"no data";}}catch(E){this.setProperty("errorType",g.MessageType.Warning);var o=this.getModel("i18n").getResourceBundle();this.setProperty('errorMessage',o.getText("KPI_NO_DATA"));h.warning("KPI error details: "+o.getText("KPI_NO_DATA")," ",this);return this._kpiErrorHandler(r,false,true,false);}this.setBusy(false);this._checkKpiCriticality();var j=new J();j.setData(k);this.setModel(j);this._setKpiName();this._setKpiValue();this._setKpiIndicator();this._setKpiStatus(this.getIndicator());if(!this.getEnabled()){this.setEnabled(true);}},_setKpiValue:function(){var v=new l({number:{path:"/"+this._oConfig.properties.value,formatter:function(s){this._isPercent=this._oConfig.properties.isPercent;this._unScaledValue=N.getFloatInstance({maxFractionDigits:2,groupingEnabled:true,showScale:false},new L(sap.ui.getCore().getConfiguration().getLanguage())).format(s);return this._oConfig.properties.isPercent?a.formatNumberForPresentation(s,this._getNumberOfFractionalDigits(),true):a.formatNumberForPresentation(s,this._getNumberOfFractionalDigits());}.bind(this)}});if(this._oConfig.properties.unitOfMeasure){(this._oConfig.properties.unitOfMeasure.hasOwnProperty("Path"))?v.bindProperty("unit",{path:"/"+this._oConfig.properties.unitOfMeasure.Path}):v.setProperty("unit",this._oConfig.properties.unitOfMeasure.String||this._oConfig.properties.unitOfMeasure);}this.setValue(v);},_setKpiStatus:function(i){switch(i){case"Good":this.setStatus("Success");this.getValue().setState("Success");break;case"Error":this.setStatus("Error");this.getValue().setState("Error");break;case"Critical":this.setStatus("Warning");this.getValue().setState("Warning");break;default:this.setStatus("None");this.getValue().setState("None");break;}this.setDesign("StatusIconHidden");},_kpiErrorHandler:function(r,i,I,j){this._resetKpiValue();var o=this.getModel("i18n").getResourceBundle();if(r.statusCode==="401"||r.statusCode==="403"||r.authorizationError){this.setProperty('visible',false);h.warning("KPI error details: "+o.getText("KPI_AUTHORIZATION_ISSUE"),"",this);return;}if(this.kpiProvider.kpiConfig.oDefaultPV===false){this.setProperty('visible',false);h.warning("KPI error details: "+o.getText("KPI_DEFAULT_PV_ERROR_MESSAGE"),"",this);return;}if(i){this.setProperty('errorMessage',o.getText("REQUIRED_VH_FIELDS_OVERLAY_MESSAGE"));h.error("KPI error details: "+o.getText("REQUIRED_VH_FIELDS_OVERLAY_MESSAGE"));this.setStatus("Error");}else if(j){this.setProperty("errorType",g.MessageType.Information);this.setProperty('errorMessage',o.getText("KPI_INFO_FOR_MISSING_MANDATE_FILTPAR"));h.info("KPI error details: "+o.getText("KPI_INFO_FOR_MISSING_MANDATE_FILTPAR")," ",this);this.setStatus("Information");}else if(this.kpiProvider.kpiConfig.bIsKpiAnnotaion&&!this.kpiProvider.kpiConfig.hasOwnProperty("navigation")){h.warning("KPI error details: "+o.getText("KPI_DRILLDOWN_NAVIGATION_MESSAGE"),"",this);this.setStatus("Warning");if(!I){return;}}this.setBusy(false);if(!i&&!this.getProperty("errorMessage")){this.setProperty('errorMessage',o.getText("KPI_GENERIC_ERROR_MESSAGE"));this.setStatus("Error");}if(r&&r.statusCode&&r.message){h.error("KPI error details: "+r.statusCode+" "+r.message);}this._setKpiName();this.setProperty('error',true);if(!this.getEnabled()){this.setEnabled(true);}},_resetKpiValue:function(){this.setValue(new l({number:"",unit:""}));this._isPercent=false;this._unScaledValue="";},_setKpiIndicator:function(){if(this._oConfig&&this._oConfig.criticalityProps){var i=this._oConfig.criticalityProps.criticalityIndicator;if(typeof i==="string"){this.setIndicator(i);}else if(typeof i==="object"){this.bindProperty("indicator",i);}}this.setDesign("StatusIconHidden");},_checkCriticalityCalculationForNumber:function(i,I){if(I===m){if((i.DeviationRangeLowValue&&!i.DeviationRangeLowValue.Path)||(i.ToleranceRangeLowValue&&!i.ToleranceRangeLowValue.Path)){return true;}}else if(I===n){if((i.DeviationRangeHighValue&&!i.DeviationRangeHighValue.Path)||(i.ToleranceRangeHighValue&&!i.ToleranceRangeHighValue.Path)){return true;}}else if(I===T){if((i.ToleranceRangeLowValue&&!i.ToleranceRangeLowValue.Path)||(i.ToleranceRangeHighValue&&!i.ToleranceRangeHighValue.Path)){return true;}}},_setKpiName:function(){if(!this.kpiSettings||!this.kpiSettings.props||!this.kpiSettings.props.title){return this.setProperty("shortDescription","");}var i=this.kpiSettings.props.title;if(i===undefined||typeof i!=="string"){i="";}var k=this._oConfig&&this._oConfig.properties.shortDescription?this._oConfig.properties.shortDescription:i;if(k){if(k.indexOf(">")>0){this.bindProperty("shortDescription",{path:k,formatter:function(v){return this._getKpiTagTitle(v);}.bind(this)});}else{this.setProperty("shortDescription",this._getKpiTagTitle(k));}}this.setText(this.getShortDescription());},_getPathForIndicatorParts:function(v){if(Number(v)||!v){return{path:"/dummy"};}return v;},_getKpiTagTitle:function(i){return this.getShortDescription()?this.getShortDescription():this._getNameFromHeuristic(i);},_getCriticalityFromEnum:function(s){return this.kpiProvider.getCriticalityFromEnum(s);},_getNumberOfFractionalDigits:function(){var i=this._oConfig.properties.valueFormat&&this._oConfig.properties.valueFormat.NumberOfFractionalDigits.Int;if(i!=0){i=1;}return i;},_getImproveDirection:function(s,i,j,k,v){return this.kpiProvider.getImproveDirection(s,i,j,k,v);},_onMouseClick:function(E){if(this.kpiSettings){this._displayKpiErrorPopOverOrCard(E);}else{h.error("KPI error details - Incorrect KPI configuration. Unable to open card");}},_displayKpiErrorPopOverOrCard:function(E){if(this.getError()){if(this._oPopoverDialog){this._oPopoverDialog.getContent()[0].setProperty("text",this.getProperty("errorMessage"));this._oPopoverDialog.getContent()[0].mAggregations._text.setProperty("text",this.getProperty("errorMessage"));this._oPopoverDialog.getContent()[0].setProperty("type",this.getProperty("errorType"));this._oPopoverDialog.openBy(this);}else{this._oPopoverDialog=this._getResponsivePopOver(this.getErrorMessage());this._oPopoverDialog.openBy(this);}}else{K.openKpiCard(E);}},_getResponsivePopOver:function(t){if(this._oPopoverDialog){return this._oPopoverDialog;}var s=D.system.phone?true:false;var r=new R({showHeader:s,placement:f.PlacementType.Auto,content:[new M({text:t,showIcon:true,type:this.getProperty("errorType")})]}).addStyleClass("sapSmartTemplatesAnalyticalListPageErrorPopOver");r.setShowCloseButton(s);return r;},_onKeyPress:function(E){if(this.kpiSettings&&E.which===jQuery.sap.KeyCodes.ENTER||E.which===jQuery.sap.KeyCodes.SPACE){this._displayKpiErrorPopOverOrCard(E);}else{h.error("KPI error details - Incorrect KPI configuration. Unable to open card");}},_checkForPercent:function(u){if(u&&u.hasOwnProperty("String")){this._oConfig.properties.unitOfMeasure=(u.String)?u.String:"";}if(u&&u.hasOwnProperty("Path")&&this._relativeToProperties.indexOf(u.Path)===-1){this._relativeToProperties.push(u.Path);}this._oConfig.properties.isPercent=(u&&u.hasOwnProperty("String"))?(u.String==="%"):false;},_getNameFromHeuristic:function(s){var p=s.split(/\s/);return p.length===1?this._getNameFromSingleWordHeuristic(s):this._getNameFromMultiWordHeuristic(p);},_getNameFromSingleWordHeuristic:function(w){return w.substr(0,3).toUpperCase();},_getNameFromMultiWordHeuristic:function(w){var p=[];p.push(w[0].charAt(0));p.push(w[1].charAt(0));if(w.length>=3){p.push(w[2].charAt(0));}return p.join("").toUpperCase();},getFilterableKPISelectionVariant:function(){return this._filterableKPISelectionVariant;},_findControl:function(i){var r,v;if(i){r=sap.ui.getCore().byId(i);if(!r){v=this._getView();if(v){r=v.byId(i);}}}return r;},_getView:function(){if(!this._oView){var o=this.getParent();while(o){if(o instanceof sap.ui.core.mvc.View){this._oView=o;break;}o=o.getParent();}}return this._oView;},exit:function(){this._relativeToProperties=[];},onAfterRendering:function(){var r=this.getModel("i18n").getResourceBundle();var t=this.getValue();if(t===null){return;}var i=(this._isPercent)?this.getValue().getNumber()+" "+this.getValue().getUnit():this._unScaledValue+" "+this.getValue().getUnit(),j;var k;if(this.kpiSettings&&this.kpiSettings.props){k=this.kpiSettings.props.title;}if(k&&k.indexOf(">")>0){this.bindProperty("tooltip",{path:k,formatter:function(v){this._oConfig.properties.title=v;this.kpiSettings.props.title=v;return r.getText(j,[v,i]);}.bind(this)});}else{}if(this.getError()){j=this.getErrorType()=="Error"?"KPI_DETERMINING_ERROR":"KPI_DETERMINING_WARNING";}this._ariaLabel=r.getText(j,[(this.kpiSettings&&this.kpiSettings.props?this.kpiSettings.props.title:""),i]);setTimeout(function(){this.detachBrowserEvent("click",this._onMouseClick).attachBrowserEvent("click",this._onMouseClick);this.detachBrowserEvent("keypress",this._onKeyPress).attachBrowserEvent("keypress",this._onKeyPress);}.bind(this),1);},getSmartKpiConfig:function(){return this._oConfig;},getOverflowToolbarConfig:function(){return{canOverflow:true};},setShortDescription:function(v){this.setProperty("shortDescription",this._getNameFromHeuristic(v));},setEnabled:function(v){this.setProperty("enabled",v,true);if(v){this.removeStyleClass("sapSmartTemplatesAnalyticalListPageKpiTagDisable");}else{this.addStyleClass("sapSmartTemplatesAnalyticalListPageKpiTagDisable");}}});},true);
