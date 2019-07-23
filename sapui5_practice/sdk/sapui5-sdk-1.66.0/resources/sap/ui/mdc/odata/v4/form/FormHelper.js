/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/model/odata/v4/AnnotationHelper"],function(O){"use strict";var F={resolveAnnotationPathForForm:function(c){var p=c.getPath();var a=c.getObject();var n=O.getNavigationPath(a);if(n){var N=n.split("/"),e=p.split("/$Type")[0];N.forEach(function(s){e=e+"/$NavigationPropertyBinding/"+s;});return a.replace(n,e);}else{return p;}},getTargetEntitySet:function(c){var e=O.getNavigationPath(c.getPath());return"/"+c.getObject(e);},checkIfCollectionFacetNeedsToBeRendered:function(c,p){if(c.$Type==="com.sap.vocabularies.UI.v1.CollectionFacet"&&c.Facets.length){var C=function(a,R){var b=R["@com.sap.vocabularies.UI.v1.PartOfPreview"];return((a!=='false')&&(b!==false))||((a==='false')&&(b===false));};var r=c.Facets;return r.some(C.bind(null,p));}return false;},getDataFieldCollection:function(c){var p=c.getPath();if(c.getObject(p+"/Data")){return(p+"/Data");}else{return p;}}};return F;},true);
