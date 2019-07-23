/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Control'],function(q,l,C){"use strict";var b=C.extend("sap.ui.vbm.Cluster",{metadata:{library:"sap.ui.vbm",properties:{color:{type:"sap.ui.core.CSSColor",group:"Misc",defaultValue:null},icon:{type:"string",group:"Misc",defaultValue:null},text:{type:"string",group:"Misc",defaultValue:null},type:{type:"sap.ui.vbm.SemanticType",group:"Behavior",defaultValue:sap.ui.vbm.SemanticType.None}}}});b.prototype.exit=function(){};b.prototype.init=function(){};b.prototype.onAfterRendering=function(){if(this.$oldContent.length>0){this.$().append(this.$oldContent);}if(this.getColor()&&(this.getType()===sap.ui.vbm.SemanticType.None)){var a=this.getId()+"-"+"backgroundcircle",i=a+"-"+"innercircle";var c=document.getElementById(a),d=document.getElementById(i);var e=q(c).css("border-bottom-color");var r=this.string2rgba(e);r="rgba("+r[0]+","+r[1]+","+r[2]+","+0.5+")";c.style.borderColor=r;d.style.borderColor=r;}};b.prototype.onBeforeRendering=function(){this.$oldContent=sap.ui.core.RenderManager.findPreservedContent(this.getId());};b.prototype.string2rgba=function(a){var c;if((c=/^rgb\(([\d]+)[,;]\s*([\d]+)[,;]\s*([\d]+)\)/.exec(a))){return[+c[1],+c[2],+c[3],1.0,0];}else{return[94,105,110];}};return b;});
