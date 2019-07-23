// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * Provides control sap.ushell.ui.shell.ShellTitle
 *
 * This control is responsible to display the Shell Header Subtitle.
 */
sap.ui.define(['sap/ui/core/Control'], function (Control) {
        "use strict";

        var ShellTitle = Control.extend("sap.ushell.ui.shell.ShellTitle",
            {
                metadata: {
                    properties: {
                        text: {type : "string", group : "Misc", defaultValue : null},
                        icon: {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null}
                    }
                },
                renderer: {
                    render: function (oRm, oControl) {
                        if (oControl.getText()) {
                            oRm.write("<span");
                            oRm.writeControlData(oControl);
                            oRm.write(' class="sapUshellHeadTitle">');
                            oRm.writeEscaped(oControl.getText());
                            oRm.write("</span>");
                        }
                    }
                }
            });

        return ShellTitle;

    }, true /* bExport */);
