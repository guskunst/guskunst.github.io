/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/DataType","sap/ui/core/theming/Parameters"],function(D,P){"use strict";sap.ui.getCore().initLibrary({name:"sap.gantt",dependencies:["sap.ui.core","sap.ui.layout","sap.ui.table","sap.m"],types:["sap.gantt.control.ToolbarType","sap.gantt.SelectionMode","sap.gantt.shape.ShapeCategory","sap.gantt.def.filter.MorphologyOperator","sap.gantt.def.filter.ColorMatrixValue","sap.gantt.shape.ext.rls.RelationshipType","sap.gantt.config.ZoomControlType","sap.gantt.config.BirdEyeRange","sap.gantt.GenericArray","sap.gantt.dragdrop.GhostAlignment","sap.gantt.simple.GanttChartWithTableDisplayType","sap.gantt.simple.ContainerToolbarPlaceholderType"],interfaces:["sap.gantt.GanttChartBase"],controls:["sap.gantt.control.Toolbar","sap.gantt.GanttChart","sap.gantt.GanttChartWithTable","sap.gantt.GanttChartContainer","sap.gantt.axistime.ProportionZoomStrategy","sap.gantt.legend.LegendContainer","sap.gantt.legend.ListLegend","sap.gantt.legend.DimensionLegend","sap.gantt.simple.GanttChartWithTable","sap.gantt.simple.ContainerToolbar","sap.gantt.simple.GanttChartContainer","sap.gantt.simple.ContainerToolbarPlaceholder"],elements:["sap.gantt.config.TimeHorizon","sap.gantt.config.TimeAxis","sap.gantt.config.ToolbarGroup","sap.gantt.config.Mode","sap.gantt.config.ModeGroup","sap.gantt.config.LayoutGroup","sap.gantt.config.ExpandChart","sap.gantt.config.ExpandChartGroup","sap.gantt.config.TimeZoomGroup","sap.gantt.config.BirdEyeGroup","sap.gantt.config.ToolbarScheme","sap.gantt.config.Hierarchy","sap.gantt.config.HierarchyColumn","sap.gantt.config.ColumnAttribute","sap.gantt.config.GanttChartLayout","sap.gantt.config.ContainerLayout","sap.gantt.config.SettingItem","sap.gantt.config.SettingGroup","sap.gantt.config.ObjectType","sap.gantt.config.ChartScheme","sap.gantt.config.Locale","sap.gantt.config.Shape","sap.gantt.def.SvgDefs","sap.gantt.axistime.AxisTimeStrategyBase","sap.gantt.AdhocLine","sap.gantt.simple.GanttRowSettings","sap.gantt.simple.BaseCalendar","sap.gantt.simple.BaseChevron","sap.gantt.simple.BaseDiamond","sap.gantt.simple.BaseGroup","sap.gantt.simple.BaseImage","sap.gantt.simple.BaseLine","sap.gantt.simple.BasePath","sap.gantt.simple.BaseRectangle","sap.gantt.simple.BaseShape","sap.gantt.simple.BaseText","sap.gantt.simple.BaseCursor","sap.gantt.simple.BaseConditionalShape","sap.gantt.simple.UtilizationBarChart","sap.gantt.simple.UtilizationLineChart","sap.gantt.simple.UtilizationChart","sap.gantt.simple.UtilizationDimension","sap.gantt.simple.UtilizationPeriod"],noLibraryCSS:false,version:"1.66.0"});this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.gantt");sap.gantt.SelectionMode={MultiWithKeyboard:"MultiWithKeyboard",Multiple:"Multiple",Single:"Single",None:"None"};sap.gantt.AdhocLineLayer={Top:"Top",Bottom:"Bottom"};sap.gantt.control.ToolbarType={Global:"GLOBAL",Local:"LOCAL"};sap.gantt.ValueSVGPaintServer=D.createType('sap.gantt.ValueSVGPaintServer',{isValid:function(v){var V=sap.m.ValueCSSColor.isValid(v);if(!V){V=/(?:url\(['|"]?)(.*?)(?:['|"]?\))|^[@|#](.*?)$|initial|transparent|none|inherit/.test(v);}return V;}},D.getType('string'));sap.gantt.ValueSVGPaintServer.setNormalizer(function(v){if(!v){return v;}if(v.substr(0,1)==="@"){v=v.substring(1);}var r=P.get(v)||v;return r;});sap.gantt.SVGLength=D.createType("sap.gantt.SVGLength",{isValid:function(v){if(v==="auto"||v==="inherit"){return true;}return/^[-+]?([0-9]*\.?[0-9]+)(em|ex|px|in|cm|mm|pt|pc|%)?$/.test(v);}},D.getType("any"));sap.gantt.shape.ShapeCategory={InRowShape:"InRowShape",Relationship:"relationship"};sap.gantt.def.filter.MorphologyOperator={Dilate:"dilate",Erode:"erode"};sap.gantt.def.filter.ColorMatrixValue={AllToWhite:"-1 0 0 0 1, 0 -1 0 0 1, 0 0 -1 0 1, 0 0 0 1 0",AllToBlack:"-1 0 0 0 0, 0 -1 0 0 0, 0 0 -1 0 0, 0 0 0 1 0"};sap.gantt.shape.ext.rls.RelationshipType={FinishToFinish:0,FinishToStart:1,StartToFinish:2,StartToStart:3};sap.gantt.simple.RelationshipType={FinishToFinish:"FinishToFinish",FinishToStart:"FinishToStart",StartToFinish:"StartToFinish",StartToStart:"StartToStart"};sap.gantt.config.ZoomControlType={SliderWithButtons:"SliderWithButtons",SliderOnly:"SliderOnly",ButtonsOnly:"ButtonsOnly",Select:"Select",None:"None"};sap.gantt.config.BirdEyeRange={AllRows:"AllRows",VisibleRows:"VisibleRows"};sap.gantt.config.TimeUnit={minute:"d3.time.minute",hour:"d3.time.hour",day:"d3.time.day",week:"d3.time.week",month:"d3.time.month",year:"d3.time.year"};sap.gantt.config.WeekFirstDay={"ad":"d3.time.monday","ae":"d3.time.saturday","af":"d3.time.saturday","ag":"d3.time.sunday","ai":"d3.time.monday","al":"d3.time.monday","am":"d3.time.monday","an":"d3.time.monday","ar":"d3.time.sunday","as":"d3.time.sunday","at":"d3.time.monday","au":"d3.time.sunday","ax":"d3.time.monday","az":"d3.time.monday","ba":"d3.time.monday","bd":"d3.time.friday","be":"d3.time.monday","bg":"d3.time.monday","bh":"d3.time.saturday","bm":"d3.time.monday","bn":"d3.time.monday","br":"d3.time.sunday","bs":"d3.time.sunday","bt":"d3.time.sunday","bw":"d3.time.sunday","by":"d3.time.monday","bz":"d3.time.sunday","ca":"d3.time.sunday","ch":"d3.time.monday","cl":"d3.time.monday","cm":"d3.time.monday","cn":"d3.time.sunday","co":"d3.time.sunday","cr":"d3.time.monday","cy":"d3.time.monday","cz":"d3.time.monday","de":"d3.time.monday","dj":"d3.time.saturday","dk":"d3.time.monday","dm":"d3.time.sunday","do":"d3.time.sunday","dz":"d3.time.saturday","ec":"d3.time.monday","ee":"d3.time.monday","eg":"d3.time.saturday","es":"d3.time.monday","et":"d3.time.sunday","fi":"d3.time.monday","fj":"d3.time.monday","fo":"d3.time.monday","fr":"d3.time.monday","gb":"d3.time.monday","gb-alt-variant":"d3.time.sunday","ge":"d3.time.monday","gf":"d3.time.monday","gp":"d3.time.monday","gr":"d3.time.monday","gt":"d3.time.sunday","gu":"d3.time.sunday","hk":"d3.time.sunday","hn":"d3.time.sunday","hr":"d3.time.monday","hu":"d3.time.monday","id":"d3.time.sunday","ie":"d3.time.sunday","il":"d3.time.sunday","in":"d3.time.sunday","iq":"d3.time.saturday","ir":"d3.time.saturday","is":"d3.time.monday","it":"d3.time.monday","jm":"d3.time.sunday","jo":"d3.time.saturday","jp":"d3.time.sunday","ke":"d3.time.sunday","kg":"d3.time.monday","kh":"d3.time.sunday","kr":"d3.time.sunday","kw":"d3.time.saturday","kz":"d3.time.monday","la":"d3.time.sunday","lb":"d3.time.monday","li":"d3.time.monday","lk":"d3.time.monday","lt":"d3.time.monday","lu":"d3.time.monday","lv":"d3.time.monday","ly":"d3.time.saturday","ma":"d3.time.saturday","mc":"d3.time.monday","md":"d3.time.monday","me":"d3.time.monday","mh":"d3.time.sunday","mk":"d3.time.monday","mm":"d3.time.sunday","mn":"d3.time.monday","mo":"d3.time.sunday","mq":"d3.time.monday","mt":"d3.time.sunday","mv":"d3.time.friday","mx":"d3.time.sunday","my":"d3.time.monday","mz":"d3.time.sunday","ni":"d3.time.sunday","nl":"d3.time.monday","no":"d3.time.monday","np":"d3.time.sunday","nz":"d3.time.monday","om":"d3.time.saturday","pa":"d3.time.sunday","pe":"d3.time.sunday","ph":"d3.time.sunday","pk":"d3.time.sunday","pl":"d3.time.monday","pr":"d3.time.sunday","pt":"d3.time.monday","py":"d3.time.sunday","qa":"d3.time.saturday","re":"d3.time.monday","ro":"d3.time.monday","rs":"d3.time.monday","ru":"d3.time.monday","sa":"d3.time.sunday","sd":"d3.time.saturday","se":"d3.time.monday","sg":"d3.time.sunday","si":"d3.time.monday","sk":"d3.time.monday","sm":"d3.time.monday","sv":"d3.time.sunday","sy":"d3.time.saturday","th":"d3.time.sunday","tj":"d3.time.monday","tm":"d3.time.monday","tn":"d3.time.sunday","tr":"d3.time.monday","tt":"d3.time.sunday","tw":"d3.time.sunday","ua":"d3.time.monday","um":"d3.time.sunday","us":"d3.time.sunday","uy":"d3.time.monday","uz":"d3.time.monday","va":"d3.time.monday","ve":"d3.time.sunday","vi":"d3.time.sunday","vn":"d3.time.monday","ws":"d3.time.sunday","xk":"d3.time.monday","ye":"d3.time.sunday","za":"d3.time.sunday","zw":"d3.time.sunday"};sap.gantt.config.DEFAULT_PLAN_HORIZON=new sap.gantt.config.TimeHorizon({startTime:new Date((new Date()).getTime()-31536000000),endTime:new Date((new Date()).getTime()+31536000000)});sap.gantt.config.DEFAULT_INIT_HORIZON=new sap.gantt.config.TimeHorizon({startTime:new Date((new Date()).getTime()-2628000000),endTime:new Date((new Date()).getTime()+2628000000)});var u=sap.ui.getCore().getConfiguration().getRTL()?".M.d":"d.M.";sap.gantt.config.DEFAULT_TIME_ZOOM_STRATEGY={"1min":{innerInterval:{unit:sap.gantt.config.TimeUnit.minute,span:1,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,format:"yyMMMEEEEd"},smallInterval:{unit:sap.gantt.config.TimeUnit.minute,span:1,pattern:"HH:mm"}},"5min":{innerInterval:{unit:sap.gantt.config.TimeUnit.minute,span:5,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,format:"yyMMMEEEEd"},smallInterval:{unit:sap.gantt.config.TimeUnit.minute,span:5,pattern:"HH:mm"}},"10min":{innerInterval:{unit:sap.gantt.config.TimeUnit.minute,span:10,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,format:"yyMMMEEEEd"},smallInterval:{unit:sap.gantt.config.TimeUnit.minute,span:10,pattern:"HH:mm"}},"15min":{innerInterval:{unit:sap.gantt.config.TimeUnit.minute,span:15,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,format:"yyMMMEEEEd"},smallInterval:{unit:sap.gantt.config.TimeUnit.minute,span:15,pattern:"HH:mm"}},"30min":{innerInterval:{unit:sap.gantt.config.TimeUnit.minute,span:30,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,format:"yyMMMEEEEd"},smallInterval:{unit:sap.gantt.config.TimeUnit.minute,span:30,pattern:"HH:mm"}},"1hour":{innerInterval:{unit:sap.gantt.config.TimeUnit.hour,span:1,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,format:"yyMMMEEEEd"},smallInterval:{unit:sap.gantt.config.TimeUnit.hour,span:1,pattern:"HH:mm"}},"2hour":{innerInterval:{unit:sap.gantt.config.TimeUnit.hour,span:2,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,format:"yyMMMEEEEd"},smallInterval:{unit:sap.gantt.config.TimeUnit.hour,span:2,pattern:"HH:mm"}},"4hour":{innerInterval:{unit:sap.gantt.config.TimeUnit.hour,span:4,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,format:"yyMMMEEEEd"},smallInterval:{unit:sap.gantt.config.TimeUnit.hour,span:4,pattern:"HH:mm"}},"6hour":{innerInterval:{unit:sap.gantt.config.TimeUnit.hour,span:6,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,format:"yyMMMEEEEd"},smallInterval:{unit:sap.gantt.config.TimeUnit.hour,span:6,pattern:"HH:mm"}},"12hour":{innerInterval:{unit:sap.gantt.config.TimeUnit.hour,span:12,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,format:"yyMMMEEEEd"},smallInterval:{unit:sap.gantt.config.TimeUnit.hour,span:12,pattern:"HH:mm"}},"1day":{innerInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.month,span:1,format:"yyyyMMMM"},smallInterval:{unit:sap.gantt.config.TimeUnit.day,span:1,pattern:u}},"2day":{innerInterval:{unit:sap.gantt.config.TimeUnit.day,span:2,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.month,span:1,format:"yyyyMMMM"},smallInterval:{unit:sap.gantt.config.TimeUnit.day,span:2,pattern:u}},"4day":{innerInterval:{unit:sap.gantt.config.TimeUnit.day,span:4,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.month,span:1,format:"yyyyMMMM"},smallInterval:{unit:sap.gantt.config.TimeUnit.day,span:4,pattern:u}},"1week":{innerInterval:{unit:sap.gantt.config.TimeUnit.week,span:1,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.month,span:1,format:"yyyyMMMM"},smallInterval:{unit:sap.gantt.config.TimeUnit.week,span:1,pattern:u}},"2week":{innerInterval:{unit:sap.gantt.config.TimeUnit.week,span:2,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.month,span:1,format:"yyyyMMMM"},smallInterval:{unit:sap.gantt.config.TimeUnit.week,span:2,pattern:u}},"1month":{innerInterval:{unit:sap.gantt.config.TimeUnit.month,span:1,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.month,span:6,format:"yyyyMMMM"},smallInterval:{unit:sap.gantt.config.TimeUnit.month,span:1,pattern:u}},"2month":{innerInterval:{unit:sap.gantt.config.TimeUnit.month,span:2,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.month,span:6,format:"yyyyMMMM"},smallInterval:{unit:sap.gantt.config.TimeUnit.month,span:2,pattern:u}},"4month":{innerInterval:{unit:sap.gantt.config.TimeUnit.month,span:4,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.year,span:1,format:"yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.month,span:4,pattern:"MMMM"}},"6month":{innerInterval:{unit:sap.gantt.config.TimeUnit.month,span:6,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.year,span:1,format:"yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.month,span:6,pattern:"MMMM"}},"1year":{innerInterval:{unit:sap.gantt.config.TimeUnit.year,span:1,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.year,span:10,format:"yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.year,span:1,pattern:"MMMM"}},"2year":{innerInterval:{unit:sap.gantt.config.TimeUnit.year,span:2,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.year,span:10,format:"yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.year,span:2,pattern:"MMMM"}},"5year":{innerInterval:{unit:sap.gantt.config.TimeUnit.year,span:5,range:90},largeInterval:{unit:sap.gantt.config.TimeUnit.year,span:10,format:"yyyy"},smallInterval:{unit:sap.gantt.config.TimeUnit.year,span:5,pattern:"MMMM"}}};sap.gantt.config.DEFAULT_TIME_AXIS=new sap.gantt.config.TimeAxis();sap.gantt.config.DEFAULT_MODE_KEY="sap_mode";sap.gantt.config.DEFAULT_MODE=new sap.gantt.config.Mode({key:sap.gantt.config.DEFAULT_MODE_KEY,text:this._oRb.getText("TLTP_DEFAULT"),icon:"sap-icon://status-positive"});sap.gantt.config.DEFAULT_MODES=[sap.gantt.config.DEFAULT_MODE];sap.gantt.config.DEFAULT_CHART_SCHEME_KEY="sap_main";sap.gantt.config.DEFAULT_CHART_SCHEME=new sap.gantt.config.ChartScheme({key:sap.gantt.config.DEFAULT_CHART_SCHEME_KEY,name:"Default",rowSpan:1});sap.gantt.config.DEFAULT_CHART_SCHEMES=[sap.gantt.config.DEFAULT_CHART_SCHEME];sap.gantt.config.DEFAULT_OBJECT_TYPE_KEY="sap_object";sap.gantt.config.DEFAULT_OBJECT_TYPE=new sap.gantt.config.ObjectType({key:sap.gantt.config.DEFAULT_OBJECT_TYPE_KEY,description:"Default",mainChartSchemeKey:sap.gantt.config.DEFAULT_CHART_SCHEME_KEY});sap.gantt.config.DEFAULT_OBJECT_TYPES=[sap.gantt.config.DEFAULT_OBJECT_TYPE];sap.gantt.config.SETTING_ITEM_ENABLE_NOW_LINE_KEY="sap_enableNowLine";sap.gantt.config.SETTING_ITEM_ENABLE_NOW_LINE=new sap.gantt.config.SettingItem({key:sap.gantt.config.SETTING_ITEM_ENABLE_NOW_LINE_KEY,checked:true,displayText:this._oRb.getText("XCKL_NOW_LINE"),tooltip:this._oRb.getText("TLTP_NOW_LINE")});sap.gantt.config.SETTING_ITEM_ENABLE_CURSOR_LINE_KEY="sap_enableCursorLine";sap.gantt.config.SETTING_ITEM_ENABLE_CURSOR_LINE=new sap.gantt.config.SettingItem({key:sap.gantt.config.SETTING_ITEM_ENABLE_CURSOR_LINE_KEY,checked:true,displayText:this._oRb.getText("XCKL_CURSOR_LINE"),tooltip:this._oRb.getText("TLTP_CURSOR_LINE")});sap.gantt.config.SETTING_ITEM_ENABLE_VERTICAL_LINE_KEY="sap_enableVerticalLine";sap.gantt.config.SETTING_ITEM_ENABLE_ADHOC_LINE_KEY="sap_enableAdhocLine";sap.gantt.config.SETTING_ITEM_ENABLE_VERTICAL_LINE=new sap.gantt.config.SettingItem({key:sap.gantt.config.SETTING_ITEM_ENABLE_VERTICAL_LINE_KEY,checked:true,displayText:this._oRb.getText("XCKL_VERTICAL_LINE"),tooltip:this._oRb.getText("TLTP_VERTICAL_LINE")});sap.gantt.config.SETTING_ITEM_ENABLE_ADHOC_LINE=new sap.gantt.config.SettingItem({key:sap.gantt.config.SETTING_ITEM_ENABLE_ADHOC_LINE_KEY,checked:true,displayText:this._oRb.getText("XCKL_ADHOC_LINE"),tooltip:this._oRb.getText("TLTP_ADHOC_LINE")});sap.gantt.config.SETTING_ITEM_ENABLE_TIME_SCROLL_SYNC_KEY="sap_enableTimeScrollSync";sap.gantt.config.SETTING_ITEM_ENABLE_TIME_SCROLL_SYNC=new sap.gantt.config.SettingItem({key:sap.gantt.config.SETTING_ITEM_ENABLE_TIME_SCROLL_SYNC_KEY,checked:true,displayText:this._oRb.getText("XCKL_TIME_SCROLL_SYNC"),tooltip:this._oRb.getText("TLTP_TIME_SCROLL_SYNC")});sap.gantt.config.DEFAULT_TOOLBAR_SETTING_ITEMS=[sap.gantt.config.SETTING_ITEM_ENABLE_NOW_LINE,sap.gantt.config.SETTING_ITEM_ENABLE_CURSOR_LINE,sap.gantt.config.SETTING_ITEM_ENABLE_VERTICAL_LINE,sap.gantt.config.SETTING_ITEM_ENABLE_ADHOC_LINE,sap.gantt.config.SETTING_ITEM_ENABLE_TIME_SCROLL_SYNC];sap.gantt.config.EMPTY_TOOLBAR_SCHEME_KEY="sap_empty_toolbar";sap.gantt.config.EMPTY_TOOLBAR_SCHEME=new sap.gantt.config.ToolbarScheme({key:sap.gantt.config.EMPTY_TOOLBAR_SCHEME_KEY,customToolbarItems:new sap.gantt.config.ToolbarGroup({position:"L1",overflowPriority:sap.m.OverflowToolbarPriority.High})});sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY="sap_container_toolbar";sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME=new sap.gantt.config.ToolbarScheme({key:sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY,customToolbarItems:new sap.gantt.config.ToolbarGroup({position:"L1",overflowPriority:sap.m.OverflowToolbarPriority.High}),timeZoom:new sap.gantt.config.TimeZoomGroup({position:"R2",overflowPriority:sap.m.OverflowToolbarPriority.NeverOverflow}),settings:new sap.gantt.config.SettingGroup({position:"R1",overflowPriority:sap.m.OverflowToolbarPriority.Low,items:sap.gantt.config.DEFAULT_TOOLBAR_SETTING_ITEMS})});sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEME_KEY="sap_ganttchart_toolbar";sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEME=new sap.gantt.config.ToolbarScheme({key:sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEME_KEY,customToolbarItems:new sap.gantt.config.ToolbarGroup({position:"L2",overflowPriority:sap.m.OverflowToolbarPriority.High}),expandTree:new sap.gantt.config.ToolbarGroup({position:"L3",overflowPriority:sap.m.OverflowToolbarPriority.Low})});sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEMES=[sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEME,sap.gantt.config.EMPTY_TOOLBAR_SCHEME];sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEMES=[sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME,sap.gantt.config.EMPTY_TOOLBAR_SCHEME];sap.gantt.config.DEFAULT_HIERARCHY_KEY="sap_hierarchy";sap.gantt.config.DEFAULT_HIERARCHY=new sap.gantt.config.Hierarchy();sap.gantt.config.DEFAULT_HIERARCHYS=[sap.gantt.config.DEFAULT_HIERARCHY];sap.gantt.config.DEFAULT_CONTAINER_SINGLE_LAYOUT_KEY="sap_container_layout_single";sap.gantt.config.DEFAULT_CONTAINER_SINGLE_LAYOUT=new sap.gantt.config.ContainerLayout({key:sap.gantt.config.DEFAULT_CONTAINER_SINGLE_LAYOUT_KEY,text:this._oRb.getText("XLST_SINGLE_LAYOUT"),toolbarSchemeKey:sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY,ganttChartLayouts:[new sap.gantt.config.GanttChartLayout({activeModeKey:sap.gantt.config.DEFAULT_MODE_KEY,hierarchyKey:sap.gantt.config.DEFAULT_HIERARCHY_KEY})]});sap.gantt.config.DEFAULT_CONTAINER_DUAL_LAYOUT_KEY="sap_container_layout_dual";sap.gantt.config.DEFAULT_CONTAINER_DUAL_LAYOUT=new sap.gantt.config.ContainerLayout({key:sap.gantt.config.DEFAULT_CONTAINER_DUAL_LAYOUT_KEY,text:this._oRb.getText("XLST_DUAL_LAYOUT"),toolbarSchemeKey:sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY,ganttChartLayouts:[new sap.gantt.config.GanttChartLayout({activeModeKey:sap.gantt.config.DEFAULT_MODE_KEY,hierarchyKey:sap.gantt.config.DEFAULT_HIERARCHY_KEY}),new sap.gantt.config.GanttChartLayout({activeModeKey:sap.gantt.config.DEFAULT_MODE_KEY,hierarchyKey:sap.gantt.config.DEFAULT_HIERARCHY_KEY})]});sap.gantt.config.DEFAULT_CONTAINER_LAYOUTS=[sap.gantt.config.DEFAULT_CONTAINER_SINGLE_LAYOUT,sap.gantt.config.DEFAULT_CONTAINER_DUAL_LAYOUT];sap.gantt.config.DEFAULT_LOCALE_CET=new sap.gantt.config.Locale({timeZone:"CET",utcdiff:"000000",utcsign:"+"});sap.gantt.config.DEFAULT_EMPTY_OBJECT={};sap.gantt.DIMENSION_LEGEND_NIL="NIL";sap.gantt.MouseWheelZoomType={FineGranular:"FineGranular",Stepwise:"Stepwise",None:"None"};sap.gantt.GenericArray=D.createType('sap.gantt.GenericArray',{isValid:function(v){if(typeof v==="string"||v instanceof String){return true;}if(Array.isArray(v)){for(var i=0;i<v.length;i++){if(!(typeof v[i]==="string"||v[i]instanceof String||typeof v[i]==="object")){return false;}}return true;}return false;},parseValue:function(v){if(v){if(Array.isArray(v)){return v;}else if(typeof v==="string"){var V;if(v.indexOf("[")>-1&&v.indexOf("{")>-1){v=v.replace(/\'/g,"\"");V=JSON.parse(v);}else{if(v.indexOf("[")>-1){var r=/^\[(.*)\]$/g;var m=r.exec(v);if(m){v=m[1];}}V=v.split(",");for(var i=0;i<V.length;i++){V[i]=V[i].trim();}}return V;}}return v;}},D.getType("any"));sap.gantt.dragdrop.GhostAlignment={Start:"Start",None:"None",End:"End"};sap.gantt.simple.GanttChartWithTableDisplayType={Both:"Both",Chart:"Chart",Table:"Table"};sap.gantt.simple.ContainerToolbarPlaceholderType={BirdEyeButton:"BirdEyeButton",DisplayTypeButton:"DisplayTypeButton",LegendButton:"LegendButton",SettingButton:"SettingButton",Spacer:"Spacer",TimeZoomControl:"TimeZoomControl"};sap.gantt.DragOrientation={Horizontal:"Horizontal",Vertical:"Vertical",Free:"Free"};return sap.gantt;});
