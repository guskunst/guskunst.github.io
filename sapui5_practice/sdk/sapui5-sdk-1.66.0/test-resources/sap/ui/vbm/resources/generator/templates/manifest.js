module.exports = function(testId, projectName) {

	
return `{
	"_version": "1.1.0",
	"sap.app": {
		"_version": "1.1.0",
		"id": "test-${testId}",
		"type": "application",
		"i18n": "i18n/i18n.properties",
		"applicationVersion": {
			"version": "1.0.0"
		},
		"ach": "CA-UI5-DOC"
	},
	"sap.ui": {
		"_version": "1.1.0",
		"technology": "UI5",
		"deviceTypes": {
			"desktop": true,
			"tablet": true,
			"phone": true
		}
	},
	"sap.ui5": {
		"_version": "1.1.0",
		"rootView": "vbm-regression.tests.${testId}.view.App",
		"dependencies": {
			"minUI5Version": "1.30",
			"libs": {
				"sap.m": {}
			}
		},
		"models": {

		}
	}

}`
}