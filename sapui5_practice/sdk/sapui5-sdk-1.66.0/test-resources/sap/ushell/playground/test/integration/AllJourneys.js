sap.ui.define([
    "sap/ui/test/Opa5",
    "./arrangement/Common",
    "./ShellHeaderJourney",
    "./ShellAppTitleJourney",
    "./TileBaseJourney",
    "./ToolAreaJourney",
    "./ToolAreaItemJourney",
    "./NavigationMenuJourney",
    "./NavigationMiniTileJourney",
    "./RightFloatingContainerJourney",
    "./TileJourney"
], function (Opa5, Common) {
    "use strict";
    Opa5.extendConfig({
        arrangements: new Common(),
        viewNamespace: "ControlPlaygrounds.view.",
        autoWait: true
    });
});