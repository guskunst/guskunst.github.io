sap.ui.define([
    "sap/ushell/services/LaunchPage",
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
],function (LaunchPage, AppRuntimeService) {
    "use strict";

    function LaunchPageProxy (oContainerInterface, sParameters, oServiceConfiguration) {
        LaunchPage.call(this, oContainerInterface, sParameters, oServiceConfiguration);

        this.getGroups = function () {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.getGroups");
        };

        this.getGroupsForBookmarks = function () {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.getGroupsForBookmarks");
        };

        this.getDefaultGroup = function () {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.getDefaultGroup");
        };

        this.addGroupAt = function (sTitle, iIndex) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.addGroupAt",
                {
                    "sTitle": sTitle,
                    "iIndex": iIndex
                }
            );
        };

        this.addGroup = function (sTitle) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.addGroup",
                {
                    "sTitle": sTitle
                }
            );
        };

        this.removeGroup = function (oGroup, iIndex) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.removeGroup",
                {
                    "oGroup": oGroup,
                    "iIndex": iIndex
                }
            );
        };

        this.resetGroup = function (oGroup, iIndex) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.resetGroup",
                {
                    "oGroup": oGroup,
                    "iIndex": iIndex
                }
            );
        };

        this.moveGroup = function (oGroup, iNewIndex) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.moveGroup",
                {
                    "oGroup": oGroup,
                    "iNewIndex": iNewIndex
                }
            );
        };

        this.setGroupTitle = function (oGroup, sTitle) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.setGroupTitle",
                {
                    "oGroup": oGroup,
                    "sTitle": sTitle
                }
            );
        };

        this.hideGroups = function (aHiddenGroupsIDs) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.hideGroups",
                {
                    "aHiddenGroupsIDs": aHiddenGroupsIDs
                }
            );
        };

        this.addTile = function (oCatalogTile, oGroup) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.addTile",
                {
                    "oCatalogTile": oCatalogTile,
                    "oGroup": oGroup
                }
            );
        };

        this.removeTile = function (oGroup, oTile, iIndex) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.removeTile",
                {
                    "oGroup": oGroup,
                    "oTile": oTile,
                    "iIndex": iIndex
                }
            );
        };

        this.moveTile = function (oTile, iSourceIndex, iTargetIndex, oSourceGroup, oTargetGroup, sNewTileType) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.moveTile",
                {
                    "oTile": oTile,
                    "iSourceIndex": iSourceIndex,
                    "iTargetIndex": iTargetIndex,
                    "oSourceGroup": oSourceGroup,
                    "oTargetGroup": oTargetGroup,
                    "sNewTileType": sNewTileType
                }
            );
        };

        this.getTileView = function (oTile) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.getTileView",
                {
                    "oTile": oTile
                }
            );
        };

        this.refreshTile = function (oTile) {
            AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.removeTile",
                {
                    "oTile": oTile
                }
            );
        };

        this.registerTileActionsProvider = function (fnProvider) {
            AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.registerTileActionsProvider",
                {
                    "fnProvider": fnProvider
                }
            );
        };

        this.getCatalogTiles = function (oCatalog) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.getCatalogTiles",
                {
                    "oCatalog": oCatalog
                }
            );
        };

        this.getCatalogTileViewControl = function (oCatalogTile) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.getCatalogTileViewControl",
                {
                    "oCatalogTile": oCatalogTile
                }
            );
        };

        this.addBookmark = function (oParameters, oGroup) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.addBookmark",
                {
                    "oParameters": oParameters,
                    "oGroup": oGroup
                }
            );
        };

        this.countBookmarks = function (sUrl) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.countBookmarks",
                {
                    "sUrl": sUrl
                }
            );
        };

        this.deleteBookmarks = function (sUrl) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.deleteBookmarks",
                {
                    "sUrl": sUrl
                }
            );
        };

        this.updateBookmarks = function (sUrl, oParameters) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.updateBookmarks",
                {
                    "sUrl": sUrl,
                    "oParameters": oParameters
                }
            );
        };

        this.setTileVisible = function (oTile, bNewVisible) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.LaunchPage.setTileVisible",
                {
                    "oTile": oTile,
                    "bNewVisible": bNewVisible
                }
            );
        };

        //Stubs
        this.isGroupRemovable = function (oGroup) {return true;};
        this.isGroupLocked = function (oGroup) {return false;};
        this.isGroupFeatured = function (oGroup) {return true;};
        this.isGroupVisible = function (oGroup) {return true;};
        this.isLinkPersonalizationSupported = function (oTile) {return true;};
        this.isTileIntentSupported = function (oTile) {return true;};
        this.isCatalogsValid = function () {return true;};
    }

    LaunchPageProxy.prototype = Object.create(LaunchPage.prototype);
    LaunchPageProxy.hasNoAdapter = LaunchPage.hasNoAdapter;

    return LaunchPageProxy;
}, false);
