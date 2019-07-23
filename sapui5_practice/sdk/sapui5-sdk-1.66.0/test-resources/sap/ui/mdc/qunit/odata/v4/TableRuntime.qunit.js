/* eslint-disable consistent-return */
/* global QUnit */
sap.ui.define(
	[
		"sap/ui/thirdparty/sinon",
		"jquery.sap.global",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Control",
		"sap/ui/mdc/odata/v4/table/TableRuntime",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function (sinon, jQuery, JSONModel, Control, TableRuntime) {
		"use strict";
		var sandbox = sinon.sandbox.create();
		QUnit.module("Unit Test for setContexts");
		QUnit.test("Unit test to check setContexts ", function (assert) {
			[{
					aSelectedContexts: [{
							getObject: function () {
								return {
									HasDraftEntity: false,
									"#ActionPath": "Sunday Light Apricot"
								};
							},
							getProperty: function (sProperty) {
								return false;
							}
						},
						{
							getObject: function () {
								return {
									HasDraftEntity: true,
									IsActiveEntity: true,
									DraftAdministrativeData: {
										InProcessByUser: false
									},
									Name: "Red Paprica"

								};
							},
							getProperty: function (sProperty) {
								return true;
							}
						},
						{
							getObject: function () {
								return {
									HasDraftEntity: true,
									IsActiveEntity: true,
									DraftAdministrativeData: {
										InProcessByUser: true
									},
									Name: "Blue Jok"

								};
							},
							getProperty: function (sProperty) {
								return true;
							}
						},
						{
							getObject: function () {
								return {
									HasDraftEntity: true,
									IsActiveEntity: false,
									DraftAdministrativeData: {
										InProcessByUser: true
									},
									Name: "Pink Tie"

								};
							},
							getProperty: function (sProperty) {
								return true;
							}
						}
					],
					sModelName: "ui",
					sPrefix: "template::Artists::Table",
					sDeletablePath: "HasDraftEntity",
					oDraft: "DraftRoot",
					sMessage: "with multiple selected contexts, model name, action path and deletable path as property name",
					bExpectedValue: {
						$contexts: {
							"template::Artists::Table": {
								selectedContexts: [{
										getObject: function () {
											return {
												HasDraftEntity: false,
												"#ActionPath": "Sunday Light Apricot"
											};
										},
										getProperty: function (sProperty) {
											return false;
										}
									},
									{
										getObject: function () {
											return {
												HasDraftEntity: true,
												IsActiveEntity: true,
												DraftAdministrativeData: {
													InProcessByUser: false
												},
												Name: "Red Paprica"

											};
										},
										getProperty: function (sProperty) {
											return true;
										}
									},
									{
										getObject: function () {
											return {
												HasDraftEntity: true,
												IsActiveEntity: true,
												DraftAdministrativeData: {
													InProcessByUser: true
												},
												Name: "Blue Jok"

											};
										},
										getProperty: function (sProperty) {
											return true;
										}
									},
									{
										getObject: function () {
											return {
												HasDraftEntity: true,
												IsActiveEntity: false,
												DraftAdministrativeData: {
													InProcessByUser: true
												},
												Name: "Pink Tie"

											};
										},
										getProperty: function (sProperty) {
											return true;
										}
									}
								],
								numberOfSelectedContexts: 4,
								deleteEnabled: true,
								deletableContexts: [{
									getObject: function () {
										return {
											HasDraftEntity: true,
											IsActiveEntity: false,
											DraftAdministrativeData: {
												InProcessByUser: true
											},
											Name: "Pink Tie"

										};
									},
									getProperty: function (sProperty) {
										return true;
									}
								}],
								unSavedContexts: [{
									getObject: function () {
										return {
											HasDraftEntity: true,
											IsActiveEntity: true,
											DraftAdministrativeData: {
												InProcessByUser: false
											},
											Name: "Red Paprica"

										};
									},
									getProperty: function (sProperty) {
										return true;
									}
								}],
								lockedContexts: [{
									getObject: function () {
										return {
											HasDraftEntity: true,
											IsActiveEntity: true,
											DraftAdministrativeData: {
												InProcessByUser: true
											},
											Name: "Blue Jok"

										};
									},
									getProperty: function (sProperty) {
										return true;
									}
								}],
								ActionPath: true
							}
						}
					}
				},
				{
					aSelectedContexts: [{
						getObject: function () {
							return {
								HasDraftEntity: false,
								"#ActionPath": "Sunday Light Apricot"
							};
						},
						getProperty: function (sProperty) {
							return false;
						}
					},
					{
						getObject: function () {
							return {
								HasDraftEntity: true,
								IsActiveEntity: true,
								DraftAdministrativeData: {
									InProcessByUser: false
								},
								Name: "Red Paprica"

							};
						},
						getProperty: function (sProperty) {
							return true;
						}
					},
					{
						getObject: function () {
							return {
								HasDraftEntity: true,
								IsActiveEntity: true,
								DraftAdministrativeData: {
									InProcessByUser: true
								},
								Name: "Blue Jok"

							};
						},
						getProperty: function (sProperty) {
							return true;
						}
					}],
					sPrefix: "template::Artists::Table",
					sDeletablePath: "undefined",
					oDraft:"Draft",
					sMessage: "without model name and with deletable path as undefined",
					bExpectedValue: {
						$contexts: {
							"template::Artists::Table": {
								selectedContexts: [{
									getObject: function () {
										return {
											HasDraftEntity: false,
											"#ActionPath": "Sunday Light Apricot"
										};
									},
									getProperty: function (sProperty) {
										return false;
									}
								},
								{
									getObject: function () {
										return {
											HasDraftEntity: true,
											IsActiveEntity: true,
											DraftAdministrativeData: {
												InProcessByUser: false
											},
											Name: "Red Paprica"

										};
									},
									getProperty: function (sProperty) {
										return true;
									}
								},
								{
									getObject: function () {
										return {
											HasDraftEntity: true,
											IsActiveEntity: true,
											DraftAdministrativeData: {
												InProcessByUser: true
											},
											Name: "Blue Jok"

										};
									},
									getProperty: function (sProperty) {
										return true;
									}
								}],
								numberOfSelectedContexts: 3,
								deleteEnabled: true,
								deletableContexts: [{
									getObject: function () {
										return {
											HasDraftEntity: false,
											Name: "Sunday Light Apricot"
										};
									},
									getProperty: function (sProperty) {
										return false;
									}
								}],
								unSavedContexts: [{
									getObject: function () {
										return {
											HasDraftEntity: true,
											IsActiveEntity: true,
											DraftAdministrativeData: {
												InProcessByUser: false
											},
											Name: "Red Paprica"

										};
									},
									getProperty: function (sProperty) {
										return true;
									}
								}],
								lockedContexts: [{
									getObject: function () {
										return {
											HasDraftEntity: true,
											IsActiveEntity: true,
											DraftAdministrativeData: {
												InProcessByUser: true
											},
											Name: "Blue Jok"

										};
									},
									getProperty: function (sProperty) {
										return true;
									}
								}],
								ActionPath: true
							}
						}
					}
				}
			].forEach(function (oProperty) {
				var oTable = new Control();
				var oStub = sandbox.stub(oTable, "getModel");
				var uiModel = new JSONModel();
				if (oProperty.sModelName) {
					oTable.setModel(uiModel, oProperty.sModelName);
					oStub.withArgs(oProperty.sModelName).returns(
						uiModel
					);
				} else {
					oTable.setModel(uiModel, "$contexts");
					oStub.withArgs("$contexts").returns(
						uiModel
					);
					oProperty.sModelName = "$contexts";
				}
				oTable.getSelectedContexts = function () {
					return oProperty.aSelectedContexts;
				};
				TableRuntime.setContexts(oTable, oProperty.sModelName, oProperty.sPrefix, oProperty.sDeletablePath);
				var actualValue = oProperty.sModelName ? oTable.getModel(oProperty.sModelName).getData() : oTable.getModel("$contexts").getData();
				assert.deepEqual(JSON.stringify(actualValue), JSON.stringify(oProperty.bExpectedValue), "Unit test to check setContexts " + oProperty.sMessage + ": ok");
				oTable.destroy();
				oStub.restore();
			});
		});
	}
);