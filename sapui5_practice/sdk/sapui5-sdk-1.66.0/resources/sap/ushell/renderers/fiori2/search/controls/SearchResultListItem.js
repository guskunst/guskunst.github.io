// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(['sap/ushell/renderers/fiori2/search/controls/SearchText','sap/ushell/renderers/fiori2/search/controls/SearchLink','sap/ushell/renderers/fiori2/search/controls/twitter/SearchTweet','sap/ushell/renderers/fiori2/search/SearchHelper','sap/ushell/renderers/fiori2/search/controls/SearchRelatedObjectsToolbar','sap/ushell/renderers/fiori2/search/SearchModel'],function(S,a,b,c,e,f){"use strict";var n='\u2013';return sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchResultListItem",{metadata:{properties:{dataSource:"object",itemId:"string",title:"string",titleDescription:"string",titleNavigation:"object",geoJson:"object",type:"string",imageUrl:"string",imageFormat:"string",imageNavigation:"object",attributes:{type:"object",multiple:true},navigationObjects:{type:"object",multiple:true},selected:"boolean",expanded:"boolean",parentListItem:"object",additionalParameters:"object",positionInList:"int",resultSetId:"string",layoutCache:"object",totalCountHiddenElement:"object"},aggregations:{_titleLink:{type:"sap.ushell.renderers.fiori2.search.controls.SearchLink",multiple:false,visibility:"hidden"},_titleLinkDescription:{type:"sap.ushell.renderers.fiori2.search.controls.SearchText",multiple:false,visibility:"hidden"},_titleDelimiter:{type:"sap.m.Text",multiple:false,visibility:"hidden"},_typeText:{type:"sap.ushell.renderers.fiori2.search.controls.SearchText",multiple:false,visibility:"hidden"},_typeLink:{type:"sap.ushell.renderers.fiori2.search.controls.SearchLink",multiple:false,visibility:"hidden"},_multiLineDescriptionText:{type:"sap.ushell.renderers.fiori2.search.controls.SearchText",multiple:false,visibility:"hidden"},_multiLineDescriptionTweet:{type:"sap.ushell.renderers.fiori2.search.controls.twitter.SearchTweet",multiple:false,visibility:"hidden"},_selectionCheckBox:{type:"sap.m.CheckBox",multiple:false,visibility:"hidden"},_expandButton:{type:"sap.m.Button",multiple:false,visibility:"hidden"},_attributeLabels:{type:"sap.m.Label",multiple:true,visibility:"hidden"},_attributeValues:{type:"sap.ui.core.Control",multiple:true,visibility:"hidden"},_attributeValuesWithoutWhyfoundHiddenTexts:{type:"sap.ui.core.InvisibleText",multiple:true,visibility:"hidden"},_relatedObjectActionsToolbar:{type:"sap.ushell.renderers.fiori2.search.controls.SearchRelatedObjectsToolbar",multiple:false,visibility:"hidden"},_titleLabeledByText:{type:"sap.ui.core.InvisibleText",multiple:false,visibility:"hidden"}}},init:function(){var t=this;if(sap.ui.core.Control.prototype.init){sap.ui.core.Control.prototype.init.apply(this,arguments);}t.setAggregation("_titleLink",new a({}).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-Title").addStyleClass("sapUshellSearchResultListItem-MightOverflow").attachPress(function(E){var p=t._getPhoneSize();var w=$(window).width();if(w<=p){E.preventDefault();E.cancelBubble();t._performTitleNavigation();}else{t._performTitleNavigation({trackingOnly:true});}}));t.setAggregation("_titleLinkDescription",new S({}).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleDescription").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));var d=new sap.m.Text({text:"|"});d.addEventDelegate({onAfterRendering:function(g){$(this.getDomRef()).attr("aria-hidden","true");}.bind(d)});t.setAggregation("_titleDelimiter",d.addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleDelimiter").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));t.setAggregation("_typeText",new S().addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleCategory").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));t.setAggregation("_typeLink",new sap.ushell.renderers.fiori2.search.controls.SearchLink({}).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleCategoryLink").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));t.setAggregation("_multiLineDescriptionText",new S({maxLines:5}).addStyleClass("sapUshellSearchResultListItem-MultiLineDescription").addStyleClass("sapUshellSearchResultListItem-MightOverflow").data("islongtext","true",true));t.setAggregation("_multiLineDescriptionTweet",new b({}).addStyleClass("sapUshellSearchResultListItem-MultiLineDescription").addStyleClass("sapUshellSearchResultListItem-MightOverflow").data("islongtext","true",true));t.setAggregation("_selectionCheckBox",new sap.m.CheckBox({select:function(E){t.setProperty("selected",E.getParameters().selected,true);}}));t.setAggregation("_expandButton",new sap.m.Button({type:sap.m.ButtonType.Transparent,press:function(E){t.toggleDetails();}}));t.setAggregation("_relatedObjectActionsToolbar",new e().addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar"));t.setAggregation("_titleLabeledByText",new sap.ui.core.InvisibleText());},renderer:function(r,C){C._renderer(r);},_renderer:function(r){this._registerItemPressHandler();this._resetPrecalculatedValues();this._renderContainer(r);this._renderAccessibilityInformation(r);},_renderContainer:function(r){var t=this;r.write('<div');r.writeControlData(t);r.addClass("sapUshellSearchResultListItem-Container");if(t.getImageUrl()){r.addClass("sapUshellSearchResultListItem-WithImage");}if(t.getImageFormat()&&t.getImageFormat().toLowerCase()==="documentthumbnail"){r.addClass("sapUshellSearchResultListItem-Document");}r.writeClasses();r.write('>');t._renderContentContainer(r);t._renderExpandButtonContainer(r);r.write('</div>');},_renderContentContainer:function(r){r.write('<div class="sapUshellSearchResultListItem-Content">');this._renderTitleContainer(r);this._renderAttributesContainer(r);r.write('</div>');},_renderExpandButtonContainer:function(r){var t=this;r.write('<div class="sapUshellSearchResultListItem-ExpandButtonContainer">');r.write('<div class="sapUshellSearchResultListItem-ExpandButton">');var i,d;var g=t.getProperty("expanded");if(g){i=sap.ui.core.IconPool.getIconURI("slim-arrow-up");d=sap.ushell.resources.i18n.getText("hideDetailBtn_tooltip");}else{i=sap.ui.core.IconPool.getIconURI("slim-arrow-down");d=sap.ushell.resources.i18n.getText("showDetailBtn_tooltip");}var h=t.getAggregation("_expandButton");h.setIcon(i);h.setTooltip(d);h.addEventDelegate({onAfterRendering:function(){t.setAriaExpandedState();}});r.renderControl(h);r.write('</div>');r.write('</div>');},_renderTitleContainer:function(r){var t=this;r.write('<div class="sapUshellSearchResultListItem-TitleAndImageContainer">');r.write('<div class="sapUshellSearchResultListItem-TitleContainer">');t._renderCheckbox(r);var d="";var g;var h=t.getAggregation("_titleLink");var i=t.getTitle();if(!i||i.trim().length===0){i=n;}else{var j=t.getTitleNavigation();if(j){d=j.getHref();g=j.getTarget();}h.setHref(d);if(g){h.setTarget(g);}}h.setText(i);if(d.length===0){h.setEnabled(false);}h.addEventDelegate({onAfterRendering:function(){t.forwardEllipsis($(h.getDomRef()));}});r.renderControl(h);var k=t.getTitleDescription();if(k&&k.trim().length>0){var l=t.getAggregation("_titleLinkDescription");l.setText(k);r.renderControl(l);}var m=t.getAggregation("_titleDelimiter");r.renderControl(m);if(!t.getModel().config._eshClickableObjectType||t.getModel().getDataSource()===t.getDataSource()){var o=t.getAggregation("_typeText");o.setText(t.getType());r.renderControl(o);}else{var u=this.getModel().getProperty('/uiFilter').clone();u.setDataSource(t.getDataSource());var p=t.getModel().searchUrlParser.renderFromParameters(this.getModel().boTopDefault,u,true);var q=t.getAggregation("_typeLink");q.setText(t.getType());q.setHref(p);q.setTooltip(sap.ushell.resources.i18n.getText("searchInDataSourceTooltip",[t.getDataSource().labelPlural]));r.renderControl(q);}r.write('</div>');t._renderImageForPhone(r);r.write('</div>');},_renderCheckbox:function(r){var t=this;r.write('<div class="sapUshellSearchResultListItem-CheckboxExpandContainer">');r.write('<div class="sapUshellSearchResultListItem-CheckboxContainer">');r.write('<div class="sapUshellSearchResultListItem-CheckboxAlignmentContainer">');var d=t.getAggregation("_selectionCheckBox");var s=t.getProperty("selected");d.setSelected(s);r.renderControl(d);r.write('</div>');r.write('</div>');r.write('</div>');},_renderImageForPhone:function(r){var t=this;if(t.getImageUrl()){r.write('<div class="sapUshellSearchResultListItem-TitleImage');if(this.getImageFormat()==="round"){r.write(" sapUshellSearchResultListItem-ImageContainerRound");}r.write('">');r.write('<div class="sapUshellSearchResultListItem-ImageContainerAlignmentHelper"></div>');r.write('<img class="sapUshellSearchResultListItem-Image" src="');r.write(t.getImageUrl());r.write('">');r.write('</div>');}},_renderImageForDocument:function(r){var t=this;if(t.getImageFormat()&&t.getImageFormat().toLowerCase()==="documentthumbnail"){var i=this.getImageNavigation();var d=i?i.getHref():"";var g,h;if(d&&d.length>0){g='<a href="'+d+'"';h='</a>';}else{g='<div';h='</div>';}r.write('<div class="sapUshellSearchResultListItem-DocumentThumbnailContainer">');r.write(g+' class="sapUshellSearchResultListItem-DocumentThumbnailBorder">');r.write('<div class="sapUshellSearchResultListItem-DocumentThumbnail-DogEar"></div>');var z=new sap.ui.core.Icon({src:sap.ui.core.IconPool.getIconURI("search"),useIconTooltip:false});z.addStyleClass("sapUshellSearchResultListItem-DocumentThumbnailZoomIcon");r.renderControl(z);var j=t.getImageUrl();if(j&&j.length>0){r.write('<img class="sapUshellSearchResultListItem-DocumentThumbnail" src="');r.write(t.getImageUrl());r.write('">');}r.write(h);r.write('</div>');}},_cutDescrAttributeOutOfAttributeList:function(){var d=this.getAttributes();for(var i=0;i<d.length;i++){var g=d[i];if(g.longtext){d.splice(i,1);this.setAttributes(d);return g;}}return undefined;},_renderMultiLineDescription:function(r){var t=this;if(t.getImageFormat()&&t.getImageFormat().toLowerCase()==="documentthumbnail"){var d=this._cutDescrAttributeOutOfAttributeList();if(d&&d.value&&d.value.length>0){var g;if(this._isTweet(d)){g=t.getAggregation("_multiLineDescriptionTweet");}else{g=t.getAggregation("_multiLineDescriptionText");}g.setText(d.value);if(d.whyfound){g.data("ishighlighted","true",true);}else{g.data("ishighlighted","false",true);}if(d.valueWithoutWhyfound){var h=new sap.ui.core.InvisibleText({});h.setText(d.valueWithoutWhyfound);g.data("tooltippedBy",h.getId(),true);g.addEventDelegate({onAfterRendering:function(){var i=$(g.getDomRef());i.attr("aria-describedby",i.attr("data-tooltippedby"));}});t.addAggregation("_attributeValuesWithoutWhyfoundHiddenTexts",h,true);r.renderControl(h);}r.renderControl(g);}else{r.write('<div class="sapUshellSearchResultListItem-MultiLineDescription"></div>');}}},_renderAttributesContainer:function(r){var t=this;r.write('<div class="sapUshellSearchResultListItem-AttributesExpandContainer');var d=t.getProperty("expanded");if(d){r.write(" sapUshellSearchResultListItem-AttributesExpanded");}r.write('">');r.write('<div class="sapUshellSearchResultListItem-AttributesAndActions">');t._renderImageForDocument(r);t._renderMultiLineDescription(r);r.write('<ul class="sapUshellSearchResultListItem-Attributes">');var i=t.getAttributes();t._renderImageAttribute(r,(i.length===0));t._renderAllAttributes(r,i);r.write('<li class="sapUshellSearchResultListItem-ExpandSpacerAttribute" aria-hidden="true"></li>');r.write('</ul>');t._renderRelatedObjectsToolbar(r);r.write('</div>');r.write('</div>');},_renderAllAttributes:function(r,d){var t=this;if(d.length===0){r.write('<li class="sapUshellSearchResultListItem-GenericAttribute sapUshellSearchResultListItem-MainAttribute sapUshellSearchResultListItem-EmptyAttributePlaceholder" aria-hidden="true"></li>');return;}var g;var l;var v;var h;var j,m,o;var p;var q=this.getLayoutCache()||{};this.setLayoutCache(q,true);if(!q.attributes){q.attributes={};}var i=0,k,s=0;var u=4;var w=3;var x=[0,0,0];var y=[0,0,0,0];var z=2;var A=2;var B;var C=t.getImageFormat()&&t.getImageFormat().toLowerCase()==="documentthumbnail";var D=t.getImageUrl()&&!C;if(C){u=w=2;x=y=[0,0];z=A=4;}var E=u*x.length;var F=w*y.length;if(D){E--;F--;x[0]++;y[0]++;}t.destroyAggregation("_attributeLabels");t.destroyAggregation("_attributeValues");t.destroyAggregation("_attributeValuesWithoutWhyfoundHiddenTexts");var G=function(M){return function(){var N=$(this.getDomRef());N.attr("aria-describedby",N.attr("data-tooltippedby"));}.bind(M);};for(;!(z<=0&&A<=0)&&i<d.length;i++){g=d[i];if(C&&s>=4){break;}if(g.isTitle){continue;}if(E<=0&&F<=0&&!g.whyfound){continue;}l=g.name;v=g.value;if(l===undefined||v===undefined){continue;}if(!v||v.trim().length===0){v=n;}o=g.longtext!==undefined&&g.longtext.length>0;h=g.valueWithoutWhyfound;var _=-1,H=-1,I={desktop:1,tablet:1};var J=q.attributes[g.key]||{};q.attributes[g.key]=J;r.write('<li class="sapUshellSearchResultListItem-GenericAttribute sapUshellSearchResultListItem-MainAttribute');if(o){B=J.longTextColumnNumber||t._howManyColumnsToUseForLongTextAttribute(h);J.longTextColumnNumber=B;I=B;r.write(' sapUshellSearchResultListItem-LongtextAttribute');}if(E<=0){if(g.whyfound&&z>0){r.write(' sapUshellSearchResultListItem-WhyFoundAttribute-Desktop');z--;}else{r.write(' sapUshellSearchResultListItem-DisplayNoneAttribute-Desktop');}}if(F<=0){if(g.whyfound&&A>0){r.write(' sapUshellSearchResultListItem-WhyFoundAttribute-Tablet');A--;}else{r.write(' sapUshellSearchResultListItem-DisplayNoneAttribute-Tablet');}}if(o&&D&&x[0]===1){H=0;B=J.longTextColumnNumber.desktop<u?J.longTextColumnNumber.desktop:u-1;x[0]+=B;E-=B;}else{for(k=0;k<x.length;k++){if(x[k]+I.desktop<=u){x[k]+=I.desktop;E-=I.desktop;H=k;break;}}}if(H<0){H=x.length;}if(o&&D&&y[0]===1){_=0;B=J.longTextColumnNumber.tablet<w?J.longTextColumnNumber.tablet:w-1;y[0]+=B;F-=B;}else{for(k=0;k<y.length;k++){if(y[k]+I.tablet<=w){y[k]+=I.tablet;F-=I.tablet;_=k;break;}}}if(_<0){_=y.length;}r.write(' sapUshellSearchResultListItem-OrderTablet-'+_);r.write(' sapUshellSearchResultListItem-OrderDesktop-'+H);r.write('"');if(o){r.write(' data-sap-searchresultitem-attributeweight-desktop="'+I.desktop+'"');r.write(' data-sap-searchresultitem-attributeweight-tablet="'+I.tablet+'"');}r.write('>');j=new sap.m.Label({displayOnly:true});j.setText(l);j.addStyleClass("sapUshellSearchResultListItem-AttributeKey");j.addStyleClass("sapUshellSearchResultListItem-MightOverflow");r.renderControl(j);r.write('<span class="sapUshellSearchResultListItem-AttributeValueContainer">');if(g.defaultNavigationTarget){m=new a();m.setHref(g.defaultNavigationTarget.getHref());m.setTarget(g.defaultNavigationTarget.getTarget());m.addStyleClass("sapUshellSearchResultListItem-AttributeLink");}else if(this._isTweet(g)){m=new b();}else{m=new S();}m.setText(v);m.addStyleClass("sapUshellSearchResultListItem-AttributeValue");m.addStyleClass("sapUshellSearchResultListItem-MightOverflow");if(g.whyfound){m.data("ishighlighted","true",true);m.addStyleClass("sapUshellSearchResultListItem-AttributeValueHighlighted");}if(o){m.data("islongtext","true",true);}if(h){p=new sap.ui.core.InvisibleText({});p.setText(h);m.data("tooltippedBy",p.getId(),true);m.addEventDelegate({onAfterRendering:G(m)});t.addAggregation("_attributeValuesWithoutWhyfoundHiddenTexts",p,true);r.renderControl(p);}r.renderControl(m);r.write('</span>');r.write('</li>');t.addAggregation("_attributeLabels",j,true);t.addAggregation("_attributeValues",m,true);s++;}if(D){var K=u-x[0];var L=w-y[0];if(K>0||L>0){r.write('<li class="sapUshellSearchResultListItem-GenericAttribute sapUshellSearchResultListItem-MainAttribute');r.write(' sapUshellSearchResultListItem-OrderTablet-0 sapUshellSearchResultListItem-OrderDesktop-0');r.write('"');r.write(' data-sap-searchresultitem-attributeweight-desktop="'+K+'"');r.write(' data-sap-searchresultitem-attributeweight-tablet="'+L+'"');r.write('></li>');}}},_isTweet:function(i){var m=sap.ushell.renderers.fiori2.search.getModelSingleton();return m.config._tweetAttribute===i.key;},_howManyColumnsToUseForLongTextAttribute:function(d){if(d.length<50){return{tablet:1,desktop:1};}if(d.length<85){return{tablet:2,desktop:2};}if(d.length<135){return{tablet:3,desktop:3};}return{tablet:3,desktop:4};},_renderImageAttribute:function(r,i){var t=this;if(!t.getImageUrl()||t.getImageFormat()&&t.getImageFormat().toLowerCase()==="documentthumbnail"){return;}r.write('<li class="sapUshellSearchResultListItem-GenericAttribute sapUshellSearchResultListItem-ImageAttribute');if(i){r.write(' sapUshellSearchResultListItem-LonelyImageAttribute');}r.write('">');r.write('<div class="sapUshellSearchResultListItem-ImageContainer');if(this.getImageFormat()==="round"){r.write(" sapUshellSearchResultListItem-ImageContainerRound");}r.write('">');if(t.getImageUrl()){r.write('<img class="sapUshellSearchResultListItem-Image');if(this.getImageFormat()==="round"){}r.write('" src="');r.write(t.getImageUrl());r.write('">');}if(this.getImageFormat()!=="round"){r.write('<div class="sapUshellSearchResultListItem-ImageContainerAlignmentHelper"></div>');}r.write('</div>');r.write('</li>');},_renderRelatedObjectsToolbar:function(r){var t=this;var d=t.getNavigationObjects();if(!d||d.length===0){return;}t._showExpandButton=true;var g=t.getAggregation("_relatedObjectActionsToolbar");g.setProperty("navigationObjects",d);g.setProperty("positionInList",this.getPositionInList());r.renderControl(g);},_renderAccessibilityInformation:function(r){var t=this;var p=t.getProperty("parentListItem");if(p){t._renderAriaDescriptionElementForTitle(r,true,true);p.addEventDelegate({onAfterRendering:function(d){var g=$(p.getDomRef());t._addAriaDescriptionToParentListElement(p,true);g.on("focusin",function(d){var h=$(d.relatedTarget);if(h.hasClass("sapUshellSearchResultListItem")||h.closest(".sapUshellSearchResultListItemApps").length>0&&!h.hasClass("sapUshellResultListMoreFooter")){t._renderAriaDescriptionElementForTitle(r,false,false);t._addAriaDescriptionToParentListElement(p,false);}else{t._renderAriaDescriptionElementForTitle(r,true,false);t._addAriaDescriptionToParentListElement(p,true);}});},onsapspace:function(E){if(E.target===E.currentTarget){t.toggleDetails();}},onsapenter:function(E){if(E.target===E.currentTarget){var d=t.getTitleNavigation();if(d){d.performNavigation();}}}});}},_renderAriaDescriptionElementForTitle:function(r,w,d){var t=this;t._searchResultListPrefix=t._searchResultListPrefix||sap.ushell.resources.i18n.getText("result_list_announcement_screenreaders");var l=t.getTitle()+", "+t.getType()+".";if(w){l=t._searchResultListPrefix+" "+l;}var g=t.getAggregation("_titleLabeledByText");g.setText(l);if(d){r.renderControl(g);}},_addAriaDescriptionToParentListElement:function(p,i){var t=this.getAggregation("_titleLabeledByText");var d=t.getId();if(i){var g=this.getTotalCountHiddenElement();if(g){d+=" "+g.getId();}}var h=$(p.getDomRef());h.attr("aria-labelledby",d);},_getExpandAreaObjectInfo:function(){var t=this;var r=$(t.getDomRef());r.addClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");var d=r.find(".sapUshellSearchResultListItem-AttributesExpandContainer");var g=r.find(".sapUshellSearchResultListItem-RelatedObjectsToolbar");var h=false;if(g.css("display")==="none"){g.css("display","block");h=true;}var i=d.height();var j=r.find(".sapUshellSearchResultListItem-AttributesAndActions").height();r.removeClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");if(h){g.css("display","");}var k=this._getElementsInExpandArea();var l=200;var m=l/10;var o={resultListItem:r,attributesExpandContainer:d,currentHeight:i,expandedHeight:j,elementsToFadeInOrOut:k,expandAnimationDuration:l,fadeInOrOutAnimationDuration:m,relatedObjectsToolbar:g};return o;},_getElementsInExpandArea:function(){var t=this;var d=$(t.getDomRef());var g=[];d.addClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");var h=d.find(".sapUshellSearchResultListItem-GenericAttribute:not(.sapUshellSearchResultListItem-ImageAttribute)");if(h.length>0){var i=h.position().top;h.each(function(){if($(this).position().top>i){g.push(this);}});}d.removeClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");return g;},isShowingDetails:function(){var d=this._getExpandAreaObjectInfo();if(d.currentHeight<d.expandedHeight){return false;}return true;},showDetails:function(d){var t=this;if(t.isShowingDetails()){return;}var g=this._getExpandAreaObjectInfo();g.relatedObjectsToolbar.css("opacity",0);g.relatedObjectsToolbar.css("display","block");var r=t.getAggregation("_relatedObjectActionsToolbar");if(r){r._layoutToolbarElements();}t.forwardEllipsis($(t.getDomRef()).find(".sapUshellSearchResultListItem-Title, .sapUshellSearchResultListItem-AttributeKey, .sapUshellSearchResultListItem-AttributeValueHighlighted"));$(t.getDomRef()).addClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");var h,s=false;var i=g.attributesExpandContainer.animate({"height":g.expandedHeight},{"duration":g.expandAnimationDuration,"progress":function(j,p,k){if(!s&&p>0.5){h=g.relatedObjectsToolbar.animate({"opacity":1},k).promise();s=true;jQuery.when(i,h).done(function(){t.setProperty("expanded",true,true);$(this).addClass("sapUshellSearchResultListItem-AttributesExpanded");$(this).css("height","");$(g.elementsToFadeInOrOut).css("opacity","");$(t.getDomRef()).removeClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");var l=sap.ui.core.IconPool.getIconURI("slim-arrow-up");var m=t.getAggregation("_expandButton");m.setTooltip(sap.ushell.resources.i18n.getText("hideDetailBtn_tooltip"));m.setIcon(l);m.rerender();g.relatedObjectsToolbar.css("display","");g.relatedObjectsToolbar.css("opacity","");}.bind(this));}}}).promise();$(g.elementsToFadeInOrOut).animate({"opacity":1},g.fadeInOrOutAnimationDuration);},hideDetails:function(d){var t=this;var r=$(t.getDomRef());if(!t.isShowingDetails()){return;}var g=this._getExpandAreaObjectInfo();g.relatedObjectsToolbar.css("opacity",1);g.relatedObjectsToolbar.animate({"opacity":0},g.expandAnimationDuration/2);var h=r.find(".sapUshellSearchResultListItem-MainAttribute").outerHeight(true)+r.find(".sapUshellSearchResultListItem-ExpandSpacerAttribute").outerHeight(true);var s=false;var i=g.attributesExpandContainer.animate({"height":h},{"duration":g.expandAnimationDuration,"progress":function(j,p,k){if(!s&&k<=g.fadeInOrOutAnimationDuration){s=true;var l=$(g.elementsToFadeInOrOut).animate({"opacity":0},g.fadeInOrOutAnimationDuration).promise();jQuery.when(i,l).done(function(){t.setProperty("expanded",false,true);g.attributesExpandContainer.removeClass("sapUshellSearchResultListItem-AttributesExpanded");$(g.elementsToFadeInOrOut).css("opacity","");g.relatedObjectsToolbar.css("opacity","");var m=sap.ui.core.IconPool.getIconURI("slim-arrow-down");var o=t.getAggregation("_expandButton");o.setTooltip(sap.ushell.resources.i18n.getText("showDetailBtn_tooltip"));o.setIcon(m);o.rerender();});}}}).promise();},toggleDetails:function(d){var g;var m=sap.ushell.renderers.fiori2.search.getModelSingleton();if(this.isShowingDetails()){g=m.eventLogger.ITEM_HIDE_DETAILS;this.hideDetails(d);}else{g=m.eventLogger.ITEM_SHOW_DETAILS;this.showDetails(d);}m.eventLogger.logEvent({type:g,itemPosition:this.getPositionInList(),executionId:this.getResultSetId()});},isSelectionModeEnabled:function(){var t=this;var i=false;var s=$(t.getDomRef()).find(".sapUshellSearchResultListItem-multiSelect-selectionBoxContainer");if(s){i=s.css("opacity")>0;}return i;},enableSelectionMode:function(d){var t=this;var s=$(t.getDomRef()).find(".sapUshellSearchResultListItem-multiSelect-innerContainer");var g=s.find(".sapUshellSearchResultListItem-multiSelect-selectionBoxContainer");var h=200;var i=false;s.animate({width:"2rem"},{"duration":h,"progress":function(j,p,r){if(!i&&p>0.5){g.css("display","");g.animate({opacity:"1.0"},h/2);i=true;}}});},disableSelectionMode:function(d){var t=this;var s=$(t.getDomRef()).find(".sapUshellSearchResultListItem-multiSelect-innerContainer");var g=s.find(".sapUshellSearchResultListItem-multiSelect-selectionBoxContainer");var h=200;g.animate({opacity:"0.0"},h/2,function(){g.css("display","none");});s.animate({width:"0"},h);},toggleSelectionMode:function(d){if(this.isSelectionModeEnabled()){this.disableSelectionMode(d);}else{this.enableSelectionMode(d);}},onAfterRendering:function(){var t=this;var d=$(t.getDomRef());t._showOrHideExpandButton();t._setListItemStatusBasedOnWindowSize();t.forwardEllipsis(d.find(".sapUshellSearchResultListItem-Title, .sapUshellSearchResultListItem-AttributeKey, .sapUshellSearchResultListItem-AttributeValueHighlighted"));c.attachEventHandlersForTooltip(t.getDomRef());},resizeEventHappened:function(){var t=this;var d=$(t.getDomRef());t._showOrHideExpandButton();t._setListItemStatusBasedOnWindowSize();t.getAggregation("_titleLink").rerender();t.forwardEllipsis(d.find(".sapUshellSearchResultListItem-Title, .sapUshellSearchResultListItem-AttributeKey, .sapUshellSearchResultListItem-AttributeValueHighlighted"));},_getPhoneSize:function(){return 767;},_resetPrecalculatedValues:function(){this._visibleAttributes=undefined;this._detailsArea=undefined;this._showExpandButton=false;},_setListItemStatusBasedOnWindowSize:function(){var w=window.innerWidth;var p=this.getParentListItem();if(this.getTitleNavigation()&&w<=this._getPhoneSize()){p.setType(sap.m.ListType.Active);}else{p.setType(sap.m.ListType.Inactive);}},_showOrHideExpandButton:function(){var t=this;var d=$(t.getDomRef());var g=d.find(".sapUshellSearchResultListItem-ExpandButtonContainer");var i=g.css("visibility")!=="hidden";var s=false;var h=d.find(".sapUshellSearchResultListItem-RelatedObjectsToolbar");s=h.length>0;var j=t.getImageFormat()&&t.getImageFormat().toLowerCase()==="documentthumbnail";if(!j&&!s){var k=t._getElementsInExpandArea();if(k.length>0){s=true;}}if(i&&!s){g.css("visibility","hidden");g.attr("aria-hidden","true");t.setAriaExpandedState();}else if(!i&&s){g.css("visibility","");g.removeAttr("aria-hidden");t.setAriaExpandedState();}},setAriaExpandedState:function(){var t=this;var d=t.getAggregation("_expandButton");var g=$(d.getDomRef());var h=$(t.getDomRef());var i=t.getParentListItem()?$(t.getParentListItem().getDomRef()):h.closest("li");var j=h.find(".sapUshellSearchResultListItem-ExpandButtonContainer");if(j.css("visibility")==="hidden"){g.removeAttr("aria-expanded");i.removeAttr("aria-expanded");}else{var k=t.getProperty("expanded");if(k){g.attr("aria-expanded","true");i.attr("aria-expanded","true");}else{g.attr("aria-expanded","false");i.attr("aria-expanded","false");}}},_registerItemPressHandler:function(){var t=this;var p=t.getParentListItem();if(p){p.attachPress(function(d){t._performTitleNavigation();});t._registerItemPressHandler=function(){};}},_performTitleNavigation:function(p){var t=p&&p.trackingOnly||false;var d=this.getTitleNavigation();if(d){d.performNavigation({trackingOnly:t});}},forwardEllipsis:function(o){var g=$(this.getDomRef());g.addClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");o.each(function(i,d){c.forwardEllipsis4Whyfound(d);});g.removeClass("sapUshellSearchResultListItem-AttributesPrepareExpansion");}});});
