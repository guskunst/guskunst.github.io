/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/fe/AppComponent",
	"sap/ui/base/ManagedObjectObserver",
	"sap/fe/core/internal/testableHelper"
], function (ComponentContainer, AppComponent, ManagedObjectObserver, testableHelper) {
	"use strict";

	var oSerializer = new XMLSerializer();

	function analyzeApp(oComponentContainer, bSuppressRendering) {

		return new Promise(function (fnResolve, fnReject) {
			var oNumberOfPages = 0,
				oPages = {},
				oStubForPrivate = testableHelper.startTest(),
				oStaticStub = oStubForPrivate && testableHelper.getStaticStub();

			//Don't autocreate pages
			oStaticStub.suppressPageCreation();

			function createAllPages(oAppComponent, oNavController) {
				var oFE = oAppComponent.getMetadata().getManifestEntry("sap.fe"),
					oEntitySets = oFE && oFE.entitySets || [];
				Object.keys(oEntitySets).forEach(function (sEntitySet) {
					var oEntitySet = oEntitySets[sEntitySet];
					["feed", "entry"].forEach(function (sPart) {
						var oPageSet = oEntitySet[sPart];
						if (oPageSet) {
							["default", "create" /* ... */].forEach(function (sAction) { // eslint-disable-line max-nested-callbacks
								var oAction = oPageSet[sAction], oPageComponentContainer;
								if (oAction && oAction.template) {
									oPageComponentContainer = oStubForPrivate.templateTester.createPageComponentContainer(sEntitySet, oAction);
									oNumberOfPages += 1;
									/* use observer */
									oObserver.observe(oPageComponentContainer, { // eslint-disable-line no-use-before-define
										associations: ['component']
									});
									setTimeout(function () { // eslint-disable-line max-nested-callbacks
										oNavController.addPage(oPageComponentContainer);
									}, 0);
								}
							});
						}
					});

				});
			}

			function collectViews(sAggregation, oView) {
				oPages[this.getId()] = {
					rootView: oView,
					component: this,
					viewXML: oView._xContent,
					viewXMLText: oSerializer.serializeToString(oView._xContent),
					preprocessorInfo: oView.getPreprocessorInfo(),
					preprocessorInfoText: JSON.stringify(oView.getPreprocessorInfo(), null, 2)
				};
				oNumberOfPages -= 1;
				if (oNumberOfPages === 0) {
					fnResolve(oPages);
				}
			}

			function observationHandler(oChange) {
				var NAMESPACE = "sap.fe.templates", oComponent = null, oControl = null;
				if (oChange.type === "association" && oChange.name === "component") {
					oComponent = oChange.object && oChange.object.getComponentInstance();
					if (oComponent instanceof AppComponent) {
						/* the application component is assigned and known */
						oControl = oComponent.getRootControl();
						if (oControl && oControl.getMetadata().getName() === "sap.m.NavContainer") {
							/* the root control is already available */
							createAllPages(oComponent, oControl);
						} else {
							/* in case the root control is not yet available, wait for assignement to rootControl aggregation */
							this.observe(oComponent, {
								aggregations: ["rootControl"]
							});
						}
					} else if (oComponent.getMetadata().getName().indexOf(NAMESPACE) > -1) {
						/* The views are assigned to the rootControl aggregation in TemplateComponent.onBeforeRendering */
						if (bSuppressRendering) {
							/* overwrite setAggregation to collect the views and keep them out of the control tree */
							oComponent.setAggregation = collectViews;
						} else {
							/* Just observe TemplateComponent.setAggregation to get the views quietly (the app will run somehow) */
							this.observe(oComponent, {
								aggregations: ["rootControl"]
							});
						}
					}
				} else if (oChange.type === "aggregation" && oChange.name === "rootControl") {
					oComponent = oChange.object;
					oControl = oChange.child;
					if (oComponent instanceof AppComponent) {
						/* the rootControl of the appComponent has received the navContainer */
						if (oControl && oControl.getMetadata().getName() === "sap.m.NavContainer") {
							createAllPages(oComponent, oControl);
						}
					} else if (oComponent.getMetadata().getName().indexOf(NAMESPACE) > -1) {
						/* Collect the views if bSuppressRendering is false or undefined */
						collectViews.call(oComponent, oChange.name, oControl);
					}
				}
			}

			var oObserver = new ManagedObjectObserver(observationHandler);

			/* Wait for application component instantiation - the app component should be availalbe after it is assigned to the component container */
			oObserver.observe(oComponentContainer, {
				associations: ['component']
			});
		});
	}

	var FioriElementsAppAnalyzer = {
		analyzeApp: analyzeApp
	};

	return FioriElementsAppAnalyzer;
});
