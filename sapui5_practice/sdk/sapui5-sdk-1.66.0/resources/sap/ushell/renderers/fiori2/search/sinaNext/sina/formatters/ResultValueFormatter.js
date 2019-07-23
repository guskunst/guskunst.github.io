// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sinaDefine(['../../core/core','./Formatter'],function(c,F){"use strict";return F.derive({initAsync:function(){},format:function(r){return this._formatDataInUI5Form(r);},formatAsync:function(r){r=this._formatDataInUI5Form(r);return c.Promise.resolve(r);},_formatDataInUI5Form:function(r){if(!sap&&!sap.ui&&!sap.ui.core&&!sap.ui.core.format){return r;}var t=this;t.sina=r.sina;r.items.forEach(function(i){if(t.sina.getDataSource(i.dataSource.id)===undefined){return;}if(jQuery.isEmptyObject(t.sina.getDataSource(i.dataSource.id).attributeMetadataMap)){return;}t.attributeMap=t.sina.getDataSource(i.dataSource.id).attributeMetadataMap;i.titleAttributes.forEach(function(a){t._formatHybridAttribute(a);});i.titleDescriptionAttributes.forEach(function(a){t._formatHybridAttribute(a);});i.detailAttributes.forEach(function(a){t._formatHybridAttribute(a);});});return r;},_formatHybridAttribute:function(a){var t=this;if(a.attributes){for(var i=0;i<a.attributes.length;i++){t._formatSingleAttribute(a.attributes[i].attribute);}}if(a.description){var d=a.description;t._formatSingleAttribute(d);}if(t.attributeMap[a.id]){t._formatSingleAttribute(a);}},_formatSingleAttribute:function(a){var t=this;a.valueFormatted=t._getFormattedValue(a);a.valueHighlighted=a.valueFormatted;if(a.isHighlighted){a.valueHighlighted='<b>'+a.valueHighlighted+'</b>';}},_getFormattedValue:function(a){var t=this.sina.AttributeType;var u=undefined;var v=a.value;switch(this.attributeMap[a.id].type){case t.Integer:u=sap.ui.core.format.NumberFormat.getIntegerInstance();break;case t.Double:u=sap.ui.core.format.NumberFormat.getFloatInstance({"decimals":2});break;case t.Timestamp:if(isNaN(Date.parse(a.value))===false){u=sap.ui.core.format.DateFormat.getDateTimeInstance();}break;case t.Date:if(isNaN(Date.parse(a.value))===false){u=sap.ui.core.format.DateFormat.getDateInstance();v=new Date(a.value);}break;case t.Time:if(isNaN(Date.parse("1970/01/01 "+a.value))===false){u=sap.ui.core.format.DateFormat.getTimeInstance();v=new Date("1970/01/01 "+a.value);}break;}if(u&&u.format(v)!==undefined){return u.format(v);}return a.value;}});});
