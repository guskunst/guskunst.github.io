sap.ui.define(["sap/ui/core/mvc/Controller","sap/ovp/cards/ActionUtils","sap/ui/generic/app/navigation/service/SelectionVariant","sap/ui/generic/app/navigation/service/PresentationVariant","sap/ovp/cards/CommonUtils","sap/ovp/cards/OVPCardAsAPIUtils","sap/ui/core/ResizeHandler","sap/ui/core/format/NumberFormat","sap/ovp/cards/AnnotationHelper","sap/ui/model/odata/AnnotationHelper","sap/m/MessageBox","sap/ui/generic/app/navigation/service/NavError","sap/ui/core/CustomData","sap/ui/model/FilterOperator","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/MessageToast","sap/ui/core/TextDirection","sap/ovp/cards/loading/State","sap/ui/generic/app/library","jquery.sap.global","sap/ovp/app/resources","sap/ovp/app/OVPUtils"],function(C,A,S,P,a,O,R,N,b,c,M,d,e,F,J,D,B,f,T,L,G,q,g,h){"use strict";return C.extend("sap.ovp.cards.generic.Card",{initKeyboardNavigation:function(){var K=function(i){this.init(i);};K.prototype.layoutItemFocusHandler=function(){var j=q(document.activeElement);if(j){var l=j.find("[aria-label]");var i,s="";if(j.find('.valueStateText').length==1){var t=j.find('.valueStateText').find('.sapMObjectNumberText').text();var v=j.find('.valueStateText').find('.sapUiInvisibleText').text();j.find('.valueStateText').attr('aria-label',t+" "+v);j.find('.valueStateText').attr('aria-labelledby',"");}if(q(l).hasClass('kpiHeaderClass')){var k=q(l).closest('div.kpiHeaderClass');var m=k.text();var n=k.attr("id");var V=sap.ui.getCore().byId(n).getValueColor();k.attr('aria-label',m+" "+V);}j.find("[role='listitem']").attr('aria-label',"");if(j.hasClass('sapOvpCardHeader')&&!j.hasClass('sapOvpStackCardContent')){var o="";var p=j.find('.cardHeaderType');if(p.length===0){var r=g.getText("CardHeaderType");o="cardHeaderType_"+new Date().getTime();var u='<div id="'+o+'" class="cardHeaderType" aria-label="'+r+'" hidden></div>';j.append(u);}else{o=p[0].id;}s+=o+" ";}for(i=0;i<l.length;i++){if(l[i].getAttribute("role")==="heading"){s+=l[i].id+" ";}}if(j.hasClass('sapOvpCardHeader')){var w=j.find('.cardHeaderText');if(w.length!==0){for(var i=0;i<w.length;i++){if(s.indexOf(w[i].id)===-1){s+=w[i].id+" ";}}}}if(s.length){j.attr("aria-labelledby",s);}if(j.prop('nodeName')==="LI"&&j.find('.linkListHasPopover').length!==0){if(j.find('#hasDetails').length===0){j.append("<div id='hasDetails' hidden>"+g.getText("HAS_DETAILS")+"</div>");j.attr('aria-describedby',"hasDetails");}}var x=j.attr("id");if((x&&x.indexOf("ovpTable")!=-1)&&j.find("[role='Link']")&&!j.hasClass('sapUiCompSmartLink')){var y=j.closest("td").attr("data-sap-ui-column"),z=j.closest("tbody").siblings().children().filter("tr").children();for(var i=0;i<z.length;i++){if(z[i].getAttribute("data-sap-ui")==y&&z[i].hasChildNodes("span")){var E=z[i].firstElementChild.getAttribute("id");j.attr("aria-labelledby",E);}}}}};K.prototype.init=function(i){this.cardLayout=i;this.keyCodes=q.sap.KeyCodes;this.jqElement=q(i.getView().$());this.jqElement=this.jqElement.parent().parent().parent();this.jqElement.on("focus.keyboardNavigation",this.layoutItemFocusHandler.bind(this));};this.keyboardNavigation=new K(this);},onInit:function(){this.oCardComponent=this.getOwnerComponent();this.oCardComponentData=this.oCardComponent&&this.oCardComponent.getComponentData();this.oMainComponent=this.oCardComponentData&&this.oCardComponentData.mainComponent;this.sCardId=this.oCardComponentData.cardId;var s=this.getView().mPreprocessors.xml[0].ovpCardProperties.oData.state;if(s!=="Loading"&&s!=="Error"){var H=this.getView().byId("ovpCardHeader");if(!!H){H.attachBrowserEvent("click",this.onHeaderClick.bind(this));H.addEventDelegate({onkeydown:function(E){if(!E.shiftKey&&(E.keyCode==13||E.keyCode==32)){E.preventDefault();this.onHeaderClick(E);}}.bind(this)});}}var n=this.getView().byId("kpiNumberValue");if(n){n.addEventDelegate({onAfterRendering:function(){var $=n.$();var i=$.find(".sapMNCValueScr");var j=$.find(".sapMNCScale");i.attr("aria-label",i.text());j.attr("aria-label",j.text());var k=this.getView().byId("ovpCardHeader").getDomRef();var o=this.getOwnerComponent().getComponentData();if(!!o&&!!o.appComponent){var l=o.appComponent;if(!!l.getModel("ui")){var u=l.getModel("ui");if(!!u.getProperty("/containerLayout")&&u.getProperty("/containerLayout")==="resizable"){var m=o.appComponent.getDashboardLayoutUtil();if(!!m){m.setKpiNumericContentWidth(k);}}}}}.bind(this)});}},exit:function(){if(this.resizeHandlerId){R.deregister(this.resizeHandlerId);}},onAfterRendering:function(){var o=this.getCardPropertiesModel();this.enableClick=true;var s=o.getProperty("/contentFragment");var i=this.getOwnerComponent().getComponentData();this._handleCountHeader();this._handleKPIHeader();var j=o.getProperty("/selectedKey");if(j&&o.getProperty("/state")!=='Loading'){var k=this.getView().byId("ovp_card_dropdown");if(k){k.setSelectedKey(j);}}try{var i=this.getOwnerComponent().getComponentData();if(i&&i.appComponent){var l=i.appComponent;if(l.getModel('ui')){var u=l.getModel('ui');if(u.getProperty('/containerLayout')==='resizable'){var m=l.getDashboardLayoutUtil();if(m){this.oDashboardLayoutUtil=m;this.cardId=i.cardId;if(m.isCardAutoSpan(i.cardId)){this.resizeHandlerId=R.register(this.getView(),function(U){q.sap.log.info('DashboardLayout autoSize:'+U.target.id+' -> '+U.size.height);m.setAutoCardSpanHeight(U);});}}}}}}catch(n){q.sap.log.error("DashboardLayout autoSpan check failed.");}if(this.oDashboardLayoutUtil&&this.oDashboardLayoutUtil.isCardAutoSpan(this.cardId)){var $=q("#"+this.oDashboardLayoutUtil.getCardDomId(this.cardId));if(this.oView.$().outerHeight()>$.innerHeight()){this.oDashboardLayoutUtil.setAutoCardSpanHeight(null,this.cardId,this.oView.$().height());}}var I=0;if(i&&i.mainComponent){var p=i.mainComponent;if(p.bGlobalFilterLoaded){I=this.checkNavigation();}}else if(O.checkIfAPIIsUsed(this)){I=this.checkAPINavigation();}var r=this.getCardPropertiesModel();var t=r.getProperty("/state");if(t!=="Loading"&&t!=="Error"){var v=r.getProperty("/template");if(v==="sap.ovp.cards.stack"){if(!I){var w=this.getView().byId('ViewAll');if(w){w=w.getDomRef();q(w).remove();}}}}if(I){if(s?s!=="sap.ovp.cards.quickview.Quickview":true){if(s==="sap.ovp.cards.stack.Stack"){var x=this.getView().getDomRef();var y=q(x).find('.sapOvpCardContentRightHeader');if(y.length!==0){y.addClass('sapOvpCardNavigable');}}else{this.getView().addStyleClass("sapOvpCardNavigable");}}if(s&&s==="sap.ovp.cards.quickview.Quickview"){var H=this.byId("ovpCardHeader");if(H){H.addStyleClass("sapOvpCardNavigable");}}}else{if(s){this.getView().addStyleClass("ovpNonNavigableItem");var H=this.byId("ovpCardHeader");if(H){H.$().removeAttr('role');H.addStyleClass('ovpNonNavigableItem');}var z=this.checkLineItemNavigation();if(!z){switch(s){case"sap.ovp.cards.list.List":var E=this.getView().byId("listItem");if(E){E.setType("Inactive");}break;case"sap.ovp.cards.table.Table":var E=this.getView().byId("tableItem");if(E){E.setType("Inactive");}break;case"sap.ovp.cards.linklist.LinkList":if(!this.checkNavigationForLinkedList()){var E=this.getView().byId("ovpCLI");if(E){E.setType("Inactive");}}break;}}}}var K=this.getView().byId("ovp_card_dropdown");var Q=this.getView().byId("ovp_card_dropdown_label");if(K){K.addAriaLabelledBy(Q.getId());}if(O.checkIfAPIIsUsed(this)){this.initKeyboardNavigation();}},checkNavigation:function(){var o=this.getCardPropertiesModel();if(this.checkHeaderNavForChart()){return 0;}var E=this.getEntityType();if(E){if(o){var i=o.getProperty("/identificationAnnotationPath");var s=i;var j=o.getProperty("/contentFragment");if(j&&(j==="sap.ovp.cards.stack.Stack"||j==="sap.ovp.cards.quickview.Quickview")){var k=(i)?i.split(","):[];if(k&&k.length>1){if(j==="sap.ovp.cards.stack.Stack"){s=k[0];}else{s=k[1];}}}var r=E[s];if(this.isNavigationInAnnotation(r)){return 1;}if(o&&o.getProperty("/template")==="sap.ovp.cards.charts.analytical"){var K=o.getProperty("/kpiAnnotationPath");if(E&&K){var l=E[K];if(l&&l.Detail){var m=l.Detail.SemanticObject&&l.Detail.SemanticObject.String;var n=l.Detail.Action&&l.Detail.Action.String;if(m&&n){return 1;}}}}}}else if(o&&o.getProperty("/template")==="sap.ovp.cards.linklist"&&o.getProperty("/staticContent")&&o.getProperty("/targetUri")){return 1;}return 0;},checkNavigationForLinkedList:function(){if(this.getEntityType()){var E=this.getEntityType();var l=E['com.sap.vocabularies.UI.v1.LineItem'];if(l&&(l[0].RecordType==="com.sap.vocabularies.UI.v1.DataFieldForAction"||l[0].RecordType==="com.sap.vocabularies.UI.v1.DataFieldWithUrl")){return true;}}return false;},checkLineItemNavigation:function(){if(this.getEntityType()){var E=this.getEntityType();var o=this.getCardPropertiesModel();if(o){var s=o.getProperty("/annotationPath");var r=E[s];return this.isNavigationInAnnotation(r);}}},isNavigationInAnnotation:function(r){if(r&&r.length){for(var i=0;i<r.length;i++){var I=r[i];if(I.RecordType==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"||I.RecordType==="com.sap.vocabularies.UI.v1.DataFieldForAction"||I.RecordType==="com.sap.vocabularies.UI.v1.DataFieldWithUrl"){return 1;}}}return 0;},checkAPINavigation:function(){var o=this.getOwnerComponent().getComponentData(),i=o.fnCheckNavigation&&typeof o.fnCheckNavigation==="function",j=i?o.fnCheckNavigation:null;if(j){if(j()){return true;}}else{if(this.checkNavigation()){return true;}}return false;},onHeaderClick:function(E){var n=E.ctrlKey||E.metaKey||h.bCRTLPressed?h.constants.explace:h.constants.inplace;if(O.checkIfAPIIsUsed(this)){if(this.checkAPINavigation()){a.onHeaderClicked();}}else{var o=this.getCardPropertiesModel();var t=o.getProperty("/template");var s=o.getProperty("/targetUri");if(t=="sap.ovp.cards.linklist"&&o.getProperty("/staticContent")!==undefined&&s){window.location.href=s;}else if(o.getProperty("/staticContent")!==undefined&&s===""){return;}else if(this.checkHeaderNavForChart()){return;}else{this.doNavigation(this.getView().getBindingContext(),null,n);}}},checkHeaderNavForChart:function(){var o=this.getCardPropertiesModel();var t=o.getProperty("/template");var n=o.getProperty("/navigation");if(n=="noHeaderNav"&&(t=="sap.ovp.cards.charts.analytical"||"sap.ovp.cards.charts.smart.chart")){return true;}else{return false;}},resizeCard:function(i){q.sap.log.info(i);if(this.resizeHandlerId){R.deregister(this.resizeHandlerId);this.resizeHandlerId=null;}},_handleCountHeader:function(){var i=this.getView().byId("ovpCountHeader");if(i){var I=this.getCardItemsBinding();if(I){this.setHeaderCounter(I,i);I.attachDataReceived(function(){this.setHeaderCounter(I,i);}.bind(this));I.attachChange(function(){this.setHeaderCounter(I,i);}.bind(this));}}},setHeaderCounter:function(i,j){var t=i.getLength();var k=i.getCurrentContexts().length;var o,l="";var n=N.getIntegerInstance({minFractionDigits:0,maxFractionDigits:1,decimalSeparator:".",style:"short"});k=parseFloat(k,10);var m=this.getOwnerComponent().getComponentData();if(m&&m.appComponent){var p=m.appComponent;if(p.getModel('ui')){var u=p.getModel('ui');if(u.getProperty('/containerLayout')!=='resizable'){if(t!==0){t=n.format(Number(t));}if(k!==0){k=n.format(Number(k));}}else{o=p.getDashboardLayoutUtil().dashboardLayoutModel.getCardById(m.cardId);}}}if(k===0){l="";}else if(o&&o.dashboardLayout.showOnlyHeader){l=g.getText("Count_Header_Total",[t]);}else if(t!=k){l=g.getText("Count_Header",[k,t]);}j.setText(l);var r=j.$();r.attr("aria-label",l);},_handleKPIHeader:function(){var k,s;if(this.getView()&&this.getView().getDomRef()){k=this.getView().getDomRef().getElementsByClassName("numericContentHbox");s=this.getView().getDomRef().getElementsByClassName("noDataSubtitle");}else{return;}if(k||s){var K=this.getKPIBinding();if(K){K.attachDataReceived(function(E){var U=E.getParameter("data")&&E.getParameter("data").results&&E.getParameter("data").results[0];var t=K.getLength();if(k[0]){k[0].style.visibility=null;if(t===0){k[0].style.visibility='hidden';}else{this._setSubTitleWithUnitOfMeasure(U);k[0].style.visibility='visible';}}if(s.length!==0){s[0].style.display="none";if(t===0){s[0].style.display="flex";}}}.bind(this));}}},getKPIBinding:function(){var n=this.byId("kpiHBoxNumeric"),k=n&&n.getBindingInfo("items")&&n.getBindingInfo("items").binding;return k;},_setSubTitleWithUnitOfMeasure:function(U){var o=this.getCardPropertiesModel();if(!!o){var i=o.getData();var s=this.getView().byId("SubTitle-Text");if(!!s){s.setText(i.subTitle);if(!!i&&!!i.entityType&&!!i.dataPointAnnotationPath){var E=o.getData().entityType;var j=i.dataPointAnnotationPath.split("/");var k=j.length===1?E[i.dataPointAnnotationPath]:E[j[0]][j[1]];var m;if(k&&k.Value&&k.Value.Path){m=k.Value.Path;}else if(k&&k.Description&&k.Description.Value&&k.Description.Value.Path){m=k.Description.Value.Path;}if(!!m){var p=a.getUnitColumn(m,E);var u;if(!!p&&!!U){u=U[p];}else{u=a.getUnitColumn(m,E,true);}var l=g.getText("SubTitle_IN");if(!!i.subTitle&&!!l&&!!u){s.setText(i.subTitle+" "+l+" "+u);var n=s.getAggregation("customData");if(n){var r;for(r in n){var t=n[r];if(t.getKey()==="aria-label"){t.setValue(i.subTitle+" "+l+" "+u);break;}}}}}}}}},getCardItemsBinding:function(){},onActionPress:function(E){var s=E.getSource(),o=this._getActionObject(s),i=s.getBindingContext();if(o.type.indexOf("DataFieldForAction")!==-1){this.doAction(i,o);}else{this.doNavigation(i,o);}},_getActionObject:function(s){var j=s.getCustomData();var o={};for(var i=0;i<j.length;i++){o[j[i].getKey()]=j[i].getValue();}return o;},doNavigation:function(o,n,s){if(!s){s=h.constants.inplace;}if(!this.enableClick){return;}this.enableClick=false;setTimeout(function(){this.enableClick=true;}.bind(this),1000);if(!this.oMainComponent){return;}if(!n){n=this.getEntityNavigationEntries(o)[0];}var i=q.extend(true,{},o);var j=q.extend(true,{},n);var k=this.oMainComponent.doCustomNavigation&&this.oMainComponent.doCustomNavigation(this.sCardId,i,j);var E=this.oMainComponent.templateBaseExtension&&this.oMainComponent.templateBaseExtension.provideExtensionNavigation&&this.oMainComponent.templateBaseExtension.provideExtensionNavigation(this.sCardId,i,j);var l;if(k){l=k;}if(E){l=E;}if(l){var t=l.type;if(t&&typeof t==="string"&&t.length>0){t=t.split(".").pop().split("/").pop().toLowerCase();switch(t){case"datafieldwithurl":l.type="com.sap.vocabularies.UI.v1.DataFieldWithUrl";break;case"datafieldforintentbasednavigation":l.type="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";break;}n=l;}}function p(s){if(!s){s=h.constants.inplace;}if(n){switch(n.type){case"com.sap.vocabularies.UI.v1.DataFieldWithUrl":this.doNavigationWithUrl(o,n,s);break;case"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":this.doIntentBasedNavigation(o,n,false,s);break;case"com.sap.vocabularies.UI.v1.KPIDetailType":this.doIntentBasedNavigation(o,n,false,s);break;}}}if(!this.oMainComponent.oAppStatePromise){p.call(this,s);}else{this.oMainComponent.oAppStatePromise.then(p.bind(this,s));}},doNavigationWithUrl:function(o,n,s){if(!s){s=h.constants.inplace;}if(!sap.ushell.Container){return;}var p=sap.ushell.Container.getService("URLParsing");if(!(p.isIntentUrl(n.url))){window.open(n.url);}else{var i=p.parseShellHash(n.url);var w=i.appSpecificRoute?true:false;this.doIntentBasedNavigation(o,i,w,s);}},fnHandleError:function(E){if(E instanceof d){if(E.getErrorCode()==="NavigationHandler.isIntentSupported.notSupported"){M.show(g.getText("OVP_NAV_ERROR_NOT_AUTHORIZED_DESC"),{title:g.getText("OVP_GENERIC_ERROR_TITLE")});}else{M.show(E.getErrorCode(),{title:g.getText("OVP_GENERIC_ERROR_TITLE")});}}},doCrossApplicationNavigation:function(I,n){var s="#"+I.semanticObject+'-'+I.action;if(I.params){var o=this.oCardComponent&&this.oCardComponent.getComponentData();var k=o&&o.appComponent;if(k){var p=k._formParamString(I.params);s=s+p;}}var t=this;if(!sap.ushell.Container){return;}sap.ushell.Container.getService("CrossApplicationNavigation").isIntentSupported([s]).done(function(r){if(r[s].supported===true){if(!!n.params){if(typeof n.params=='string'){try{n.params=JSON.parse(n.params);}catch(l){q.sap.log.error("Could not parse the Navigation parameters");return;}}}var o=t.getOwnerComponent().getComponentData();var m=o?o.globalFilter:undefined;var u=m&&m.getUiState({allFilters:false});var v=u?JSON.stringify(u.getSelectionVariant()):"{}";m=q.parseJSON(v);var w=t._getFilterPreference();m=t._removeFilterFromGlobalFilters(w,m);if(!n.params){n.params={};}if(!!m&&!!m.SelectOptions){for(var i=0;i<m.SelectOptions.length;i++){var x=m.SelectOptions[i].Ranges;if(!!x){var y=[];for(var j=0;j<x.length;j++){if(x[j].Sign==="I"&&x[j].Option==="EQ"){y.push(x[j].Low);}}n.params[m.SelectOptions[i].PropertyName]=y;}}}sap.ushell.Container.getService("CrossApplicationNavigation").toExternal(n);}else{var E=new d("NavigationHandler.isIntentSupported.notSupported");t.fnHandleError(E);}}).fail(function(){q.sap.log.error("Could not get authorization from isIntentSupported");});},doIntentBasedNavigation:function(o,i,u,n){if(!n){n=h.constants.inplace;}if(!sap.ushell.Container){return;}var p,j,k,E=o?o.getObject():null;var l=this.getCardPropertiesModel(),s=l.getProperty("/customParams");if(o&&typeof o.getAllData==="function"&&s){k=o.getAllData();}else if(l.getProperty("/staticContent")){k={iStaticLinkListIndex:i.iStaticLinkListIndex,bStaticLinkListIndex:true};}if(E&&E.__metadata){delete E.__metadata;}var m=a.getNavigationHandler();if(m){if(i){p=this._getEntityNavigationParameters(E,k,o);j={target:{semanticObject:i.semanticObject,action:i.action},appSpecificRoute:i.appSpecificRoute,params:p.sNavSelectionVariant};var r={};if(p.sNavPresentationVariant){r.presentationVariant=p.sNavPresentationVariant;}if(u){if(i&&i.semanticObject&&i.action){var t=this.getCardPropertiesModel().getProperty("/staticParameters");j.params=(!!t)?t:{};this.doCrossApplicationNavigation(i,j);}}else{m.navigate(j.target.semanticObject,j.target.action,j.params,null,this.fnHandleError,r,n);}}}},doAction:function(o,i){this.actionData=A.getActionInfo(o,i,this.getEntityType());if(this.actionData.allParameters.length>0){this._loadParametersForm();}else{this._callFunction();}},getEntityNavigationEntries:function(o,s){var n=[];var E=this.getEntityType();var j=this.getCardPropertiesModel();var k=j.getProperty("/template");if(!E){return n;}if(!s&&!o){if(!this.oCardComponentData.settings.identificationAnnotationPath){var l=j.getProperty("/kpiAnnotationPath");if(l&&k==="sap.ovp.cards.charts.analytical"){s=l;var r=E[s];var m=r&&r.Detail;var p=m.SemanticObject&&m.SemanticObject.String;var t=m.Action&&m.Action.String;if(m.RecordType==="com.sap.vocabularies.UI.v1.KPIDetailType"){if(p&&t){n.push({type:m.RecordType,semanticObject:p,action:t,label:""});}else{q.sap.log.error("Invalid Semantic object and action configured for annotation "+m.RecordType);}}}}}if(!s){var I=j.getProperty("/identificationAnnotationPath");var u=(I)?I.split(","):[];if(u&&u.length>1){s=u[0];}else{s=I;}}var v=E[s];if(q.isArray(v)){v=b.sortCollectionByImportance(v);for(var i=0;i<v.length;i++){if(v[i].RecordType==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"){n.push({type:v[i].RecordType,semanticObject:v[i].SemanticObject.String,action:v[i].Action.String,label:v[i].Label?v[i].Label.String:null});}if(v[i].RecordType==="com.sap.vocabularies.UI.v1.DataFieldWithUrl"&&!v[i].Url.UrlRef){var w=this.getView().getModel();var x=w.oMetaModel;var y=x.createBindingContext(E.$path);var z=c.format(y,v[i].Url);var H=new e({key:"url",value:z});if(o&&k==="sap.ovp.cards.charts.analytical"){w=o.getModel();}H.setModel(w);H.setBindingContext(o);var U=H.getValue();n.push({type:v[i].RecordType,url:U,value:v[i].Value.String,label:v[i].Label?v[i].Label.String:null});}}}return n;},getModel:function(){return this.getView().getModel();},getMetaModel:function(){if(this.getModel()){return this.getModel().getMetaModel();}},getCardPropertiesModel:function(){if(!this.oCardPropertiesModel||q.isEmptyObject(this.oCardPropertiesModel)){this.oCardPropertiesModel=this.getView().getModel("ovpCardProperties");}return this.oCardPropertiesModel;},getEntitySet:function(){if(!this.entitySet){var E=this.getCardPropertiesModel().getProperty("/entitySet");this.entitySet=this.getMetaModel().getODataEntitySet(E);}return this.entitySet;},getEntityType:function(){if(!this.entityType){if(this.getMetaModel()&&this.getEntitySet()){this.entityType=this.getMetaModel().getODataEntityType(this.getEntitySet().entityType);}}return this.entityType;},getCardContentContainer:function(){if(!this.cardContentContainer){this.cardContentContainer=this.getView().byId("ovpCardContentContainer");}return this.cardContentContainer;},_processCustomParameters:function(o,s,j){var k=this.getCardPropertiesModel();if(!this.oMainComponent||!k){return;}var l;if(o&&o.bStaticLinkListIndex){var m=k.getProperty("/staticContent");l=m[o.iStaticLinkListIndex]["customParams"];o=null;}else{l=k.getProperty("/customParams");}if(!l||!this.oMainComponent.templateBaseExtension.provideCustomParameter||!this.oMainComponent.onCustomParams){return;}var n=this.oMainComponent.templateBaseExtension.provideCustomParameter(l)?this.oMainComponent.templateBaseExtension.provideCustomParameter(l):this.oMainComponent.onCustomParams(l);if(!n||!q.isFunction(n)){return;}var p=q.extend(true,{},o);var r=q.extend(true,{},s);var t=n(p,r);if(!t||(!q.isArray(t)&&!q.isPlainObject(t))){return;}var I=q.isPlainObject(t);if(I&&q.isEmptyObject(t)){return;}var u=I&&(t.bIgnoreEmptyString||t.ignoreEmptyString);var v=I?(t.aSelectionVariant||t.selectionVariant):t;if(!q.isArray(v)){return;}var i,w,x,y,V,z;w=v.length;for(i=0;i<w;i++){x=v[i];if(!x){continue;}y=x.path;V=x.value1;z=x.value2;if(!y||typeof y!=="string"||y===""){q.sap.log.error("Custom Variant property path '"+y+"' should be valid string");continue;}if(!(V||V===0||(V===""&&u))){continue;}V=V.toString();z=z&&z.toString();if(V===""&&u){s.removeSelectOption(y);}if(o){delete o[y];}if(j){delete j[y];}s.addSelectOption(y,x.sign,x.operator,V,z);}if(u){this._removeEmptyStringsFromSelectionVariant(s);}return u;},_getEntityNavigationParameters:function(E,o,j){var k={};var s,p,l;var m=this.getOwnerComponent().getComponentData();var n=m?m.globalFilter:undefined;var r=this.getCardPropertiesModel();var t=r&&r.getProperty("/staticContent");if(!t){var u=b.getCardSelections(this.getCardPropertiesModel());var v=u.filters;var w=u.parameters;var x=this.getEntityType();v&&v.forEach(function(c1){c1.path=c1.path.replace("/",".");switch(c1.operator){case F.NE:c1.operator=F.EQ;c1.sign="E";break;case F.Contains:c1.operator="CP";var d1=c1.value1;c1.value1="*"+d1+"*";break;case F.EndsWith:c1.operator="CP";var d1=c1.value1;c1.value1="*"+d1;break;case F.StartsWith:c1.operator="CP";var d1=c1.value1;c1.value1=d1+"*";}});u.filters=v;if(j&&E&&E.hasOwnProperty("$isOthers")){var y=j.getOtherNavigationDimensions();for(var z in y){var H=y[z];for(var i=0;i<H.length;i++){u.filters.push({path:z,operator:"EQ",value1:H[i],sign:"E"});}}}w&&w.forEach(function(c1){c1.path=c1.path.replace("/",".");});u.parameters=w;var I=b.getCardSorters(this.getCardPropertiesModel());if(E){var z;for(var i=0;x.property&&i<x.property.length;i++){z=x.property[i].name;var K=E[z];if(E.hasOwnProperty(z)){if(q.isArray(E[z])&&E[z].length===1){k[z]=E[z][0];}else if(q.type(K)!=="object"){k[z]=K;}}}}var Q=r&&r.getProperty("/kpiAnnotationPath");var U=r&&r.getProperty("/template");if(Q&&U==="sap.ovp.cards.charts.analytical"){var V=x[Q];var W=V&&V.Detail;if(W&&W.RecordType==="com.sap.vocabularies.UI.v1.KPIDetailType"){k["kpiID"]=V.ID.String;}}p=I&&new P(I);s=this._buildSelectionVariant(n,u);l=r&&r.getProperty("/staticParameters");}else{var X=n&&n.getUiState({allFilters:false});var Y=X?JSON.stringify(X.getSelectionVariant()):"{}";s=new S(Y);var Z=this._getFilterPreference();s=this._removeFilterFromGlobalFilters(Z,s);if(t[o.iStaticLinkListIndex].params){l=t[o.iStaticLinkListIndex].params;}else if(t[o.iStaticLinkListIndex].staticParameters){l=t[o.iStaticLinkListIndex].staticParameters;}}var $;if(o&&!o.bStaticLinkListIndex){$=this._processCustomParameters(o,s,k);}else if(o&&o.bStaticLinkListIndex){$=this._processCustomParameters(o,s);}else{$=this._processCustomParameters(k,s);}var _=$?G.navigation.service.SuppressionBehavior.ignoreEmptyString:undefined;if(l){for(var z in l){if(!k.hasOwnProperty(z)){k[z]=l[z];}}}var a1=a.getNavigationHandler();var b1=a1&&a1.mixAttributesAndSelectionVariant(k,s.toJSONString(),_);if(!t){this._removeSensitiveAttributesFromNavSelectionVariant(x,b1);}return{sNavSelectionVariant:b1?b1.toJSONString():null,sNavPresentationVariant:p?p.toJSONString():null};},_removeSensitiveAttributesFromNavSelectionVariant:function(E,n){for(var i=0;i<E.property.length;i++){if(E.property[i]["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"]&&E.property[i]["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"].Bool){delete n._mSelectOptions[E.property[i].name];}}},_removeEmptyStringsFromSelectionVariant:function(s){var p=s.getParameterNames();for(var i=0;i<p.length;i++){if(s.getParameter(p[i])===""){s.removeParameter(p[i]);}}var k=s.getSelectOptionsPropertyNames();for(i=0;i<k.length;i++){var l=s.getSelectOption(k[i]);for(var j=0;j<l.length;j++){if(l[j].Low===""&&!l[j].High){l.splice(j,1);j--;}}if(l.length===0){s.removeSelectOption(k[i]);}}return s;},_checkIfCardFiltersAreValid:function(m,p){var i=true;if(m&&m.filterAll==="global"){i=false;}else if(m&&m.globalFilter){if(m.globalFilter.indexOf(p)>=0){i=false;}}return i;},_getFilterPreference:function(){var o=this.getOwnerComponent()?this.getOwnerComponent().getComponentData():null;var m;if(o&&o.mainComponent){m=o.mainComponent._getFilterPreference(o.cardId);}return m;},_removeFilterFromGlobalFilters:function(m,s){var i=[];if(m&&m.filterAll==="card"){i=s.getSelectOptionsPropertyNames();}else if(m&&m.cardFilter){i=m.cardFilter;}i.forEach(function(p){if(p!=="$.basicSearch"){s.removeSelectOption(p);}});return s;},_buildSelectionVariant:function(o,k){var u=o&&o.getUiState({allFilters:false});var s=u?JSON.stringify(u.getSelectionVariant()):"{}";var l=new S(s);var m,v,V,p;var n=this._getFilterPreference();l=this._removeFilterFromGlobalFilters(n,l);var r=k.filters;var t=k.parameters;for(var i=0;i<r.length;i++){m=r[i];if(m.path&&m.operator&&typeof m.value1!=="undefined"){v=m.value1.toString();V=(typeof m.value2!=="undefined")?m.value2.toString():undefined;if(this._checkIfCardFiltersAreValid(n,m.path)){l.addSelectOption(m.path,m.sign,m.operator,v,V);}}}var w,x,y;for(var j=0;j<t.length;j++){p=t[j];if(!p.path||!p.value){continue;}w=p.path.split("/").pop();w=w.split(".").pop();if(w.indexOf("P_")===0){x=w;y=w.substr(2);}else{x="P_"+w;y=w;}if(l.getParameter(x)){continue;}if(l.getParameter(y)){continue;}l.addParameter(w,p.value);}return l;},_loadParametersForm:function(){var p=new J();p.setData(this.actionData.parameterData);var t=this;var o=new D('ovpCardActionDialog',{title:this.actionData.sFunctionLabel,afterClose:function(){o.destroy();}}).addStyleClass("sapUiNoContentPadding");var i=new B({text:this.actionData.sFunctionLabel,press:function(E){var m=A.getParameters(E.getSource().getModel(),t.actionData.oFunctionImport);o.close();t._callFunction(m,t.actionData.sFunctionLabel);}});var j=new B({text:"Cancel",press:function(){o.close();}});o.setBeginButton(i);o.setEndButton(j);var k=function(E){var m=A.mandatoryParamsMissing(E.getSource().getModel(),t.actionData.oFunctionImport);i.setEnabled(!m);};var l=A.buildParametersForm(this.actionData,k);o.addContent(l);o.setModel(p);o.open();},_callFunction:function(u,i){var p={batchGroupId:"Changes",changeSetId:"Changes",urlParameters:u,forceSubmit:true,context:this.actionData.oContext,functionImport:this.actionData.oFunctionImport};var t=this;var o=new Promise(function(r,j){var m=t.actionData.oContext.getModel();var s;s="/"+p.functionImport.name;m.callFunction(s,{method:p.functionImport.httpMethod,urlParameters:p.urlParameters,batchGroupId:p.batchGroupId,changeSetId:p.changeSetId,headers:p.headers,success:function(k,l){r(l);},error:function(k){k.actionText=i;j(k);}});});o.then(function(r){return f.show(g.getText("Toast_Action_Success"),{duration:1000});},function(E){var j=a.showODataErrorMessages(E);if(j===""&&E.actionText){j=g.getText("Toast_Action_Error")+' "'+E.actionText+'"'+".";}return M.error(j,{title:g.getText("OVP_GENERIC_ERROR_TITLE"),onClose:null,styleClass:"",initialFocus:null,textDirection:T.Inherit});});},setErrorState:function(){var o=this.getOwnerComponent();if(!o||!o.oContainer){return;}var i=o.oContainer;var j=this.getCardPropertiesModel();var k={name:"sap.ovp.cards.loading",componentData:{model:this.getView().getModel(),settings:{category:j.getProperty("/category"),title:j.getProperty("/title"),description:j.getProperty("/description"),entitySet:j.getProperty("/entitySet"),state:L.ERROR,template:j.getProperty("/template")}}};var l=sap.ui.component(k);i.setComponent(l);setTimeout(function(){o.destroy();},0);},changeSelection:function(s,i,o){if(!i){var j=this.getView().byId("ovp_card_dropdown");s=parseInt(j.getSelectedKey(),10);}var t={};if(!i){t=this.getCardPropertiesModel().getProperty("/tabs")[s-1];}else{t=o.tabs[s-1];}var u={cardId:this.getOwnerComponent().getComponentData().cardId,selectedKey:s};for(var p in t){u[p]=t[p];}if(O.checkIfAPIIsUsed(this)){O.recreateCard(u,this.getOwnerComponent().getComponentData());}else{this.getOwnerComponent().getComponentData().mainComponent.recreateCard(u);this.getOwnerComponent().getComponentData().mainComponent.setOrderedCardsSelectedKey(this.getOwnerComponent().getComponentData().cardId,s);}},getItemHeight:function(o,s,i){if(!!o){var j=o.getView().byId(s);var H=0;if(!!j){if(i){if(j.getItems()[0]&&j.getItems()[0].getDomRef()){H=q(j.getItems()[0].getDomRef()).outerHeight(true);}}else{if(j.getDomRef()){H=q(j.getDomRef()).outerHeight(true);}}}return H;}},getHeaderHeight:function(){var H=this.getItemHeight(this,'ovpCardHeader'),o=this.getOwnerComponent()?this.getOwnerComponent().getComponentData():null;if(o&&o.appComponent){var i=o.appComponent.getDashboardLayoutUtil(),j=i.getDashboardLayoutModel().getCardById(o.cardId);if(H!==0){j.dashboardLayout.headerHeight=H;}}return H;}});});