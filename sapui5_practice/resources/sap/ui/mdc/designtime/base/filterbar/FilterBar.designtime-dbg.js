/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

// Provides the Design Time Metadata for the sap.ui.mdc.base.FilterField control
sap.ui.define([
	"sap/ui/fl/changeHandler/ChangeHandlerMediator"
], function(ChangeHandlerMediator) {
	"use strict";

	return {
		name: "{name}",
		description: "{description}",
		aggregations: {
			_content: {
				domRef: ":sap-domref",
				ignore: false,
				propagateRelevantContainer: true,
				propagateMetadata: function(oElement) {

					// Disable RTA for all other controls
					if (oElement.isA("sap.ui.mdc.base.filterbar.FilterBar")) {
						return {
							actions: {
								addFilter: {
									changeType: "addFilter",
									changeOnRelevantContainer: true
								},
								removeFilter: {
									changeType: "removeFilter",
									changeOnRelevantContainer: true
								},
								setFilterPosition: {
									changeType: "setFilterPosition",
									changeOnRelevantContainer: true
								},
								setFilterValue: {
									changeType: "setFilterValue",
									changeOnRelevantContainer: true
								},
								removeFilterValue: {
									changeType: "removeFilterValue",
									changeOnRelevantContainer: true,
									jsOnly : false
								}
							}
						};

					} else if (oElement.isA("sap.ui.mdc.base.FilterField")) {
						return {
							actions: {
								settings: {
									handler: function(oControl, mPropertyBag) {
										// TODO: test only -> to be fixed!
										var oMDCFilterBar = mPropertyBag.contextElement.getParent().getParent();
										oMDCFilterBar.setMetadataDelegate("sap/ui/mdc/base/odata/v4/FilterBarHelper");
										return oMDCFilterBar.showFiltersDialog();
									},
									changeOnRelevantContainer: true
								}
							}
						};
					}
					return {
						actions: null
					};
				}

			}
		}
	};

}, /* bExport= */false);
