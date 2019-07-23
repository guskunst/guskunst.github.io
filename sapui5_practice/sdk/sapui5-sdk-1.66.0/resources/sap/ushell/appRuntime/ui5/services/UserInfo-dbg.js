sap.ui.define([
    "sap/ushell/services/UserInfo",
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
],function (UserInfo, AppRuntimeService) {
    "use strict";

    function UserInfoProxy (oAdapter, oContainerInterface) {
        UserInfo.call(this, oAdapter, oContainerInterface);

        this.getUser =  function () {
            jQuery.sap.log.warning("'UserInfo.getUser' is private API and should not be called");
        };

        this.getThemeList = function () {
            jQuery.sap.log.warning("'UserInfo.getThemeList' is private API and should not be called");
        };

        this.updateUserPreferences = function () {
            jQuery.sap.log.warning("'UserInfo.updateUserPreferences' is private API and should not be called");
        };

        this.getLanguageList = function () {
            jQuery.sap.log.warning("'UserInfo.getLanguageList' is private API and should not be called");
        };
    }

    UserInfoProxy.prototype = Object.create(UserInfo.prototype);
    UserInfoProxy.hasNoAdapter = UserInfo.hasNoAdapter;

    return UserInfoProxy;
}, true);
