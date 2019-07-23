/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(['jquery.sap.global','sap/fe/core/TemplateComponent'],function(q,T){"use strict";var L=T.extend("sap.fe.templates.ListReport.Component",{metadata:{properties:{variantManagement:{type:"sap.fe.VariantManagement",defaultValue:sap.fe.VariantManagement.None},_tableType:{type:"string",defaultValue:"ResponsiveTable"},_templateName:{type:"string",defaultValue:"sap.fe.templates.ListReport.ListReport"}},library:"sap.fe",manifest:"json"},onAfterBinding:function(c){this.getRootControl().getController().onAfterBinding(c);},getViewData:function(){var v={};if(this.getVariantManagement()===sap.fe.VariantManagement.None){v.noPageVariantManagement=true;}else{v.noPageVariantManagement=false;}v._tableType=this.get_tableType();v.entitySetName=this.getEntitySet();return v;}});return L;},true);
