sap.ui.define([
    "test-resources/sap/ovp/qunit/cards/utils",
    "test-resources/sap/ovp/mockservers",
    "jquery.sap.global",
    "sap/ovp/cards/CommonUtils"
],function (utils, mockservers, jquery, CommonUtils) {
            "use strict";
            /* jQuery, sap */

            /**
             * This is a hack, as the namespace 'sap.ovp.demo' when run in the qunit results in wrong resource prefix
             * so i change now manually - to continue work. consult Aviad what causes this so we could remove this.
             */
            //jQuery.sap.require("sap.ui.model.odata.AnnotationHelper");
            //jQuery.sap.require("sap.ovp.test.qunit.cards.utils");

            var utils = utils;

            module("sap.ovp.cards.Image", {
                /**
                 * This method is called before each test
                 */
                setup: function () {
                    //jQuery.sap.require("sap.ovp.test.mockservers");
                    mockservers.loadMockServer(utils.odataBaseUrl_salesOrder, utils.odataRootUrl_salesOrder);
                },
                /**
                 * This method is called after each test. Add every restoration code here
                 *
                 */
                teardown: function () {
                    mockservers.close();
                }
            });

            test("Simple Image card test", function () {
                var cardTestData = {
                    card : {
                        "id": "card_1",
                        "model": "salesOrder",
                        "template": "sap.ovp.cards.image",
                        "settings": {
                            "entitySet": "SalesOrderSet",
                            "category": "Image Card",
                            "imageUrl": "img/app_object_header.jpg"
                        }
                    },
                    dataSource : {
                        baseUrl: utils.odataBaseUrl_salesOrder,
                        rootUri: utils.odataRootUrl_salesOrder,
                        annoUri: utils.testBaseUrl + "data/annotations_no_badge_title.xml"
                    },
                    expectedResult : {
                        Body : {
                            Image : {
                                src:"img/app_object_header.jpg",
                                densityAware:"true",
                                width:"100%"
                            }

                        }
                    }
                };

                var oModel = utils.createCardModel(cardTestData);
                stop();
                oModel.getMetaModel().loaded().then(function () {

                    var oView = utils.createCardView(cardTestData, oModel);

                    oView.loaded().then(function (oView) {
                        //start the async test
                        start();

                        var cardXml = oView._xContent;
                        ok(cardXml !== undefined, "Existence check to XML parsing");


                        var cardCfg = cardTestData.card;
                        var expectedImageRes = cardTestData.expectedResult.Body.Image;

                        // basic list XML structure tests
                        ok(utils.imageNodeExists(cardXml), "Basic XML check - see that there is an Image node");


                        // specific XML property binding value test
                        ok(utils.validateImageXmlValues(cardXml, expectedImageRes), "Image XML Values");
                    });
                });
            });

            asyncTest("image card Screen reader test", function () {
                var cardTestData = {
                    card : {
                        "id": "card_2",
                        "model": "salesOrder",
                        "template": "sap.ovp.cards.image",
                        "settings": {
                            "entitySet": "SalesOrderSet",
                            "category": "Image Card",
                            "imageUrl": "img/app_object_header.jpg"
                        }
                    },
                    dataSource : {
                        baseUrl: utils.odataBaseUrl_salesOrder,
                        rootUri: utils.odataRootUrl_salesOrder,
                        annoUri: utils.testBaseUrl + "data/annotations_no_badge_title.xml"
                    },
                    expectedResult : {
                        Body : {
                            Image : {
                                src:"img/app_object_header.jpg",
                                densityAware:"true",
                                width:"100%"
                            }

                        }
                    }
                };

                var oModel = utils.createCardModel(cardTestData);
                oModel.getMetaModel().loaded().then(function () {

                    var oView = utils.createCardView(cardTestData, oModel);
                    oView.loaded().then(function (oView) {
                        var testContainer = jQuery('<div id="testContainer" style="display: none;">').appendTo('body');
                        oView.placeAt('testContainer');
                        oView.rerender();
                        oView.onAfterRendering = function () {
                            //start the async test
                            start();

                            var cardHtml = oView.getDomRef();
                            var cardImageContent = testContainer.find(".ovpImageContainer");
                            ok(cardImageContent.attr("aria-label") == sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("imageCard"), "Image Card type is accessble");
                            ok(cardImageContent.attr("role") == "heading", "card role is define");
                            oView.destroy();
                        };
                    });
                });
            });

        });
