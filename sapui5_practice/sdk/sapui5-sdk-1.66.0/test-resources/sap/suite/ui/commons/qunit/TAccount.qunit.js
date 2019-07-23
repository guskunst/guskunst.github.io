sap.ui.define([
	"jquery.sap.global",
	"sap/suite/ui/commons/taccount/TAccount",
	"sap/suite/ui/commons/taccount/TAccountItem",
	"sap/suite/ui/commons/taccount/TAccountGroup",
	"sap/suite/ui/commons/taccount/TAccountPanel",
	"sap/suite/ui/commons/taccount/TAccountItemProperty",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function (jQuery, TAccount, TAccountItem, TAccountGroup, TAccountPanel, TAccountItemProperty, createAndAppendDiv) {
	"use strict";

	createAndAppendDiv("content");

	function render(oElement) {
		oElement.placeAt("content");
		sap.ui.getCore().applyChanges();
	}

	function createTAccount(sMeasure) {
		return new TAccount({
			measureOfUnit: sMeasure || "EUR",
			credit: [new TAccountItem({
				value: 300,
				properties: [new TAccountItemProperty({
					key: "A",
					value: "B"
				})]
			})],
			debit: [
				new TAccountItem({
					value: 100
				}),
				new TAccountItem({
					value: 50
				})
			]
		});
	}

	function createGroup() {
		return new TAccountGroup({
			accounts: [createTAccount(), createTAccount()]
		});
	}

	function createMixedGroup() {
		return new TAccountGroup({
			accounts: [createTAccount("EUR"), createTAccount("US")]
		});
	}

	function createPanel() {
		return new TAccountPanel({
			content: [createGroup(), createGroup()]
		});
	}

	function createMixedPanel() {
		return new TAccountPanel({
			content: [createMixedGroup(), createGroup()]
		});
	}

	QUnit.module("TAccount", {});

	QUnit.test("TAccount check", function (assert) {
		var oAccount = createTAccount();
		render(oAccount);

		assert.equal(oAccount._iSum, 150);

		oAccount.destroy();
	});


	QUnit.test("TAccountGroup check", function (assert) {
		var oGroup = createGroup();
		render(oGroup);

		assert.equal(oGroup._oSum.sum, 300);
		oGroup.destroy();

		var oGroupMixed = createMixedGroup();
		render(oGroupMixed);

		assert.equal(oGroupMixed._oSum.correct, false);
		oGroupMixed.destroy();
	});

	QUnit.test("TAccountGroup collapse", function (assert) {
		var oGroup = createGroup();
		render(oGroup);

		assert.equal(oGroup.$().find(".sapSuiteUiCommonsAccountTWrapper:visible").length, 2);
		oGroup._expandCollapseAllAccounts();
		sap.ui.getCore().applyChanges();

		oGroup.destroy();
	});


	QUnit.test("TAccount Panel check", function (assert) {
		var oPanel = createPanel();
		render(oPanel);

		assert.equal(oPanel._oSum.sum, 600);
		oPanel.destroy();

		var oPanelMixed = createMixedPanel();
		render(oPanelMixed);

		assert.equal(oPanelMixed._oSum.correct, false);
		oPanelMixed.destroy();
	});

	QUnit.test("Test opening and closing balance", function (assert) {
		var oAccount = createTAccount();
		render(oAccount);

		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountOpeningHeader").length, 0);
		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountClosingHeader").length, 0);
		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountClosingHeaderLine").length, 0);

		oAccount.destroy();

		var oAccountOpening = createTAccount();
		oAccountOpening.setOpening(true);
		oAccountOpening.setOpeningCredit(50000);
		render(oAccountOpening);

		assert.equal(oAccountOpening.$().find(".sapSuiteUiCommonsAccountOpeningHeader").length, 1);
		assert.equal(oAccountOpening.$().find(".sapSuiteUiCommonsAccountClosingHeader").length, 1);
		assert.equal(oAccountOpening.$().find(".sapSuiteUiCommonsAccountClosingHeaderLine").length, 1);


		oAccountOpening.destroy();
	});

	QUnit.test("Test ordered mode for TAccount items", function (assert) {
		var oAccount = new TAccount({
			measureOfUnit: "EUR",
			credit: [new TAccountItem({
				value: 300,
				properties: [new TAccountItemProperty({
					label: "Posting Date",
					key: "PostingDate",
					value: "3/1/2018"
				})]
			})],
			debit: [
				new TAccountItem({
					value: 100,
					properties: [new TAccountItemProperty({
						label: "Posting Date",
						key: "PostingDate",
						value: "1/1/2018"
					})]
				}),
				new TAccountItem({
					value: 50,
					properties: [new TAccountItemProperty({
						label: "Posting Date",
						key: "PostingDate",
						value: "5/1/2018"
					})]
				})
			]
		});

		oAccount.setOrderBy("PostingDate");
		render(oAccount);

		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountItemLeft").length, 2);
		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountItemRight").length, 1);
		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountMiddleBorder").length, 1);

		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountItemTitle")[0].textContent, "100.00 EUR");
		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountItemTitle")[1].textContent, "300.00 EUR");
		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountItemTitle")[2].textContent, "50.00 EUR");

		oAccount.destroy();
	});

	QUnit.test("Test dropzones for drag and drop", function (assert) {
		var oPanel = createPanel();
		render(oPanel);
		var iGroupCols = oPanel.$().find(".sapSuiteUiCommonsAccountGroupColumn").length / 2;

		assert.equal(oPanel.$().find(".sapSuiteUiCommonsAccountGroupDroppingAreaInnerText").length, (iGroupCols + 2) * 2);
		assert.equal(oPanel.$().find(".sapSuiteUiCommonsTAccountDropZoneTop").length, 4);
		assert.equal(oPanel.$().find(".sapSuiteUiCommonsTAccountDropZoneBottom").length, 4);

		oPanel.destroy();
	});

	QUnit.test("Test keyboard control for drag and drop", function (assert) {
		var oPanel = createMixedPanel(),
			oGroup = oPanel.getContent()[0],
			aAccounts = oGroup.getAccounts(),
			oEvent = {
				preventDefault: function () {
				},
				stopImmediatePropagation: function () {
				}
			},
			$columns;

		var fnTestLength = function (aLengths) {
			for (var i = 0; i < $columns.length; i++) {
				assert.equal(jQuery($columns[i]).find(".sapSuiteUiCommonsAccount").length, aLengths[i]);
			}
		};

		oEvent[sap.ui.Device.os.macintosh ? "metaKey" : "ctrlKey"] = true;
		assert.expect(110);

		render(oPanel);
		// width for 5 columns
		oGroup.$("content").width(1800);
		oGroup._adjustUI();
		$columns = oGroup.$().find(".sapSuiteUiCommonsAccountGroupColumn");

		aAccounts[0].onsappreviousmodifiers(oEvent);
		fnTestLength([1, 1, 0, 0, 0]);
		aAccounts[0].onsapupmodifiers(oEvent);
		fnTestLength([1, 1, 0, 0, 0]);
		aAccounts[0].onsapnextmodifiers(oEvent);
		fnTestLength([0, 2, 0, 0, 0]);
		aAccounts[0].onsapupmodifiers(oEvent);
		fnTestLength([0, 2, 0, 0, 0]);
		aAccounts[0].onsapupmodifiers(oEvent);
		fnTestLength([1, 1, 0, 0, 0]);
		aAccounts[0].onsapdownmodifiers(oEvent);
		fnTestLength([0, 2, 0, 0, 0]);
		aAccounts[0].onsapdownmodifiers(oEvent);
		fnTestLength([0, 2, 0, 0, 0]);
		aAccounts[0].onsapdownmodifiers(oEvent);
		fnTestLength([0, 1, 1, 0, 0]);
		aAccounts[0].onsapnextmodifiers(oEvent);
		fnTestLength([0, 1, 0, 1, 0]);
		aAccounts[0].onsapnextmodifiers(oEvent);
		fnTestLength([0, 1, 0, 0, 1]);
		aAccounts[0].onsapnextmodifiers(oEvent);
		fnTestLength([0, 1, 0, 0, 1]);
		aAccounts[0].onsapdownmodifiers(oEvent);
		fnTestLength([0, 1, 0, 0, 1]);
		aAccounts[0].onsappreviousmodifiers(oEvent);
		fnTestLength([0, 1, 0, 1, 0]);
		aAccounts[0].onsappreviousmodifiers(oEvent);
		fnTestLength([0, 1, 1, 0, 0]);

		// Test change control key name
		oEvent.ctrlKey = false;
		oEvent.metaKey = true;
		aAccounts[0]._setControlKeyName("metaKey");

		aAccounts[0].onsappreviousmodifiers(oEvent);
		fnTestLength([0, 2, 0, 0, 0]);
		aAccounts[0].onsapnextmodifiers(oEvent);
		fnTestLength([0, 1, 1, 0, 0]);
		aAccounts[0].onsapupmodifiers(oEvent);
		fnTestLength([0, 2, 0, 0, 0]);
		aAccounts[0].onsapdownmodifiers(oEvent);
		fnTestLength([0, 1, 1, 0, 0]);

		oEvent.ctrlKey = true;
		oEvent.metaKey = false;
		aAccounts[0]._setControlKeyName("ctrlKey");

		aAccounts[0].onsappreviousmodifiers(oEvent);
		fnTestLength([0, 2, 0, 0, 0]);
		aAccounts[0].onsapnextmodifiers(oEvent);
		fnTestLength([0, 1, 1, 0, 0]);
		aAccounts[0].onsapupmodifiers(oEvent);
		fnTestLength([0, 2, 0, 0, 0]);
		aAccounts[0].onsapdownmodifiers(oEvent);
		fnTestLength([0, 1, 1, 0, 0]);

		oPanel.destroy();
	});

	QUnit.test("Header title/subtitle tooltip", function (assert) {
		var oElement = {},
			oAccount = createTAccount(),
			sShortText = "Lorem ipsum dolor sit amet",
			sVeryLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun" +
				"t ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco labor" +
				"is nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate veli" +
				"t esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt " +
				"in ulpa qui officia deserunt mollit anim id est laborum.";

		var fnRefreshElement = function (sClass) {
			sap.ui.getCore().applyChanges();
			oElement = oAccount.$().find(sClass);
		};

		assert.expect(10);
		render(oAccount);

		oAccount.setTitle(sShortText);
		fnRefreshElement(".sapSuiteUiCommonsAccountHeaderTitle");
		assert.notOk(oElement.attr("title"));

		oAccount.setTitle(sVeryLongText);
		fnRefreshElement(".sapSuiteUiCommonsAccountHeaderTitle");
		assert.equal(oElement.attr("title"), sVeryLongText);

		oAccount.setSubtitle(sVeryLongText);
		fnRefreshElement(".sapSuiteUiCommonsAccountHeaderTitleWithSubtitle");
		assert.equal(oElement.attr("title"), sVeryLongText);
		fnRefreshElement(".sapSuiteUiCommonsAccountHeaderSubtitle");
		assert.equal(oElement.attr("title"), sVeryLongText);

		oAccount.setTitle(sShortText);
		fnRefreshElement(".sapSuiteUiCommonsAccountHeaderTitleWithSubtitle");
		assert.notOk(oElement.attr("title"));
		fnRefreshElement(".sapSuiteUiCommonsAccountHeaderSubtitle");
		assert.equal(oElement.attr("title"), sVeryLongText);

		oAccount.setSubtitle(sShortText);
		fnRefreshElement(".sapSuiteUiCommonsAccountHeaderTitleWithSubtitle");
		assert.notOk(oElement.attr("title"));
		fnRefreshElement(".sapSuiteUiCommonsAccountHeaderSubtitle");
		assert.notOk(oElement.attr("title"));

		oAccount.setTitle(sVeryLongText);
		fnRefreshElement(".sapSuiteUiCommonsAccountHeaderTitleWithSubtitle");
		assert.equal(oElement.attr("title"), sVeryLongText);
		fnRefreshElement(".sapSuiteUiCommonsAccountHeaderSubtitle");
		assert.notOk(oElement.attr("title"));

		oAccount.destroy();
	});

	QUnit.test("TAccount group resizer", function (assert) {
		var group = new TAccountGroup({});


		group.placeAt("content");
		sap.ui.getCore().applyChanges();

		var $group = group.$();
		$group.width(800);
		group._adjustUI();
		assert.equal(group._iColumnCount, 2, "4 columns");

		$group.width(300);
		group._adjustUI();
		assert.equal(group._iColumnCount, 1, "2 columns");

		$group.width(1400);
		group._adjustUI();
		assert.equal(group._iColumnCount, 4, "2 columns");
	});

	QUnit.test("TAccount test aria properties", function (assert) {
		var oAccount = createTAccount();
		render(oAccount);

		assert.equal(oAccount.$().attr("role"), "region", "TAccount has region role");
		assert.ok(oAccount.$().attr("aria-labelledBy"), "TAccount has aria-labelledBy attribute");
		assert.ok(oAccount.$().attr("aria-describedBy"), "TAccount has aria-describedBy attribute");

		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountGroupCollapseIcon").attr("role"), "button", "T container caret has button role");
		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountGroupCollapseIcon").attr("aria-pressed"), "true", "T container caret has button role");

		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountInfoIconWrapper").attr("aria-labelledby"), oAccount.$().find(".sapSuiteUiCommonsAccountInfoIconWrapper").find(".sapUiInvisibleText").attr("id"), "T container mark has correct aria-labelledby property");

		assert.ok(oAccount.$().find(".sapSuiteUiCommonsAccountDebit").attr("aria-labelledBy"), "T container debit list has aria-labelledBy attribute");
		assert.ok(oAccount.$().find(".sapSuiteUiCommonsAccountCredit").attr("aria-labelledBy"), "T container credit list has aria-labelledBy attribute");
		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountDebit").attr("role"), "listbox", "T container debit list has listbox role");
		assert.equal(oAccount.$().find(".sapSuiteUiCommonsAccountCredit").attr("role"), "listbox", "T container credit list has listbox role");

		var aItems = oAccount.$().find(".sapSuiteUiCommonsAccountItem");
		assert.equal(aItems[0].getAttribute("role"), "option", "TAccount item has option role");
		assert.equal(aItems[0].getAttribute("aria-setsize"), "2", "TAccount item has correct aria-setsize");
		assert.equal(aItems[0].getAttribute("aria-posinset"), "1", "TAccount item has correct aria-posinset");
		assert.equal(aItems[0].getAttribute("aria-selected"), "false", "TAccount item has correct aria-selected");
		assert.equal(aItems[0].getAttribute("aria-label"), oAccount.getDebit()[0]._getAriaLabel(), "TAccount item has correct aria-label");

		assert.equal(aItems[1].getAttribute("role"), "option", "TAccount item has option role");
		assert.equal(aItems[1].getAttribute("aria-setsize"), "2", "TAccount item has correct aria-setsize");
		assert.equal(aItems[1].getAttribute("aria-posinset"), "2", "TAccount item has correct aria-posinset");
		assert.equal(aItems[1].getAttribute("aria-selected"), "false", "TAccount item has correct aria-selected");
		assert.equal(aItems[1].getAttribute("aria-label"), oAccount.getDebit()[1]._getAriaLabel(), "TAccount item has correct aria-label");

		assert.equal(aItems[2].getAttribute("role"), "option", "TAccount item has option role");
		assert.equal(aItems[2].getAttribute("aria-setsize"), "1", "TAccount item has correct aria-setsize");
		assert.equal(aItems[2].getAttribute("aria-posinset"), "1", "TAccount item has correct aria-posinset");
		assert.equal(aItems[2].getAttribute("aria-selected"), "false", "TAccount item has correct aria-selected");
		assert.equal(aItems[2].getAttribute("aria-label"), oAccount.getCredit()[0]._getAriaLabel(), "TAccount item has correct aria-label");

		aItems[0].click();
		sap.ui.getCore().applyChanges();
		assert.equal(aItems[0].getAttribute("aria-selected"), "true", "TAccount item has correct aria-selected");
		assert.notEqual(aItems[0].getAttribute("aria-label"), oAccount.getDebit()[0]._getAriaLabel(), "TAccount item has correct aria-label");

		aItems[0].click();
		aItems[1].click();
		sap.ui.getCore().applyChanges();
		assert.equal(aItems[0].getAttribute("aria-selected"), "false", "TAccount item has correct aria-selected");
		assert.equal(aItems[0].getAttribute("aria-label"), oAccount.getDebit()[0]._getAriaLabel(), "TAccount item has correct aria-label");
		assert.equal(aItems[1].getAttribute("aria-selected"), "true", "TAccount item has correct aria-selected");
		assert.notEqual(aItems[1].getAttribute("aria-label"), oAccount.getDebit()[1]._getAriaLabel(), "TAccount item has correct aria-label");

		oAccount.destroy();
	});

});
