// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.ui.launchpad.TileContainer
 */
(function () {
    "use strict";
    /*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
     notEqual, notStrictEqual, ok, raises, start, strictEqual, stop, test,
     jQuery, sap, sinon */

    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.m.Button");
    jQuery.sap.require("sap.ushell.ui.launchpad.AccessibilityCustomData");
    jQuery.sap.require("sap.ushell.services.Container");

    var oCore = sap.ui.getCore(),
        oConfig = (oCore && oCore.getConfiguration) ? oCore.getConfiguration() : undefined,
        stub,
        testContainer,
        oTestControl,
        oAccessibilityCustomData

    module("sap.ushell.ui.launchpad.AccessibilityCustomData", {
        setup: function () {
            testContainer = jQuery('<div id="testContainer" style="display: none;">').appendTo('body');
            oTestControl =  new sap.m.Button('testControl');
            oAccessibilityCustomData = new sap.ushell.ui.launchpad.AccessibilityCustomData();
            oTestControl.addCustomData(oAccessibilityCustomData);
            oTestControl.placeAt('testContainer');
            sap.ushell.bootstrap("local");
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        teardown: function () {
            if (stub) {
                stub.restore();
            }
            oAccessibilityCustomData.destroy();
            oAccessibilityCustomData.destroy();
            oTestControl.destroy();
            jQuery(testContainer).remove();
            delete sap.ushell.Container;
        }
    });

    asyncTest("Add valid aria-label attribute as Custom Data", function () {
        if (oConfig) {
            stub = sinon.stub(oConfig, "getAccessibility").returns(true);
        }
        oAccessibilityCustomData.setKey('aria-label');
        oAccessibilityCustomData.setValue('meaningless text');
        oAccessibilityCustomData.setWriteToDom(true);
        setTimeout(function () {
            start();
            var bAriaLabelAdded = testContainer.find('[aria-label="meaningless text"]').length > 0;

            ok(bAriaLabelAdded, 'Area Label added');
        }, 0);
    });

    asyncTest("Add valid Role attribute as Custom Data", function () {
        if (oConfig) {
            stub = sinon.stub(oConfig, "getAccessibility").returns(true);
        }
        oAccessibilityCustomData.setKey('role');
        oAccessibilityCustomData.setValue('button');
        oAccessibilityCustomData.setWriteToDom(true);
        setTimeout(function () {
            start();
            var bRoleAttributeAdded = testContainer.find('[role="button"]').length > 0;

            ok(bRoleAttributeAdded, 'Role attribute added');
        }, 0);
    });

    asyncTest("Add aria-label attribute as Custom Data with WriteToDom set as false", function () {
        if (oConfig) {
            stub = sinon.stub(oConfig, "getAccessibility").returns(true);
        }
        oAccessibilityCustomData.setKey('aria-label');
        oAccessibilityCustomData.setValue('meaningless text');
        oAccessibilityCustomData.setWriteToDom(false);
        setTimeout(function () {
            start();
            var bAriaLabelAdded = testContainer.find('[aria-label]').length > 0;

            ok(!bAriaLabelAdded, 'Area Label added');
        }, 0);
    });

    asyncTest("Add a non aria-label attribute as Accessibility Custom Data", function () {
        if (oConfig) {
            stub = sinon.stub(oConfig, "getAccessibility").returns(true);
        }
        oAccessibilityCustomData.setKey('test');
        oAccessibilityCustomData.setValue('meaningless text');
        oAccessibilityCustomData.setWriteToDom(true);
        setTimeout(function () {
            start();
            var bAriaLabelAdded = testContainer.find('[data-test="meaningless text"]').length > 0;

            ok(bAriaLabelAdded, 'data-test added');
        }, 0);
    });

    asyncTest("Add aria-label attribute when accessibilty state is false", function () {
        if (oConfig) {
            stub = sinon.stub(oConfig, "getAccessibility").returns(false);
        }
        oAccessibilityCustomData.setKey('aria-label');
        oAccessibilityCustomData.setValue('meaningless text');
        oAccessibilityCustomData.setWriteToDom(true);
        setTimeout(function () {
            start();
            var bAriaLabelAdded = testContainer.find('[aria-label]').length > 0;

            ok(!bAriaLabelAdded, 'aria label not added');
        }, 0);
    });
    
    asyncTest("Append DIV element with navigationMode ID to tile, when focusing it", function () {

        var oTile = new sap.ushell.ui.launchpad.Tile({
            navigationMode: "embedded"
        });
        oTile.addDelegate({
            onAfterRendering: function () {
                jQuery(oTile.getDomRef()).focusin();
                setTimeout(function () {
                    start();
                    var sId = oTile.getId() + '_navigationMode';
                    assert.ok( jQuery('#' + sId)[0].tagName === 'DIV', "Div element with ID that contains _navigationMode" );
                    assert.ok( jQuery(oTile.getDomRef()).find(sId).selector === sId, "Tile have descendant with known ID" );
                }, 0);
            }
        }, false);
        oTile.placeAt(testContainer);
        var oStaticTile = new sap.ushell.ui.tile.StaticTile();
        oTile.addTileView(oStaticTile);
    });
}());
