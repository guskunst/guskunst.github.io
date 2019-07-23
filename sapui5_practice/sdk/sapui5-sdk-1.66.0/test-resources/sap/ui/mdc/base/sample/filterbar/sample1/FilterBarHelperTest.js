/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/odata/v4/base/filterbar/FilterBarDelegate", "sap/ui/mdc/PropertyInfo", 'sap/ui/mdc/library'
], function(FilterBarDelegate, PropertyInfo, mdcLibrary) {
	"use strict";

	var FilterExpression = mdcLibrary.FilterExpression;
	var ODataFilterBarTestHelper = Object.assign({}, FilterBarDelegate);

	ODataFilterBarTestHelper.fetchProperties = function(oModel, sEntitySet) {
		return new Promise(function(fResolve) {
			FilterBarDelegate.fetchProperties(oModel, sEntitySet).then(function(aProperties) {
				aProperties.some(function(oProperty) {
					if (oProperty.getName() === "SupplierID") {
						oProperty.setFieldHelp("FVH01");
						return true;
					}
					return false;
				});

				aProperties.push(new PropertyInfo({
					name: "$search",
					type: "Edm.String",  // TODO: maybe use type as indicator for searchfield
					filterExpression: FilterExpression.Single,
					visible: true
				}));

				fResolve(aProperties);
			});
		});
	};
	return ODataFilterBarTestHelper;
}, /* bExport= */false);
