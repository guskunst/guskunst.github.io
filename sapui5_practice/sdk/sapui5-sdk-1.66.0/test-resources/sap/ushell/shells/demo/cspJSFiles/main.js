/**
 * Main method to be executed once SAPUI5 has been initialized.
 */
function main() {
    "use strict";
    // load and register Fiori2 icon font
    if (sap.ui.Device.os.ios) {
        jQuery.sap.setIcons({
            'phone': '../../../../../resources/sap/ushell/themes/base/img/launchicons/57_iPhone_Desktop_Launch.png',
            'phone@2': '../../../../../resources/sap/ushell/themes/base/img/launchicons/114_iPhone-Retina_Web_Clip.png',
            'tablet': '../../../../../resources/sap/ushell/themes/base/img/launchicons/72_iPad_Desktop_Launch.png',
            'tablet@2': '../../../../../resources/sap/ushell/themes/base/img/launchicons/144_iPad_Retina_Web_Clip.png',
            'favicon': '../../../../../resources/sap/ushell/themes/base/img/launchpad_favicon.ico',
            'precomposed': true
        });
    } else {
        jQuery.sap.setIcons({
            'phone': '',
            'phone@2': '',
            'tablet': '',
            'tablet@2': '',
            'favicon': '../../../../../resources/sap/ushell/themes/base/img/launchpad_favicon.ico',
            'precomposed': true
        });
    }
    jQuery.sap.require("sap.ushell.iconfonts");
    sap.ushell.iconfonts.registerFiori2IconFont();

    /*global sap, document */
    jQuery.sap.require("sap.ushell.functionBindPrototype");

    // clean fiori loading screen markup before placing main content
    var oContent = sap.ushell.Container.createRenderer("fiori2");
    setTimeout(function () {
        oContent.placeAt("canvas");
    }, 1);
    jQuery(document).keydown(function (e) {
        //CTRL + ALT +  G keydown combo
        if (e.ctrlKey && e.altKey && e.keyCode === 71) {
            jQuery("#dbg_grid_overlay").toggle();
        }
    });
}