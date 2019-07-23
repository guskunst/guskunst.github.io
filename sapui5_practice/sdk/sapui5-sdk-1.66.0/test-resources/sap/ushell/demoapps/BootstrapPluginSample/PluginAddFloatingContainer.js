/**
 * Test/Example for the FLP FloatingContainer feature.
 *
 * This is an implementation of a bootstrap plugin that addresses fiori2 renderer API
 * in order to set the floating container's content and set its visibility.
 *
 * Main functionality:
 *  - Adding an activation button to the shell header (A HeaderEndItem with id "FloatingContainerButton")
 *    that shows/hides the floating container using the renderer API function setFloatingContainerVisibility
 *  - Creating a sap.m.List (id: "ContentList") that contains the items displayed in the floating container
 *    (NotificationListItems, and a Button)
 *  - A sap.m.Page (id "ContentPage") that contains the list and is the actual UI control that is set as the floating container's content.
 *    and that contains the list.
 *  - The style class listCSSClass is added in order to give ContentPage a background that distinguishes it (visually) from the FLP canvas
 * 
 */
(function () {
    "use strict";
    /*global jQuery, sap, localStorage, window */
    jQuery.sap.log.debug("PluginAddFloatingContainer - module loaded");

    jQuery.sap.declare("sap.ushell.demo.PluginAddFloatingContainer");
    // register
    sap.ui.getCore().getEventBus().subscribe("launchpad", "shellFloatingContainerIsDocked", _onDock, this);
    sap.ui.getCore().getEventBus().subscribe("launchpad", "shellFloatingContainerIsAccessible",_onAccessible );
    sap.ui.getCore().getEventBus().subscribe("launchpad", "shellFloatingContainerIsUnDocked", _onUnDock, this);

    //This function implement logic for un-dock event
    function _onUnDock() {
        jQuery("#ContentPage").removeClass("sapUshellShellFloatingContainerFullHeight");
    }

    //This function implement logic for dock event
    function _onDock() {
        jQuery("#ContentPage").addClass("sapUshellShellFloatingContainerFullHeight");
    }

    //This function implement logic for accesablity events
    function _onAccessible(){
        var oFloatingContainer = document.getElementById("shell-floatingContainer");
        oFloatingContainer.focus();
    }


    var bContainerVisible = false,
        oRenderer = jQuery.sap.getObject("sap.ushell.renderers.fiori2.Renderer");

    function applyRenderer() {
        var oContent,
            getRenderer = function () {
                if (!oRenderer) {
                    oRenderer = sap.ushell.Container.getRenderer("fiori2");
                }
            },
            applyContentStyles = function () {
                var style = document.createElement('style');

                style.type = 'text/css';
                style.innerHTML = ".listCSSClass {background: rgba(187, 230, 211, .25); height: 220px; padding: 5px; }";
                style.innerHTML += ".listCSSClass section {position: relative}";
                document.getElementsByTagName('head')[0].appendChild(style);
            },
            getContainerImage = function () {
                var oImage = sap.m.Image();
                oImage.setSrc("../demo/img/Chat_Participants_Messages_002.png");
                return oImage;
            },
            /**
             * Creates and returns a sap.m.List that includes several UI controls
             */
            getContainerNotificationContent = function () {
                var oNotificationItem1 = new sap.m.NotificationListItem("notificationItem1", {
                        priority: sap.ui.core.Priority.Medium,
                        title: "Notification 1",
                        description: "AAA"
                    }),
                    oNotificationItem2 = new sap.m.NotificationListItem("notificationItem2", {
                        priority: sap.ui.core.Priority.High,
                        title: "Notification 2",
                        description: "BBB"
                    }),
                    oNotificationItem3 = new sap.m.NotificationListItem("notificationItem3", {
                        priority: sap.ui.core.Priority.High,
                        title: "Notification 3",
                        description: "CCC"
                    }),
                // On click, the toggles the FloatingContainer's visibility (i.e. closes the container)
                    oExitButton = new sap.m.ActionListItem("ExitButton", {
                        text: "Exit",
                        press: function (oEvent) {
                            oRenderer.setFloatingContainerVisibility(!bContainerVisible);
                            bContainerVisible = !bContainerVisible;
                        }
                    }),
                    oContentList = new sap.m.List("ContentList", {
                        items: [oNotificationItem1, oNotificationItem2, oNotificationItem3, oExitButton]
                    }),
                    oFlotingContainerPage = new sap.m.Page("ContentPage", {
                        content: [oContentList],
                        title: "List Notifications"
                    }).addStyleClass("listCSSClass");

                applyContentStyles();
                oFlotingContainerPage.setShowHeader(true);
                return oFlotingContainerPage;
            },

            getContainerContent = function () {
                jQuery.sap.require("sap.ushell.ui5service.UserStatus");

                var sUserName = sap.ushell.Container.getUser().getFullName(),
                    oPopover,
                    oUserStatusButton;

                var oService = sap.ui.core.service.ServiceFactoryRegistry.get("sap.ushell.ui5service.UserStatus");

                var oServiceInstance = oService.createInstance();

                oServiceInstance.then(
                    function (oService) {
                        oService.setEnabled(true);
                        oService.attachStatusChanged(function (oEvent) {
                            var lastStatusChange = sap.ui.getCore().byId("lastStatusChange");
                            lastStatusChange.setText("Status Chnaged to ["+ oEvent.mParameters.data + "]");
                            if (oEvent.mParameters.data === null ) {
                                oUserStatusButton.setStatus(sap.ushell.ui.launchpad.UserStatusItem.prototype.STATUS_ENUM.APPEAR_OFFLINE);
                            }
                            else {
                                oUserStatusButton.setStatus(sap.ushell.ui.launchpad.UserStatusItem.prototype.STATUS_ENUM[oEvent.mParameters.data]);
                            }
                        });
                    },
                    function (oError) {
                        alert("error");
                    }
                );

                var fnStatusChangeHandle = function(newStatus) {
                    var oServiceInstance = oService.createInstance();

                    oServiceInstance.then(
                        function (oService) {
                            oService.setStatus(newStatus);
                            oUserStatusButton.setStatus(newStatus);
                            oPopover.close();
                        },
                        function (oError) {
                            alert("error");
                        }
                    );
                }.bind(this);


                jQuery.sap.require('sap.ushell.ui.launchpad.UserStatusItem');

                oPopover = new sap.m.Popover("statusesFC", {
                    placement : sap.m.PlacementType.Bottom,
                    showArrow : false,
                    showHeader : false,
                    content : [
                        new sap.ushell.ui.launchpad.UserStatusItem({
                            status: sap.ushell.ui.launchpad.UserStatusItem.prototype.STATUS_ENUM.AVAILABLE,
                            id: "userStatusItemFC1",
                            isOpener: false,
                            press: function(oEvent) {
                                fnStatusChangeHandle(sap.ushell.ui5service.UserStatus.prototype.AvailableStatus.AVAILABLE);
                            }.bind(this)
                        }).addStyleClass('sapUserStatusContainer'),
                        new sap.ushell.ui.launchpad.UserStatusItem({
                            status: sap.ushell.ui.launchpad.UserStatusItem.prototype.STATUS_ENUM.AWAY,
                            id: "userStatusItemFC2",
                            isOpener: false,
                            press: function(oEvent) {
                                fnStatusChangeHandle(sap.ushell.ui5service.UserStatus.prototype.AvailableStatus.AWAY);
                            }.bind(this)
                        }).addStyleClass('sapUserStatusContainer'),
                        new sap.ushell.ui.launchpad.UserStatusItem({
                            status: sap.ushell.ui.launchpad.UserStatusItem.prototype.STATUS_ENUM.BUSY,
                            id: "userStatusItemFC3",
                            isOpener: false,
                            press: function(oEvent) {
                                fnStatusChangeHandle(sap.ushell.ui5service.UserStatus.prototype.AvailableStatus.BUSY);
                            }.bind(this)
                        }).addStyleClass('sapUserStatusContainer'),
                        new sap.ushell.ui.launchpad.UserStatusItem({
                            status: sap.ushell.ui.launchpad.UserStatusItem.prototype.STATUS_ENUM.APPEAR_OFFLINE,
                            id: "userStatusItemFC4",
                            isOpener: false,
                            press: function(oEvent) {
                                fnStatusChangeHandle(sap.ushell.ui5service.UserStatus.prototype.AvailableStatus.APPEAR_OFFLINE);
                            }.bind(this)
                        }).addStyleClass('sapUserStatusContainer')
                    ]
                });

                oUserStatusButton = new sap.ushell.ui.launchpad.UserStatusItem({
                    id: "userStatusItemMain",
                    status: sap.ushell.ui.launchpad.UserStatusItem.prototype.STATUS_ENUM.AVAILABLE,
                    tooltip: "{i18n>headerActionsTooltip}",
                    ariaLabel: sap.ushell.Container.getUser().getFullName(),
                    image: sap.ui.core.IconPool.getIconURI("account"),
                    press: function(oEvent) {
                        var oButton = sap.ui.getCore().byId(oEvent.mParameters.id);
                        oPopover.openBy(oButton);
                    }.bind(this),
                    contentList : oPopover
                }).addStyleClass('sapUserStatusOpener');


                var listItem1 = new sap.m.CustomListItem("Item1", {
                        content: [
                            new sap.m.Label({
                                text: "Last Status Change:"
                            })
                        ]
                    }),

                    listItem2 = new sap.m.CustomListItem("Item2", {
                        content: [
                            new sap.m.Label("lastStatusChange", {
                                text: "XXXXX"
                            })
                        ]
                    }),

                    listItem3 = new sap.m.CustomListItem("Item3", {
                        content: [
                            oUserStatusButton
                        ]
                    }),


                // On click, the toggles the FloatingContainer's visibility (i.e. closes the container)
                    oExitButton = new sap.m.ActionListItem("ExitButton", {
                        text: "Exit",
                        press: function (oEvent) {
                            oRenderer.setFloatingContainerVisibility(!bContainerVisible);
                            bContainerVisible = !bContainerVisible;
                        }
                    }),
                    oDragButton = new sap.m.ActionListItem("DragButton", {
                        text: "Drag"
                    }),
                    oContentList = new sap.m.List("ContentList", {
                        items: [listItem1, listItem2, listItem3, oExitButton]
                    }),
                    oFlotingContainerPage = new sap.m.Page("ContentPage", {
                        content: [oContentList],
                        title: "Header of a Page"
                    }).addStyleClass("listCSSClass");

                applyContentStyles();
                oFlotingContainerPage.setShowHeader(true);
                return oFlotingContainerPage;
            };

        if (!getRenderer()) {
            oRenderer = sap.ushell.Container.getRenderer("fiori2");
        }
        if (oRenderer) {
            bContainerVisible = oRenderer.getFloatingContainerVisiblity();
            // A shell header button that controls the visibility of the Floating Container
            oRenderer.addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem", {
                id: "FloatingContainerButton",
                icon: "sap-icon://S4Hana/S0011",
                press: function (oEvent) {
                    oRenderer.setFloatingContainerDragSelector("#ContentPage-intHeader");
                    oRenderer.setFloatingContainerVisibility(!bContainerVisible);
                    bContainerVisible = !bContainerVisible;
                    var state = oRenderer.getFloatingContainerState();
                    if(state.indexOf("docked") != -1){
                        jQuery("#ContentPage").addClass("sapUshellShellFloatingContainerFullHeight");
                    }
                }
            }, true, false, ["home", "app"]);

            oContent = getContainerContent();

            // Setting the content of the Floating Container for the states "home" and "app"

            // The content is added to the container only in the current state
            //oRenderer.setFloatingContainerContent(oContent, true);

            // The content is added to the container in "home" and "app" states
            //oRenderer.setFloatingContainerContent(oContent, false , ["home", "app"]);

            // The content is added to the container in all states
            oRenderer.setFloatingContainerContent(oContent, false);
        } else {
            jQuery.sap.log.error("BootstrapPluginSample - failed to apply renderer extensions, because 'sap.ushell.renderers.fiori2.RendererExtensions' not available");
        }
    }

    // the module could be loaded asynchronously, the shell does not guarantee a loading order;
    // therefore, we have to consider both cases, i.e. renderer is loaded before or after this module
    if (oRenderer) {
        // fiori renderer already loaded, apply extensions directly
        applyRenderer();
    } else {
        // fiori renderer not yet loaded, register handler for the loaded event
        sap.ui.getCore().getEventBus().subscribe("sap.ushell", "rendererLoaded", applyRenderer, this);
    }
}());
