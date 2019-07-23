jQuery.sap.declare("sap.zen.crosstab.DataArea");jQuery.sap.require("sap.zen.crosstab.BaseArea");jQuery.sap.require("sap.zen.crosstab.rendering.RenderingConstants");
sap.zen.crosstab.DataArea=function(c){"use strict";sap.zen.crosstab.BaseArea.call(this,c);this.sAreaType=sap.zen.crosstab.rendering.RenderingConstants.TYPE_DATA_AREA;};
sap.zen.crosstab.DataArea.prototype=jQuery.sap.newObject(sap.zen.crosstab.BaseArea.prototype);
sap.zen.crosstab.DataArea.prototype.renderArea=function(r){this.renderContainerStructure(r,"sapzencrosstab-DataArea",this.oCrosstab.isVCutOff(),this.oCrosstab.isHCutOff());};
sap.zen.crosstab.DataArea.prototype.insertCell=function(c,r,C){sap.zen.crosstab.BaseArea.prototype.insertCell.call(this,c,r,C);if(C===this.oDataModel.getColCnt()-1&&c){c.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_LAST_IN_ROW);}if(r===this.oDataModel.getRowCnt()-1&&c){c.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_LAST_IN_COL);}};
sap.zen.crosstab.DataArea.prototype.getSelectedCellsByHeaderSelection=function(h,r){var R={};var a=h.getArea();if(a.isRowHeaderArea()){var s=h.getRow();var e=0;var S=0;var c=0;if(!r){e=Math.min((s+h.getRowSpan()),(this.getRenderStartRow()+this.getRenderRowCnt()));S=this.getRenderStartCol();c=this.getRenderColCnt();}else{e=s+h.getRowSpan();}for(var i=s;i<e;i++){var C=this.oDataModel.getAllLoadedCellsByRow(this,i);for(var j=0;j<C.length;j++){R[C[j].getId()]=C[j];}}}else if(a.isColHeaderArea()){var S=h.getCol();var E=0;var s=0;var b=0;if(!r){E=Math.min((S+h.getColSpan()),(this.getRenderStartCol()+this.getRenderColCnt()));s=this.getRenderStartRow();b=this.getRenderRowCnt();}else{E=S+h.getColSpan();}for(var i=S;i<E;i++){var d=this.oDataModel.getAllLoadedCellsByCol(this,i);for(var j=0;j<d.length;j++){R[d[j].getId()]=d[j];}}}return R;};