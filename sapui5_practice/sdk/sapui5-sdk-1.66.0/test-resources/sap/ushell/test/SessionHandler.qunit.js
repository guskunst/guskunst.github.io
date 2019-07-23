// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.require([
    "sap/ushell/resources",
    "sap/ushell/services/Container",
    "sap/ushell/SessionHandler"
], function (Resources, Container, SessionHandler) {
    "use strict";
    /* eslint-disable */ // TBD: make ESLint conform

    /*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
     notEqual, notStrictEqual, ok, raises, start, strictEqual, stop, test,
     jQuery, sap, sinon */

    var oShellView,
        oSessionHandlerConfig = {
            sessionTimeoutIntervalInMinutes: 30,
            sessionTimeoutReminderInMinutes: 5,
            enableAutomaticSignout: false,
            keepSessionAlivePopupText: "XXX The session is about to expoire",
            pageReloadPopupText: "XXX The session was terminated, please reload"
        },
        oSessionHandlerConfigNoReminder = {
            sessionTimeoutIntervalInMinutes: 30,
            sessionTimeoutReminderInMinutes: 0,
            enableAutomaticSignout: false
        };

    module("sap.ushell.SessionHandler", {
        setup: function () {
            stop();
            sap.ushell.bootstrap("local").then(start);
         },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        teardown: function () {
            delete sap.ushell.Container;
        }
    });

    test("Test initialization flow", function () {
        var oSessionHandler = new SessionHandler(),
            oCurrentDateStub,
            oTestModel,
            oCurrentDateStub = sinon.stub(oSessionHandler, "_getCurrentDate").returns("CurrentDate");
            //oSessionHandler.putTimestampInStorage = sinon.spy();
            oSessionHandler.attachUserEvents = sinon.spy();
            oSessionHandler.notifyServer = sinon.spy();
            oSessionHandler.notifyUserInactivity = sinon.spy();

            oSessionHandler.init(oSessionHandlerConfig);
            oTestModel = oSessionHandler.oModel;

    //    ok(oSessionHandler.putTimestampInStorage.calledOnce === true, "putTimestampInStorage called");
        ok(oSessionHandler.attachUserEvents.calledOnce === true, "attachUserEvents called");
        ok(oSessionHandler.getTimestampFromStorage() === "CurrentDate", "Correct date is stored in LocalStorage");
        ok(oTestModel.getProperty("/SessionRemainingTimeInSeconds") === oSessionHandlerConfig.sessionTimeoutReminderInMinutes * 60, "Model property SessionRemainingTimeInSeconds updated correctly");
        ok(oSessionHandler.notifyServer.calledOnce === true, "NotifyServer called once");
        ok(oSessionHandler.notifyUserInactivity.calledOnce === true, "NotifyUserInactivity called once");

        oCurrentDateStub.restore();
    });

    test("Test function notifyUserInactivity", function () {
        var oSessionHandler = new SessionHandler(),
            iReminderIntervalInMinutes = oSessionHandlerConfig.sessionTimeoutIntervalInMinutes - oSessionHandlerConfig.sessionTimeoutReminderInMinutes,
            dBaseDate = new Date(),
            dDate1 = new Date(dBaseDate.getTime()),
            dDate2 = new Date(dBaseDate.getTime()),
            oCurrentDateStub,
            oGetTimestampFromStorageStub,
            bContinueWorkingDialogVisibilityStub,
            oCreateContinueWorkingDialogStub,
            putContinueWorkingDialogStub,
            oOpenDialogSpy = sinon.spy(),
            oOrigSetTimeout = window.setTimeout;

        dDate1.setMinutes(dBaseDate.getMinutes() + iReminderIntervalInMinutes - 10);
        dDate2.setMinutes(dBaseDate.getMinutes() + iReminderIntervalInMinutes + 2);

        oGetTimestampFromStorageStub = sinon.stub(oSessionHandler, "getTimestampFromStorage").returns(dBaseDate.toString());
        bContinueWorkingDialogVisibilityStub = sinon.stub(oSessionHandler, "getContinueWorkingVisibilityFromStorage").returns("false");
        putContinueWorkingDialogStub = sinon.stub(oSessionHandler, "putContinueWorkingVisibilityInStorage")



        oSessionHandler.config = oSessionHandlerConfig;
        window.setTimeout = sinon.spy();

        // Use-case 1: the time since the last action is smaller then reminderIntervalInMinutes
        oCurrentDateStub = sinon.stub(oSessionHandler, "_getCurrentDate").returns(dDate1);

        oSessionHandler.notifyUserInactivity();

        ok(window.setTimeout.calledOnce === true, "setTimout called once when timeSinceLastActionInMinutes < reminderIntervalInMinutes");

        // Use-case 2: the time since the last action bigger then reminderIntervalInMinutes
        oCurrentDateStub.restore();
        oCurrentDateStub = sinon.stub(oSessionHandler, "_getCurrentDate").returns(dDate2);
        oSessionHandler.detachUserEvents = sinon.spy();
        oSessionHandler.handleSessionRemainingTime = sinon.spy();
        oCreateContinueWorkingDialogStub = sinon.stub(oSessionHandler, "createContinueWorkingDialog").returns({
        	open : oOpenDialogSpy
        });

        oSessionHandler.notifyUserInactivity();

        ok(window.setTimeout.calledOnce === true, "setTimout NOT called when timeSinceLastActionInMinutes > reminderIntervalInMinutes");
        ok(oSessionHandler.detachUserEvents.calledOnce === true, "detachUserEvents called when timeSinceLastActionInMinutes > reminderIntervalInMinutes");
        ok(oSessionHandler.handleSessionRemainingTime.calledOnce === true, "handleSessionRemainingTime called when timeSinceLastActionInMinutes > reminderIntervalInMinutes");
        ok(oSessionHandler.handleSessionRemainingTime.args[0][0] === oSessionHandlerConfig.sessionTimeoutReminderInMinutes * 60, "handleSessionRemainingTime called with correct number of seconds");
        ok(oOpenDialogSpy.calledOnce === true, "ContinueWorkingDialog opened when timeSinceLastActionInMinutes > reminderIntervalInMinutes");
        ok(putContinueWorkingDialogStub.calledOnce, "putContinueWorkingDialogStub should be called once");
        equal(putContinueWorkingDialogStub.firstCall.args[0], null, "localStorage item showContinueWorkingDialog was reseted");

        oCurrentDateStub.restore();
        oGetTimestampFromStorageStub.restore();
        oCreateContinueWorkingDialogStub.restore();
        putContinueWorkingDialogStub.restore();
        window.setTimeout = oOrigSetTimeout;
    });

    test("Test function notifyUserInactivity when Reminder off", function () {
        var oSessionHandler = new SessionHandler(),
            iReminderIntervalInMinutes = oSessionHandlerConfigNoReminder.sessionTimeoutIntervalInMinutes - oSessionHandlerConfigNoReminder.sessionTimeoutReminderInMinutes,
            dBaseDate = new Date(),
            dDate1 = new Date(dBaseDate.getTime()),
            dDate2 = new Date(dBaseDate.getTime()),
            oCurrentDateStub,
            oGetTimestampFromStorageStub,
            oSessionTimeOutDialogStub,
            oOpenDialogSpy = sinon.spy(),
            oOrigSetTimeout = window.setTimeout,
            oCreateContinueWorkingDialogStub;

        dDate1.setMinutes(dBaseDate.getMinutes() + iReminderIntervalInMinutes - 10);
        dDate2.setMinutes(dBaseDate.getMinutes() + iReminderIntervalInMinutes + 2);

        oGetTimestampFromStorageStub = sinon.stub(oSessionHandler, "getTimestampFromStorage").returns(dBaseDate.toString());

        oSessionHandler.config = oSessionHandlerConfigNoReminder;

        oSessionTimeOutDialogStub = sinon.stub(oSessionHandler, "createSessionExpiredDialog").returns({
            open : oOpenDialogSpy
        });
        oCreateContinueWorkingDialogStub = sinon.stub(oSessionHandler, "createContinueWorkingDialog").returns({
            open : oOpenDialogSpy
        });

        window.setTimeout = sinon.spy();

        // Use-case 1: the time since the last action is smaller then reminderIntervalInMinutes
        oCurrentDateStub = sinon.stub(oSessionHandler, "_getCurrentDate").returns(dDate1);

        oSessionHandler.notifyUserInactivity();

        ok(window.setTimeout.calledOnce, "setTimout should called when reminderIntervalInMinutes = 0 and the user has activity");
        equals(oSessionTimeOutDialogStub.callCount, 0, "createSessionExpiredDialog should not be called ");
        equals(oOpenDialogSpy.callCount, 0, "sessionExpiredDialog should not be called");


        // Use-case 2: the time since the last action bigger then reminderIntervalInMinutes
        oCurrentDateStub.restore();
        oCurrentDateStub = sinon.stub(oSessionHandler, "_getCurrentDate").returns(dDate2);
        oSessionHandler.detachUserEvents = sinon.spy();
        oSessionHandler.handleSessionRemainingTime = sinon.spy();


        oSessionHandler.notifyUserInactivity();


        ok(window.setTimeout.calledOnce, "setTimout should not called when reminderIntervalInMinutes = 0 and the interval is over");
        ok(oSessionTimeOutDialogStub.calledOnce, "createSessionExpiredDialog should be called once");
        ok(oOpenDialogSpy.calledOnce, "sessionExpiredDialog should be opened once");
        equals ( oCreateContinueWorkingDialogStub.callCount, 0, "Continue Working Dialog should not called and open when reminderIntervalInMinutes = 0 ");
        equals ( oSessionHandler.detachUserEvents.callCount, 0, "Continue Working Dialog should not called and open when reminderIntervalInMinutes = 0 ");
        equals ( oSessionHandler.handleSessionRemainingTime.callCount, 0, "handleSessionRemainingTime should not called when reminderIntervalInMinutes = 0 ");

        oCurrentDateStub.restore();
        oGetTimestampFromStorageStub.restore();
        oCreateContinueWorkingDialogStub.restore();
        window.setTimeout = oOrigSetTimeout;
    });


    test("Test function notifyServer", function () {
        var oSessionHandler = new SessionHandler(),
            dBaseDate = new Date(),
            dDate1 = new Date(dBaseDate.getTime()),
            dDate2 = new Date(dBaseDate.getTime()),
            oGetTimestampFromStorageStub,
            oCurrentDateStub,
            oOrigSetTimeout = window.setTimeout,
            oOrigContainerKeepAlive = sap.ushell.Container.sessionKeepAlive;


        dDate1.setMinutes(dBaseDate.getMinutes() + oSessionHandlerConfig.sessionTimeoutIntervalInMinutes - 2);
        dDate2.setMinutes(dBaseDate.getMinutes() + oSessionHandlerConfig.sessionTimeoutIntervalInMinutes + 2);

        oGetTimestampFromStorageStub = sinon.stub(oSessionHandler, "getTimestampFromStorage").returns(dBaseDate.toString());

        oSessionHandler.config = oSessionHandlerConfig;
        window.setTimeout = sinon.spy();
        sap.ushell.Container.sessionKeepAlive = sinon.spy();

        // Use-case 1: the time since the last action is smaller then sessionTimeoutIntervalInMinutes
        oCurrentDateStub = sinon.stub(oSessionHandler, "_getCurrentDate").returns(dDate1);

        oSessionHandler.notifyServer();

        ok(sap.ushell.Container.sessionKeepAlive.calledOnce === true, "Time from last user action is smaller than sessionTimeoutIntervalInMinutes -> sap.ushell.Container.sessionKeepAlive called once");
        ok(window.setTimeout.calledOnce === true, "Time from last user action is smaller than sessionTimeoutIntervalInMinutes -> setTimeout called");
        ok(window.setTimeout.args[0][1] === oSessionHandlerConfig.sessionTimeoutIntervalInMinutes * 60 * 1000, "setTimeout called in order to wait another sessionTimeoutIntervalInMinutes interval");

        // Use-case 2: the time since the last action is bigger then sessionTimeoutIntervalInMinutes
        oCurrentDateStub.restore();
        oCurrentDateStub = sinon.stub(oSessionHandler, "_getCurrentDate").returns(dDate2);

        oSessionHandler.notifyServer();
        ok(sap.ushell.Container.sessionKeepAlive.calledOnce === true, "Time from last user action is bigger than sessionTimeoutIntervalInMinutes -> sap.ushell.Container.sessionKeepAlive is not called");
        ok(window.setTimeout.calledTwice === true, "Time from last user action is smaller than sessionTimeoutIntervalInMinutes -> setTimeout called");
        ok(window.setTimeout.args[0][1] === oSessionHandlerConfig.sessionTimeoutIntervalInMinutes * 60 * 1000, "setTimeout called in order to wait another sessionTimeoutIntervalInMinutes interval");

        oGetTimestampFromStorageStub.restore();
        oCurrentDateStub.restore();
        window.setTimeout = oOrigSetTimeout;
        sap.ushell.Container.sessionKeepAlive = oOrigContainerKeepAlive;
    });

    test("Test function handleSessionRemainingTime", function () {
        var oSessionHandler = new SessionHandler(),
            oSetModelPropertySpy = sinon.spy(),
            oCloseKeepAliveDialogSpy = sinon.spy(),
            oSessionExpiredDialogOpenSpy = sinon.spy(),
            oEventBusPublishStub,
            putContinueWorkingDialogStub,
            bContinueWorkingDialogVisibilityStub,
            oExpiredDialogStub;

        oSessionHandler.oSessionKeepAliveDialog = {
            close : oCloseKeepAliveDialogSpy
        };

        oExpiredDialogStub = sinon.stub(oSessionHandler, "createSessionExpiredDialog").returns({
            open : oSessionExpiredDialogOpenSpy
        });
        oSessionHandler.oModel = {
            setProperty : oSetModelPropertySpy
        };

        oSessionHandler.logout = sinon.spy();
        oEventBusPublishStub = sinon.stub(sap.ui.getCore().getEventBus(), "publish").returns({});

        bContinueWorkingDialogVisibilityStub = sinon.stub(oSessionHandler, "getContinueWorkingVisibilityFromStorage").returns("false");
        putContinueWorkingDialogStub = sinon.stub(oSessionHandler, "putContinueWorkingVisibilityInStorage")

        oSessionHandler.handleSessionRemainingTime(30);
        ok(oSetModelPropertySpy.calledOnce === true, "Session remaining time not 0 - the Model is updated");
        ok(oSetModelPropertySpy.args[0][0] === "/SessionRemainingTimeInSeconds", "Session remaining time not 0 - the Model is updated");
        ok(oSetModelPropertySpy.args[0][1] === 29, "Session remaining time not 0 - a second is rediced, and the Model is updated");

        oSessionHandler.config = {
        		enableAutomaticSignout : false
        };
        oSessionHandler.handleSessionRemainingTime(0);
        ok(oEventBusPublishStub.calledOnce === true, "Session remaining time is 0 - not in kiosk mode - sessionTimeout event published");
        ok(oEventBusPublishStub.args[0][1] === "sessionTimeout", "Session remaining time is 0 - not in kiosk mode - sessionTimeout event published");
        ok(oCloseKeepAliveDialogSpy.calledOnce === true, "Session remaining time is 0 - not in kiosk mode - KeepAlive dialog closed");
        ok(oSessionHandler.logout.notCalled === true, "Session remaining time is 0 - not in kiosk mode - logout not called");
        ok(oSessionExpiredDialogOpenSpy.calledOnce === true, "Session remaining time is 0 - not in kiosk mode - sessionTimeout dialog opened");

        oSessionHandler.config.enableAutomaticSignout = true;
        oSessionHandler.handleSessionRemainingTime(0);
        ok(oEventBusPublishStub.calledTwice === true, "Session remaining time is 0 - kiosk mode - Event published once");
        ok(oEventBusPublishStub.args[0][1] === "sessionTimeout", "Session remaining time is 0 - kiosk mode - sessionTimeout was published");
        ok(oCloseKeepAliveDialogSpy.calledTwice === true, "Session remaining time is 0 - kiosk mode - KeepAlive dialog closed");
        ok(oSessionHandler.logout.calledOnce === true, "Session remaining time is 0 - kiosk mode - logout called");
        ok(oSessionExpiredDialogOpenSpy.calledOnce === true, "Session remaining time is 0 - kiosk mode - SessionExpiredDialog NOT opened");
    });

    test("Test function continueWorkingButtonPressHandler", function () {
        var oSessionHandler = new SessionHandler(),
            oKeepAliveDialogCloseSpy = sinon.spy(),
            oCurrentDateStub;

        oSessionHandler.oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local, "test");
        oSessionHandler.attachUserEvents = sinon.spy();
        oSessionHandler.notifyUserInactivity = sinon.spy();
        oSessionHandler.oSessionKeepAliveDialog = {
            close : oKeepAliveDialogCloseSpy
        };
        oCurrentDateStub = sinon.stub(oSessionHandler, "_getCurrentDate").returns("CurrentDate");
        oSessionHandler.continueWorkingButtonPressHandler();

        ok(oSessionHandler.notifyUserInactivity.calledOnce === true, "notifyUserInactivity called once");
        ok(oSessionHandler.getTimestampFromStorage() === "CurrentDate", "Correct date is stored in LocalStorage");
        ok(oSessionHandler.attachUserEvents.calledOnce === true, "attachUserEvents called");
        ok(oSessionHandler.getContinueWorkingVisibilityFromStorage() === false, "localStorage item showContinueWorkingDialog has the value false");

        oCurrentDateStub.restore();
    });
});
