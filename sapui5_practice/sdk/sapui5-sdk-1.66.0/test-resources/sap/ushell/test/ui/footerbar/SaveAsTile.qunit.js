(function () {
    "use strict";
    /*global module, ok, test, jQuery, sap, sinon */
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.services.Container");
    jQuery.sap.require("sap.ui.thirdparty.datajs");

    var oRenderer,
        oView,
        oController,
        viewData,
        oControllerLoadGroupsSpy;

    module("sap.ushell.ui.footerbar.SaveAsTile", {
        setup: function () {
            sap.ushell.bootstrap("local");
            oRenderer = sap.ushell.Container.createRenderer("fiori2");
            viewData = {
                appData : {
                    icon: "sap-icon://Fiori9/F1515",
                    info: "Description",
                    number: 515,
                    numberState: "Positive",
                    numberUnit: "Days Overdue",
                    subtitle: "Test Subtitle",
                    title: "Test Title 1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890yyyyy"
                }
            };
            oView = new sap.ui.view(
                {
                    type: sap.ui.core.mvc.ViewType.JS,
                    viewName: "sap.ushell.ui.footerbar.SaveAsTile",
                    viewData: viewData
                });
            oController = oView.getController();
            oControllerLoadGroupsSpy = sinon.spy(oController, "loadPersonalizedGroups");
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        teardown: function () {
            delete sap.ushell.Container;
            oRenderer.destroy();
            oView.destroy();
            oControllerLoadGroupsSpy.restore();
        }
    });

    /*asyncTest("calcTileDataFromServiceUrl Test", function () {

        var oDataStub = sinon.stub(OData, "read");

        OData.read = function (request, success, fail) {
            var oResult = {
                number: 805,
                numberState: "Negative",
                numberUnit: "Days",
                subtitle: "",
                title: "",
                stateArrow: "up"
            };
            success(oResult);
        };
        oController.calcTileDataFromServiceUrl("url");

        setTimeout(function () {
            start();
            ok(oController.getView().getModel().getProperty("/title").length === 256 ,'Check title limit to 256');
            ok(oController.getView().getModel().getProperty("/subtitle") === "Test Subtitle" ,'Check subtitle');
            ok(oController.getView().getModel().getProperty("/stateArrow") === "up" ,'Check Arrow state is set from oData response');
            ok(oController.getView().getModel().getProperty("/numberState") === "Negative" ,'Check Number state is set from oData response');
            ok(oController.getView().getModel().getProperty("/numberUnit") === "Days" ,'Check Number unit is set from oData response');
            ok(oController.getView().getModel().getProperty("/numberValue") === 805 ,'Check Number value is set from oData response');
            ok(oController.getView().getModel().getProperty("/icon") === "sap-icon://Fiori9/F1515" ,'Icon is set from view data');
            ok(oController.getView().getModel().getProperty("/info") === "Description" ,'Info is set from view data');

        }, 0);

        oDataStub.restore();

    });
    asyncTest("Check loadPersonalized group is called Test", function () {
        oController.onInit();
        setTimeout(function () {
            start();
            ok(oControllerLoadGroupsSpy.calledOnce,  "loadPersonalizedGroups method was called exactly one time");

        }, 0);

    });

    test("Check required property is set correctly on input elements", function () {
        var oView = oController.getView(),
            oContent = oView.getContent();
        ok(oContent[2].getProperty("required") === true,  "title have a required property");
        ok(oContent[4].getProperty("required") === false,  "subtitle doesn't have a required property");
        ok(oContent[6].getProperty("required") === false,  "info doesn't have a required property");
    });*/
}());
