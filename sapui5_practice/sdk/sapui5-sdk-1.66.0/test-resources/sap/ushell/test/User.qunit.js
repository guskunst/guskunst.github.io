// Copyright (c) 2014 SAP AG, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap/ushell/User.js
 */
(function () {
    "use strict";
    /*jslint nomen: true*/
    /*global deepEqual, module, ok, sap, test, strictEqual, jQuery, sinon, throws */

    jQuery.sap.require("sap.ushell.User");

    jQuery.sap.require("sap.ui.thirdparty.URI");
    var URI = sap.ui.require('sap/ui/thirdparty/URI');

    function getDocumentLocationOrigin() {
        var oUri = new URI(document.location);
        return oUri.protocol() + "://" + oUri.host();
    }

    module("sap.ushell.User", {
        setup: function () {

        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        teardown: function () {
            if (sap.ui.core.Core.prototype && sap.ui.core.Core.prototype.applyTheme.restore) {
                sap.ui.core.Core.prototype.applyTheme.restore();
            }
        }
    });

    test("constructor is robust enough to deal with an empty container adapter config", function () {
        var oContainerAdapterConfig,
            oUser;

        // Arrange
        oContainerAdapterConfig = {};

        // Act
        oUser = new sap.ushell.User(oContainerAdapterConfig);
        oUser = oUser; // no eslint warning

        // Assert
        ok(true, "Success: Constructor can deal with empty container adapter config");
        // not sure if all methods run through
    });

    test(["setAccessibilityMode throws if it is not allowed to",
          "set the accessibility mode"].join(" "), function () {

        var oUser = new sap.ushell.User({});

        sinon.stub(oUser, "isSetAccessibilityPermitted").returns(false);

        throws(
            oUser.setAccessibilityMode.bind(oUser, "some accessibility mode"),
            /setAccessibilityMode not permitted/,
            "exception was thrown"
        );
    });

    test(["setAccessibilityMode logs an error if it is not allowed to",
          "set the accessibility mode"].join(" "), function () {

        var oUser = new sap.ushell.User({});

        sinon.stub(oUser, "isSetAccessibilityPermitted").returns(false);
        sinon.spy(jQuery.sap.log, "error");

        try {
            oUser.setAccessibilityMode("some accessibility mode");
        } catch (e) {
            // do nothing
        }

        strictEqual(
            jQuery.sap.log.error.getCall(0).args[0],
            "setAccessibilityMode not permitted",
            "expected error message was logged"
        );

        jQuery.sap.log.error.restore();
    });

    /* ****************************************************************
     *   User Image tests
     * **************************************************************** */

    test("User image can be retrieved after setting", function () {
        var sDummyUserURI = "http://dummyUsrURI",
            oContainerAdapterConfig,
            oUser,
            sRetrievedUserURI;

        // Arrange
        oContainerAdapterConfig = {};

        // Act
        oUser = new sap.ushell.User(oContainerAdapterConfig);
        oUser.setImage(sDummyUserURI);
        sRetrievedUserURI = oUser.getImage();

        // Assert
        ok(sRetrievedUserURI === sDummyUserURI, "User image was unsuccessfully set");
    });

    test("Attached callbacks are being called upon setting user image", function () {
        var sDummyUserURI = "http://dummyUsrURI",
            sRetrievedUserURI,
            fnMockCallback = sinon.spy(function (param) {
                sRetrievedUserURI = param.mParameters;
            }),
            oContainerAdapterConfig,
            oUser;

        // Arrange
        oContainerAdapterConfig = {};

        // Act
        oUser = new sap.ushell.User(oContainerAdapterConfig);
        oUser.attachOnSetImage(fnMockCallback);
        oUser.setImage(sDummyUserURI);

        // Assert
        ok(fnMockCallback.calledOnce, "fnMockCallback is expected to be called one");
        ok(sRetrievedUserURI === sDummyUserURI, "Failed retrieving image URI from event object");
    });

    /* ****************************************************************
     *   Themeing tests
     * **************************************************************** */

    [
         {
             testDescription: "oThemeInput and oSystemTheme are undefined",
             oThemeInput: undefined,
             oSystemTheme: undefined,
             expected: {
                 originalTheme: {
                     theme: "",
                     root: ""
                 },
                 theme: "",
                 suppliedRoot: "",
                 path: "",
                 locationPath: "",
                 locationOrigin: ""
             }
         },
         {
             testDescription: "oThemeInput and oSystemTheme are empty objects",
             oThemeInput: {},
             oSystemTheme: {},
             expected: {
                 originalTheme: {
                     theme: "",
                     root: ""
                 },
                 theme: "",
                 suppliedRoot: "",
                 path: "",
                 locationPath: "",
                 locationOrigin: ""
             }
         },
         {
             testDescription: "oThemeInput is an empty object",
             oThemeInput: {},
             oSystemTheme: {
                         locationPathUi5: "/UI5/theme/path",
                         locationPathCustom: "/custom/theme/path",
                         locationOrigin: "https://frontendserver.sap.com:4711"
             },
             expected: {
                 originalTheme: {
                     theme: "",
                     root: ""
                 },
                 theme: "",
                 suppliedRoot: "",
                 path: "",
                 locationPath: "",
                 locationOrigin: ""
             }
         },
         {
             testDescription: "oThemeInput.theme is undefined",
             oThemeInput: {
                 theme: undefined,
                 root: undefined
             },
             oSystemTheme: {
                 locationPathUi5: "/UI5/theme/path",
                 locationPathCustom: "/custom/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             },
             expected: {
                 originalTheme: {
                     theme: "",
                     root: ""

                 },
                 theme: "",
                 suppliedRoot: "",
                 path: "",
                 locationPath: "",
                 locationOrigin: ""
             }
         },
         {
             testDescription: "oThemeInput is an sap_ theme",
             oThemeInput: {
                 theme: "sap_hcb",
                 root: ""
             },
             oSystemTheme: {
                 locationPathUi5: "/UI5/theme/path",
                 locationPathCustom: "/custom/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             },
             expected: {
                 originalTheme: {
                     theme: "sap_hcb",
                     root: ""
                 },
                 theme: "sap_hcb",
                 suppliedRoot: "",
                 path: "",
                 locationPath: "/UI5/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             }
         },
         {
             testDescription: "oThemeInput is an sap_ theme with path as theme root",
             oThemeInput: {
                 theme: "sap_hcb",
                 root: "/some/supplied/theme/path"
             },
             oSystemTheme: {
                 locationPathUi5: "/UI5/theme/path",
                 locationPathCustom: "/custom/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             },
             expected: {
                 originalTheme: {
                     theme: "sap_hcb",
                     root: "/some/supplied/theme/path"
                 },
                 theme: "sap_hcb",
                 suppliedRoot: "/some/supplied/theme/path",
                 path: "/some/supplied/theme/path",
                 locationPath: "/some/supplied/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             }
         },
         {
             testDescription: "oThemeInput is an sap_ theme with full URL as theme root",
             oThemeInput: {
                 theme: "sap_hcb",
                 root: "https://someotherfrontendserver.sap.com:3270/some/supplied/theme/path"
             },
             oSystemTheme: {
                 locationPathUi5: "/UI5/theme/path",
                 locationPathCustom: "/custom/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             },
             expected: {
                 originalTheme: {
                     theme: "sap_hcb",
                     root: "https://someotherfrontendserver.sap.com:3270/some/supplied/theme/path"
                 },
                 theme: "sap_hcb",
                 suppliedRoot: "https://someotherfrontendserver.sap.com:3270/some/supplied/theme/path",
                 path: "/some/supplied/theme/path",
                 locationPath: "/some/supplied/theme/path",
                 locationOrigin: "https://someotherfrontendserver.sap.com:3270"
             }
         },
         {
             testDescription: "oThemeInput is a custom theme",
             oThemeInput: {
                 theme: "customTheme",
                 root: "/supplied/custom/theme/path"
             },
             oSystemTheme: {
                 locationPathUi5: "/UI5/theme/path",
                 locationPathCustom: "/custom/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             },
             expected: {
                 originalTheme: {
                     theme: "customTheme",
                     root: "/supplied/custom/theme/path"
                 },
                 theme: "customTheme",
                 suppliedRoot: "/supplied/custom/theme/path",
                 path: "/supplied/custom/theme/path",
                 locationPath: "/supplied/custom/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             }
         },
         {
             testDescription: "oThemeInput is a custom theme with no theme root",
             oThemeInput: {
                 theme: "customTheme",
                 root: ""
             },
             oSystemTheme: {
                 locationPathUi5: "/UI5/theme/path",
                 locationPathCustom: "/custom/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             },
             expected: {
                 originalTheme: {
                     theme: "customTheme",
                     root: ""
                 },
                 theme: "customTheme",
                 suppliedRoot: "",
                 path: "/custom/theme/path",
                 locationPath: "/custom/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             }
         },
         {
             testDescription: "oThemeInput is a custom theme with path as theme root",
             oThemeInput: {
                 theme: "customTheme",
                 root: "/some/supplied/theme/path"
             },
             oSystemTheme: {
                 locationPathUi5: "/UI5/theme/path",
                 locationPathCustom: "/custom/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             },
             expected: {
                 originalTheme: {
                     theme: "customTheme",
                     root: "/some/supplied/theme/path"
                 },
                 theme: "customTheme",
                 suppliedRoot: "/some/supplied/theme/path",
                 path: "/some/supplied/theme/path",
                 locationPath: "/some/supplied/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             }
         },
         {
             testDescription: "oThemeInput is a custom theme with full URL as theme root",
             oThemeInput: {
                 theme: "customTheme",
                 root: "https://someotherfrontendserver.sap.com:3270/some/supplied/theme/path"
             },
             oSystemTheme: {
                 locationPathUi5: "/UI5/theme/path",
                 locationPathCustom: "/custom/theme/path",
                 locationOrigin: "https://frontendserver.sap.com:4711"
             },
             expected: {
                 originalTheme: {
                     theme: "customTheme",
                     root: "https://someotherfrontendserver.sap.com:3270/some/supplied/theme/path"
                 },
                 theme: "customTheme",
                 suppliedRoot: "https://someotherfrontendserver.sap.com:3270/some/supplied/theme/path",
                 path: "/some/supplied/theme/path",
                 locationPath: "/some/supplied/theme/path",
                 locationOrigin: "https://someotherfrontendserver.sap.com:3270"
             }
         }
    ].forEach(function (oFixture) {
        test("_AmendTheme returns the correct result when " + oFixture.testDescription, 1, function () {
            var oCompleteTheme;

            // Act
           oCompleteTheme =  sap.ushell.User.prototype._amendTheme(oFixture.oThemeInput, oFixture.oSystemTheme);
            // Assert
           deepEqual(oCompleteTheme, oFixture.expected, "Theme is completed correctly");
        });
    });

    /* **************************************************************** */

    [
        {
             testDescription: "boot theme is undefined and sThemeRoot is undefined",
             oBootTheme: undefined,
             sThemeRoot: undefined,
             expected: {
                 themeName: "",
                 originalTheme: "",
                 themePlusUrl: "",
                 NWBC: ""
             }
        },
        {
            testDescription: "boot theme is undefined and sThemeRoot is initialized",
            oBootTheme: undefined,
            sThemeRoot: "/theme/root",
            expected: {
                themeName: "",
                originalTheme: "",
                themePlusUrl: "",
                NWBC: ""
            }
       },
       {
           testDescription: "boot theme is a sap_ theme with undefined root",
           oBootTheme: {
               theme: "sap_hcb",
               root: undefined
           },
           sThemeRoot: "/theme/root",
           expected: {
               themeName: "sap_hcb",
               originalTheme: "sap_hcb",
               themePlusUrl: "sap_hcb@" + getDocumentLocationOrigin() + (new URI(jQuery.sap.getModulePath(""))).absoluteTo(document.location).pathname(),
                   // absolute path to the frontend server
               NWBC: "sap_hcb"
           }
       },
       {
           testDescription: "boot theme is a sap_ theme with '' root",
           oBootTheme: {
               theme: "sap_hcb",
               root: ""
           },
           sThemeRoot: "/theme/root",
           expected: {
               themeName: "sap_hcb",
               originalTheme: "sap_hcb",
               themePlusUrl: "sap_hcb@" + getDocumentLocationOrigin() + (new URI(jQuery.sap.getModulePath(""))).absoluteTo(document.location).pathname(),
                   // absolute path to the frontend server
               NWBC: "sap_hcb"
           }
        },
        {
            testDescription: "boot theme is a sap_ theme with a root",
            oBootTheme: {
                theme: "sap_hcb",
                root: "/theme/specific/root"
            },
            sThemeRoot: "/theme/root",
            expected: {
                themeName: "sap_hcb",
                originalTheme: "sap_hcb",
                themePlusUrl: "sap_hcb@" + getDocumentLocationOrigin() + "/theme/specific/root",
                NWBC: "sap_hcb"
            }
        },
        {
            testDescription: "boot theme is a sap_ theme with a URL as root",
            oBootTheme: {
                theme: "sap_hcb",
                root: "https://frontendserver.sap.com/theme/specific/root"
            },
            sThemeRoot: "/theme/root",
            expected: {
                themeName: "sap_hcb",
                originalTheme: "sap_hcb",
                themePlusUrl: "sap_hcb@https://frontendserver.sap.com/theme/specific/root",
                NWBC: "sap_hcb"
            }
        },
        {
            testDescription: "boot theme is a custom theme with '' root",
            oBootTheme: {
                theme: "red_crystal",
                root: ""
            },
            sThemeRoot: "/system/theme/root",
            expected: {
                themeName: "red_crystal",
                originalTheme: "red_crystal",
                themePlusUrl: "red_crystal@" + getDocumentLocationOrigin() + "/system/theme/root",
                NWBC: "red_crystal@" + getDocumentLocationOrigin() + "/system/theme/root"
            }
        },
        {
            testDescription: "boot theme is a custom theme with a root",
            oBootTheme: {
                theme: "red_crystal",
                root: "/theme/specific/root"
            },
            sThemeRoot: "/system/theme/root",
            expected: {
                themeName: "red_crystal",
                originalTheme: "red_crystal",
                themePlusUrl: "red_crystal@" + getDocumentLocationOrigin() + "/theme/specific/root",
                NWBC: "red_crystal@" + getDocumentLocationOrigin() + "/theme/specific/root"
           }
        },
        {
            testDescription: "boot theme is a custom theme @ root",
            oBootTheme: {
                theme: "red_crystal@/theme/specific/root",
                root: ""
            },
            sThemeRoot: "/system/theme/root",
            expected: {
                themeName: "red_crystal",
                originalTheme: "red_crystal@/theme/specific/root",
                themePlusUrl: "red_crystal@" + getDocumentLocationOrigin() + "/theme/specific/root",
                NWBC: "red_crystal@" + getDocumentLocationOrigin() + "/theme/specific/root"
            }
        },
        {
            testDescription: "boot theme is a sap_ theme with a URL as root",
            oBootTheme: {
                theme: "red_crystal",
                root: "https://frontendserver.sap.com/theme/specific/root"
            },
            sThemeRoot: "/system/theme/root",
            expected: {
                originalTheme: "red_crystal",
                themeName: "red_crystal",
                themePlusUrl: "red_crystal@https://frontendserver.sap.com/theme/specific/root",
                NWBC: "red_crystal@https://frontendserver.sap.com/theme/specific/root"
            }
        },
        {
            testDescription: "boot theme is a sap_ theme @ URL",
            oBootTheme: {
                theme: "red_crystal@https://frontendserver.sap.com/theme/specific/root",
                root: ""
            },
            sThemeRoot: "/system/theme/root",
            expected: {
                originalTheme: "red_crystal@https://frontendserver.sap.com/theme/specific/root",
                themeName: "red_crystal",
                themePlusUrl: "red_crystal@https://frontendserver.sap.com/theme/specific/root",
                NWBC: "red_crystal@https://frontendserver.sap.com/theme/specific/root"
            }
        }
    ].forEach(function (oFixture) {
        test("The User object is correctly initialized rgd. theme when " + oFixture.testDescription, 4, function () {
            var oUser,
                oContainerAdapterConfig;

            // Arrange
            oContainerAdapterConfig = {
                bootTheme : oFixture.oBootTheme,
                themeRoot : oFixture.sThemeRoot
            };
            // Act
            oUser = new sap.ushell.User(oContainerAdapterConfig);
            // Assert
            strictEqual(oUser.getTheme(),
                    oFixture.expected.themeName, "Theme name is set correctly (no parameter supplied to getTheme)");
            strictEqual(oUser.getTheme(sap.ushell.User.prototype.constants.themeFormat.ORIGINAL_THEME),
                    oFixture.expected.originalTheme, "Original theme is set correctly (parameter supplied to getTheme)");
            strictEqual(oUser.getTheme(sap.ushell.User.prototype.constants.themeFormat.THEME_NAME_PLUS_URL),
                    oFixture.expected.themePlusUrl, "Theme name and location URL is set correctly");
            strictEqual(oUser.getTheme(sap.ushell.User.prototype.constants.themeFormat.NWBC),
                    oFixture.expected.NWBC, "Theme is set correctly");
        });
    });

    /* **************************************************************** */

    [
        {
            testDescription: "a sap theme is set where the boot theme was a custom boot theme",
            oBootTheme: {
                theme: "redcrystal",
                root: "/sap/public/bc/themes/~client120"
            },
            sThemeRoot: "/sap/public/bc/themes/~client120",
            sNewTheme: "sap_bluecrystal",
            expected: ["sap_bluecrystal"]
        },
        {
            testDescription: "a custom theme is set where the boot theme was an sap theme",
            oBootTheme: {
                theme: "sap_bluecrystal",
                root: ""
            },
            sThemeRoot: "/sap/public/bc/themes/~client120",
            sNewTheme: "redcrystal@/sap/public/bc/themes/~client120",
            expected: ["redcrystal", "/sap/public/bc/themes/~client120" + "/UI5/"]
        },
        {
            testDescription: "a custom theme is set where the boot theme was a custom theme",
            oBootTheme: {
                theme: "green_bluecrystal",
                root: "/sap/public/bc/themes/~client120"
            },
            sThemeRoot: "/sap/public/bc/themes/~client120",
            sNewTheme: "redcrystal",
            expected: ["redcrystal", "/sap/public/bc/themes/~client120" + "/UI5/"]
        },
        {
            testDescription: "a custom theme with a path is set",
            oBootTheme: {
                theme: "sap_bluecrystal",
                root: ""
            },
            sThemeRoot: "/sap/public/bc/themes/~client120",
            sNewTheme: "redcrystal@/custom/theme/path",
            expected: ["redcrystal", "/custom/theme/path" + "/UI5/"]
        },
        {
            testDescription: "an sap_ theme with a theme URL is set",
            oBootTheme: {
                theme: "redcrystal",
                root: "/sap/public/bc/themes/~client120"
            },
            sThemeRoot: "/sap/public/bc/themes/~client120",
            sNewTheme: "sap_hcb@https://frontendserver.customer.com/his/theme/path",
            expected: ["sap_hcb", "https://frontendserver.customer.com/his/theme/path" + "/UI5/"]
        },
        {
            testDescription: "a custom theme with a theme URL is set",
            oBootTheme: {
                theme: "redcrystal",
                root: "/sap/public/bc/themes/~client120"
            },
            sThemeRoot: "/sap/public/bc/themes/~client120",
            sNewTheme: "greencrystal@https://frontendserver.customer.com/his/theme/path",
            expected: ["greencrystal", "https://frontendserver.customer.com/his/theme/path" + "/UI5/"]
        }
    ].forEach(function (oFixture) {
        test("setTheme applies the new theme correctly when " + oFixture.testDescription, 3, function () {
            var oContainerAdapterConfig,
                oUser,
                fnApplyTheme;

            // Arrange
            oContainerAdapterConfig = {
                bootTheme : oFixture.oBootTheme,
                themeRoot : oFixture.sThemeRoot
            };

            // Arrange
            fnApplyTheme = sinon.stub(sap.ui.core.Core.prototype, "applyTheme");
            oUser = new sap.ushell.User(oContainerAdapterConfig);
            // Act
            oUser.setTheme(oFixture.sNewTheme);
            // Assert
            ok(fnApplyTheme.calledOnce, "Success: applyTheme was called once");
            deepEqual(fnApplyTheme.args[0], oFixture.expected, "correct arguments");
            strictEqual(oUser.getTheme(), // theme name
                    oFixture.expected[0], "getTheme returns the set theme");
        });
    });

    /* **************************************************************** */

    /* **************************************************************** */

    test("sap.ushell.User: changed property handling", function () {
        // 1 - get
        // 2 - set get
        // 3 - reset get
        var oContainerAdapterConfig,
            oUser,
            aReturnedChangedProperties,
            aExpectedChangedProperties;

        // Arrange
        aExpectedChangedProperties = [{
            "propertyName": "Property1",
            "name": "Property1",
            "newValue": "newValue",
            "oldValue": "oldValue"
        }];
        oContainerAdapterConfig = {};
        oUser = new sap.ushell.User(oContainerAdapterConfig);
        // Act
        aReturnedChangedProperties = oUser.getChangedProperties(); // Step 1
        // Assert
        deepEqual(aReturnedChangedProperties, [], "Success: Step 1 - empty changed properties");
        // Act
        oUser.setChangedProperties(
            {
                "propertyName": aExpectedChangedProperties[0].propertyName,
                "name": aExpectedChangedProperties[0].name
            },
            aExpectedChangedProperties[0].oldValue,
            aExpectedChangedProperties[0].newValue); // Step 2
        // Assert
        deepEqual(aReturnedChangedProperties, [], "Success: Step 2 - set did not affect the value returned by the first get");
                // to check that the live object is not returned but only a copied object
        aReturnedChangedProperties = oUser.getChangedProperties();
        deepEqual(aReturnedChangedProperties, aExpectedChangedProperties, "Success: Step 2 - changed properties were set correctly");
        // Act
        oUser.resetChangedProperties(); // Step 3
        // Assert
        deepEqual(aReturnedChangedProperties, aExpectedChangedProperties,
                "Success: Step 3 - reset did not affect the value returend by the second get");
        aReturnedChangedProperties = oUser.getChangedProperties();
        deepEqual(aReturnedChangedProperties, [], "Success: Step 3 - changed properties were reset correctly");
    });

    test(["sap.ushell.User: does not warn if constructed with an adapter",
          "configuration that does not specify a content density"].join(" "), function () {

        // Arrange
        sinon.spy(jQuery.sap.log, "warning");

        // Act
        var oUser = new sap.ushell.User({  // the container adapter configuration
            userProfile: [{
                id: "CONTENT_DENSITY",
                value: "compact"
            }],
            bootTheme: {
                theme: "redcrystal",
                root: "/sap/public/bc/themes/~client120"
            },
            themeRoot: "/sap/public/bc/themes/~client120"
        });

        oUser = oUser; // avoid eslint error

        // Assert
        strictEqual(jQuery.sap.log.warning.callCount, 0, "jQuery.sap.log.warning was not called");

        jQuery.sap.log.warning.restore();
    });

    [
        {
            testDescription: "user profile doesn't contain CONTENT_DENSITY",
            containerAdapterConfig: {
                userProfile: [{
                    id: "SOMETHING_ELSE",
                    value: "something"
                }]
            },
            expectedValue: undefined
        }
    ].forEach(function (oFixture) {
        test("sap.ushell.User: getContentDensity returns the correct value when " + oFixture.testDescription, function () {
            // Act
            var oUser = new sap.ushell.User(oFixture.containerAdapterConfig);

            // Assert

            strictEqual(oUser.getContentDensity(), oFixture.expectedValue,
                "expected value was returned");
        });
    });

    [
        {
            testDescription: "containerAdapConfig has a ranges.theme which contains the given theme name",
            input: {
                containerAdapterConfig: {
                    "ranges": {
                        "theme": {
                            "custom_cool_theme": {
                                "displayName": "Custom Theme",
                                "themeRoot": "myThemeRoot"
                            }
                        }
                    }
                },
                givenTheme:"custom_cool_theme",
            },
            expectedThemeRoot:"myThemeRoot"
        },
        {
            testDescription: "Meta Data contains of ranges and theme root undefined",
            input: {
                containerAdapterConfig: {
                    "ranges": {
                        "theme": {
                            "custom_cool_theme": {
                                "displayName": "Custom Theme"
                            }
                        }
                    }
                },
                givenTheme:"custom_cool_theme"
            },
            expectedThemeRoot:""
        },
        {
            testDescription: "Meta Data contains of ranges and no themes",
            input: {
                containerAdapterConfig: {
                    "ranges": {
                    }
                },
                givenTheme:"custom_cool_theme"
            },
            expectedThemeRoot: ""
        },
        {
            testDescription: "Meta Data does not contain ranges, to stay compatible ",
            input: {
                containerAdapterConfig: {},
                givenTheme:"custom_cool_theme"
            },
            expectedThemeRoot:""
        }
    ].forEach(function(oFixture){
        test("sap.ushell.User: getThemeRoot returns correct value when " + oFixture.testDescription, function () {
            // Arange
            var oUser = new sap.ushell.User(oFixture.input.containerAdapterConfig);

            // Act && Assert
            strictEqual(
                oUser.getThemeRoot(oFixture.input.givenTheme),
                oFixture.expectedThemeRoot,
                "expected theme root was returned");
        });
    });

    [
        {
            testDescription: "cozy contentDensity is set and isSetContentDensityPermitted is false",
            contentDensity: "cozy"
        },
        {
            testDescription: "'any value' contentDensity is set and isSetContentDensityPermitted is false",
            contentDensity: "any value"
        }
    ].forEach(function (oFixture) {
        test("sap.ushell.User: setContentDensity throws when " + oFixture.testDescription, function () {
            var oUser = new sap.ushell.User({}); // configuration doesn't matter
            sinon.stub(oUser, "isSetContentDensityPermitted").returns(false);

            throws(
                oUser.setContentDensity.bind(oUser, oFixture.contentDensity),
                /setContentDensity not permitted/,
                "exception was thrown"
            );
        });

        test("sap.ushell.User: setContentDensity logs an error when " + oFixture.testDescription, function () {
            var oUser = new sap.ushell.User({}); // configuration doesn't matter
            sinon.stub(oUser, "isSetContentDensityPermitted").returns(false);
            sinon.spy(jQuery.sap.log, "error");

            try {
                oUser.setContentDensity(oFixture.contentDensity);
            } catch (e) {
                // do nothing
            }

            strictEqual(
                jQuery.sap.log.error.getCall(0).args[0],
                "setContentDensity not permitted",
                "expected error message was logged"
            );

            jQuery.sap.log.error.restore();
        });
    });

    // test that setChangedProperties is called if it is allowed to change contentDensity
    //


}());
