// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview Integration tests for SchedulingAgent
 */
sap.ui.require([
    "sap/ushell/bootstrap/SchedulingAgent",
    "sap/ushell/bootstrap/_SchedulingAgent/state",
    "sap/base/util/LoaderExtensions",
    "sap/ushell/EventHub",
    "sap/ui/core/Component",
    "sap/base/util/LoaderExtensions",
    "sap/ushell/Config"
], function (
    SchedulingAgent,
    DeepState,
    LoaderExtensions,
    EventHub,
    Component,
    Loader,
    Config
) {
    "use strict";

    /* global sap, sinon, QUnit */

    var oLoadingConfigurationMock = {
        OrderOfLoadingBlocks: [
            "AfterLoadPluginsCall",
            "FLPPlugins"
        ],
        LoadingBlocks: {
            AfterLoadPluginsCall: {
                LoadingSteps: [
                    {
                        LoadingStep: "StartScheduler",
                        canBeLoadedAsync: false
                    },
                    {
                        LoadingStep: "LoadRendererExtensions",
                        canBeLoadedAsync: false
                    },
                    {
                        LoadingStep: "MessagePopoverInit",
                        canBeLoadedAsync: true
                    },
                    {
                        LoadingStep: "UsageAnalytics",
                        canBeLoadedAsync: true
                    }
                ],
                maxWaitInMs: 3000
            },
            FLPPlugins: {
                LoadingSteps: [
                    {
                        LoadingStep: "ConditionalWaitForAppLoading",
                        canBeLoadedAsync: false
                    },
                    {
                        LoadingStep: "Notifications",
                        canBeLoadedAsync: false
                    },
                    {
                        LoadingStep: "UserImage",
                        canBeLoadedAsync: false
                    },
                    {
                        LoadingStep: "Search",
                        canBeLoadedAsync: false
                    },
                    {
                        LoadingStep: "MeArea",
                        canBeLoadedAsync: false
                    },
                    {
                        LoadingStep: "ShellComplete",
                        canBeLoadedAsync: true
                    }
                ],
                maxWaitInMs: 0
            }
        }
    };

    var oStepConfigurationMock = {
        StartScheduler: {
            loadingMode: "continueOnEvent",
            continueOnEvent: {
                eventName: "startScheduler"
            },
            userCanTrigger: false,
            canBeInterrupted: false
        },
        LoadRendererExtensions: {
            loadingMode: "byEvent",
            byEvent: {
                eventName: "loadRendererExtensions",
                eventData: ""
            },
            Dependencies: []
        },
        MessagePopoverInit: {
            loadingMode: "byEvent",
            byEvent: {
                eventName: "initMessagePopover",
                eventData: ""
            },
            Dependencies: [
                "LoadRendererExtensions"
            ]
        },
        UsageAnalytics: {
            loadingMode: "byEvent",
            byEvent: {
                eventName: "loadUsageAnalytics",
                eventData: ""
            },
            Dependencies: [
                "LoadRendererExtensions"
            ]
        },
        Notifications: {
            loadingMode: "byComponentCreate",
            excludedFLPStates: [
                "lean",
                "lean-home"
            ],
            byComponentCreate: {
                enabled: true,
                ui5ComponentOptions: {
                    name: "sap.ushell.components.shell.Notifications"
                },
                url: "sap/ushell/components/shell/Notifications"
            },
            configSwitch: {
                path: "/core/shell/model/enableNotifications",
                assertionValue: true
            },
            userCanTrigger: false,
            canBeInterrupted: false
        },
        MeArea: {
            loadingMode: "byComponentCreate",
            byComponentCreate: {
                enabled: true,
                ui5ComponentOptions: {
                    name: "sap.ushell.components.shell.MeArea.fiori3"
                },
                url: "sap/ushell/components/shell/MeArea/fiori3"
            },
            userCanTrigger: false,
            canBeInterrupted: false
        },
        UserImage: {
            loadingMode: "byComponentCreate",
            byComponentCreate: {
                enabled: true,
                ui5ComponentOptions: {
                    name: "sap.ushell.components.shell.UserImage"
                },
                url: "sap/ushell/components/shell/UserImage"
            },
            userCanTrigger: false,
            canBeInterrupted: false
        },
        Search: {
            loadingMode: "byComponentCreate",
            excludedFLPStates: [
                "lean",
                "lean-home"
            ],
            byComponentCreate: {
                enabled: true,
                ui5ComponentOptions: {
                    name: "sap.ushell.components.shell.Search"
                },
                url: "sap/ushell/components/shell/Search"
            },
            userCanTrigger: false,
            canBeInterrupted: false
        },
        ShellComplete: {
            loadingMode: "byEvent",
            byEvent: {
                eventName: "ShellComplete",
                eventData: ""
            }
        },
        ConditionalWaitForAppLoading: {
            loadingMode: "waitInMs",
            waitInMs: {
                waitingTime: 42
            },
            mandatoryFLPStates: [
                "app"
            ]
        }
    };

    QUnit.module("Integration Test", {
        beforeEach: function () {
            // Config values for the different stubs.
            // Change them in the tests accordingly.
            this.oConfigurationMock = {
                FLPState: {
                    sStateName: "home"
                },
                Notifications: {
                    bComponentCreated: true,
                    iLoadingTime: 0,
                    bEnabledByConfig: true
                },
                MeArea: {
                    bComponentCreated: true,
                    iLoadingTime: 0
                },
                Search: {
                    bComponentCreated: true,
                    iLoadingTime: 0
                },
                UserImage: {
                    bComponentCreated: true,
                    iLoadingTime: 0
                },
                StepsToBeDone: {
                    LoadRendererExtensions: true,
                    MessagePopoverInit: true,
                    UsageAnalytics: true,
                    WarmupPlugins: true,
                    ShellComplete: true
                }
            };

            this.oTestLoadingConfig = JSON.parse(JSON.stringify(oLoadingConfigurationMock));
            this.oTestStepConfig = JSON.parse(JSON.stringify(oStepConfigurationMock));

            this.oComponentCreateStub = sinon.stub(Component, "create").callsFake(function (componentPath) {
                var bResolvePromise = false;
                // We want to be able to make the promises to resolve in a different order in some tests
                var iTimeOut = 0;
                return new Promise(function (resolve, reject) {
                    switch (componentPath.name) {
                        case "sap.ushell.components.shell.UserImage":
                            bResolvePromise = this.oConfigurationMock.UserImage.bComponentCreated;
                            iTimeOut = this.oConfigurationMock.UserImage.iLoadingTime;
                            break;
                        case "sap.ushell.components.shell.Search":
                            bResolvePromise = this.oConfigurationMock.Search.bComponentCreated;
                            iTimeOut = this.oConfigurationMock.Search.iLoadingTime;
                            break;
                        case "sap.ushell.components.shell.MeArea.fiori3":
                            bResolvePromise = this.oConfigurationMock.MeArea.bComponentCreated;
                            iTimeOut = this.oConfigurationMock.MeArea.iLoadingTime;
                            break;
                        case "sap.ushell.components.shell.Notifications":
                            bResolvePromise = this.oConfigurationMock.Notifications.bComponentCreated;
                            iTimeOut = this.oConfigurationMock.Notifications.iLoadingTime;
                            break;
                        default:
                            break;
                    }
                    if (bResolvePromise) {
                        setTimeout(resolve, iTimeOut);
                    } else {
                        setTimeout(reject, iTimeOut);
                    }
                }.bind(this));

            }.bind(this));

            this.oConfigStub = sinon.stub(Config, "last").callsFake(function (path) {
                if (path === "/core/shell/model/enableNotifications") {
                    return this.oConfigurationMock.Notifications.bEnabledByConfig;
                }
                if (path === "/core/shell/model/currentState/stateName") {
                    return this.oConfigurationMock.FLPState.sStateName;
                }
                return false;
            }.bind(this));

            this.aDoables = Object.keys(oStepConfigurationMock).reduce(function (aArray, sKey) {
                var oStep = oStepConfigurationMock[sKey];
                if (oStep.loadingMode === "byEvent") {
                    aArray.push(EventHub.once(oStep.byEvent.eventName).do(function () {
                        if (this.oConfigurationMock.StepsToBeDone[sKey]) {
                            EventHub.emit("StepDone", sKey);
                        } else {
                            EventHub.emit("StepFailed", sKey);
                        }
                    }.bind(this)));
                }
                return aArray;
            }.bind(this), []);

            this.oLoadResourceStub = sinon.stub(LoaderExtensions, "loadResource").callsFake(function (configPath) {
                return new Promise(function (resolve, reject) {
                    if (configPath === "sap/ushell/bootstrap/_SchedulingAgent/LoadingConfiguration.json") {
                        resolve(this.oTestLoadingConfig);
                    } else if (configPath === "sap/ushell/bootstrap/_SchedulingAgent/StepConfiguration.json") {
                        resolve(this.oTestStepConfig);
                    } else {
                        reject();
                    }
                }.bind(this));
            }.bind(this));
        },
        afterEach: function () {
            this.oComponentCreateStub.restore();
            this.oConfigStub.restore();
            this.oLoadResourceStub.restore();
            this.aDoables.forEach(function (doable) {
                doable.off();
            });
            EventHub._reset();
        }
    });

    QUnit.test("The agent is successfully loaded", function (assert) {
        var bModuleIsobject = typeof SchedulingAgent === "object";
        assert.ok(bModuleIsobject, "Agent module loaded.");
    });

    QUnit.test("Default loading", function (assert) {
        var done = assert.async();

        SchedulingAgent._initialize();

        EventHub.emit("startScheduler");

        EventHub.wait("FLPLoadingDone").then(function () {
            EventHub.once("FLPLoadingDone").do(function () {
                assert.strictEqual(DeepState.oState.ofLoadingBlock.AfterLoadPluginsCall.status, "BLOCK_DONE", "AfterLoadPluginsCall block loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.LoadRendererExtensions.status, "STEP_DONE", "Renderer Extensions loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MessagePopoverInit.status, "STEP_DONE", "Message Popover Init loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UsageAnalytics.status, "STEP_DONE", "Usage analytics loaded.");

                assert.strictEqual(DeepState.oState.ofLoadingBlock.FLPPlugins.status, "BLOCK_DONE", "FLPPlugins block loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ConditionalWaitForAppLoading.status, "STEP_SKIPPED", "Conditional timeout skipped.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Notifications.status, "STEP_DONE", "Notifications loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UserImage.status, "STEP_DONE", "UserImage loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Search.status, "STEP_DONE", "Search loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MeArea.status, "STEP_DONE", "MeArea loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ShellComplete.status, "STEP_DONE", "ShellComplete triggered.");
                done();
            });
        });
    });

    QUnit.test("MeArea not loaded", function (assert) {
        var done = assert.async();

        this.oConfigurationMock.MeArea.bComponentCreated = false;

        SchedulingAgent._initialize();

        EventHub.emit("startScheduler");

        EventHub.wait("FLPLoadingDone").then(function () {
            EventHub.once("FLPLoadingDone").do(function () {
                assert.strictEqual(DeepState.oState.ofLoadingBlock.AfterLoadPluginsCall.status, "BLOCK_DONE", "AfterLoadPluginsCall block loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.LoadRendererExtensions.status, "STEP_DONE", "Renderer Extensions loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MessagePopoverInit.status, "STEP_DONE", "Message Popover Init loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UsageAnalytics.status, "STEP_DONE", "Usage analytics loaded.");

                assert.strictEqual(DeepState.oState.ofLoadingBlock.FLPPlugins.status, "BLOCK_DONE", "FLPPlugins block loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ConditionalWaitForAppLoading.status, "STEP_SKIPPED", "Conditional timeout skipped.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Notifications.status, "STEP_DONE", "Notifications loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UserImage.status, "STEP_DONE", "UserImage loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Search.status, "STEP_DONE", "Search loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MeArea.status, "STEP_SKIPPED", "MeArea skipped.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ShellComplete.status, "STEP_DONE", "ShellComplete triggered.");
                done();
            });
        });
    });


    QUnit.test("MeArea & Search not loaded", function (assert) {
        var done = assert.async();

        this.oConfigurationMock.MeArea.bComponentCreated = false;
        this.oConfigurationMock.Search.bComponentCreated = false;

        SchedulingAgent._initialize();

        EventHub.emit("startScheduler");

        EventHub.wait("FLPLoadingDone").then(function () {
            EventHub.once("FLPLoadingDone").do(function () {
                assert.strictEqual(DeepState.oState.ofLoadingBlock.AfterLoadPluginsCall.status, "BLOCK_DONE", "AfterLoadPluginsCall block loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.LoadRendererExtensions.status, "STEP_DONE", "Renderer Extensions loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MessagePopoverInit.status, "STEP_DONE", "Message Popover Init loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UsageAnalytics.status, "STEP_DONE", "Usage analytics loaded.");

                assert.strictEqual(DeepState.oState.ofLoadingBlock.FLPPlugins.status, "BLOCK_DONE", "FLPPlugins block loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ConditionalWaitForAppLoading.status, "STEP_SKIPPED", "Conditional timeout skipped.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Notifications.status, "STEP_DONE", "Notifications loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UserImage.status, "STEP_DONE", "UserImage loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Search.status, "STEP_SKIPPED", "Search skipped.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MeArea.status, "STEP_SKIPPED", "MeArea skipped.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ShellComplete.status, "STEP_DONE", "ShellComplete triggered.");
                done();
            });
        });
    });

    QUnit.test("FLP in lean state", function (assert) {
        var done = assert.async();

        this.oConfigurationMock.FLPState.sStateName = "lean";

        SchedulingAgent._initialize();

        EventHub.emit("startScheduler");

        EventHub.wait("FLPLoadingDone").then(function () {
            EventHub.once("FLPLoadingDone").do(function () {
                assert.strictEqual(DeepState.oState.ofLoadingBlock.AfterLoadPluginsCall.status, "BLOCK_DONE", "AfterLoadPluginsCall block loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.LoadRendererExtensions.status, "STEP_DONE", "Renderer Extensions loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MessagePopoverInit.status, "STEP_DONE", "Message Popover Init loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UsageAnalytics.status, "STEP_DONE", "Usage analytics loaded.");

                assert.strictEqual(DeepState.oState.ofLoadingBlock.FLPPlugins.status, "BLOCK_DONE", "FLPPlugins block loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ConditionalWaitForAppLoading.status, "STEP_SKIPPED", "Conditional timeout skipped.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Notifications.status, "STEP_SKIPPED", "Notifications skipped.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UserImage.status, "STEP_DONE", "UserImage loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Search.status, "STEP_SKIPPED", "Search skipped.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MeArea.status, "STEP_DONE", "MeArea loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ShellComplete.status, "STEP_DONE", "ShellComplete triggered.");
                done();
            });
        });
    });

    QUnit.test("FLP in app state", function (assert) {
        var done = assert.async();

        this.oConfigurationMock.FLPState.sStateName = "app";

        SchedulingAgent._initialize();

        EventHub.emit("startScheduler");

        EventHub.wait("FLPLoadingDone").then(function () {
            EventHub.once("FLPLoadingDone").do(function () {
                assert.strictEqual(DeepState.oState.ofLoadingBlock.AfterLoadPluginsCall.status, "BLOCK_DONE", "AfterLoadPluginsCall block loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.LoadRendererExtensions.status, "STEP_DONE", "Renderer Extensions loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MessagePopoverInit.status, "STEP_DONE", "Message Popover Init started.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UsageAnalytics.status, "STEP_DONE", "Usage analytics loaded.");

                assert.strictEqual(DeepState.oState.ofLoadingBlock.FLPPlugins.status, "BLOCK_DONE", "FLPPlugins block loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ConditionalWaitForAppLoading.status, "STEP_DONE", "Conditional timeout loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Notifications.status, "STEP_DONE", "Notifications loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UserImage.status, "STEP_DONE", "UserImage loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Search.status, "STEP_DONE", "Search loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MeArea.status, "STEP_DONE", "MeArea loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ShellComplete.status, "STEP_DONE", "ShellComplete triggered.");
                done();
            });
        });
    });

    QUnit.test("A step dependency wasn't resolved", function (assert) {
        var done = assert.async();

        this.oConfigurationMock.StepsToBeDone.LoadRendererExtensions = false;

        SchedulingAgent._initialize();

        EventHub.emit("startScheduler");

        EventHub.wait("FLPLoadingDone").then(function () {
            EventHub.once("FLPLoadingDone").do(function () {
                assert.strictEqual(DeepState.oState.ofLoadingBlock.AfterLoadPluginsCall.status, "BLOCK_ABORTED", "AfterLoadPluginsCall block loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.LoadRendererExtensions.status, "STEP_SKIPPED", "Renderer Extensions loaded.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MessagePopoverInit.status, "STEP_ABORTED", "Message Popover Init aborted.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UsageAnalytics, undefined, "Usage analytics not started.");

                assert.strictEqual(DeepState.oState.ofLoadingBlock.FLPPlugins, undefined, "FLPPlugins block not started.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ConditionalWaitForAppLoading, undefined, "Conditional timeout not started.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Notifications, undefined, "Notifications not started.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.UserImage, undefined, "UserImage not started.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.Search, undefined, "Search not started.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.MeArea, undefined, "MeArea not started.");
                assert.strictEqual(DeepState.oState.ofLoadingStep.ShellComplete, undefined, "ShellComplete not triggered.");

                // Technical assertions:
                assert.strictEqual(Object.keys(DeepState.oState.ofLoadingStep).length, 3, "Three steps had their state set.");
                assert.strictEqual(Object.keys(DeepState.oState.ofLoadingBlock).length, 1, "Only one block had its state set.");
                done();
            });
        });
    });

    QUnit.skip("Block dependency not working", function (assert) {
        // Out of scope, will be implemented at a later point
    });

});
