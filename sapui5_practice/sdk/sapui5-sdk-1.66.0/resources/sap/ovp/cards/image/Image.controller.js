sap.ui.define(["sap/ovp/cards/generic/Card.controller","jquery.sap.global"],function(C,q){"use strict";return C.extend("sap.ovp.cards.image.Image",{onInit:function(){C.prototype.onInit.apply(this,arguments);},onImagePress:function(e){this.doNavigation(e.getSource().getBindingContext());}});});
