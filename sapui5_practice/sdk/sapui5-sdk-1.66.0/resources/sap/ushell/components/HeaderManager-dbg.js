// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/utils",
    "sap/ushell/utils/clone",
    "sap/ushell/components/StateHelper",
    "sap/ushell/components/_HeaderManager/PropertyStrategiesFactory",
    'sap/ui/core/theming/Parameters',
    'sap/base/util/ObjectPath',
    'sap/ui/Device'
    ],
    function (
        Config,
        EventHub,
        utils,
        fnClone,
        StateHelper,
        fnGetPropertyStrategy,
        ThemingParameters,
        ObjectPath,
        Device
    ) {
    "use strict";

    var oHeaderDefaultProperties = {
        application: {},
        centralAreaElement: null,
        headEndItems: [],
        headItems: [],
        headerVisible: true,
        showLogo: false,
        ShellAppTitleState: undefined,
        rootIntent: "",
        title: ""
    };

    var oHeaderBaseStates;
    var oApplicationStates;
    var BASE_STATES = {
        "blank": {},
        "blank-home": {},
        "home": {
            "headItems": []
        },
        "app": {
            "headItems": ["backBtn", "homeBtn"]
        },
        "minimal": {
            "headItems": ["homeBtn"]
        },
        "standalone": {
            "headItems": ["backBtn"]
        },
        "embedded": {
            "headItems": ["backBtn", "homeBtn"]
        },
        "embedded-home": {
            "headItems": []
        },
        "headerless": {
            "headItems": ["backBtn", "homeBtn"],
            "headerVisible": false
        },
        "merged": {
            "headItems": ["backBtn", "homeBtn"]
        },
        "headerless-home": {
            "headerVisible": false
        },
        "merged-home": {},
        "lean": {
            "headItems": []
        },
        "lean-home": {}
    };
    var aDoableObjects = [];

    /**
     * Initialisation of the HeaderManager
     *
     * @param {object} oConfig Shell config
     * @param {object} oApplicationShellStates the global state from AppLifeCycle.
     */
    function init(oConfig, oApplicationShellStates) {
        var sInitialState = oConfig && oConfig.appState ? oConfig.appState : "home";
        oHeaderBaseStates = _createInitialState(oConfig);
        // Custom states are received from the AppLifeCycle.
        // It is a global object, might be changed by AppLifeCycle anytime.
        // We keep the reference to this object and use it for calculation of the current state
        oApplicationStates = oApplicationShellStates;

        _handleHeaderResize(Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD));

         _subscribeToEvents();

        // Emit the initial state of header
        recalculateState(sInitialState);
   }

    /**
     *  Destroy the Header manager
     *
     *  Destroy header controls created in the HeaderManager
     */
    function destroy() {
        _unSubscribeFromEvents();
    }


    function _subscribeToEvents() {
         var oDoable = EventHub.on("setHeaderCentralAreaElement").do(function (oParameters) {
            updateStates({
                propertyName: "centralAreaElement",
                value: oParameters.id,
                aStates: StateHelper.getPassStates(oParameters.states), // If no states provided - set for all states
                bCurrentState: !!oParameters.currentState,
                bDoNotPropagate: !!oParameters.bDoNotPropagate
            });
        });
        aDoableObjects.push(oDoable);
        aDoableObjects.push(EventHub.on("ShellFloatingContainerDockedIsResized").do(_handleHeaderResize));
        aDoableObjects.push(EventHub.on("updateHeaderOverflowState").do(_handleHeaderResize));
        Device.media.attachHandler(_handleHeaderResize, this, Device.media.RANGESETS.SAP_STANDARD);
    }

    function _unSubscribeFromEvents() {
        if (aDoableObjects) {
            aDoableObjects.forEach(function (oDoable) {
                oDoable.off();
            });
        }
        Device.media.detachHandler(_handleHeaderResize, this, Device.media.RANGESETS.SAP_STANDARD);
    }

    function _handleHeaderResize(oParams) {
        validateShowLogo(oParams);
        handleEndItemsOverflow(oParams);
    }

    function validateShowLogo (oParams) {
        var deviceType,
            sCurrentState = Config.last("/core/shell/model/currentState/stateName"),
            bIsHeaderLessState = sCurrentState === 'merged' || sCurrentState === 'headerless',
            bIsMeAreaSelected = Config.last("/core/shell/model/currentViewPortState") === "LeftCenter",
            bShellLogoVisible = true;
        if (oParams && oParams.name) {
            deviceType = oParams.name;
        } else {
            deviceType = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name;
        }

        if (deviceType === "Phone" && !bIsMeAreaSelected || bIsHeaderLessState) {
            bShellLogoVisible = false;
        }
        // Set the arg bDoNotPropagate to true, otherwise changes will be redundantly apply also to other states
        // (e.g. - headerless should always be presented without logo)
        updateStates({
            propertyName: "showLogo",
            value: bShellLogoVisible,
            aStates: ["home", "app", "blank", "blank-home", "minimal", "lean"],
            bCurrentState: false,
            bDoNotPropagate: true
        });
    }

    function initShellBarLogo (oConfig, oShellHeader) {
        if (oConfig && oConfig.appState === "embedded") {
            oShellHeader.setLogo(sap.ui.resource('sap.ui.core', 'themes/base/img/1x1.gif'));
            return;
        }

        function getIconURI (ico) { // The icon may be "none" or "url('xxxxx')", return null or xxxxx
            var match = /url[\s]*\('?"?([^'")]*)'?"?\)/.exec(ico);
            return match ? match[1] : null;
        }

        function setBarLogo () {
            // Set custom icon or standard SAP logo
            var sLogoUrl = getIconURI(ThemingParameters.get("sapUiGlobalLogo"))
                || sap.ui.require.toUrl("sap/ushell") + '/themes/base/img/sap_55x27.png';
            if (oShellHeader) {
                oShellHeader.setLogo(sLogoUrl);
            }
        }

        // Do not set logo image until the main theme is loaded
        if (sap.ui.getCore().isThemeApplied()) {
            setBarLogo();
        }
        sap.ui.getCore().attachThemeChanged(setBarLogo);
    }

    /**
     * Logic to determin if the headEndItemsOverflow button should be visible.
     *
     * @param {object} oParams an object containing a device name.
     */
    function handleEndItemsOverflow (oParams) {
        var aEndItems = Config.last("/core/shellHeader/headEndItems");
        var mDeviceTypes = {
            "Phone" : true,
            "Tablet" : true
        };

        // there is enough place for the buttons on the tablet size in Fiori3
        delete mDeviceTypes["Tablet"];
        // If there are up to 2 items and one of them is MeArea, don't show the overflow button
        if (aEndItems.length < 2 || (aEndItems.length === 2 && aEndItems.indexOf("meAreaHeaderButton") !== -1)) {
            return;
        }


        function removeOverflowBtn () {
            removeHeaderEndItem(["endItemsOverflowBtn"], false, ["home", "app"]);
            // Destroy the popover to avoid duplicate elements ids in the DOM
            // and to ensure the endItems are rendered correctly in the header
            var oPopover = sap.ui.getCore().byId('headEndItemsOverflow');
            if (oPopover) {
                oPopover.destroy();
            }
        }

        var sDeviceType = (oParams && oParams.name) || Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name;

        if (sDeviceType in mDeviceTypes) {
            if (aEndItems.indexOf("endItemsOverflowBtn") === -1) {
                // Add the endItemsOverflowBtn to the model in case we are
                // not in desktop mode and in case it does not exists
                addHeaderEndItem(["endItemsOverflowBtn"], false, ["home", "app"]);
            } else {
                // This case is when the overflow button exists and we have switched between Tablet and Phone media causing header items
                // to get in or out of the popover, hence we need to re-render the shell header.
                removeOverflowBtn();
                // Without the timeout, the previous call to removeOverflowButton has no effect
                window.setTimeout(function () {
                    addHeaderEndItem(["endItemsOverflowBtn"], false, ["home", "app"]);
                });
            }
        } else {
            removeOverflowBtn();
        }
    }

    function addHeaderEndItem (aIds, bCurrentState, aStates, bDoNotPropagate) {
        updateStates({
            propertyName: "headEndItems",
            value: aIds,
            aStates: aStates,
            bCurrentState: !!bCurrentState,
            bDoNotPropagate: !!bDoNotPropagate
        });
    }

    function removeHeaderEndItem (aIds, bCurrentState, aStates) {
        updateStates({
            propertyName: "headEndItems",
            value: aIds,
            aStates: aStates,
            bCurrentState: !!bCurrentState,
            action: "remove",
            bDoNotPropagate: false
        });
    }

    // Header state methods

    /**
     * Generate base header state
     *
     * @param {object} oStateDeltas state delta
     * @param {object} oDefaults defaults
     * @returns {object} state
     */
    function generateBaseHeaderState (oStateDeltas, oDefaults) {
        var oState = {};
        Object.keys(oStateDeltas).forEach(function (sDeltaState) {
            var oDelta = oStateDeltas[sDeltaState];
            oState[sDeltaState] = Object.keys(oDelta).reduce(function (oTarget, sDeltaProperty) {
                oTarget[sDeltaProperty] = oDelta[sDeltaProperty];
                return oTarget;
            }, fnClone(oDefaults));

        });
        return oState;
    }

    /**
     * Update states
     *
     * @param {object} oParameters object with parameters used for update
     */
    function updateStates (oParameters) {
        var sPropertyName = oParameters.propertyName,
            aStatesToUpdate = !oParameters.bCurrentState ? StateHelper.getAllStateToUpdate(oParameters.aStates, oParameters.bDoNotPropagate) : [],
            oCurrentState = Config.last("/core/shellHeader"),
            sCurrentStateName = Config.last("/core/shell/model/currentState/stateName"),
            valueToApply = oParameters.value,
            oPropertyStrategy;

        if (sPropertyName.charAt(0) === "/") {
            sPropertyName = sPropertyName.substring(1);
        }
        oPropertyStrategy = fnGetPropertyStrategy(sPropertyName, oParameters.action);

        // If we don't know how to deal with property, don't do any updates
        if (!oPropertyStrategy) {
            return;
        }
        // Don't update any base states if bCurrentState is true
        if (!oParameters.bCurrentState) {
            oHeaderBaseStates = _calculateNewBaseStates(
                oHeaderBaseStates,
                sPropertyName,
                oPropertyStrategy,
                aStatesToUpdate,
                valueToApply);
        }
        // Update current header state in sap/ushell/Config
        if (aStatesToUpdate.indexOf(sCurrentStateName) > -1 || oParameters.bCurrentState) {
            var vCurrentPropertyValue = ObjectPath.get(sPropertyName.split("/"), oCurrentState),
                vNewPropertyValue = oPropertyStrategy.execute(vCurrentPropertyValue, valueToApply);
            if (vCurrentPropertyValue !== vNewPropertyValue) {
                ObjectPath.set(sPropertyName.split("/"), vNewPropertyValue, oCurrentState);
                _updateConfig(sPropertyName, oCurrentState);
            }
        }
        // In case of the current state we need to update custom model (reference object from AppLifeCycle) as well
        if (oParameters.bCurrentState) {
            _updateCustomModel(sPropertyName, oPropertyStrategy, valueToApply);
        }
    }

    function extendStates (oStates) {
        var stateEntryKey;
        for (stateEntryKey in oStates) {
            if (oStates.hasOwnProperty(stateEntryKey)) {
                utils.updateProperties(oHeaderBaseStates[stateEntryKey], oStates[stateEntryKey]);
            }
        }
    }

    /**
     * Recalculate states
     *
     * @param {string} sBaseStateName name of base state
     * @param {string} sExtendedStateName name of extended state
     */
    function recalculateState (sBaseStateName, sExtendedStateName) {
        // Apply the extended state to the current if sExtendedStateName is not empty
        var oBaseState = !sExtendedStateName ? oHeaderBaseStates[sBaseStateName] : Config.last("/core/shellHeader"),
            oCustomState,
            oExtendedState;

        if (!oBaseState) {
            throw new Error("the state (" + sBaseStateName + ") does not exist");
        }
        if (oApplicationStates && oApplicationStates.customShellState) {
            oCustomState = oApplicationStates.customShellState.currentState;
        }
        if (sExtendedStateName && oApplicationStates.extendedShellStates[sExtendedStateName]) {
            oExtendedState = oApplicationStates.extendedShellStates[sExtendedStateName].customState.currentState;
        }
        Config.emit("/core/shellHeader", calculateCurrentHeaderState(oBaseState, oCustomState, oExtendedState));
    }

    /**
     * Calculate current header state
     *
     * @param {object} oBaseState base state
     * @param {object} oCustomState custom state
     * @param {object} oExtendedState extended state
     * @returns {undefined}
     */
    function calculateCurrentHeaderState (oBaseState, oCustomState, oExtendedState) {
        var oResult = {};
        Object.keys(oBaseState).forEach(function (sPropertyName) {
            var oPropertyStrategy = fnGetPropertyStrategy(sPropertyName),
                vPropertyValue;
            // If don't have strategy to apply property use only property from base state
            if (!oPropertyStrategy) {
                oResult[sPropertyName] = fnClone(oBaseState[sPropertyName]);
                return;
            }
            vPropertyValue = fnClone(oBaseState[sPropertyName]);
            // Extend state has higher property than custom property
            if (oExtendedState) {
                vPropertyValue = oPropertyStrategy.execute(vPropertyValue, oExtendedState[sPropertyName]);
            }
            if (oCustomState) {
                vPropertyValue = oPropertyStrategy.execute(vPropertyValue, oCustomState[sPropertyName]);
            }
            oResult[sPropertyName] = vPropertyValue;
        });
        return oResult;
    }

    /**
     * Create initial state
     *
     * @param {object} oConfig view configuration
     */
    function _createInitialState (oConfig) {
        if (oConfig) {
            oHeaderDefaultProperties.rootIntent = "#" + oConfig.rootIntent;
        }
        var oBaseStates = generateBaseHeaderState(BASE_STATES, oHeaderDefaultProperties);

        function _moveActionsToShellHeader (btnName, oBaseStates) {
            var key, index;
            for (key in oBaseStates) {
                if (key === "blank" || key === "blank-home") {
                    continue;
                }
                if (btnName === "ActionModeBtn" && key === "app") {
                    continue;
                }
                if ((btnName === "openCatalogBtn" || btnName === "userSettingsBtn") && (key === "lean" || key === "lean-home")) {
                    continue;
                }
                if (btnName === "ContactSupportBtn" || btnName === "EndUserFeedbackBtn") {
                    if (["home", "app", "minimal", "standalone", "embedded", "embedded-home", "lean"].indexOf(key) === -1) {
                        continue;
                    }
                }

                // Add the button to the shell header if not yet exists in this state
                index = oBaseStates[key].headEndItems.indexOf(btnName);
                if (index === -1) {
                    oBaseStates[key].headEndItems.push(btnName);
                }
            }
        }

        function _updateTitle (sTitle, oBaseStates) {
            var key;
            for (key in oBaseStates) {
                oBaseStates[key].title = sTitle;
            }
        }

        if (oConfig) {
            if (oConfig.moveEditHomePageActionToShellHeader) {
                _moveActionsToShellHeader("ActionModeBtn", oBaseStates);
            }
            if (oConfig.moveContactSupportActionToShellHeader) {
                _moveActionsToShellHeader("ContactSupportBtn", oBaseStates);
            }
            if (oConfig.moveGiveFeedbackActionToShellHeader) {
                _moveActionsToShellHeader("EndUserFeedbackBtn", oBaseStates);
            }
            if (oConfig.moveAppFinderActionToShellHeader) {
                _moveActionsToShellHeader("openCatalogBtn", oBaseStates);
            }
            if (oConfig.moveUserSettingsActionToShellHeader) {
                _moveActionsToShellHeader("userSettingsBtn", oBaseStates);
            }
            if (oConfig.title) {
                _updateTitle(oConfig.title, oBaseStates);
            }
        }

        return oBaseStates;
    }

    function _calculateNewBaseStates (oBaseStates, sPropertyName, oPropertyStrategy, aStates, valueToApply) {
        if (aStates.length === 0) {
            return oBaseStates;
        }
        var oNewState = fnClone(oBaseStates);
        aStates.forEach(function (sStateName) {
            var oState = oNewState[sStateName],
                vNewValue;
            if (oState) {
                vNewValue = oPropertyStrategy.execute(ObjectPath.get(sPropertyName.split("/"), oState), valueToApply);
                ObjectPath.set(sPropertyName.split("/"), vNewValue, oState);
            }
        });
        return oNewState;
    }

    function _updateCustomModel (sPropertyName, oPropertyStrategy, valueToApply) {
        var oCustomState,
            vNewValue;
        if (!oApplicationStates) {
            return;
        }
        oCustomState = oApplicationStates.customShellState.currentState;
        vNewValue = oPropertyStrategy.execute(ObjectPath.get(sPropertyName.split("/"), oCustomState), valueToApply);
        ObjectPath.set(sPropertyName.split("/"), vNewValue, oCustomState);

    }

    function _updateConfig (sPropertyName, oCurrentState) {
        var sRootProperty = sPropertyName.split("/").shift();
        Config.emit("/core/shellHeader/" + sRootProperty, oCurrentState[sRootProperty]);
    }

    function _getBaseState (sState) {
        var result;
        try {
            result = oHeaderBaseStates[sState];
        } catch (ex) {
            result = undefined;
        }
        return result;
    }

    function _getBaseStateMember (sState, sProperty) {
        var result;
        try {
            result = _getBaseState(sState)[sProperty];
        } catch (ex) {
            result = undefined;
        }
        return result;
    }

    function _rewriteBaseStates (oTestBaseState) {
        oHeaderBaseStates = oTestBaseState;
    }

    return {
        init: init,
        destroy: destroy,

        // State methods
        updateStates: updateStates,
        recalculateState: recalculateState,
        extendStates: extendStates,

        initShellBarLogo: initShellBarLogo,
        validateShowLogo: validateShowLogo,
        handleEndItemsOverflow: handleEndItemsOverflow,

        /* for testing */
        _resetBaseStates: _rewriteBaseStates,
        _generateBaseHeaderState: generateBaseHeaderState,
        _createInitialState: _createInitialState,
        _getBaseState: _getBaseState,
        _getBaseStateMember: _getBaseStateMember
    };

}, /* bExport */ false);
