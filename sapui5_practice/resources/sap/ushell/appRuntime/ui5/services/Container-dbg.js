// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/services/Container",
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
],function (oContainer, AppRuntimeService) {
    "use strict";

    function ContainerProxy () {
        var fnOrgSetDirtyFlag;

        this.bootstrap = function (sPlatform, mAdapterPackagesByPlatform) {
            return sap.ushell.bootstrap(sPlatform, mAdapterPackagesByPlatform).then(function (Container) {
                fnOrgSetDirtyFlag = sap.ushell.Container.setDirtyFlag;

                //override setDirtyFlag for delegation.
                sap.ushell.Container.setDirtyFlag = function (bIsDirty) {
                    //set local isDirty flage, so that it will reflet the real dirty state.
                    fnOrgSetDirtyFlag(bIsDirty);

                    //reflect the changes to the outer shell.
                    AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.services.ShellUIService.setDirtyFlag", {
                            "bIsDirty": bIsDirty
                        });
                };

                sap.ushell.Container.getFLPUrl = function (bIncludeHash) {
                    return AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.services.Container.getFLPUrl", {
                            "bIncludeHash": bIncludeHash
                        });
                };
            });
        };
    }

    return new ContainerProxy();
}, true);
