//@ui5-bundle sap/ushell_abap/library-h2-preload.js
/*!
 * Copyright (c) 2009-2017 SAP SE, All Rights Reserved
 */
sap.ui.predefine('sap/ushell_abap/library',["sap/ui/core/library","sap/m/library"],function(c,l){"use strict";sap.ui.getCore().initLibrary({name:"sap.ushell_abap",version:"1.66.0",dependencies:["sap.ui.core","sap.m"],noLibraryCSS:true,extensions:{"sap.ui.support":{diagnosticPlugins:["sap/ushell_abap/support/plugins/app-infra/AppInfraOnSapNetWeaverSupportPlugin"]}}});return sap.ushell_abap;},true);
sap.ui.require.preload({
	"sap/ushell_abap/manifest.json":'{"_version":"1.9.0","sap.app":{"id":"sap.ushell_abap","type":"library","embeds":["plugins/fcc-transport-ui"],"applicationVersion":{"version":"1.66.0"},"title":"SAP library: sap.ushell_abap","description":"SAP library: sap.ushell_abap","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":[]},"sap.ui5":{"dependencies":{"minUI5Version":"1.66","libs":{"sap.ui.core":{"minVersion":"1.66.0"}}},"library":{"i18n":false,"css":false}}}'
},"sap/ushell_abap/library-h2-preload"
);
sap.ui.loader.config({depCacheUI5:{
"sap/ui2/srvc/PageBuildingService.js":["sap/ui2/srvc/ODataService.js","sap/ui2/srvc/ODataWrapper.js","sap/ui2/srvc/utils.js"],
"sap/ui2/srvc/RemoteCatalogService.js":["sap/ui2/srvc/PageBuildingService.js"],
"sap/ushell_abap/adapters/abap/AdapterContainer.js":["sap/ui2/srvc/ODataService.js"],
"sap/ushell_abap/adapters/abap/AppStateAdapter.js":["sap/ui2/srvc/ODataWrapper.js","sap/ushell/services/Personalization.js"],
"sap/ushell_abap/adapters/abap/ClientSideTargetResolutionAdapter.js":["sap/ui2/srvc/ODataWrapper.js","sap/ui2/srvc/utils.js"],
"sap/ushell_abap/adapters/abap/ContainerAdapter.js":["jquery.sap.global.js","sap/ui/thirdparty/URI.js","sap/ui/thirdparty/datajs.js","sap/ui2/srvc/ODataWrapper.js","sap/ushell/System.js","sap/ushell/User.js","sap/ushell/utils.js","sap/ushell_abap/bootstrap/evo/abap.bootstrap.utils.js"],
"sap/ushell_abap/adapters/abap/EndUserFeedbackAdapter.js":["sap/ui2/srvc/ODataService.js","sap/ui2/srvc/ODataWrapper.js"],
"sap/ushell_abap/adapters/abap/LaunchPageAdapter.js":["sap/base/Log.js","sap/ui/thirdparty/URI.js","sap/ui2/srvc/catalog.js","sap/ui2/srvc/chipdefinition.js","sap/ui2/srvc/chipinstance.js","sap/ushell/components/cards/ManifestPropertyHelper.js"],
"sap/ushell_abap/adapters/abap/PageBuildingAdapter.js":["sap/ui2/srvc/PageBuildingService.js","sap/ui2/srvc/RemoteCatalogService.js","sap/ui2/srvc/factory.js","sap/ui2/srvc/pageset.js","sap/ushell/System.js"],
"sap/ushell_abap/adapters/abap/PersonalizationAdapter.js":["sap/ui2/srvc/ODataService.js","sap/ui2/srvc/ODataWrapper.js","sap/ushell/services/Personalization.js","sap/ushell/services/_Personalization/constants.js","sap/ushell_abap/adapters/abap/AdapterContainer.js"],
"sap/ushell_abap/adapters/abap/SupportTicketAdapter.js":["sap/ui2/srvc/ODataService.js","sap/ui2/srvc/ODataWrapper.js"],
"sap/ushell_abap/adapters/abap/UserInfoAdapter.js":["sap/ui/thirdparty/datajs.js","sap/ui2/srvc/ODataService.js","sap/ui2/srvc/ODataWrapper.js"],
"sap/ushell_abap/adapters/hana/ContainerAdapter.js":["sap/ui2/srvc/utils.js","sap/ushell/System.js","sap/ushell/User.js"],
"sap/ushell_abap/bootstrap/evo/XhrLogonEventHandler.js":["sap/ushell_abap/bootstrap/evo/abap.bootstrap.utils.js"],
"sap/ushell_abap/bootstrap/evo/abap-def-dev.js":["sap/ui2/srvc/chip.js","sap/ushell/bootstrap/common/common.boot.path.js","sap/ushell/bootstrap/common/common.configure.ui5.extractLibs.js","sap/ushell/bootstrap/common/common.configure.ui5.js","sap/ushell/bootstrap/common/common.debug.mode.js","sap/ushell/bootstrap/common/common.load.splashscreen.js","sap/ushell_abap/bootstrap/evo/abap.configure.ushell.js","sap/ushell_abap/bootstrap/evo/abap.load.launchpad.js","sap/ushell_abap/bootstrap/evo/abap.ui5.boot.handler.js","sap/ushell_abap/bootstrap/evo/boottask.js"],
"sap/ushell_abap/bootstrap/evo/abap-def.js":["sap/ui2/srvc/chip.js","sap/ushell/bootstrap/common/common.boot.path.js","sap/ushell/bootstrap/common/common.configure.ui5.extractLibs.js","sap/ushell/bootstrap/common/common.configure.ui5.js","sap/ushell/bootstrap/common/common.debug.mode.js","sap/ushell/bootstrap/common/common.load.core-min.js","sap/ushell/bootstrap/common/common.load.splashscreen.js","sap/ushell/bootstrap/common/common.preload.module.js","sap/ushell_abap/bootstrap/evo/abap.configure.ushell.js","sap/ushell_abap/bootstrap/evo/abap.load.launchpad.js","sap/ushell_abap/bootstrap/evo/abap.ui5.boot.handler.js","sap/ushell_abap/bootstrap/evo/boottask.js"],
"sap/ushell_abap/bootstrap/evo/abap.bootstrap.utils.js":["sap/ui2/srvc/utils.js","sap/ushell/utils.js"],
"sap/ushell_abap/bootstrap/evo/abap.configure.ushell.js":["jquery.sap.global.js","sap/ushell/bootstrap/common/common.configure.ushell.js","sap/ushell_abap/bootstrap/evo/abap.constants.js"],
"sap/ushell_abap/bootstrap/evo/abap.get.server.config.Urls.js":["sap/ushell_abap/bootstrap/evo/abap.validate.Url.js"],
"sap/ushell_abap/bootstrap/evo/abap.load.launchpad.js":["sap/ui2/srvc/bag.js","sap/ui2/srvc/chip.js","sap/ui2/srvc/contracts/actions.js","sap/ui2/srvc/contracts/bag.js","sap/ui2/srvc/contracts/configuration.js","sap/ui2/srvc/contracts/configurationUi.js","sap/ui2/srvc/contracts/fullscreen.js","sap/ui2/srvc/contracts/preview.js","sap/ui2/srvc/contracts/refresh.js","sap/ui2/srvc/contracts/search.js","sap/ui2/srvc/contracts/searchProvider.js","sap/ui2/srvc/contracts/types.js","sap/ui2/srvc/contracts/url.js","sap/ui2/srvc/contracts/visible.js","sap/ui2/srvc/error.js","sap/ushell/functionBindPrototype.js","sap/ushell/utils.js"],
"sap/ushell_abap/bootstrap/evo/abap.request.pageset.js":["sap/ushell_abap/bootstrap/evo/abap.bootstrap.utils.js"],
"sap/ushell_abap/bootstrap/evo/abap.request.server.config.js":["sap/ui2/srvc/utils.js","sap/ushell_abap/bootstrap/evo/abap.get.server.config.Urls.js"],
"sap/ushell_abap/bootstrap/evo/abap.request.startup.js":["sap/ui2/srvc/utils.js","sap/ushell/utils.js","sap/ushell_abap/bootstrap/evo/abap.bootstrap.utils.js"],
"sap/ushell_abap/bootstrap/evo/abap.ui5.boot.handler.js":["sap/ui2/srvc/utils.js"],
"sap/ushell_abap/bootstrap/evo/abap.xhr.handler.js":["sap/ushell/bootstrap/common/common.configure.xhrlogon.js","sap/ushell/bootstrap/common/common.load.xhrlogon.js","sap/ushell_abap/bootstrap/evo/XhrLogonEventHandler.js","sap/ushell_abap/bootstrap/evo/abap.bootstrap.utils.js"],
"sap/ushell_abap/bootstrap/evo/boottask.js":["sap/ui/Device.js","sap/ui2/srvc/utils.js","sap/ushell/bootstrap/common/common.boot.path.js","sap/ushell/bootstrap/common/common.load.xhrlogon.js","sap/ushell/services/Container.js","sap/ushell/utils.js","sap/ushell_abap/bootstrap/evo/abap.bootstrap.utils.js","sap/ushell_abap/bootstrap/evo/abap.request.pageset.js","sap/ushell_abap/bootstrap/evo/abap.request.server.config.js","sap/ushell_abap/bootstrap/evo/abap.request.startup.js","sap/ushell_abap/bootstrap/evo/abap.xhr.handler.js"],
"sap/ushell_abap/library.js":["sap/m/library.js","sap/ui/core/library.js"],
"sap/ushell_abap/plugins/fcc-transport-ui/Component.js":["sap/ui/Device.js","sap/ui/core/Component.js","sap/ui/fl/transport/TransportDialog.js","sap/ushell_abap/plugins/fcc-transport-ui/model/models.js"],
"sap/ushell_abap/plugins/fcc-transport-ui/model/models.js":["sap/ui/Device.js","sap/ui/model/json/JSONModel.js"],
"sap/ushell_abap/support/plugins/app-infra/AppInfraOnSapNetWeaverSupportPlugin.js":["jquery.sap.global.js","sap/m/Text.js","sap/ui/core/HTML.js","sap/ui/core/support/Plugin.js","sap/ui/core/support/Support.js","sap/ui/layout/VerticalLayout.js"],
"sap/ushell_abap/ui5appruntime/AppInfoAdapter.js":["sap/base/Log.js","sap/ui/thirdparty/URI.js","sap/ui/thirdparty/jquery.js"]
}});
//# sourceMappingURL=library-h2-preload.js.map