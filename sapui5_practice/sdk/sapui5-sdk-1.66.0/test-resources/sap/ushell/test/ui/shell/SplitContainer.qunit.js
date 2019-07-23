// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.ui.shell.SplitContainer
 */
(function () {
    "use strict";
    /*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
    notEqual, notStrictEqual, ok, raises, start, strictEqual, stop, test,
    jQuery, sap, sinon */

    jQuery.sap.require("sap.ushell.ui.shell.SplitContainer");
    jQuery.sap.require("sap.ushell.ui.shell.ShellLayout");
    jQuery.sap.require("jquery.sap.dom");

    sap.ui.core.Control.extend("my.Test", {
        renderer: function(rm, ctrl){
            rm.write("<div style='width:10px;height:10px;background-color:gray;'");
            rm.writeControlData(ctrl);
            rm.write("></div>");
        }
    });

    var aObjects = $("#uiArea1");
    if (aObjects.length === 0) {
        jQuery('<div id="uiArea1"></div>').appendTo('body');
    }

    var oSC = new sap.ushell.ui.shell.SplitContainer("sc", {
        content: [new my.Test("_ctnt")],
        secondaryContent: [new my.Test("_sec_ctnt")]
    });
    var oSC2 = new sap.ushell.ui.shell.SplitContainer("sc2", {
        showSecondaryContent: true,
        secondaryContentSize: "200px"
    });

    function testMultiAggregation(sName, oCtrl){
        oCtrl.getMetadata()._enrichChildInfos();
        var oAggMetaData = oCtrl.getMetadata().getAggregations()[sName];
        var oType = jQuery.sap.getObject(oAggMetaData.type === "sap.ui.core.Control" ? "my.Test" : oAggMetaData.type);

        function _get(){
            return oCtrl[oAggMetaData._sGetter]();
        }

        function _mutator(bInsert, aArgs){
            var sMutator = oAggMetaData._sMutator;
            if(bInsert){
                sMutator = sMutator.replace("add", "insert");
            }
            oCtrl[sMutator].apply(oCtrl, aArgs);
        }

        function _removeAll(){
            var sMutator = oAggMetaData._sGetter;
            sMutator = sMutator.replace("get", "removeAll");
            oCtrl[sMutator].apply(oCtrl);
        }

        equal(_get().length, 0, "Initial number of "+sName+" controls");
        _mutator(false, [new oType(sName+"_1")]);
        equal(_get().length, 1, "Number of "+sName+" controls after add");
        _mutator(true, [new oType(sName+"_2"), 0]);
        equal(_get().length, 2, "Number of "+sName+" controls after insert");
        equal(_get()[0].getId(), sName+"_2", "First "+sName+" control");
        equal(_get()[1].getId(), sName+"_1", "Second "+sName+" control");
        oCtrl[oAggMetaData._sRemoveMutator](0);
        equal(_get().length, 1, "Number of "+sName+" controls after remove");
        equal(_get()[0].getId(), sName+"_1", "First "+sName+" control");
        _removeAll();
        equal(_get().length, 0, "Number of "+sName+" controls after removeAll");
    };

    oSC.placeAt("uiArea1");

    module("sap.ushell.ui.shell.SplitContainer", {
        setup: function () {
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        teardown: function () {
        }
    });

    test("Properties - Default Values", function() {
        equal(oSC.getShowSecondaryContent(), false, "Default 'showSecondaryContent'");
        equal(oSC.getSecondaryContentSize(), "250px", "Default 'secondaryContentWidth'");
    });

    test("Properties - Custom Values", function() {
        equal(oSC2.getShowSecondaryContent(), true, "Custom 'showSecondaryContent'");
        equal(oSC2.getSecondaryContentSize(), "200px", "Custom 'secondaryContentWidth'");
    });

    test("Aggregation 'content'", function() {
        testMultiAggregation("content", oSC2);
    });

    test("Aggregation 'secondaryContent'", function() {
        testMultiAggregation("secondaryContent", oSC2);
    });

    test("Content", function() {
        ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("sc-canvas"), jQuery.sap.domById("_ctnt")), "Content rendered correctly");
        ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("sc-pane"), jQuery.sap.domById("_sec_ctnt")), "Secondary Content rendered correctly");
    });

    asyncTest("Secondary Content Width", function() {
        oSC.setSecondaryContentSize("200px");
        setTimeout(function(){
            var nOuterWidth = jQuery.sap.byId("sc-pane").outerWidth();
            ok(Math.abs(200 - nOuterWidth) <= 1, "Secondary Content Width after change");
            start();
        }, 600);
    });

    asyncTest("Open/Close Secondary Content", function() {
        function checkVisibility(){
            return jQuery.sap.byId("sc-panecntnt").is(":visible");
        }

        ok(!checkVisibility(), "Secondary Content initially hidden");
        oSC.setShowSecondaryContent(true);

        setTimeout(function(){
            ok(checkVisibility(), "Secondary Content visible");
            oSC.setShowSecondaryContent(false);
            setTimeout(function(){
                ok(!checkVisibility(), "Secondary Content hidden again");
                start();
            }, 600);
        }, 600);
    });

    // this test actually clears the relevant objects such as the shells and the custom DIV created beforehand
    // this test is set to run last and should remain so.
    test("Clear UI", 0, function () {
        oSC.destroy();
        oSC2.destroy();
        jQuery("#uiArea1").remove();
    });

}());