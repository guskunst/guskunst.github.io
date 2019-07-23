//@ui5-bundle sap/ushell/demo/ReceiveParametersTestApp/Component-preload.js
sap.ui.require.preload({
	"sap/ushell/demo/ReceiveParametersTestApp/Component.js":function(){// define a root UIComponent which exposes the main view
/*global jQuery, sap */
jQuery.sap.declare("sap.ushell.demo.ReceiveParametersTestApp.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.Router");

// new Component
sap.ui.core.UIComponent.extend("sap.ushell.demo.ReceiveParametersTestApp.Component", {

    oMainView : null,

    // use inline declaration instead of component.json to save 1 round trip
    metadata : {
        "manifest": "json"
    },

    createContent : function () {
        "use strict";
        var oModel,
            oModel2,
            oComponentData;
        jQuery.sap.log.info("sap.ushell.demo.ReceiveParametersTestApp: Component.createContent");

//        this.oRouter.initialize(); // router initialization must be done after view construction

        oModel = new sap.ui.model.json.JSONModel();

        /* *StartupParameters* (2)   */
        /* http://localhost:8080/ushell/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html#Action-toappnavsample?AAA=BBB&DEF=HIJ */
        /* results in   { AAA : [ "BBB"], DEF: ["HIJ"] }  */
        oComponentData = this.getComponentData && this.getComponentData();
        jQuery.sap.log.info("sap.ushell.demo.ReceiveParametersTestApp: app was started with parameters " + JSON.stringify(oComponentData.startupParameters || {}));

        oModel.setData(this.createStartupParametersData(oComponentData && oComponentData.startupParameters || {}));
        this.setModel(oModel, "startupParameters");

        this.oMainView = sap.ui.xmlview("sap.ushell.demo.ReceiveParametersTestApp.Main");
        this.oMainView.setHeight("100%");
        oModel2 = new sap.ui.model.json.JSONModel({ appstate : " no app state "});
        sap.ushell.Container.getService("CrossApplicationNavigation").getStartupAppState(this).done(function (oAppState) {
            oModel2.setProperty("/appstate", JSON.stringify(oAppState.getData() || " no app state ", undefined, 2));
        });
        this.oMainView.setModel(oModel2, "AppState");
        var that = this;
        if(oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["block"]
        || oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["block-count"]
        || oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["block-waves"]) {
            var block =       oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["block"] && oComponentData.startupParameters["block"][0] || 1000;
            var block_count = oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["block-count"] &&  oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["block-count"][0] || 1;
            var block_waves = oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["block-waves"] &&  oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["block-waves"][0] || 1;
            var block_delay = oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["block-delay"] &&  oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["block-delay"][0]  || 1;


            function makeBlock(i,w,block) {
            var fname = "w" + w + "_" + i;
                that[fname] = function() {
                    var tmI = new Date().getTime();
                    var ts = 0;
                    var k = 3;
                    while(ts < block) {
                        k = k + 1; 
                        ts = (new Date().getTime()) - tmI;
                        k = k + ts;
                    };
                    jQuery.sap.log.error("wavew" + w + "_" + i + " done " + k);
                    if( i === 0 ) {
                        makeWave(w+1,block);
                    }
                };
                jQuery.sap.log.error("schedule wave" + fname);
                setTimeout(that[fname],block_delay);
            }
            function makeWave(w,block) {
                if (w >= block_waves ) {
                    return;
                }
                for(i = 0; i < block_count; ++i) {
                    makeBlock(i,w,block);
                }
            }
            makeWave(0,block);
            function a() {
                var tmI = new Date().getTime();
                var ts = 0;
                var k = 3;
                while(ts < block) {
                    k = k + 1;
                    ts = (new Date().getTime()) - tmI;
                    k = k + ts;
                };
            };
            a(); // block once synchronous
        }
        return this.oMainView;
    },

    createStartupParametersData : function (oComponentData) {
        "use strict";
        // convert the raw componentData into a model that is consumed by the UI
        var aParameters = [],
            sKey = null;
        if (oComponentData) {
            for (sKey in oComponentData) {
                if (Object.prototype.hasOwnProperty.call(oComponentData, sKey)) {
                    if (sKey === "CRASHME") {
                        throw new Error("Deliberately crashed on startup");
                    }
                    aParameters.push({
                        key : sKey,
                        value : oComponentData[sKey].toString()
                    });
                }
            }
        }
        return {
            "parameters" : aParameters
        };
    },

    exit : function () {
        "use strict";
        jQuery.sap.log.info("sap.ushell.demo.ReceiveParametersTestApp: Component.js exit called : this.getId():" + this.getId());

        this.oMainView = null;
    }
});
},
	"sap/ushell/demo/ReceiveParametersTestApp/Main.controller.js":function(){(function () {
    "use strict";
    /*global sap,jQuery */
    /*jslint nomen: true, vars: true */
    sap.ui.controller("sap.ushell.demo.ReceiveParametersTestApp.Main", {

        getMyComponent : function () {
            var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var myComponent = sap.ui.component(sComponentId);
            return myComponent;
        },


     

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf Main
         */
        onInit: function () {
            var that = this;

        },

        navigate : function (sEvent, sNavTarget) {
            return;
            var oView = null;
            if (sEvent === "toHome") {
                // use external navigation to navigate to homepage
                if (this.oCrossAppNavigator) {
                    this.oCrossAppNavigator.toExternal({ target : { shellHash : "#" }});
                }
                return;
            }
            if (sEvent === "toView") {
                var sView = sNavTarget; // navtarget;
                if (sView === "" || !this.isLegalViewName(sView)) {
                    var vw = this.mViewNamesToViews.Detail;
                    this.oApp.toDetail(vw);
                    return;
                }
                /* *Nav* (7) Trigger inner app navigation */
                this.oInnerAppRouter.navTo("toaView", { viewName : sView}, true);
                return;
            }
            if (sEvent === "back") {
                this.oApp.back();
            } else if (sEvent === "backDetail") {
                this.oApp.backDetail();
            } else {
                jQuery.sap.log.info("sap.ushell.demo.ReceiveParametersTestApp: Unknown navigation");
            }

        },

        isLegalViewName : function (sViewNameUnderTest) {
            return (typeof sViewNameUnderTest === "string") && (["Detail","View1", "View2", "View3", "View4"].indexOf(sViewNameUnderTest) >= 0);
        },

        doNavigate : function (sEvent, sNavTarget) {
        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf Main
         */
//    onBeforeRendering: function() {
//
//    },
        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf Main
         */
//    onAfterRendering: function() {
//
//    },
        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf Main
         */
        onExit: function () {
            jQuery.sap.log.info("sap.ushell.demo.ReceiveParametersTestApp: On Exit of Main.XML.controller called : this.getView().getId():" + this.getView().getId());
            this.mViewNamesToViews = {};
            if (this.oInnerAppRouter) {
                this.oInnerAppRouter.destroy();
            }
        }

    });

}());
},
	"sap/ushell/demo/ReceiveParametersTestApp/Main.view.xml":'<?xml version="1.0" encoding="UTF-8" ?>\n<!-- ${copyright} -->\n<core:View \n\txmlns:core="sap.ui.core" \n\txmlns:mvc="sap.ui.core.mvc" \n\txmlns="sap.m" \n\txmlns:l="sap.ui.layout"\n\txmlns:t="sap.ui.codeeditor" \n\txmlns:form="sap.ui.layout.form" controllerName="sap.ushell.demo.ReceiveParametersTestApp.Main" \n\txmlns:html="http://www.w3.org/1999/xhtml">\n\t<Page showHeader="false">\n\t\t<content>\n\t\t\t<l:Grid class="sapUiSmallMarginTop"\thSpacing="2" defaultSpan="L6 M12 S12">\n\t\t\t\t<l:content>\n\t\t\t\t\t<VBox class="sapUiSmallMarginTop">\n\t\t\t\t\t\t<Title text="Received AppState (JSON.stringified)" titleStyle="H4"/>\n\t\t\t\t\t\t<t:CodeEditor editable="false" width="40em" height="30em" value="{AppState>/appstate}" />\n\t\t\t\t\t</VBox>\t\t\t\t\t\t\t\n\t\t\t\t\t<Table headerText="Application Startup Parameters" noDataText="No startup parameters passed" items="{path: \'startupParameters>/parameters\'}">\n\t\t\t\t\t\t<columns>\n\t\t\t\t\t\t\t<Column\twidth="30%">\n\t\t\t\t\t\t\t\t<Text text="Name" />\n\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t</Column>\n\t\t\t\t\t\t\t<Column minScreenWidth="Tablet" demandPopin="true">\n\t\t\t\t\t\t\t\t<Text text="Value" />\n\t\t\t\t\t\t\t</Column>\n\t\t\t\t\t\t</columns>\n\t\t\t\t\t\t<items>\n\t\t\t\t\t\t\t<ColumnListItem>\n\t\t\t\t\t\t\t\t<cells>\n\t\t\t\t\t\t\t\t\t<Text text="{startupParameters>key}" />\n\t\t\t\t\t\t\t\t\t<Text text="{startupParameters>value}" />\n\t\t\t\t\t\t\t\t</cells>\n\t\t\t\t\t\t\t</ColumnListItem>\n\t\t\t\t\t\t</items>\n\t\t\t\t\t</Table>\t\n\t\t\t\t</l:content>\n\t\t\t</l:Grid>\n\t\t</content>\n\t</Page>\n</core:View>',
	"sap/ushell/demo/ReceiveParametersTestApp/manifest.json":'{\n    "_version": "1.1.0",\n    "start_url": "start.html",\n\n    "sap.app": {\n        "_version": "1.1.0",\n        "i18n": "messagebundle.properties",\n        "id": "sap.ushell.demo.ReceiveParametersTestApp",\n        "type": "component",\n        "embeddedBy": "",\n        "title": "{{title}}",\n        "description": "{{description}}",\n        "ach": "CA-UI2-INT-FE",\n        "dataSources": {},\n        "cdsViews": [],\n        "offline": true\n    },\n    "sap.ui": {\n        "_version": "1.1.0",\n\n        "technology": "UI5",\n        "icons": {\n            "icon" : "sap-icon://Fiori5/F0818",\n            "favIcon" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/favicon/F0818_KPI_Workspace.ico",\n            "phone" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0818_KPI_Workspace/57_iPhone_Desktop_Launch.png",\n            "phone@2" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0818_KPI_Workspace/114_iPhone-Retina_Web_Clip.png",\n            "tablet" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0818_KPI_Workspace/72_iPad_Desktop_Launch.png",\n            "tablet@2" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0818_KPI_Workspace/144_iPad_Retina_Web_Clip.png",\n            "homeScreenIconPhone" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0818_KPI_Workspace/57_iPhone_Desktop_Launch.png",\n            "homeScreenIconPhone@2" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0818_KPI_Workspace/114_iPhone-Retina_Web_Clip.png",\n            "homeScreenIconTablet" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0818_KPI_Workspace/72_iPad_Desktop_Launch.png",\n            "homeScreenIconTablet@2" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/launchicon/F0818_KPI_Workspace/144_iPad_Retina_Web_Clip.png",\n            "startupImage320x460" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/320_x_460.png",\n            "startupImage640x920" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/640_x_920.png",\n            "startupImage640x1096" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/640_x_1096.png",\n            "startupImage768x1004" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/768_x_1004.png",\n            "startupImage748x1024" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/1024_x_748.png",\n            "startupImage1536x2008" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/1536_x_2008.png",\n            "startupImage1496x2048" : "/sap/public/bc/ui5_ui5/resources/sap/ca/ui/themes/base/img/splashscreen/2048_x_1496.png"\n        },\n        "deviceTypes": {\n            "desktop": true,\n            "tablet": true,\n            "phone": true\n        },\n        "fullWidth": true,\n        "supportedThemes": [\n            "sap_hcb",\n            "sap_bluecrystal",\n            "sap_belize"\n        ]\n    },\n    "sap.ui5": {\n        "_version": "1.1.0",\n        "resources": {\n            "js": [],\n            "css": [ ]\n        },\n        "dependencies": {\n            "libs": {\n                "sap.m": {\n                    "minVersion": "1.28"\n                }\n            }\n        },\n        "models": {},\n        "rootView": "",\n        "handleValidation": false,\n        "config": {},\n        "routing": {},\n        "contentDensities": { "compact": true, "cozy": true }\n    }\n}',
	"sap/ushell/demo/ReceiveParametersTestApp/messagebundle.properties":'\r\n# Copyright (c) 2009-2015 SAP SE, All Rights Reserved\r\n# See Translation Guide for SAPUI5 Application Developers in the\r\n# sap help portal for details\r\n# http://help.sap.com/saphelp_uiaddon10/helpdata/en/b9/a2a70596e241ebad8901f1d19fe28e/content.htm?frameset=/en/0c/5f019e130e45ceb8914d72fb0257dd/frameset.htm&current_toc=/en/e4/843b8c3d05411c83f58033bac7f072/plain.htm&node_id=652\r\n\r\n# XTIT: Dialog title\r\ntitle=Application Navigation Parameter display\r\n\r\n# XTXT: description\r\ndescription=application displaying received parameters of an navigation\r\n',
	"sap/ushell/demo/ReceiveParametersTestApp/messagebundle_de.properties":'\r\n# See Translation Guide for SAPUI5 Application Developers in the\r\n# sap help portal for details\r\n# http://help.sap.com/saphelp_uiaddon10/helpdata/en/b9/a2a70596e241ebad8901f1d19fe28e/content.htm?frameset=/en/0c/5f019e130e45ceb8914d72fb0257dd/frameset.htm&current_toc=/en/e4/843b8c3d05411c83f58033bac7f072/plain.htm&node_id=652\r\n\r\n# XTIT: Dialog title\r\ntitle=Appplication Navigation Parameteranzeige\r\n\r\n# XTXT: description\r\ndescription=Diese Anwendung zeigt die empfangenen Parameter einer App an\r\n'
},"sap/ushell/demo/ReceiveParametersTestApp/Component-preload"
);
