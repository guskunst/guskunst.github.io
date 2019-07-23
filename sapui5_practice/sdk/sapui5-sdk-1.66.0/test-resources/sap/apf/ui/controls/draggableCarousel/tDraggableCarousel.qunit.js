(function() {
	'use strict';

	jQuery.sap.declare('test.sap.apf.ui.controls.draggableCarousel.tDraggableCarousel');

	jQuery.sap.require("sap.ui.thirdparty.qunit");
	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.apf.ui.controls.draggableCarousel.DraggableCarousel");

	QUnit.module("Draggable Carousel Tests", {
		beforeEach : function(assert) {
			this.dCarousel = new sap.apf.ui.controls.draggableCarousel.DraggableCarousel({
				containerHeight : "500px",
				containerWidth : "350px",
				blockHeight : "200px",
				blockWidth : "200px",
				blockMargin : "25px",
				separator : document.createElement('div'),
				removeIcon : document.createElement('div'),
				separatorHeight : "30px",
				removeIconHeight : "20px",
				onBeforeDrag : function(nDragIndex) {
					jQuery.sap.log.error(nDragIndex);
				},
				onAfterDrop : function(fromIndex, toIndex) {
					jQuery.sap.log.error('Block Moved from ' + fromIndex + ' to ' + toIndex);
				},
				onAfterRemove : function(removedIndex) {
					jQuery.sap.log.error('Block ' + removedIndex + ' removed');
				}
			});
		},
		afterEach : function() {
			return;
		}
	});
	QUnit.test("Availability Tests", function(assert) {
		assert.ok(this.dCarousel.addBlock, "addBlock function available");
		assert.ok(this.dCarousel.swapBlocks, "swapBlocks function available");
		assert.ok(this.dCarousel.insertBlock, "insertBlock function available");
		assert.ok(this.dCarousel.removeBlock, "removeBlock function available");
		assert.ok(this.dCarousel.placeAt, "placeAt function available");
	});
	QUnit.test("Functionality Tests", function(assert) {
		this.dCarousel.placeAt('qunit-fixture');
		assert.equal(jQuery('.DnD-container').length, 1, "placeAt functions as expected");
		var sampleDiv1 = document.createElement('div');
		sampleDiv1.setAttribute('id', 'div1');
		this.dCarousel.addBlock({
			blockElement : sampleDiv1
		});
		assert.equal(jQuery('.DnD-block').length, 1, "addBlock functions as expected with single block");
		var sampleDiv2 = document.createElement('div');
		sampleDiv2.setAttribute('id', 'div2');
		var sampleDiv4 = document.createElement('div');
		sampleDiv4.setAttribute('id', 'div4');
		this.dCarousel.addBlock([ {
			blockElement : sampleDiv2
		}, {
			blockElement : sampleDiv4
		} ]);
		assert.equal(jQuery('.DnD-block').length, 3, "addBlock functions as expected with multiple blocks");
		var sampleDiv3 = document.createElement('div');
		sampleDiv3.setAttribute('id', 'div3');
		this.dCarousel.insertBlock({
			blockElement : sampleDiv3
		}, 2);
		assert.equal(this.dCarousel.eleRefs.blocks[2].children[1].id, 'div3', 'insertBlock functions as expected');
		this.dCarousel.swapBlocks(0, 2);
		assert.ok(this.dCarousel.eleRefs.blocks[0].children[1].id === 'div3' && this.dCarousel.eleRefs.blocks[2].children[1].id === 'div1', 'swapBlocks functions as expected');
		var removeCallback = sinon.stub();
		this.dCarousel.removeBlock(3, removeCallback);
		assert.ok(jQuery('.DnD-block').length === 3 && removeCallback.calledOnce, 'removeBlock works as expected');
	});
}());