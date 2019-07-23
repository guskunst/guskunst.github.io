// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log"],function(B){"use strict";var h=[];var v=true;var c="FLPScheduler";var l={getHistory:function(){return h;},verboseOn:function(){v=true;return(v===true);},verboseOff:function(){v=false;return(v===false);},isVerboseOn:function(){return(v===true);},clearHistory:function(){h.length=0;},dumpHistory:function(i){var _=i===undefined?h:h.filter(function(e){return e.id===i;});console.table(_);return _;},logError:function(t){B.error(this.stateToString(t),undefined,c);h.push(t);return true;},logWarning:function(t){if(v){B.warning(this.stateToString(t),c);h.push(t);}return v;},logStatus:function(t){if(v){B.info(this.stateToString(t),c);h.push(t);}return v;},stateToString:function(s){return"FLP Bootstrap Scheduling Agent :: "+s.type+" '"+s.id+"' /"+s.status+((s.remark)?"/ : "+s.remark:"/");}};return l;},false);
