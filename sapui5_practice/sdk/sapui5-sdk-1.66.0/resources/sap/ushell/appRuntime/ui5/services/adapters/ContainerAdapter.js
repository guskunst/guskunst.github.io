// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/User"],function(U){"use strict";var C=function(s,p,a){var u;this.load=function(){u=new U({});return new jQuery.Deferred().resolve().promise();};this.getSystem=function(){return s;};this.getUser=function(){return u;};};return C;},true);
