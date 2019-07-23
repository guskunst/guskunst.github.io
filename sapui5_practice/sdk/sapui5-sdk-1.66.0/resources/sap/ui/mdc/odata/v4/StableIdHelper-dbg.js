/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

/**
 * Stable Id helper
 */
sap.ui.define([
	'sap/ui/core/ID', 'sap/base/Log'
], function(Id, Log) {
	"use strict";

	function validateId (sId) {
		if (Id.isValid(sId)) {
			return sId;
		} else {
			sId = replaceSpecialCharsInId(sId);
			if (Id.isValid(sId)) {
				return sId;
			} else {
				Log.error(sId + ' - Stable Id could not be generated due to insufficient information.');
				throw sId + ' - Stable Id could not be generated due to insufficient information.';
			}
		}
	}

	function replaceSpecialCharsInId (sId) {
		if (sId.indexOf(" ") >= 0) {
			Log.error(sId + ' - Spaces are not allowed in ID parts.');
			throw sId + ' - Spaces are not allowed in ID parts.';
		}
		sId = sId
				.replace(/^\/|^@|^#/, "") // remove special characters from the beginning of the string
				.replace(/\/$|@$|#$/, "") // remove special characters from the end of the string
				.replace(/\/|@|#/g, "::"); // replace special characters with ::

		while (sId.indexOf('::::') > -1) {
			sId = sId.replace('::::', '::');
		}

		return sId;
	}

	var oIdGenerators = {
		'Facet': function (oFacet) {
			var sFacetId;
			if (oFacet.$Type && oFacet.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet") {
				if (oFacet.ID) {
					sFacetId = oFacet.ID;
				}
			} else if (oFacet.$Type && oFacet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
				if (oFacet.ID && oFacet.ID.String) {
					sFacetId = oFacet.ID.String;
				} else {
					sFacetId = oFacet.Target.$AnnotationPath;
				}
			}
			return sFacetId;
		}
	};
	var oStableIdHelper = {
		/**
		 * generates Stable Id based on the given parameters
		 *
		 * parameters are combined in the same order that they are provided and are separated by '::'
		 * special characters (@, /, #) are replaced by '::' if they are in the middle of the Stable Id and removed all together if the are part at the beginning or end
		 * Example:
		 * // Get Constant Stable Id
		 * generate(['Stable', 'Id']) would result in 'Stable::Id' as the Stable Id
		 *
		 * // Get Paramerterized Stable Id from a Collection Facet
		 * var oParameter = {
		 * 		Facet: {
		 * 			$Type: "com.sap.vocabularies.UI.v1.CollectionFacet",
		 * 			Label: "General Info Facet Label",
		 * 			ID: 'GeneralInformation'
		 * 		}
		 * };
		 * generate(['section', oParameter]) would result in 'section::GeneralInformation' as the Stable Id
		 *
		 * oParameter is and object of Metadata contexts available while templating which will be used to generate Stable IDs.
		 * oParameter object keys define the type of metadata context.
		 * For example, the key 'Facet'in the above example tells the Stable Id Helper that the context is a Facet (could be reference or collection facet)
		 *
		 * Currently supported metadata context is Collection/Reference facet identified by 'Facet' key.
		 *
		 * @param {Array<(string|object)>} aStableIdParts - Array of strings and objects
		 * @returns {string} Stable Id constructed from the provided parameters
		 */
		generate: function(aStableIdParts) {

			var sStableId = '',
			vElement, sParamId;
			for (var i = 0; i < aStableIdParts.length; i++) {
				vElement = aStableIdParts[i];
				if (!vElement) {
					continue;
				}
				sStableId += sStableId !== '' ? '::' : '';
				if (typeof vElement === 'string') {
					vElement = validateId(vElement);
					if (vElement) {
						sStableId += vElement;
					}
				} else if (typeof vElement === 'object') {
					// handle parameters
					for (var sKey in vElement) {
						sParamId = oIdGenerators[sKey](vElement[sKey]);
						sParamId = validateId(sParamId);
						if (sParamId) {
							sStableId += sParamId;
						}
					}
				}
			}
			return sStableId;
		}
	};
	return oStableIdHelper;

});
