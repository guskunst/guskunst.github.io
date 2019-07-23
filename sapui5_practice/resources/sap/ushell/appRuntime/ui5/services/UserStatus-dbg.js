sap.ui.define([
    "sap/ui/core/service/ServiceFactoryRegistry",
    "sap/ui/core/service/ServiceFactory",
    "sap/ui/core/service/Service",
    "../../../ui5service/_UserStatus/userstatus.class.factory",
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
],function (ServiceFactoryRegistry, ServiceFactory, Service, fnDefineClass, AppRuntimeService) {
    "use strict";

    var oService =  fnDefineClass({
        serviceRegistry: ServiceFactoryRegistry,
        serviceFactory: ServiceFactory,
        service: Service
    });

    var NewService = oService.extend("sap.ushell.appRuntime.services.UserStatus", {

    });

    return NewService;
}, true);
