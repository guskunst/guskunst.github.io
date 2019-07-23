/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/changeHandler/Base","sap/ui/fl/Utils"],function(B,U){"use strict";var a={createRenameChangeHandler:function(r){r.changePropertyName=r.changePropertyName||"newText";return{applyChange:function(c,C,p){var m=p.modifier;var P=r.propertyName;var o=c.getDefinition();var t=o.texts[r.changePropertyName];var v=t.value;if(o.texts&&t&&typeof(v)==="string"){c.setRevertData(m.getPropertyBindingOrProperty(C,P));m.setPropertyBindingOrProperty(C,P,v);return true;}else{U.log.error("Change does not contain sufficient information to be applied: ["+o.layer+"]"+o.namespace+"/"+o.fileName+"."+o.fileType);}},revertChange:function(c,C,p){var m=p.modifier;var P=r.propertyName;var o=c.getRevertData();if(o||o===""){m.setPropertyBindingOrProperty(C,P,o);c.resetRevertData();return true;}else{U.log.error("Change doesn't contain sufficient information to be reverted. Most Likely the Change didn't go through applyChange.");}},completeChangeContent:function(c,s,p){var C=c.getDefinition();var b=r.changePropertyName;var t=r.translationTextType;var o=p.modifier.bySelector(c.getSelector(),p.appComponent);C.content.originalControlType=p.modifier.getControlType(o);if(typeof(s.value)==="string"){B.setTextInChange(C,b,s.value,t);}else{throw new Error("oSpecificChangeInfo.value attribute required");}}};}};return a;},true);
