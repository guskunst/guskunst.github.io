/*global QUnit, sinon */

sap.ui.define([
	"sap/f/GridContainer",
	"sap/ui/core/Core",
	"sap/m/Panel",
	"sap/m/GenericTile",
	"sap/f/Card",
	"sap/f/GridContainerItemLayoutData",
	"sap/f/GridContainerSettings",
	"sap/ui/Device",
	"sap/base/Log"
],
function (
	GridContainer,
	Core,
	Panel,
	GenericTile,
	Card,
	GridContainerItemLayoutData,
	GridContainerSettings,
	Device,
	Log
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture",
		EDGE_VERSION_WITH_GRID_SUPPORT = 16,
		bIsGridSupported = !Device.browser.msie && !(Device.browser.edge && Device.browser.version < EDGE_VERSION_WITH_GRID_SUPPORT);

	/**
	 * Test if grid settings are applied to the grid in DOM
	 *
	 * @param {sap.f.GridContainer} oGrid The grid
	 * @param {sap.f.GridContainerSettings} oSettings Expected settings
	 * @param {string} sLayout Layout under test
	 * @param {Assert} assert Assert
	 */
	function assertGridSettings(oGrid, oSettings, sLayout, assert) {
		var oGridStyle = oGrid.getDomRef().style,
			expectedColumnsTemplate = "repeat(" + (oSettings.getColumns() || "auto-fill") + ", " + oSettings.getColumnSize() + ")";

		if (bIsGridSupported) {
			assert.strictEqual(oGridStyle.getPropertyValue("grid-template-columns"), expectedColumnsTemplate, "Grid has expected column template settings for layout '" + sLayout + "'");
			assert.strictEqual(oGridStyle.getPropertyValue("grid-auto-rows"), oSettings.getRowSize(), "Grid has expected row size for '" + sLayout + "'");

			// test row-gap and column-gap, because grid-gap can not be tested directly
			assert.strictEqual(oGridStyle.getPropertyValue("grid-row-gap") || oGridStyle.getPropertyValue("row-gap"), oSettings.getGap(), "Grid has expected row gap for '" + sLayout + "'");
			assert.strictEqual(oGridStyle.getPropertyValue("grid-column-gap") || oGridStyle.getPropertyValue("column-gap"), oSettings.getGap(), "Grid has expected column gap for '" + sLayout + "'");
		} else {
			assert.strictEqual(oGrid.getActiveLayoutSettings(), oSettings, "Grid has expected settings for '" + sLayout + "'");
		}
	}

	/**
	 * Calculates expected top and left for the given item, relative to the previous item.
	 * To be used for IE and Edge tests
	 *
	 * @param {jQuery} $grid The grid
	 * @param {jQuery} $item The item to be tested
	 * @param {jQuery} $previousItem The previous item. Null if there is no previous item.
	 * @param {Number} iGapSize Gap size
	 * @returns {Object} Object containing expected top and left position
	 */
	function calcExpectedPosition($grid, $item, $previousItem, iGapSize) {
		// tests for ie and edge
		var iPrevBottom = 0,
			iPrevRight = 0,
			iExpectedTop = 0,
			iExpectedLeft = 0;

		// assert that the current grid item is positioned well relative to the last grid item
		if ($previousItem) {
			iPrevBottom = parseInt($previousItem.css("top")) + $previousItem.height();
			iPrevRight = parseInt($previousItem.css("left")) + $previousItem.width();

			if (iPrevRight + iGapSize + $item.width() > $grid.width()) {
				iExpectedTop = iPrevBottom + iGapSize;
				iExpectedLeft = 0;
			} else {
				iExpectedTop = parseInt($previousItem.css("top"));
				iExpectedLeft = iPrevRight + iGapSize;
			}
		}

		return {
			"top": iExpectedTop,
			"left": iExpectedLeft
		};
	}

	QUnit.module("Init");

	QUnit.test("Initialization", function (assert) {
		// Act
		var oGrid = new GridContainer();

		// Assert
		assert.ok(oGrid.isA("sap.f.GridContainer"), "GridContainer is initialized");
		assert.strictEqual(oGrid.getContainerQuery(), false, "GridContainer containerQuery property is false");
		assert.strictEqual(oGrid.getSnapToRow(), false, "GridContainer snapToRow property is false");
		assert.strictEqual(oGrid.getAllowDenseFill(), false, "GridContainer allowDenseFill property is false");
		assert.strictEqual(oGrid.getInlineBlockLayout(), false, "GridContainer inlineBlockLayout property is false");

		assert.ok(oGrid.getActiveLayoutSettings().isA("sap.f.GridContainerSettings"), true, "GridContainer has default layout settings");
	});

	QUnit.module("Properties", {
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Snap to row", function (assert) {
		// Arrange
		this.oGrid.setSnapToRow(true);

		// Act
		Core.applyChanges();

		// Assert
		assert.ok(this.oGrid.$().hasClass("sapFGridContainerSnapToRow"), "Has class sapFGridContainerSnapToRow when snapToRow is true");
	});

	QUnit.test("Width", function (assert) {
		// Arrange
		this.oGrid.setWidth("100px");

		// Act
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().width(), 100, "Width is as expected");
	});

	QUnit.test("Tooltip", function (assert) {
		// Arrange
		var sExample = "Some tooltip";
		this.oGrid.setTooltip(sExample);

		// Act
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().attr("title"), sExample, "The grid has the expected tooltip");
	});

	QUnit.test("Allow dense fill", function (assert) {
		// Arrange
		this.oGrid.setAllowDenseFill(true);

		// Act
		Core.applyChanges();

		// Assert
		if (bIsGridSupported) {
			assert.strictEqual(this.oGrid.$().css("grid-auto-flow"), "row dense", "The grid has 'grid-auto-flow:row dense', when allowDenseFill is true");
		} else {
			assert.expect(0);
		}
	});

	QUnit.test("Inline block layout", function (assert) {
		// Arrange
		var oTile = new GenericTile({
			layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 2 })
		});
		this.oGrid.addItem(oTile);
		this.oGrid.setInlineBlockLayout(true);

		// Act
		Core.applyChanges();

		// Assert
		if (bIsGridSupported) {
			assert.strictEqual(this.oGrid.$().css("grid-auto-rows"), "min-content", "The grid has 'grid-auto-rows:min-content', when inlineBlockLayout is true");
			assert.strictEqual(oTile.$().parent().css("grid-row-start"), "span 1", "The grid items have row span 1");
		} else {
			assert.expect(0);
		}
	});

	QUnit.module("Items", {
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Render items", function (assert) {
		// Arrange
		this.oGrid
			.addItem(new GenericTile({id: "tile1", header: "Comulative Tools"}))
			.addItem(new GenericTile({id: "tile2", header: "Travel and Expenses"}));

		// Act
		Core.applyChanges();

		// Assert
		assert.ok(this.oGrid.getDomRef(), "GridContainer is rendered");
		assert.ok(this.oGrid.$().find("#tile1").length, "Item 1 is rendered");
		assert.ok(this.oGrid.$().find("#tile2").length, "Item 2 is rendered");
	});

	QUnit.test("Add/remove items", function (assert) {
		// Arrange
		var oItem = new GenericTile({id: "tile1", header: "Comulative Tools"});

		// Act
		this.oGrid.addItem(oItem);
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().find("#tile1").length, 1, "Item 1 is rendered");

		// Act
		this.oGrid.removeItem(oItem);
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().find("#tile1").length, 0, "Item 1 is not rendered inside the grid");

		oItem.destroy();
	});

	QUnit.test("Items positioning", function (assert) {
		// Arrange
		var aExamples = [
			{
				expectedRows: 2,
				expectedColumns: 2,
				item: new GenericTile({
					layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 2 })
				})
			},
			{
				expectedRows: 5,
				expectedColumns: 4,
				item: new Card({
					height: "400px",
					layoutData: new GridContainerItemLayoutData({ columns: 4 })
				})
			},
			{
				expectedRows: 5,
				expectedColumns: 4,
				item: new Card({
					height: "400px",
					layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 4 })
				})
			},
			{
				expectedRows: 2,
				expectedColumns: 4,
				item: new Card({
					height: "400px",
					layoutData: new GridContainerItemLayoutData({ rows: 2, columns: 4 })
				})
			}
		];

		aExamples.forEach(function (oExample) {
			this.oGrid.addItem(oExample.item);
		}.bind(this));

		// Act
		Core.applyChanges();

		// Assert
		var $previousGridItem;
		aExamples.forEach(function (oExample, iInd) {
			var $gridItem = oExample.item.$().parent();

			if (bIsGridSupported) {
				assert.strictEqual($gridItem.css("grid-row-start"), "span " + oExample.expectedRows, "Item " + iInd + " rows are as expected");
				assert.strictEqual($gridItem.css("grid-column-start"), "span " + oExample.expectedColumns, "Item " + iInd + " columns are as expected");
			} else {
				// tests for ie and edge
				var iCellSize = 80,
					iGapSize = 16;

				var mExpected = calcExpectedPosition(this.oGrid.$(), $gridItem, $previousGridItem, iGapSize);
				assert.strictEqual($gridItem.css("top"), mExpected.top + "px", "Item " + iInd + " top position is as expected");
				assert.strictEqual($gridItem.css("left"), mExpected.left + "px", "Item " + iInd + " left position is as expected");

				assert.strictEqual($gridItem.height(), oExample.expectedRows * (iCellSize + iGapSize) - iGapSize, "Item " + iInd + " height is as expected");
				assert.strictEqual($gridItem.width(), oExample.expectedColumns * (iCellSize + iGapSize) - iGapSize, "Item " + iInd + " width is as expected");
			}

			$previousGridItem = $gridItem;
		}.bind(this));
	});

	if (bIsGridSupported) {
		QUnit.test("Item with more columns than the grid with columns auto-fill", function (assert) {
			// Arrange
			var oItem = new Card({
				layoutData: new GridContainerItemLayoutData({ columns: 6 })
			});
			this.oGrid.addItem(oItem);

			// Act
			this.oGrid.setWidth("370px"); // place for 4 columns
			Core.applyChanges();

			// Assert
			assert.strictEqual(oItem.$().parent().css("grid-column-start"), "span 4", "Item has 4 columns as expected");
		});

		QUnit.test("Item with more columns than the grid with defined columns count", function (assert) {
			// Arrange
			var oItem = new Card({
				layoutData: new GridContainerItemLayoutData({ columns: 6 })
			});
			this.oGrid.addItem(oItem);

			// Act
			this.oGrid.setLayout(new GridContainerSettings({ columns: 4 })); // explicitly set 4 columns
			Core.applyChanges();

			// Assert
			assert.strictEqual(oItem.$().parent().css("grid-column-start"), "span 4", "Item has 4 columns as expected");
		});

		QUnit.test("Item resize", function (assert) {
			// Arrange
			var oItem = new Card();
			this.oGrid.addItem(oItem);
			Core.applyChanges();

			// Act
			oItem.setHeight("400px");
			Core.applyChanges();

			// Assert
			assert.strictEqual(oItem.$().parent().css("grid-row-start"), "span 5", "Item has 5 rows after resize");
		});
	}

	QUnit.module("Layout settings", {
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.module("Layout settings basics");

	QUnit.test("Initialization and default settings", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings();

		// Assert
		assert.ok(oSettings.isA("sap.f.GridContainerSettings"), "GridContainerSettings is initialized");
		assert.strictEqual(oSettings.getColumns(), undefined, "No default columns count");
		assert.strictEqual(oSettings.getColumnSize(), "80px", "Default column size is '80px'");
		assert.strictEqual(oSettings.getRowSize(), "80px", "Default row size is '80px'");
		assert.strictEqual(oSettings.getGap(), "16px", "Default gap size is '16px'");
	});

	QUnit.test("Parse 'rem' settings to 'px'", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings({columnSize: "10rem", rowSize: "5.5rem", gap: "0.5rem"});

		// Assert
		assert.strictEqual(oSettings.getColumnSizeInPx(), 160, "Column size in 'px' is 160");
		assert.strictEqual(oSettings.getRowSizeInPx(), 88, "Row size in 'px' is 88");
		assert.strictEqual(oSettings.getGapInPx(), 8, "Gap size in 'px' is 8");
	});

	QUnit.test("Parse edge cases for settings", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings({rowSize: "5in", gap: "0"}),
			fnLogErrorSpy = sinon.spy(Log, "error");

		// Assert
		assert.ok(isNaN(oSettings.getRowSizeInPx()), "Row size of '5in' can not be parsed and results in NaN");
		assert.ok(fnLogErrorSpy.calledOnce, "An error was logged about that row size '5in' can not be converted to 'px'");
		assert.strictEqual(oSettings.getGapInPx(), 0, "Gap size of 0 is 0 in 'px'");

		fnLogErrorSpy.restore();
	});

	QUnit.module("Layout settings & breakpoints", {
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Custom layout settings", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings({rowSize: "90px", columnSize: "90px", gap: "20px"});
		this.oGrid.setAggregation("layout", oSettings);

		// Act
		Core.applyChanges();

		// Assert
		assertGridSettings(this.oGrid, oSettings, "layout", assert);
	});

	QUnit.module("Layout breakpoints", {
		beforeEach: function () {
			this.oGrid = new GridContainer();

			// prepare settings for each layout
			this.mTestSettings = {
				"layoutXL": new GridContainerSettings({rowSize: "90px", columnSize: "90px", gap: "20px"}),
				"layoutL": new GridContainerSettings({rowSize: "80px", columnSize: "80px", gap: "16px"}),
				"layoutM": new GridContainerSettings({rowSize: "60px", columnSize: "60px", gap: "8px"}),
				"layoutS": new GridContainerSettings({rowSize: "40px", columnSize: "40px", gap: "4px"})
			};
			for (var sLayout in this.mTestSettings) {
				this.oGrid.setAggregation(sLayout, this.mTestSettings[sLayout]);
			}

			// listen for layout change event
			this.oLayoutChangeStub = sinon.stub();
			this.oGrid.attachLayoutChange(function (oEvent) {
				this.oLayoutChangeStub(oEvent.getParameter("layout"));
			}.bind(this));
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Breakpoints", function (assert) {
		// Arrange
		var oGetCurrentRangeStub = sinon.stub(Device.media, 'getCurrentRange');
		this.oGrid.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act & Assert
		["Phone", "Tablet", "Desktop", "LargeDesktop"].forEach(function (sRangeName) {

			// Act
			oGetCurrentRangeStub.returns({name: sRangeName});
			this.oGrid._resize(); // TODO fire resize or fire Device.media sizeChanged
			Core.applyChanges();

			// Assert
			var sLayoutName = GridContainer.mSizeLayouts[sRangeName];
			assertGridSettings(this.oGrid, this.mTestSettings[sLayoutName], sLayoutName, assert);
			assert.ok(this.oLayoutChangeStub.calledWith(sLayoutName), "Layout change event was called for layout " + sLayoutName);
			this.oLayoutChangeStub.reset();
		}.bind(this));

		oGetCurrentRangeStub.restore();
	});

	QUnit.test("Breakpoints when containerQuery is true", function (assert) {
		// Arrange
		this.oGrid.setContainerQuery(true);
		var oContainer = new Panel({content: this.oGrid});
		oContainer.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act & Assert
		var mLayouts = {
				"500px": "layoutS",
				"700px": "layoutM",
				"1200px": "layoutL",
				"1600px": "layoutXL"
			},
			sLayoutName;

		for (var sWidth in mLayouts) {

			// Act
			oContainer.$().width(sWidth);
			this.oGrid._resize(); // TODO fire resize or fire Device.media sizeChanged

			// Assert
			sLayoutName = mLayouts[sWidth];
			assertGridSettings(this.oGrid, this.mTestSettings[sLayoutName], sLayoutName, assert);
			assert.ok(this.oLayoutChangeStub.calledWith(sLayoutName), "Layout change event was called for layout " + sLayoutName);
			this.oLayoutChangeStub.reset();
		}

		oContainer.destroy();
	});
});