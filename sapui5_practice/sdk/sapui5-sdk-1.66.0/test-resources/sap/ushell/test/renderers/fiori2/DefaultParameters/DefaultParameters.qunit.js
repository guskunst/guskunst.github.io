// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
(function () {
    "use strict";
    /* eslint-disable */ // TBD: make ESLint conform

    /*global module, test, jQuery, sap, sinon, ok, start, stop */
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.services.Container");
    jQuery.sap.require("sap.ui.comp.smartform.SmartForm");
    jQuery.sap.require("sap.ui.comp.smartfield.SmartField");
    jQuery.sap.require('sap.ui.comp.valuehelpdialog.ValueHelpDialog');
    var defaultParameters,
        parametersMockObj;

    module("sap.ushell.components.shell.UserSettings.DefaultParameters", {
        setup: function () {
            stop();
            sap.ushell.bootstrap("local").then(function () {
                var deferredEditorParams = jQuery.Deferred();
                parametersMockObj = {
                    "UshellTest1" : {
                        "valueObject": {
                            "value": "InitialFromPlugin",
                            "extendedValue": {
                                "Ranges" : [{ "Sign" : "I", "Option": "E", "value" : "x"}]
                            }
                        },
                        "editorMetadata" : {
                            // metadata request only
                            "displayText" : "Test Default 1",
                            "description": "Description of the test default 1",
                            "groupId": "EXAMPLE-FIN-GRP1",
                            "groupTitle" : "FIN User Defaults (UShell examples)",
                            "parameterIndex" : 1
                        }
                    },
                    "storeChangedDataTest" : {
                        "valueObject": {
                            "value": "",
                            "extendedValue": undefined
                        },
                        "editorMetadata" : {
                            // metadata request only
                            "displayText" : "Test Default 1",
                            "description": "Description of the test default 1",
                            "groupId": "EXAMPLE-FIN-GRP1",
                            "groupTitle" : "FIN User Defaults (UShell examples)",
                            "parameterIndex" : 1
                        }
                    }
                };
                var editorGetParametersStub = sinon.stub(sap.ushell.Container.getService("UserDefaultParameters"), "editorGetParameters");
                editorGetParametersStub.returns(deferredEditorParams.promise());
                deferredEditorParams.resolve(parametersMockObj);
                defaultParameters = sap.ui.jsview("userPrefDefaultSettings", "sap.ushell.components.shell.UserSettings.DefaultParameters");
                start();
            });
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        teardown: function () {
            defaultParameters.destroy();
            if (sap.ui.getCore().byId("saveButton")) {
                sap.ui.getCore().byId("saveButton").destroy();
            }
            delete sap.ushell.Container;

        }
    });

    test("Init Default Parameters view", function (assert) {
        var done = assert.async();
        var expectedMockObj = {
            "UshellTest1" : {
                "valueObject": {
                    "value": "InitialFromPlugin",
                    "extendedValue": {
                        "Ranges" : [{ "Sign" : "I", "Option": "E", "value" : "x"}]
                    }
                },
                "editorMetadata" : {
                    // metadata request only
                    "displayText" : "Test Default 1",
                    "description": "Description of the test default 1",
                    "groupId": "EXAMPLE-FIN-GRP1",
                    "groupTitle" : "FIN User Defaults (UShell examples)",
                    "parameterIndex" : 1
                }
            },
            "storeChangedDataTest" : {
                "valueObject": {
                    "value": "",
                    "extendedValue": undefined
                },
                "editorMetadata" : {
                    // metadata request only
                    "displayText" : "Test Default 1",
                    "description": "Description of the test default 1",
                    "groupId": "EXAMPLE-FIN-GRP1",
                    "groupTitle" : "FIN User Defaults (UShell examples)",
                    "parameterIndex" : 1
                }
            }
        };
        setTimeout(function() {

            assert.ok(defaultParameters, true);
            assert.equal(jQuery.isEmptyObject(defaultParameters.oController.oChangedParameters), true);
            assert.deepEqual(parametersMockObj, expectedMockObj);
            done();
        });
    });

    test("isValueDifferent method  Default Parameters view", function () {
        var oValueObject1 = {
            "value": "InitialFromPlugin",
            "extendedValue": {
                "Ranges" : [{ "Sign" : "I", "Option": "E", "value" : "x"}]
            }
        },
            oValueObject2 = {
                "extendedValue": {
                    "Ranges" : [{ "Sign" : "I", "Option": "E", "value" : "x"}]
                }
            },
            oValueObject3 = {
                "extendedValue": {
                    "Ranges" : [{ "Sign" : "E", "Option": "E", "value" : "x"}]
                }
            },
            oValueObject4 = jQuery.extend({value: ""}, oValueObject2),
            oValueObject5 = {
                "value": "InitialFromPlugin",
                "extendedValue": {
                    "Ranges" : [{ "Sign" : "I", "Option": "BT", "value" : "x"}]
                }
            };

        ok(!defaultParameters.oController.isValueDifferent(oValueObject1, oValueObject1), "Objects are supposed to be equal");
        ok(!defaultParameters.oController.isValueDifferent(oValueObject2, oValueObject4), "Objects are supposed to be equal");
        ok(defaultParameters.oController.isValueDifferent(oValueObject3, oValueObject4), "Objects aren't supposed to be equal");
        ok(!defaultParameters.oController.isValueDifferent(oValueObject3, undefined), "Expected false when one of the objects is undefined");
        ok(!defaultParameters.oController.isValueDifferent(undefined, undefined), "Expected false when one of the objects is undefined");
        ok(!defaultParameters.oController.isValueDifferent(undefined, oValueObject2), "Expected false when one of the objects is undefined");
        ok(defaultParameters.oController.isValueDifferent(oValueObject1, oValueObject5), "Objects are supposed to be different");


    });

    test("storeChangedData method  Default Parameters view", function () {
        var contentObj;
        defaultParameters.oController.getContent().done(function(result) {
            contentObj = result.oController;
        });
        var oModel = contentObj.oMdlParameter;


        ok(!contentObj.oChangedParameters["UshellTest1"]);

        oModel.setProperty('/UshellTest1/valueObject/extendedValue', {});
        ok(contentObj.oChangedParameters["UshellTest1"] === true);

    });

    test("GetListofSupportedRangeOperations method", function () {
        var opList = defaultParameters.oController.getListOfSupportedRangeOperations();
        ok((jQuery.inArray("StartsWith", opList) === -1 && jQuery.inArray("EndsWith", opList) === -1) && jQuery.inArray("Initial", opList) === -1);
    });

    test("onSave method editorSetValue called", function (assert) {
       var done = assert.async();
        defaultParameters.oController.getContent().done(function(result) {
            var editorSetValueStub = sinon.spy(sap.ushell.Container.getService("UserDefaultParameters"), "editorSetValue");
            defaultParameters.oController.oCurrentParameters["UshellTest1"].valueObject = {
                "value": "InitialFromPlugin",
                "extendedValue": {
                    "Ranges": [{"Sign": "I", "Option": "BT", "value": "x"}]
                }
            };
            defaultParameters.oController.oChangedParameters["UshellTest1"] = true;
            defaultParameters.oController.onSave();
            ok(editorSetValueStub.calledOnce);
            done();
        });

    });
    test("onSave method editorSetValue not called", function (assert) {
        var done = assert.async();
        var editorSetValueStub = sinon.spy(sap.ushell.Container.getService("UserDefaultParameters"), "editorSetValue");
        defaultParameters.oController.onSave();
        setTimeout(function() {
            ok(!editorSetValueStub.called);
            done();
        });
    });
    //TODO: Restore this test with respect to a change in getContent.
    //test("storeChangedData with corrupted content", function (assert) {
    //    var done = assert.async();
    //    var isValueDifferentStub = sinon.spy(defaultParameters.oController, "isValueDifferent");
    //    defaultParameters.oController.aDisplayedUserDefaults = [{
    //        parameterName: "storeChangedDataTest",
    //        valueObject: {
    //            _shellData: {
    //                storeDate: "Wed Jan 13 2016 09:45:57 GMT+0200 (Jerusalem Standard Time)"
    //            },
    //            value: "",
    //            extendedValue: undefined
    //        },
    //        modelBind: {
    //            model: {
    //                getProperty : function () {
    //                    return "";
    //                }
    //            },
    //            extendedModel: {
    //                getProperty : function () {
    //                    return undefined;
    //                }
    //            },
    //            sFullPropertyPath: "/"
    //        }
    //    }];
    //    defaultParameters.oController.sForm = {
    //        check : function () {
    //            return [];
    //        }
    //    };
    //    defaultParameters.oController.getContent();
    //    defaultParameters.oController.storeChangedData();
    //    setTimeout(function() {
    //        ok(isValueDifferentStub.calledOnce);
    //        ok(!isValueDifferentStub.args[0][0].extendedValue, "Expected call with undefined extended value");
    //        ok(!isValueDifferentStub.args[0][1].extendedValue, "Expected call with undefined extended value");
    //        ok(isValueDifferentStub.args[0][0].value === "", "Expected call with empty  value");
    //        ok(isValueDifferentStub.args[0][1].value === "", "Expected call with empty  value");
    //        done();
    //    });
    //});

}());
