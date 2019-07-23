/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/dt/plugin/ControlDragDrop','sap/ui/dt/Util','sap/ui/rta/plugin/RTAElementMover','sap/ui/rta/plugin/Plugin','sap/ui/rta/Utils'],function(C,D,R,P,U){"use strict";var a=C.extend("sap.ui.rta.plugin.DragDrop",{metadata:{library:"sap.ui.rta",properties:{commandFactory:{type:"object",multiple:false}},events:{dragStarted:{},elementModified:{command:{type:"sap.ui.rta.command.BaseCommand"}}}}});U.extendWith(a.prototype,P.prototype,function(d,s,p,m,S){return p!=="getMetadata";});a.prototype.init=function(){C.prototype.init.apply(this,arguments);this.setElementMover(new R({commandFactory:this.getCommandFactory()}));};a.prototype.setCommandFactory=function(c){this.setProperty("commandFactory",c);this.getElementMover().setCommandFactory(c);};a.prototype._isEditable=function(o,p){return this.getElementMover().isEditable(o,p.onRegistration);};a.prototype.registerElementOverlay=function(o){C.prototype.registerElementOverlay.apply(this,arguments);P.prototype.registerElementOverlay.apply(this,arguments);};a.prototype.deregisterElementOverlay=function(o){C.prototype.deregisterElementOverlay.apply(this,arguments);P.prototype.removeFromPluginsList.apply(this,arguments);};a.prototype.onDragStart=function(o){this.fireDragStarted();C.prototype.onDragStart.apply(this,arguments);this.getSelectedOverlays().forEach(function(o){o.setSelected(false);});o.$().addClass("sapUiRtaOverlayPlaceholder");};a.prototype.onDragEnd=function(o){this.getElementMover().buildMoveCommand().then(function(c){this.fireElementModified({"command":c});o.$().removeClass("sapUiRtaOverlayPlaceholder");o.setSelected(true);o.focus();C.prototype.onDragEnd.apply(this,arguments);}.bind(this)).catch(function(e){throw D.propagateError(e,"DragDrop#onDragEnd","Error accured during onDragEnd execution","sap.ui.rta.plugin");});};a.prototype.onMovableChange=function(o){C.prototype.onMovableChange.apply(this,arguments);};return a;},true);
