//@ui5-bundle sap/ui/demo/masterdetail/Component-preload.js
sap.ui.predefine('sap/ui/demo/masterdetail/Component',["sap/ui/core/UIComponent","sap/ui/Device","./model/models","./controller/ListSelector","./controller/ErrorHandler"],function(U,D,m,L,E){"use strict";return U.extend("sap.ui.demo.masterdetail.Component",{metadata:{manifest:"json"},init:function(){this.oListSelector=new L();this._oErrorHandler=new E(this);this.setModel(m.createDeviceModel(),"device");U.prototype.init.apply(this,arguments);this.getRouter().initialize();},destroy:function(){this.oListSelector.destroy();this._oErrorHandler.destroy();U.prototype.destroy.apply(this,arguments);},getContentDensityClass:function(){if(this._sContentDensityClass===undefined){if(document.body.classList.contains("sapUiSizeCozy")||document.body.classList.contains("sapUiSizeCompact")){this._sContentDensityClass="";}else if(!D.support.touch){this._sContentDensityClass="sapUiSizeCompact";}else{this._sContentDensityClass="sapUiSizeCozy";}}return this._sContentDensityClass;}});});
sap.ui.predefine('sap/ui/demo/masterdetail/controller/App.controller',["./BaseController","sap/ui/model/json/JSONModel"],function(B,J){"use strict";return B.extend("sap.ui.demo.masterdetail.controller.App",{onInit:function(){var v,s,o=this.getView().getBusyIndicatorDelay();v=new J({busy:true,delay:0,layout:"OneColumn",previousLayout:"",actionButtonsInfo:{midColumn:{fullScreen:false}}});this.setModel(v,"appView");s=function(){v.setProperty("/busy",false);v.setProperty("/delay",o);};this.getOwnerComponent().getModel().metadataLoaded().then(s);this.getOwnerComponent().getModel().attachMetadataFailed(s);this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());}});});
sap.ui.predefine('sap/ui/demo/masterdetail/controller/BaseController',["sap/ui/core/mvc/Controller","sap/ui/core/routing/History"],function(C,H){"use strict";return C.extend("sap.ui.demo.masterdetail.controller.BaseController",{getRouter:function(){return this.getOwnerComponent().getRouter();},getModel:function(n){return this.getView().getModel(n);},setModel:function(m,n){return this.getView().setModel(m,n);},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle();},onNavBack:function(){var p=H.getInstance().getPreviousHash();if(p!==undefined){history.go(-1);}else{this.getRouter().navTo("master",{},true);}}});});
sap.ui.predefine('sap/ui/demo/masterdetail/controller/Detail.controller',["./BaseController","sap/ui/model/json/JSONModel","../model/formatter","sap/m/library"],function(B,J,f,m){"use strict";var U=m.URLHelper;return B.extend("sap.ui.demo.masterdetail.controller.Detail",{formatter:f,onInit:function(){var v=new J({busy:false,delay:0,lineItemListTitle:this.getResourceBundle().getText("detailLineItemTableHeading")});this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched,this);this.setModel(v,"detailView");this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));},onSendEmailPress:function(){var v=this.getModel("detailView");U.triggerEmail(null,v.getProperty("/shareSendEmailSubject"),v.getProperty("/shareSendEmailMessage"));},onListUpdateFinished:function(e){var t,T=e.getParameter("total"),v=this.getModel("detailView");if(this.byId("lineItemsList").getBinding("items").isLengthFinal()){if(T){t=this.getResourceBundle().getText("detailLineItemTableHeadingCount",[T]);}else{t=this.getResourceBundle().getText("detailLineItemTableHeading");}v.setProperty("/lineItemListTitle",t);}},_onObjectMatched:function(e){var o=e.getParameter("arguments").objectId;this.getModel("appView").setProperty("/layout","TwoColumnsMidExpanded");this.getModel().metadataLoaded().then(function(){var O=this.getModel().createKey("Objects",{ObjectID:o});this._bindView("/"+O);}.bind(this));},_bindView:function(o){var v=this.getModel("detailView");v.setProperty("/busy",false);this.getView().bindElement({path:o,events:{change:this._onBindingChange.bind(this),dataRequested:function(){v.setProperty("/busy",true);},dataReceived:function(){v.setProperty("/busy",false);}}});},_onBindingChange:function(){var v=this.getView(),e=v.getElementBinding();if(!e.getBoundContext()){this.getRouter().getTargets().display("detailObjectNotFound");this.getOwnerComponent().oListSelector.clearMasterListSelection();return;}var p=e.getPath(),r=this.getResourceBundle(),o=v.getModel().getObject(p),O=o.ObjectID,s=o.Name,V=this.getModel("detailView");this.getOwnerComponent().oListSelector.selectAListItem(p);V.setProperty("/shareSendEmailSubject",r.getText("shareSendEmailObjectSubject",[O]));V.setProperty("/shareSendEmailMessage",r.getText("shareSendEmailObjectMessage",[s,O,location.href]));},_onMetadataLoaded:function(){var o=this.getView().getBusyIndicatorDelay(),v=this.getModel("detailView"),l=this.byId("lineItemsList"),O=l.getBusyIndicatorDelay();v.setProperty("/delay",0);v.setProperty("/lineItemTableDelay",0);l.attachEventOnce("updateFinished",function(){v.setProperty("/lineItemTableDelay",O);});v.setProperty("/busy",true);v.setProperty("/delay",o);},onCloseDetailPress:function(){this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen",false);this.getOwnerComponent().oListSelector.clearMasterListSelection();this.getRouter().navTo("master");},toggleFullScreen:function(){var F=this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen",!F);if(!F){this.getModel("appView").setProperty("/previousLayout",this.getModel("appView").getProperty("/layout"));this.getModel("appView").setProperty("/layout","MidColumnFullScreen");}else{this.getModel("appView").setProperty("/layout",this.getModel("appView").getProperty("/previousLayout"));}}});});
sap.ui.predefine('sap/ui/demo/masterdetail/controller/DetailObjectNotFound.controller',["./BaseController"],function(B){"use strict";return B.extend("sap.ui.demo.masterdetail.controller.DetailObjectNotFound",{});});
sap.ui.predefine('sap/ui/demo/masterdetail/controller/ErrorHandler',["sap/ui/base/Object","sap/m/MessageBox"],function(U,M){"use strict";return U.extend("sap.ui.demo.masterdetail.controller.ErrorHandler",{constructor:function(c){this._oResourceBundle=c.getModel("i18n").getResourceBundle();this._oComponent=c;this._oModel=c.getModel();this._bMessageOpen=false;this._sErrorText=this._oResourceBundle.getText("errorText");this._oModel.attachMetadataFailed(function(e){var p=e.getParameters();this._showServiceError(p.response);},this);this._oModel.attachRequestFailed(function(e){var p=e.getParameters();if(p.response.statusCode!=="404"||(p.response.statusCode===404&&p.response.responseText.indexOf("Cannot POST")===0)){this._showServiceError(p.response);}},this);},_showServiceError:function(d){if(this._bMessageOpen){return;}this._bMessageOpen=true;M.error(this._sErrorText,{id:"serviceErrorMessageBox",details:d,styleClass:this._oComponent.getContentDensityClass(),actions:[M.Action.CLOSE],onClose:function(){this._bMessageOpen=false;}.bind(this)});}});});
sap.ui.predefine('sap/ui/demo/masterdetail/controller/ListSelector',["sap/ui/base/Object","sap/base/Log"],function(B,L){"use strict";return B.extend("sap.ui.demo.masterdetail.controller.ListSelector",{constructor:function(){this._oWhenListHasBeenSet=new Promise(function(r){this._fnResolveListHasBeenSet=r;}.bind(this));this.oWhenListLoadingIsDone=new Promise(function(r,R){this._oWhenListHasBeenSet.then(function(l){l.getBinding("items").attachEventOnce("dataReceived",function(){if(this._oList.getItems().length){r({list:l});}else{R({list:l});}}.bind(this));}.bind(this));}.bind(this));},setBoundMasterList:function(l){this._oList=l;this._fnResolveListHasBeenSet(l);},selectAListItem:function(b){this.oWhenListLoadingIsDone.then(function(){var l=this._oList,s;if(l.getMode()==="None"){return;}s=l.getSelectedItem();if(s&&s.getBindingContext().getPath()===b){return;}l.getItems().some(function(i){if(i.getBindingContext()&&i.getBindingContext().getPath()===b){l.setSelectedItem(i);return true;}});}.bind(this),function(){L.warning("Could not select the list item with the path"+b+" because the list encountered an error or had no items");});},clearMasterListSelection:function(){this._oWhenListHasBeenSet.then(function(){this._oList.removeSelections(true);}.bind(this));}});});
sap.ui.predefine('sap/ui/demo/masterdetail/controller/Master.controller',["./BaseController","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/Sorter","sap/ui/model/FilterOperator","sap/m/GroupHeaderListItem","sap/ui/Device","sap/ui/core/Fragment","../model/formatter"],function(B,J,F,S,a,G,D,b,f){"use strict";return B.extend("sap.ui.demo.masterdetail.controller.Master",{formatter:f,onInit:function(){var l=this.byId("list"),v=this._createViewModel(),o=l.getBusyIndicatorDelay();this._oGroupFunctions={UnitNumber:function(c){var n=c.getProperty('UnitNumber'),k,t;if(n<=20){k="LE20";t=this.getResourceBundle().getText("masterGroup1Header1");}else{k="GT20";t=this.getResourceBundle().getText("masterGroup1Header2");}return{key:k,text:t};}.bind(this)};this._oList=l;this._oListFilterState={aFilter:[],aSearch:[]};this.setModel(v,"masterView");l.attachEventOnce("updateFinished",function(){v.setProperty("/delay",o);});this.getView().addEventDelegate({onBeforeFirstShow:function(){this.getOwnerComponent().oListSelector.setBoundMasterList(l);}.bind(this)});this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched,this);this.getRouter().attachBypassed(this.onBypassed,this);},onUpdateFinished:function(e){this._updateListItemCount(e.getParameter("total"));},onSearch:function(e){if(e.getParameters().refreshButtonPressed){this.onRefresh();return;}var q=e.getParameter("query");if(q){this._oListFilterState.aSearch=[new F("Name",a.Contains,q)];}else{this._oListFilterState.aSearch=[];}this._applyFilterSearch();},onRefresh:function(){this._oList.getBinding("items").refresh();},onOpenViewSettings:function(e){var d="filter";if(e.getSource()instanceof sap.m.Button){var s=e.getSource().getId();if(s.match("sort")){d="sort";}else if(s.match("group")){d="group";}}if(!this.byId("viewSettingsDialog")){b.load({id:this.getView().getId(),name:"sap.ui.demo.masterdetail.view.ViewSettingsDialog",controller:this}).then(function(o){this.getView().addDependent(o);o.addStyleClass(this.getOwnerComponent().getContentDensityClass());o.open(d);}.bind(this));}else{this.byId("viewSettingsDialog").open(d);}},onConfirmViewSettingsDialog:function(e){var c=e.getParameters().filterItems,d=[],C=[];c.forEach(function(i){switch(i.getKey()){case"Filter1":d.push(new F("UnitNumber",a.LE,100));break;case"Filter2":d.push(new F("UnitNumber",a.GT,100));break;default:break;}C.push(i.getText());});this._oListFilterState.aFilter=d;this._updateFilterBar(C.join(", "));this._applyFilterSearch();this._applySortGroup(e);},_applySortGroup:function(e){var p=e.getParameters(),P,d,s=[];if(p.groupItem){P=p.groupItem.getKey();d=p.groupDescending;var g=this._oGroupFunctions[P];s.push(new S(P,d,g));}P=p.sortItem.getKey();d=p.sortDescending;s.push(new S(P,d));this._oList.getBinding("items").sort(s);},onSelectionChange:function(e){var l=e.getSource(),s=e.getParameter("selected");if(!(l.getMode()==="MultiSelect"&&!s)){this._showDetail(e.getParameter("listItem")||e.getSource());}},onBypassed:function(){this._oList.removeSelections(true);},createGroupHeader:function(g){return new G({title:g.text,upperCase:false});},onNavBack:function(){history.go(-1);},_createViewModel:function(){return new J({isFilterBarVisible:false,filterBarLabel:"",delay:0,title:this.getResourceBundle().getText("masterTitleCount",[0]),noDataText:this.getResourceBundle().getText("masterListNoDataText"),sortBy:"Name",groupBy:"None"});},_onMasterMatched:function(){this.getModel("appView").setProperty("/layout","OneColumn");},_showDetail:function(i){var r=!D.system.phone;this.getModel("appView").setProperty("/layout","TwoColumnsMidExpanded");this.getRouter().navTo("object",{objectId:i.getBindingContext().getProperty("ObjectID")},r);},_updateListItemCount:function(t){var T;if(this._oList.getBinding("items").isLengthFinal()){T=this.getResourceBundle().getText("masterTitleCount",[t]);this.getModel("masterView").setProperty("/title",T);}},_applyFilterSearch:function(){var c=this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),v=this.getModel("masterView");this._oList.getBinding("items").filter(c,"Application");if(c.length!==0){v.setProperty("/noDataText",this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));}else if(this._oListFilterState.aSearch.length>0){v.setProperty("/noDataText",this.getResourceBundle().getText("masterListNoDataText"));}},_updateFilterBar:function(s){var v=this.getModel("masterView");v.setProperty("/isFilterBarVisible",(this._oListFilterState.aFilter.length>0));v.setProperty("/filterBarLabel",this.getResourceBundle().getText("masterFilterBarText",[s]));}});});
sap.ui.predefine('sap/ui/demo/masterdetail/controller/NotFound.controller',["./BaseController"],function(B){"use strict";return B.extend("sap.ui.demo.masterdetail.controller.NotFound",{onInit:function(){this.getRouter().getTarget("notFound").attachDisplay(this._onNotFoundDisplayed,this);},_onNotFoundDisplayed:function(){this.getModel("appView").setProperty("/layout","OneColumn");}});});
sap.ui.predefine('sap/ui/demo/masterdetail/localService/mockserver',["sap/ui/core/util/MockServer","sap/ui/model/json/JSONModel","sap/base/Log","sap/base/util/UriParameters"],function(M,J,L,U){"use strict";var m,_="sap/ui/demo/masterdetail/",a=_+"localService/mockdata";var o={init:function(O){var b=O||{};return new Promise(function(r,R){var s=sap.ui.require.toUrl(_+"manifest.json"),c=new J(s);c.attachRequestCompleted(function(){var u=new U(window.location.href),j=sap.ui.require.toUrl(a),d=c.getProperty("/sap.app/dataSources/mainService"),e=sap.ui.require.toUrl(_+d.settings.localUri),f=/.*\/$/.test(d.uri)?d.uri:d.uri+"/";if(!m){m=new M({rootUri:f});}else{m.stop();}M.config({autoRespond:true,autoRespondAfter:(b.delay||u.get("serverDelay")||500)});m.simulate(e,{sMockdataBaseUrl:j,bGenerateMissingMockData:true});var g=m.getRequests();var h=function(k,l,n){n.response=function(x){x.respond(k,{"Content-Type":"text/plain;charset=utf-8"},l);};};if(b.metadataError||u.get("metadataError")){g.forEach(function(k){if(k.path.toString().indexOf("$metadata")>-1){h(500,"metadata Error",k);}});}var E=b.errorType||u.get("errorType"),i=E==="badRequest"?400:500;if(E){g.forEach(function(k){h(i,E,k);});}m.setRequests(g);m.start();L.info("Running the app with mock data");r();});c.attachRequestFailed(function(){var e="Failed to load application manifest";L.error(e);R(new Error(e));});});},getMockServer:function(){return m;}};return o;});
sap.ui.predefine('sap/ui/demo/masterdetail/model/formatter',[],function(){"use strict";return{currencyValue:function(v){if(!v){return"";}return parseFloat(v).toFixed(2);}};});
sap.ui.predefine('sap/ui/demo/masterdetail/model/models',["sap/ui/model/json/JSONModel","sap/ui/Device"],function(J,D){"use strict";return{createDeviceModel:function(){var m=new J(D);m.setDefaultBindingMode("OneWay");return m;}};});
sap.ui.require.preload({
	"sap/ui/demo/masterdetail/i18n/i18n.properties":'#\n#Tue May 21 07:50:19 UTC 2019\nmasterListNoDataText=No <ObjectsPlural> are currently available\nmasterGroup1=<UnitNumber> Group\nmasterSort2=Sort By <UnitNumber>\nshareSendEmailObjectMessage=<Email body PLEASE REPLACE ACCORDING TO YOUR USE CASE> {0} (id\\: {1})\\r\\n{2}\nmasterSort1=Sort By <Name>\nmasterFilterBarText=Filtered by {0}\nnotFoundText=The requested resource was not found\ndetailIconTabBarAttachments=Attachments\ncloseColumn=Close\nappTitle=Master-Detail\nsendEmail=Send E-Mail\ndetailLineItemTableUnitNumberColumn=<LastColumnName>\nmasterFilter2=>100 <UnitOfMeasure>\nmasterFilter1=<100 <UnitOfMeasure>\nshareSendEmailObjectSubject=<Email subject including object identifier PLEASE REPLACE ACCORDING TO YOUR USE CASE> {0}\ndetailLineItemTableHeading=<LineItemsPlural>\ndetailLineItemTableIDColumn=<FirstColumnName>\nmasterFilterName=<UnitNumber>\nmasterSearchTooltip=Enter an <Objects> name or a part of it.\nnotFoundTitle=Not Found\nmasterFilterNone=none\ndetailLineItemTableNoDataText=No <LineItemsPlural>\nmasterGroupNone=(Not grouped)\nappDescription=Best-practice starting point for a master-detail app (standalone)\nnotAvailableViewTitle=<Objects>\ndetailLineItemTableHeadingCount=<LineItemsPlural> ({0})\nmasterTitleCount=<Objects> ({0})\ndetailIconTabBarInfo=Info\npriceTitle=Price\nerrorText=Sorry, a technical error occurred\\! Please try again later.\nnoObjectFoundText=This <Objects> is not available\nmasterGroup1Header2=<UnitNumber> higher than 20\nmasterGroup1Header1=<UnitNumber> 20 or less\nmasterListNoDataWithFilterOrSearchText=No matching <ObjectsPlural> found\n',
	"sap/ui/demo/masterdetail/manifest.json":'{"_version":"1.12.0","sap.app":{"id":"sap.ui.demo.masterdetail","type":"application","i18n":"i18n/i18n.properties","title":"{{appTitle}}","description":"{{appDescription}}","applicationVersion":{"version":"1.0.0"},"resources":"resources.json","dataSources":{"mainService":{"uri":"/here/goes/your/serviceUrl/","type":"OData","settings":{"odataVersion":"2.0","localUri":"localService/metadata.xml"}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"sap-icon://detail-view","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"rootView":{"viewName":"sap.ui.demo.masterdetail.view.App","type":"XML","async":true,"id":"app"},"dependencies":{"minUI5Version":"1.60.0","libs":{"sap.ui.core":{},"sap.m":{},"sap.f":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"sap.ui.demo.masterdetail.i18n.i18n"}},"":{"dataSource":"mainService","preload":true}},"routing":{"config":{"routerClass":"sap.f.routing.Router","viewType":"XML","viewPath":"sap.ui.demo.masterdetail.view","controlId":"layout","controlAggregation":"beginColumnPages","bypassed":{"target":"notFound"},"async":true},"routes":[{"pattern":"","name":"master","target":"master"},{"pattern":"Objects/{objectId}","name":"object","target":["master","object"]}],"targets":{"master":{"viewName":"Master","viewLevel":1,"viewId":"master"},"object":{"viewName":"Detail","viewId":"detail","viewLevel":1,"controlAggregation":"midColumnPages"},"detailObjectNotFound":{"viewName":"DetailObjectNotFound","viewId":"detailObjectNotFound","controlAggregation":"midColumnPages"},"notFound":{"viewName":"NotFound","viewId":"notFound"}}}}}',
	"sap/ui/demo/masterdetail/view/App.view.xml":'<mvc:View controllerName="sap.ui.demo.masterdetail.controller.App" displayBlock="true" height="100%" xmlns="sap.m" xmlns:f="sap.f" xmlns:mvc="sap.ui.core.mvc"><App id="app" busy="{appView&gt;/busy}" busyIndicatorDelay="{appView&gt;/delay}"><f:FlexibleColumnLayout id="layout" layout="{appView&gt;/layout}" backgroundDesign="Translucent"/></App></mvc:View>',
	"sap/ui/demo/masterdetail/view/Detail.view.xml":'<mvc:View controllerName="sap.ui.demo.masterdetail.controller.Detail" xmlns="sap.m" xmlns:semantic="sap.f.semantic" xmlns:mvc="sap.ui.core.mvc"><semantic:SemanticPage id="detailPage" busy="{detailView&gt;/busy}" busyIndicatorDelay="{detailView&gt;/delay}"><semantic:titleHeading><Title text="{Name}" level="H2"/></semantic:titleHeading><semantic:headerContent><ObjectAttribute title="{i18n&gt;priceTitle}"/><ObjectNumber id="objectHeaderNumber" number="{path:\'UnitNumber\',formatter:\'.formatter.currencyValue\'}" unit="{UnitOfMeasure}"/></semantic:headerContent><semantic:content><Table id="lineItemsList" width="auto" items="{LineItems}" updateFinished=".onListUpdateFinished" noDataText="{i18n&gt;detailLineItemTableNoDataText}" busyIndicatorDelay="{detailView&gt;/lineItemTableDelay}"><headerToolbar><Toolbar><Title id="lineItemsTitle" text="{detailView&gt;/lineItemListTitle}" titleStyle="H3" level="H3"/></Toolbar></headerToolbar><columns><Column><Text text="{i18n&gt;detailLineItemTableIDColumn}"/></Column><Column minScreenWidth="Tablet" demandPopin="true" hAlign="End"><Text text="{i18n&gt;detailLineItemTableUnitNumberColumn}"/></Column></columns><items><ColumnListItem><cells><ObjectIdentifier title="{Name}" text="{LineItemID}"/><ObjectNumber number="{path:\'UnitNumber\',formatter:\'.formatter.currencyValue\'}" unit="{UnitOfMeasure}"/></cells></ColumnListItem></items></Table></semantic:content><semantic:sendEmailAction><semantic:SendEmailAction id="shareEmail" press=".onSendEmailPress"/></semantic:sendEmailAction><semantic:closeAction><semantic:CloseAction id="closeColumn" press=".onCloseDetailPress"/></semantic:closeAction><semantic:fullScreenAction><semantic:FullScreenAction id="enterFullScreen" visible="{= !${device&gt;/system/phone} &amp;&amp; !${appView&gt;/actionButtonsInfo/midColumn/fullScreen}}" press=".toggleFullScreen"/></semantic:fullScreenAction><semantic:exitFullScreenAction><semantic:ExitFullScreenAction id="exitFullScreen" visible="{= !${device&gt;/system/phone} &amp;&amp; ${appView&gt;/actionButtonsInfo/midColumn/fullScreen}}" press=".toggleFullScreen"/></semantic:exitFullScreenAction></semantic:SemanticPage></mvc:View>',
	"sap/ui/demo/masterdetail/view/DetailObjectNotFound.view.xml":'<mvc:View controllerName="sap.ui.demo.masterdetail.controller.DetailObjectNotFound" xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc"><MessagePage id="page" title="{i18n&gt;detailTitle}" text="{i18n&gt;noObjectFoundText}" icon="sap-icon://product" description="" showNavButton="{=    ${device&gt;/system/phone} ||    ${device&gt;/system/tablet} &amp;&amp;    ${device&gt;/orientation/portrait}   }" navButtonPress=".onNavBack"/></mvc:View>',
	"sap/ui/demo/masterdetail/view/Master.view.xml":'<mvc:View controllerName="sap.ui.demo.masterdetail.controller.Master" xmlns="sap.m" xmlns:semantic="sap.f.semantic" xmlns:mvc="sap.ui.core.mvc"><semantic:SemanticPage id="masterPage" preserveHeaderStateOnScroll="true" toggleHeaderOnTitleClick="false"><semantic:titleHeading><Title id="masterPageTitle" text="{masterView&gt;/title}" level="H2"/></semantic:titleHeading><semantic:content><List id="list" width="auto" class="sapFDynamicPageAlignContent" items="{path:\'/Objects\',sorter:{path:\'Name\',descending:false},groupHeaderFactory:\'.createGroupHeader\'}" busyIndicatorDelay="{masterView&gt;/delay}" noDataText="{masterView&gt;/noDataText}" mode="{= ${device&gt;/system/phone} ? \'None\' : \'SingleSelectMaster\'}" growing="true" growingScrollToLoad="true" updateFinished=".onUpdateFinished" selectionChange=".onSelectionChange"><infoToolbar><Toolbar active="true" id="filterBar" visible="{masterView&gt;/isFilterBarVisible}" press=".onOpenViewSettings"><Title id="filterBarLabel" text="{masterView&gt;/filterBarLabel}" level="H3"/></Toolbar></infoToolbar><headerToolbar><OverflowToolbar><SearchField id="searchField" showRefreshButton="true" tooltip="{i18n&gt;masterSearchTooltip}" search=".onSearch" width="auto"><layoutData><OverflowToolbarLayoutData minWidth="150px" maxWidth="240px" shrinkable="true" priority="NeverOverflow"/></layoutData></SearchField><ToolbarSpacer/><Button id="sortButton" press=".onOpenViewSettings" icon="sap-icon://sort" type="Transparent"/><Button id="filterButton" press=".onOpenViewSettings" icon="sap-icon://filter" type="Transparent"/><Button id="groupButton" press=".onOpenViewSettings" icon="sap-icon://group-2" type="Transparent"/></OverflowToolbar></headerToolbar><items><ObjectListItem type="Navigation" press=".onSelectionChange" title="{Name}" number="{path:\'UnitNumber\',formatter:\'.formatter.currencyValue\'}" numberUnit="{UnitOfMeasure}"/></items></List></semantic:content></semantic:SemanticPage></mvc:View>',
	"sap/ui/demo/masterdetail/view/NotFound.view.xml":'<mvc:View controllerName="sap.ui.demo.masterdetail.controller.NotFound" xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc"><MessagePage id="page" title="{i18n&gt;notFoundTitle}" text="{i18n&gt;notFoundText}" icon="sap-icon://document" showNavButton="true" navButtonPress=".onNavBack"/></mvc:View>',
	"sap/ui/demo/masterdetail/view/ViewSettingsDialog.fragment.xml":'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><ViewSettingsDialog id="viewSettingsDialog" confirm=".onConfirmViewSettingsDialog"><sortItems><ViewSettingsItem text="{i18n&gt;masterSort1}" key="Name" selected="true"/><ViewSettingsItem text="{i18n&gt;masterSort2}" key="UnitNumber"/></sortItems><filterItems><ViewSettingsFilterItem id="filterItems" text="{i18n&gt;masterFilterName}" multiSelect="false"><items><ViewSettingsItem id="viewFilter1" text="{i18n&gt;masterFilter1}" key="Filter1"/><ViewSettingsItem id="viewFilter2" text="{i18n&gt;masterFilter2}" key="Filter2"/></items></ViewSettingsFilterItem></filterItems><groupItems><ViewSettingsItem text="{i18n&gt;masterGroup1}" key="UnitNumber"/></groupItems></ViewSettingsDialog></core:FragmentDefinition>'
},"sap/ui/demo/masterdetail/Component-preload"
);
//# sourceMappingURL=Component-preload.js.map