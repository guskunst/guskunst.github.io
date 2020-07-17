// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/resources"],function(r){"use strict";var f={};var g=r.i18n.getText("featuredGroup.title");var R=r.i18n.getText("recentActivities");var F=r.i18n.getText("frequentActivities");var t=r.i18n.getText("top",3);var o={"_version":"3.0.0","site":{"identification":{"version":"3.0","id":"c9dcc1f3-dec0-4db4-91d3-639bf38d91ce","title":"Featured Group","description":"Sample site for featured group cards"},"payload":{"groupsOrder":["FeaturedGroupCards"]}},"catalogs":{},"vizTypes":{"sap.ushell.Card":{"sap.app":{"id":"sap.ushell.Card","type":"card","applicationVersion":{"version":"1.0.0"}},"sap.ui":{"deviceTypes":{"desktop":true,"tablet":true,"phone":true}}}},"visualizations":{"FrequentCard":{"vizType":"sap.ushell.Card","businessApp":"fin.cash.bankmaster.manage.BusinessApp","target":{"appId":"fin.cash.bankmaster.manage","inboundId":"Bank-manage","parameters":{}},"vizConfig":{"sap.flp":{"columns":"4","rows":"3"},"sap.app":{"id":"FrequentCard","type":"card"},"sap.ui5":{"services":{"CardNavigationService":{"factoryName":"sap.ushell.ui5service.CardNavigation"},"CardUserFrequentsService":{"factoryName":"sap.ushell.ui5service.CardUserFrequents"}}},"sap.card":{"type":"List","header":{"title":F,"status":{"text":t},"actions":[{"type":"Navigation","service":"CardNavigationService","parameters":{"openUI":"FrequentActivities"}}]},"content":{"maxItems":3,"data":{"service":{"name":"CardUserFrequentsService"}},"item":{"title":{"value":"{Name}"},"description":{"value":"{Description}"},"highlight":"{Highlight}","icon":{"src":"{= ${Icon} === undefined ? 'sap-icon://product' : ${Icon} }","label":"icon"},"actions":[{"type":"Navigation","service":"CardNavigationService","parameters":{"title":"{Name}","url":"{Url}","intentSemanticObject":"{Intent/SemanticObject}","intentAction":"{Intent/Action}","intentParameters":"{Intent/Parameters}"}}]}}}}},"RecentCard":{"vizType":"sap.ushell.Card","businessApp":"fin.cash.bankmaster.manage.BusinessApp","target":{"appId":"fin.cash.bankmaster.manage","inboundId":"Bank-manage","parameters":{}},"vizConfig":{"sap.flp":{"columns":"4","rows":"3"},"sap.app":{"id":"RecentCard","type":"card"},"sap.ui5":{"services":{"CardNavigationService":{"factoryName":"sap.ushell.ui5service.CardNavigation"},"CardUserRecentsService":{"factoryName":"sap.ushell.ui5service.CardUserRecents"}}},"sap.card":{"type":"List","header":{"title":R,"status":{"text":t},"actions":[{"type":"Navigation","service":"CardNavigationService","parameters":{"openUI":"RecentActivities"}}]},"content":{"maxItems":3,"data":{"service":{"name":"CardUserRecentsService"}},"item":{"title":{"label":"{{title_label}}","value":"{Name}"},"description":{"label":"{{description_label}}","value":"{Description}"},"icon":{"src":"{= ${Icon} === undefined ? 'sap-icon://product' : ${Icon} }","label":"icon"},"highlight":"{Highlight}","actions":[{"type":"Navigation","service":"CardNavigationService","parameters":{"title":"{Name}","url":"{Url}","intentSemanticObject":"{Intent/SemanticObject}","intentAction":"{Intent/Action}","intentParameters":"{Intent/Parameters}"}}]}}}}}},"applications":{},"groups":{"FeaturedGroupCards":{"identification":{"id":"FeaturedGroupCards","title":g},"contentProvider":"featured","isFeatured":true,"payload":{"locked":true,"tiles":[{"id":"frequentCard","vizId":"FrequentCard","contentProvider":"featured"},{"id":"recentCard","vizId":"RecentCard","contentProvider":"featured"}],"links":[],"groups":[]}}},"systemAliases":{}};f.getMockAdapterConfig=function(e,E){var T=o.groups.FeaturedGroupCards.payload.tiles,v=o.visualizations;for(var i=0;i<T.length;i++){var a=T[i],s=!e&&a.vizId==="FrequentCard",S=!E&&a.vizId==="RecentCard";if(s||S){delete v[a.vizId];T.splice(i,1);i--;}}return o;};return f;},true);