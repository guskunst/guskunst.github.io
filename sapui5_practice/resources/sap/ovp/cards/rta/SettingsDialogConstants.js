sap.ui.define([],function(){"use strict";return{aVariantNames:[{sVariant:".SelectionVariant",sPath:"selectionVariant"},{sVariant:".PresentationVariant",sPath:"presentationVariant"},{sVariant:".SelectionPresentationVariant",sPath:"selectionPresentationVariant"},{sVariant:".KPI",sPath:"KPI"},{sVariant:".Identification",sPath:"identification"},{sVariant:".DataPoint",sPath:"dataPoint",isMandatoryField:true},{sVariant:".Chart",sPath:"chart",isMandatoryField:true},{sVariant:".Chart",sPath:"chartSPVorKPI",isMandatoryField:true},{sVariant:".SelectionVariant",sPath:"selectionVariantSPVorKPI"},{sVariant:".PresentationVariant",sPath:"presentationVariantSPVorKPI"},{sVariant:".LineItem",sPath:"lineItem",isMandatoryField:true},{sVariant:".HeaderInfo",sPath:"dynamicSubTitle",isMandatoryField:true}],tabFields:['entitySet','dynamicSubtitleAnnotationPath','annotationPath','selectionAnnotationPath','presentationAnnotationPath','identificationAnnotationPath','dataPointAnnotationPath','chartAnnotationPath','colorPalette','ChartProperties','chartProperties','selectionPresentationAnnotationPath','kpiAnnotationPath','value'],mainFields:['title','subTitle','valueSelectionInfo','listType','listFlavor','sortOrder','sortBy','stopResizing','defaultSpan'],resetTabFields:['dynamicSubtitleAnnotationPath','annotationPath','selectionAnnotationPath','presentationAnnotationPath','identificationAnnotationPath','dataPointAnnotationPath','chartAnnotationPath','selectionPresentationAnnotationPath','kpiAnnotationPath'],cardSettingsForStaticLinkListCard:['title','subTitle','listFlavor','stopResizing','defaultSpan'],AllCardSettingsForKPICard:['title','subTitle','stopResizing','defaultSpan','entitySet','kpiAnnotationPath','identificationAnnotationPath'],allCardSettings:['entitySet','listType','listFlavor','sortOrder','sortBy','imageUri','targetUri','openInNewWindow','semanticObject','action','dynamicSubtitleAnnotationPath','annotationPath','selectionAnnotationPath','presentationAnnotationPath','identificationAnnotationPath','dataPointAnnotationPath','chartAnnotationPath','colorPalette','ChartProperties','chartProperties','selectionPresentationAnnotationPath','kpiAnnotationPath','stopResizing','defaultSpan'],cardSettingsArrayLevel:{"staticContent":{"text":['title','subTitle','imageAltText'],"settings":['imageUri','targetUri','openInNewWindow','semanticObject','action']},"tabs":{"text":['value'],"settings":['entitySet','dynamicSubtitleAnnotationPath','annotationPath','selectionAnnotationPath','presentationAnnotationPath','identificationAnnotationPath','dataPointAnnotationPath','chartAnnotationPath','colorPalette','ChartProperties','chartProperties','selectionPresentationAnnotationPath','kpiAnnotationPath','navigation'],"onlyTabLevelProps":['value'],"checkForRemoval":['entitySet']}},cardSettingsForComplex:{"text":['title','subTitle','valueSelectionInfo','itemText'],"settings":['listType','listFlavor','sortOrder','sortBy','stopResizing','defaultSpan','customParams','staticParameters','objectStreamCardsSettings']},cardSettings:{"text":['title','subTitle','valueSelectionInfo','itemText'],"settings":['listType','listFlavor','sortOrder','sortBy','dynamicSubtitleAnnotationPath','annotationPath','selectionAnnotationPath','presentationAnnotationPath','identificationAnnotationPath','dataPointAnnotationPath','chartAnnotationPath','colorPalette','ChartProperties','chartProperties','selectionPresentationAnnotationPath','kpiAnnotationPath','stopResizing','defaultSpan','customParams','staticParameters','objectStreamCardsSettings']},cardSettingsWithText:['title','subTitle','valueSelectionInfo','itemText',{'staticContent':['title','subTitle','imageAltText']},{'tabs':['value']}],oVisibility:{"cardPreview":true,"stopResizing":false,"noOfRows":false,"noOfColumns":false,"title":true,"showEntitySet":false,"dynamicSwitchStateSubTitle":false,"dynamicSwitchSubTitle":false,"dynamicSubTitle":false,"subTitle":true,"kpiHeader":true,"valueSelectionInfo":true,"listType":true,"listFlavor":true,"selectionVariantSPVorKPI":true,"presentationVariantSPVorKPI":true,"chartSPVorKPI":true,"selectionPresentationVariant":true,"KPI":true,"selectionVariant":true,"presentationVariant":true,"lineItem":true,"identification":true,"dataPoint":true,"chart":true,"links":false,"lineItemTitle":false,"lineItemSubTitle":false,"staticLink":false,"viewSwitch":false,"moveToTheTop":false,"moveUp":false,"moveDown":false,"moveToTheBottom":false,"delete":false,"showMore":true,"removeVisual":false,"selectCard":false,"addKPIHeader":false,"setEntitySet":false,"setCardProperties":false,"setGeneralCardProperties":false,"requiredSubTitle":false,"showNewCardTypes":false,"subTitleValueState":"","subTitleValueStateText":"","addCustomActions":false},_aRefreshNotRequired:[{"formElementId":"sapOvpSettingsTitle","cardElementId":"ovpHeaderTitle"},{"formElementId":"sapOvpSettingsViewName","cardElementId":"ovp_card_dropdown"},{"formElementId":"sapOvpDefaultViewSwitch","cardElementId":""},{"formElementId":"sapOvpSettingsSubTitle","cardElementId":"SubTitle-Text"},{"formElementId":"sapOvpSettingsLineItemTitle","cardElementId":"linkListTitleLabel"},{"formElementId":"sapOvpSettingsLineItemSubTitle","cardElementId":"linkListSubTitleLabel"},{"formElementId":"sapOvpSettingsValueSelectionInfo","cardElementId":"ovpValueSelectionInfo"},{"formElementId":"sapOvpSettingsIdentification","cardElementId":"","updateProperty":"identificationAnnotationPath"},{"formElementId":"sapOvpSettingsKPIHeaderSwitch","cardElementId":"kpiHeader","isKpiSwitch":true}],_aRefreshRequired:[{"formElementId":"sapOvpSettingsKPIHeaderSwitch","updateProperty":"kpiHeader"},{"formElementId":"sapOvpSettingsSwitchSubTitle","updateProperty":"subTitleSwitch"},{"formElementId":"sapOvpSettingsListType","updateProperty":"listType"},{"formElementId":"sapOvpSettingsListFlavorForList","updateProperty":"listFlavor"},{"formElementId":"sapOvpSettingsListFlavorForLinkList","updateProperty":"listFlavorForLinkList"},{"formElementId":"sapOvpSettingsSortOrder","updateProperty":"sortOrder"},{"formElementId":"sapOvpSettingsSortBy","updateProperty":"sortBy"},{"formElementId":"sapOvpSettingsDynamicSubTitle","updateProperty":"dynamicSubtitleAnnotationPath"},{"formElementId":"sapOvpSettingsFilterAndPresentedBy","updateProperty":"selectionPresentationAnnotationPath"},{"formElementId":"sapOvpSettingsFilterBy","updateProperty":"selectionAnnotationPath"},{"formElementId":"sapOvpSettingsPresentedBy","updateProperty":"presentationAnnotationPath"},{"formElementId":"sapOvpSettingsDataPoint","updateProperty":"dataPointAnnotationPath"},{"formElementId":"sapOvpSettingsChart","updateProperty":"chartAnnotationPath"},{"formElementId":"sapOvpSettingsLineItem","updateProperty":"annotationPath"},{"formElementId":"sapOvpSettingsEntitySet","updateProperty":"entitySet"},{"formElementId":"sapOvpSettingsStaticLinkListDelete","updateProperty":"delete"},{"formElementId":"sapOvpSettingsStaticLinkListAdd","updateProperty":"add"},{"formElementId":"sapOvpSettingsStaticLinkListSort","updateProperty":"sort"},{"formElementId":"sapOvpSettingsStaticLinkListChangeVisual","updateProperty":"changeVisual"},{"formElementId":"sapOvpSettingsStaticLinkListRemoveVisual","updateProperty":"removeVisual"},{"formElementId":"sapOvpSettingsNumberOfRows","updateProperty":"noOfRows"},{"formElementId":"sapOvpSettingsKPIAnnotation","updateProperty":"kpiAnnotationPath"},{"formElementId":"sapOvpSettingsNewKPICard","updateProperty":""}],aListType:[{"key":"condensed","name":"Condensed"},{"key":"extended","name":"Extended"}],aListFlavour:[{"key":"standard","name":"Standard"},{"key":"bar","name":"Bar"}],aLinkListFlavour:[{"key":"carousel","name":"Carousel"},{"key":"standard","name":"Standard"}],aDataPointSelectionMode:[{"key":"dataPointNav","name":"Data Point Navigation"},{"key":"chartNav","name":"Chart Navigation"}],_updateManifestProperties:[{"formElementId":"sapOVPDataSource","formElement":"datasSource"},{"formElementId":"sapOVPCardType","formElement":"template"},{"formElementId":"sapOVPEntitySetList","formElement":"entitySet"},{"formElementId":"sapOvpCardTitle","formElement":"title"},{"formElementId":"sapOvpCardSubTitle","formElement":"subTitle"},{"formElementId":"sapOVPIdentification","formElement":"identificationAnnotationPath"},{"formElementId":"sapOVPSelectionPresentationVariant","formElement":"selectionPresentationAnnotationPath"},{"formElementId":"sapOVPSelectionVariant","formElement":"selectionAnnotationPath"},{"formElementId":"sapOVPPresentationVariant","formElement":"presentationAnnotationPath"},{"formElementId":"sapOVPAnnotationPath","formElement":"annotationPath"},{"formElementId":"sapOVPListType","formElement":"listType"},{"formElementId":"sapOVPListFlavor","formElement":"listFlavor"},{"formElementId":"sapOVPAddKpiCheckBoxID","formElement":"KPICheckBox"},{"formElementId":"sapOvpDataPoint","formElement":"dataPointAnnotationPath"},{"formElementId":"sapOVPAddODataSelect","formElement":"addODataSelectCheckBox"},{"formElementId":"sapOvpCardProperiesAuthorization","formElement":"requireAppAuthorization"},{"formElementId":"sapOvpKpiAnnotationPath","formElement":"kpiAnnotationPath"},{"formElementId":"sapOVPDataPointSelectionMode","formElement":"navigationPath"},{"formElementId":"sapOVPLinkListFlavor","formElement":"listFlavor"}],aCardType:[{"template":"sap.ovp.cards.list","text":"List"},{"template":"sap.ovp.cards.linklist","text":"Link List"},{"template":"sap.ovp.cards.table","text":"Table"},{"template":"sap.ovp.cards.stack","text":"Stack"},{"template":"sap.ovp.cards.charts.analytical","text":"Analytical"}],NewCardSettings:[{"template":"sap.ovp.cards.linklist","cardSettings":['title','subTitle','listFlavor','entitySet','requireAppAuthorization','annotationPath','identificationAnnotationPath','selectionAnnotationPath','presentationAnnotationPath','selectionPresentationAnnotationPath'],"text":['title','subTitle','listFlavor','requireAppAuthorization']},{"template":"sap.ovp.cards.list","cardSettings":['title','subTitle','listType','listFlavor','entitySet','requireAppAuthorization','annotationPath','identificationAnnotationPath','selectionAnnotationPath','presentationAnnotationPath','selectionPresentationAnnotationPath','addODataSelect','dataPointAnnotationPath','valueSelectionInfo'],"text":['title','subTitle','listType','listFlavor','requireAppAuthorization','addODataSelect','valueSelectionInfo']},{"template":"sap.ovp.cards.table","cardSettings":['title','subTitle','entitySet','requireAppAuthorization','annotationPath','identificationAnnotationPath','selectionAnnotationPath','presentationAnnotationPath','selectionPresentationAnnotationPath','addODataSelect','dataPointAnnotationPath','valueSelectionInfo'],"text":['title','subTitle','requireAppAuthorization','addODataSelect','valueSelectionInfo']},{"template":"sap.ovp.cards.stack","cardSettings":['title','subTitle','entitySet','requireAppAuthorization','annotationPath','addODataSelect'],"text":['title','subTitle','requireAppAuthorization','addODataSelect']},{"template":"sap.ovp.cards.charts.analytical","cardSettings":['title','subTitle','entitySet','requireAppAuthorization','kpiAnnotationPath','identificationAnnotationPath','navigationPath','dataPointAnnotationPath','valueSelectionInfo'],"text":['title','subTitle','requireAppAuthorization','valueSelectionInfo']}],_oMandatoryInputFields:['/title','/subTitle','/valueSelectionInfo']};},true);