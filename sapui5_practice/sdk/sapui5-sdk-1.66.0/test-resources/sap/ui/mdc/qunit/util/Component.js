/**
 * Dummy unit test component --> util.Component
 */
sap.ui.define("util/Component", [
	"sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel"
], function(UIComponent, JSONModel) {
	"use strict";
	return UIComponent.extend("util.Component", {
		createContent: function() {
			// View with dummy pre-processor
			return sap.ui.xmlview({
				async: true,
				type: "XML",
				viewContent: '<core:View height="100%" xmlns:core="sap.ui.core" xmlns="util"> <Table id="table" metadataContexts="{model:\'action\', path:\'/actions\'}" header="test"/> </core:View>',
				preprocessors: {
					xml: {
						models: {
							action: new JSONModel({
								actions: [
									{
										name: "Action 1"
									},
									{
										name: "Action 2"
									}
								]
							})
						}
					}
				}
			});
		}
	});
});
