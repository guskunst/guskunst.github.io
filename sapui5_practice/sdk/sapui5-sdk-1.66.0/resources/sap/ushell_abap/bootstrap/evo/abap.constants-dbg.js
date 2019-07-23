// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([

], function () {
    'use strict';

    return {
        defaultUshellConfig: {
            "defaultRenderer": "fiori2",
            "ushell": {
                "home": {
                    "tilesWrappingType": "Hyphenated"
                }
            },
            "renderers": {
                "fiori2" : {
                    "componentData": {
                        "config": {
                            "sessionTimeoutReminderInMinutes": 5,
                            "sessionTimeoutIntervalInMinutes": 30,
                            "enableAutomaticSignout":true,
                            "enablePersonalization": true,
                            "enableTagFiltering": false,
                            "enableSearch": true,
                            "enableTilesOpacity": false,
                            "enableSetTheme": true,
                            "enableAccessibility": true,
                            "enableHelp" : false,
                            "enableUserDefaultParameters": true,
                            "preloadLibrariesForRootIntent": false,
                            "enableBackGroundShapes": true,
                            "enableNotificationsUI": false,
                            "enableRecentActivity": true,
                            "tilesWrappingType": "Hyphenated",
                            "applications": {
                                "Shell-home" : {
                                    "enableActionModeMenuButton": true,
                                    "enableEasyAccess": true,
                                    "enableTileActionsIcon": false,
                                    "enableHideGroups": false,
                                    "enableTilesOpacity": false
                                }
                            },
                            "rootIntent": "Shell-home"
                        }
                    }
                }
            },
            "services": {
                "Personalization": {
                    "config": {
                        "appVariantStorage": {
                            "enabled": true,
                            "adapter": {
                                "module": "sap.ushell.adapters.AppVariantPersonalizationAdapter"
                            }
                        }
                    }
                },
                "CrossApplicationNavigation" : {
                    "config" : {
                        "sap-ushell-enc-test" : false
                    }
                },
                "NavTargetResolution" : {
                    "config" : {
                        "runStandaloneAppFolderWhitelist": {
                            "*" : false,
                            "/sap/bc/ui5_ui5/" : true,
                            "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/" : true
                        },
                        "enableClientSideTargetResolution": true
                    }
                },
                "Ui5ComponentLoader" : {
                    "config" : {
                        "amendedLoading" : true
                    }
                },
                "ShellNavigation" : {
                    "config" : {
                        "reload" : false
                    }
                },
                "UserDefaultParameterPersistence" : {
                    "adapter": {
                        "module" : "sap.ushell.adapters.local.UserDefaultParameterPersistenceAdapter"
                    }
                },
                "EndUserFeedback": {
                    "config": {
                        "enabled": true
                    }
                },
                "Notifications": {
                    "config": {
                        "enabled": false,
                        "serviceUrl": "/sap/opu/odata4/iwngw/notification/default/iwngw/notification_srv/0001",
                        "webSocketUrl": "/sap/bc/apc/iwngw/notification_push_apc",
                        "pollingIntervalInSeconds": 30,
                        "enableNotificationsPreview": false
                    }
                },
                "AllMyApps": {
                    "config": {
                        "enabled": true,
                        "showHomePageApps": true,
                        "showCatalogApps": true
                    }
                }
            },
            // platform specific (ABAP) launchpad configuration
            "launchpadConfiguration" :  {
                "configurationFile" : {
                    "sap-ushell-config-url" : undefined, // optionally define a hard coded absolute or relative path here (prevents using url filename!)
                    "configurationFileFolderWhitelist": {
                        "" : true,
                        "cfg/" : true,
                        "cfg/sap/" : true,
                        "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/" : true,
                        "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/cfg/" : true,
                        "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/cfg/sap/" : true,
                        "/sap/ushell_config/" : true,
                        "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/LaunchpadConfigFileExamples/" : true,
                        "/resources/sap/dfa/help/sap/cfg/" : true,
                        "/sap/bc/ui5_ui5/ui2/ushell_me/sap/ushell/me/" : true
                    }
                }
            },
            "xhrLogon": {
                // configuration for XHR-Logon mode - possible values: "frame", "window", "reload"
                // default is "frame" which performs the XHR-Logon in an iframe
                // if set to "window" the XHR login is performed in a new browser window.
                // if set to "reload", a "session expired" error message is shown and the page is reloaded
                // See SAP Note 2193513 for details.
                "mode": "frame"
            },
            "bootstrapPlugins": {
                "UiAdaptationPersonalization": {
                    component: "sap.ushell.plugins.rta-personalize",
                    enabled: false
                }
            },
            "ui5": {
                "libs": {
                    "sap.ui.core": true,
                    "sap.m": true,
                    "sap.ushell": true
                }
            }
        }
    };

});