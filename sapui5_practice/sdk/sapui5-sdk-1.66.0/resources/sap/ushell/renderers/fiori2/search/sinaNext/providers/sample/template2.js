// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sinaDefine([],function(){"use strict";return function(c){var g={};g.metadata=[];g.metadata2=[];g.getMetadataById=function(l,a){var r=null;for(var i=0;i<l.length;i++){if(l[i].id===a){r=l[i];break;}}return r;};g.searchResultSetItemArray=[];g.searchResultSetItemArray2=[];g.chartResultSetArray=[];var t,d;g._init=function(m){var a=m.metadata;var b=m.metadata2;c.sina._createDataSource({id:"Scientists",label:"Scientist",labelPlural:"Scientists",type:c.sina.DataSourceType.BusinessObject,attributesMetadata:a});c.sina._createDataSource({id:"Mysterious_Sightings",label:"Mysterious Sighting",labelPlural:"Mysterious Sightings",type:c.sina.DataSourceType.BusinessObject,attributesMetadata:b});};if(c.sina){g.metadata=[c.sina._createAttributeMetadata({id:'SCIENTIST',label:'Scientist',dataType:c.sina.AttributeType.String,type:c.sina.AttributeType.String,usage:{Title:'Title',AdvancedSearch:{displayOrder:0},Facet:{}},isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'LOCATION',label:'Location',dataType:c.sina.AttributeType.String,type:c.sina.AttributeType.String,usage:{Detail:'Detail',AdvancedSearch:{displayOrder:0},Facet:{}},isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'LOC_4326',label:'LOC_4326',type:c.sina.AttributeType.GeoJson,usage:{type:'Detail',displayOrder:1},isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'SEX',label:'Sex',type:c.sina.AttributeType.String,usage:{Detail:'Detail',AdvancedSearch:{displayOrder:0},Facet:{}},isSortable:true,isKey:false,hasDescription:true,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'SEX_DESC',label:'Description for Gender',type:c.sina.AttributeType.String,usage:'detail',isSortable:false,isKey:false,isDescription:true,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'DISCIPLINE',label:'Discipline',type:c.sina.AttributeType.String,usage:'detail',isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'DESC',label:'Descritption',type:c.sina.AttributeType.String,usage:'detail',isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'PIC',label:'picture',type:c.sina.AttributeType.ImageUrl,usage:'title',presentationUsage:'Thumbnail',format:'round',isSortable:false,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'SALARY',label:'Salary',type:c.sina.AttributeType.Integer,usage:'detail',isSortable:true,isQuantity:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'CURRENCY',label:'Currency',type:c.sina.AttributeType.String,usage:'detail',isSortable:true,isCurrency:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'HEIGHT',label:'Height',type:c.sina.AttributeType.Integer,usage:'detail',isSortable:true,isQuantity:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'UOM_HEIGHT',label:'Unit of Measure for Height Attribute',type:c.sina.AttributeType.String,usage:'detail',isSortable:true,isUnitOfMeasure:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'PHONE',label:'Phone',type:c.sina.AttributeType.String,usage:'detail',isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'EMAIL',label:'Email',type:c.sina.AttributeType.String,usage:'detail',isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact})];g.metadata2=[c.sina._createAttributeMetadata({id:'CAPTION',label:'Caption',dataType:c.sina.AttributeType.String,type:c.sina.AttributeType.String,usage:'title',isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'LOCATION',label:'Location',dataType:c.sina.AttributeType.String,type:c.sina.AttributeType.String,usage:{Detail:'Detail',AdvancedSearch:{displayOrder:0},Facet:{}},isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'LOC_4326',label:'LOC_4326',type:c.sina.AttributeType.GeoJson,usage:{type:'Detail',displayOrder:1},isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'SCIENTIST',label:'Scientist',dataType:c.sina.AttributeType.String,type:c.sina.AttributeType.String,usage:{Title:'Title',AdvancedSearch:{displayOrder:0},Facet:{}},isSortable:false,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'DESC',label:'Descritption',dataType:c.sina.AttributeType.String,type:c.sina.AttributeType.String,format:c.sina.AttributeFormatType.LongText,usage:'detail',isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'PIC',label:'picture',type:c.sina.AttributeType.ImageUrl,usage:'title',presentationUsage:'Thumbnail',isSortable:false,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact}),c.sina._createAttributeMetadata({id:'URL',label:'URL',dataType:c.sina.AttributeType.String,type:c.sina.AttributeType.String,usage:'detail',isSortable:true,isKey:false,matchingStrategy:c.sina.MatchingStrategy.Exact})];}if(c.searchQuery&&c.searchQuery.filter&&c.searchQuery.filter.dataSource&&c.sina&&c.NavigationTarget&&c.sina.getDataSource("Scientists")){t=[c.sina._createSearchResultSetItemAttribute({id:'SCIENTIST',valueHighlighted:'',isHighlighted:false,label:'Scientist',value:'Hannah White',valueFormatted:'Hannah White',metadata:g.getMetadataById(g.metadata,"SCIENTIST")})];d=[c.sina._createSearchResultSetItemAttribute({id:'SALARY',valueHighlighted:'',isHighlighted:false,label:'Salary',value:'2800',valueFormatted:'1000.00',metadata:g.getMetadataById(g.metadata,"SALARY"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'CURRENCY',valueHighlighted:'',isHighlighted:false,label:'Currency',value:'Euro',valueFormatted:'€',metadata:g.getMetadataById(g.metadata,"CURRENCY")})}),c.sina._createSearchResultSetItemAttribute({id:'HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Height',value:'175',valueFormatted:'175',metadata:g.getMetadataById(g.metadata,"HEIGHT"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'UOM_HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Unit of Measure for Height',value:'cm',valueFormatted:'cm',metadata:g.getMetadataById(g.metadata,"UOM_HEIGHT")})}),c.sina._createSearchResultSetItemAttribute({id:'LOCATION',valueHighlighted:'',isHighlighted:false,label:'Site Location',value:'Galapagos',valueFormatted:'Galapagos',metadata:g.getMetadataById(g.metadata,"LOCATION")}),c.sina._createSearchResultSetItemAttribute({id:'PHONE',valueHighlighted:'',isHighlighted:false,label:'Phone',value:'+1 212 6539539',valueFormatted:'+1 212 6539539',metadata:g.getMetadataById(g.metadata,"PHONE")}),c.sina._createSearchResultSetItemAttribute({id:'EMAIL',valueHighlighted:'',isHighlighted:false,label:'Contact',value:'hannah.white@acme.com',valueFormatted:'hannah.white@acme.com',metadata:g.getMetadataById(g.metadata,"EMAIL")}),c.sina._createSearchResultSetItemAttribute({id:'fieldoffice',valueHighlighted:'',isHighlighted:false,label:'Hannah White (Field Office, Allagash, Maine)',value:'{ "type": "Point", "coordinates": [-69.040601, 47.082589] }',valueFormatted:'{ "type": "Point", "coordinates": [-69.040601, 47.082589] }',defaultNavigationTarget:c.sina._createNavigationTarget({label:'Send Mail',targetUrl:'mailto:hanna.white@acme.com'}),metadata:g.getMetadataById(g.metadata,"LOC_4326")}),c.sina._createSearchResultSetItemAttribute({id:'DISCIPLINE',valueHighlighted:'',isHighlighted:false,label:'Discipline',value:'Multidisciplinary',valueFormatted:'Multidisciplinary',metadata:g.getMetadataById(g.metadata,"DISCIPLINE")}),c.sina._createSearchResultSetItemAttribute({id:'SEX',valueHighlighted:'',isHighlighted:false,label:'Sex',value:'♀',valueFormatted:'♀',metadata:g.getMetadataById(g.metadata,"SEX"),description:c.sina._createSearchResultSetItemAttribute({id:'SEX_DESC',valueHighlighted:'',isHighlighted:false,label:'Description for Gender',value:'Female',valueFormatted:'Female',metadata:g.getMetadataById(g.metadata,"SEX_DESC")})}),c.sina._createSearchResultSetItemAttribute({id:'PIC',valueHighlighted:'',isHighlighted:false,label:'Picture',value:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/scientist_hannah.jpg',valueFormatted:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/scientist_hannah.jpg',metadata:g.getMetadataById(g.metadata,"PIC")})];g.searchResultSetItemArray.push(c.sina._createSearchResultSetItem({dataSource:c.sina.getDataSource("Scientists"),titleAttributes:t,titleDescriptionAttributes:[],detailAttributes:d}));t=[c.sina._createSearchResultSetItemAttribute({id:'SCIENTIST',valueHighlighted:'',isHighlighted:false,label:'Scientist',value:'Robert Sarmast',valueFormatted:'Robert Sarmast',metadata:g.getMetadataById(g.metadata,"SCIENTIST")})];d=[c.sina._createSearchResultSetItemAttribute({id:'SALARY',valueHighlighted:'',isHighlighted:false,label:'Salary',value:'3000',valueFormatted:'3000.00',metadata:g.getMetadataById(g.metadata,"SALARY"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'CURRENCY',valueHighlighted:'',isHighlighted:false,label:'Currency',value:'Euro',valueFormatted:'€',metadata:g.getMetadataById(g.metadata,"CURRENCY")})}),c.sina._createSearchResultSetItemAttribute({id:'HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Height',value:'188',valueFormatted:'188',metadata:g.getMetadataById(g.metadata,"HEIGHT"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'UOM_HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Unit of Measure for Height',value:'cm',valueFormatted:'cm',metadata:g.getMetadataById(g.metadata,"UOM_HEIGHT")})}),c.sina._createSearchResultSetItemAttribute({id:'LOCATION',valueHighlighted:'',isHighlighted:false,label:'Site Location',value:'Cyprus',valueFormatted:'Off East Cyprus',metadata:g.getMetadataById(g.metadata,"LOCATION")}),c.sina._createSearchResultSetItemAttribute({id:'fieldoffice',valueHighlighted:'',isHighlighted:false,label:'Robert Sarmast (Offices)',value:'{ "type": "Point", "coordinates": [-118.236036, 34.050492] }',valueFormatted:'{ "type": "Point", "coordinates": [-118.236036, 34.050492] }',metadata:g.getMetadataById(g.metadata,"LOC_4326")}),c.sina._createSearchResultSetItemAttribute({id:'DISCIPLINE',valueHighlighted:'',isHighlighted:false,label:'Discipline',value:'Ancient History',valueFormatted:'Ancient History',metadata:g.getMetadataById(g.metadata,"DISCIPLINE")}),c.sina._createSearchResultSetItemAttribute({id:'SEX',valueHighlighted:'',isHighlighted:false,label:'Sex',value:'♂',valueFormatted:'♂',metadata:g.getMetadataById(g.metadata,"SEX"),description:c.sina._createSearchResultSetItemAttribute({id:'SEX_DESC',valueHighlighted:'',isHighlighted:false,label:'Description for Gender',value:'Male',valueFormatted:'Male',metadata:g.getMetadataById(g.metadata,"SEX_DESC")})}),c.sina._createSearchResultSetItemAttribute({id:'PIC',valueHighlighted:'',isHighlighted:false,label:'Picture',value:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/scientist_RobertSarmast.jpg',valueFormatted:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/scientist_RobertSarmast.jpg',metadata:g.getMetadataById(g.metadata,"PIC")})];g.searchResultSetItemArray.push(c.sina._createSearchResultSetItem({dataSource:c.sina.getDataSource("Scientists"),titleAttributes:t,titleDescriptionAttributes:[],detailAttributes:d}));t=[c.sina._createSearchResultSetItemAttribute({id:'SCIENTIST',valueHighlighted:'',isHighlighted:false,label:'Scientist',value:'Zecharia Sitchin',valueFormatted:'Zecharia Sitchin',metadata:g.getMetadataById(g.metadata,"SCIENTIST")})];d=[c.sina._createSearchResultSetItemAttribute({id:'SALARY',valueHighlighted:'',isHighlighted:false,label:'Salary',value:'3200',valueFormatted:'3200.00',metadata:g.getMetadataById(g.metadata,"SALARY"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'CURRENCY',valueHighlighted:'',isHighlighted:false,label:'Currency',value:'Euro',valueFormatted:'€',metadata:g.getMetadataById(g.metadata,"CURRENCY")})}),c.sina._createSearchResultSetItemAttribute({id:'HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Height',value:'165',valueFormatted:'165',metadata:g.getMetadataById(g.metadata,"HEIGHT"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'UOM_HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Unit of Measure for Height',value:'cm',valueFormatted:'cm',metadata:g.getMetadataById(g.metadata,"UOM_HEIGHT")})}),c.sina._createSearchResultSetItemAttribute({id:'LOCATION',valueHighlighted:'',isHighlighted:false,label:'Site Location',value:'Baalbek',valueFormatted:'Baalbek, Lebanon',metadata:g.getMetadataById(g.metadata,"LOCATION")}),c.sina._createSearchResultSetItemAttribute({id:'fieldoffice',valueHighlighted:'',isHighlighted:false,label:'Zecharia Sitchin (NYU)',value:'{ "type": "Point", "coordinates": [-73.995589, 40.730355] }',valueFormatted:'{ "type": "Point", "coordinates": [-73.995589, 40.730355] }',metadata:g.getMetadataById(g.metadata,"LOC_4326")}),c.sina._createSearchResultSetItemAttribute({id:'DISCIPLINE',valueHighlighted:'',isHighlighted:false,label:'Discipline',value:'Archeology',valueFormatted:'Archeology',metadata:g.getMetadataById(g.metadata,"DISCIPLINE")}),c.sina._createSearchResultSetItemAttribute({id:'SEX',valueHighlighted:'',isHighlighted:false,label:'Sex',value:'♂',valueFormatted:'♂',metadata:g.getMetadataById(g.metadata,"SEX"),description:c.sina._createSearchResultSetItemAttribute({id:'SEX_DESC',valueHighlighted:'',isHighlighted:false,label:'Description for Gender',value:'Male',valueFormatted:'Male',metadata:g.getMetadataById(g.metadata,"SEX_DESC")})}),c.sina._createSearchResultSetItemAttribute({id:'PIC',valueHighlighted:'',isHighlighted:false,label:'Picture',value:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/sitchin.jpg',valueFormatted:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/sitchin.jpg',metadata:g.getMetadataById(g.metadata,"PIC")})];g.searchResultSetItemArray.push(c.sina._createSearchResultSetItem({dataSource:c.sina.getDataSource("Scientists"),titleAttributes:t,titleDescriptionAttributes:[],detailAttributes:d}));t=[c.sina._createSearchResultSetItemAttribute({id:'SCIENTIST',valueHighlighted:'',isHighlighted:false,label:'Scientist',value:'Alan F. Alford',valueFormatted:'Alan F. Alford',metadata:g.getMetadataById(g.metadata,"SCIENTIST")})];d=[c.sina._createSearchResultSetItemAttribute({id:'SALARY',valueHighlighted:'',isHighlighted:false,label:'Salary',value:'2100',valueFormatted:'2100.00',metadata:g.getMetadataById(g.metadata,"SALARY"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'CURRENCY',valueHighlighted:'',isHighlighted:false,label:'Currency',value:'Euro',valueFormatted:'€',metadata:g.getMetadataById(g.metadata,"CURRENCY")})}),c.sina._createSearchResultSetItemAttribute({id:'HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Height',value:'182',valueFormatted:'182',metadata:g.getMetadataById(g.metadata,"HEIGHT"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'UOM_HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Unit of Measure for Height',value:'cm',valueFormatted:'cm',metadata:g.getMetadataById(g.metadata,"UOM_HEIGHT")})}),c.sina._createSearchResultSetItemAttribute({id:'LOCATION',valueHighlighted:'',isHighlighted:false,label:'Site Location',value:'Baalbek',valueFormatted:'Baalbek, Lebanon',metadata:g.getMetadataById(g.metadata,"LOCATION")}),c.sina._createSearchResultSetItemAttribute({id:'fieldoffice',valueHighlighted:'',isHighlighted:false,label:'Alan F. Alford (Eridu Books)',value:'{ "type": "Point", "coordinates": [-1.387958, 50.933494] }',valueFormatted:'{ "type": "Point", "coordinates": [-1.387958, 50.933494] }',metadata:g.getMetadataById(g.metadata,"LOC_4326")}),c.sina._createSearchResultSetItemAttribute({id:'DISCIPLINE',valueHighlighted:'',isHighlighted:false,label:'Discipline',value:'Egyptology',valueFormatted:'Egyptology',metadata:g.getMetadataById(g.metadata,"DISCIPLINE")}),c.sina._createSearchResultSetItemAttribute({id:'SEX',valueHighlighted:'',isHighlighted:false,label:'Sex',value:'♂',valueFormatted:'♂',metadata:g.getMetadataById(g.metadata,"SEX"),description:c.sina._createSearchResultSetItemAttribute({id:'SEX_DESC',valueHighlighted:'',isHighlighted:false,label:'Description for Gender',value:'Male',valueFormatted:'Male',metadata:g.getMetadataById(g.metadata,"SEX_DESC")})}),c.sina._createSearchResultSetItemAttribute({id:'PIC',valueHighlighted:'',isHighlighted:false,label:'Picture',value:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/alford.jpg',valueFormatted:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/alford.jpg',metadata:g.getMetadataById(g.metadata,"PIC")})];g.searchResultSetItemArray.push(c.sina._createSearchResultSetItem({dataSource:c.sina.getDataSource("Scientists"),titleAttributes:t,titleDescriptionAttributes:[],detailAttributes:d}));t=[c.sina._createSearchResultSetItemAttribute({id:'SCIENTIST',valueHighlighted:'',isHighlighted:false,label:'Scientist',value:'Klaus Schmidt',valueFormatted:'Klaus Schmidt',metadata:g.getMetadataById(g.metadata,"SCIENTIST")})];d=[c.sina._createSearchResultSetItemAttribute({id:'SALARY',valueHighlighted:'',isHighlighted:false,label:'Salary',value:'1500',valueFormatted:'1500.00',metadata:g.getMetadataById(g.metadata,"SALARY"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'CURRENCY',valueHighlighted:'',isHighlighted:false,label:'Currency',value:'Euro',valueFormatted:'€',metadata:g.getMetadataById(g.metadata,"CURRENCY")})}),c.sina._createSearchResultSetItemAttribute({id:'HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Height',value:'195',valueFormatted:'195',metadata:g.getMetadataById(g.metadata,"HEIGHT"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'UOM_HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Unit of Measure for Height',value:'cm',valueFormatted:'cm',metadata:g.getMetadataById(g.metadata,"UOM_HEIGHT")})}),c.sina._createSearchResultSetItemAttribute({id:'LOCATION',valueHighlighted:'',isHighlighted:false,label:'Site Location',value:'Göbekli Tepe',valueFormatted:'Göbekli Tepe, Turkey',metadata:g.getMetadataById(g.metadata,"LOCATION")}),c.sina._createSearchResultSetItemAttribute({id:'fieldoffice',valueHighlighted:'',isHighlighted:false,label:'Klaus Schmidt (Institut für Ur- und Frühgeschichte, Erlangen)',value:'{ "type": "Point", "coordinates": [11.016959, 49.600319] }',valueFormatted:'{ "type": "Point", "coordinates": [11.016959, 49.600319] }',metadata:g.getMetadataById(g.metadata,"LOC_4326")}),c.sina._createSearchResultSetItemAttribute({id:'DISCIPLINE',valueHighlighted:'',isHighlighted:false,label:'Discipline',value:'Prehistory',valueFormatted:'Prehistory',metadata:g.getMetadataById(g.metadata,"DISCIPLINE")}),c.sina._createSearchResultSetItemAttribute({id:'SEX',valueHighlighted:'',isHighlighted:false,label:'Sex',value:'♂',valueFormatted:'♂',metadata:g.getMetadataById(g.metadata,"SEX"),description:c.sina._createSearchResultSetItemAttribute({id:'SEX_DESC',valueHighlighted:'',isHighlighted:false,label:'Description for Gender',value:'Male',valueFormatted:'Male',metadata:g.getMetadataById(g.metadata,"SEX_DESC")})}),c.sina._createSearchResultSetItemAttribute({id:'PIC',valueHighlighted:'',isHighlighted:false,label:'Picture',value:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/kschmidt.jpg',valueFormatted:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/kschmidt.jpg',metadata:g.getMetadataById(g.metadata,"PIC")})];g.searchResultSetItemArray.push(c.sina._createSearchResultSetItem({dataSource:c.sina.getDataSource("Scientists"),titleAttributes:t,titleDescriptionAttributes:[],detailAttributes:d}));t=[c.sina._createSearchResultSetItemAttribute({id:'CAPTION',valueHighlighted:'',isHighlighted:false,label:'Caption',value:'',valueFormatted:'',metadata:g.getMetadataById(g.metadata2,"CAPTION")})];d=[c.sina._createSearchResultSetItemAttribute({id:'SALARY',valueHighlighted:'',isHighlighted:false,label:'Salary',value:'5123',valueFormatted:'5123.00',metadata:g.getMetadataById(g.metadata,"SALARY"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'CURRENCY',valueHighlighted:'',isHighlighted:false,label:'Currency',value:'Euro',valueFormatted:'€',metadata:g.getMetadataById(g.metadata,"CURRENCY")})}),c.sina._createSearchResultSetItemAttribute({id:'HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Height',value:'169',valueFormatted:'169',metadata:g.getMetadataById(g.metadata,"HEIGHT"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'UOM_HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Unit of Measure for Height',value:'cm',valueFormatted:'cm',metadata:g.getMetadataById(g.metadata,"UOM_HEIGHT")})}),c.sina._createSearchResultSetItemAttribute({id:'DESC',valueHighlighted:'',isHighlighted:false,label:'Quote',value:'I heard the sound of a baby crying... I heard the sound of a baby crying... I heard the sound of a baby crying... I heard the sound of a baby crying... ',valueFormatted:'"I heard the sound of a baby crying... I heard the sound of a baby crying... I heard the sound of a baby crying... I heard the sound of a baby crying... "',metadata:g.getMetadataById(g.metadata2,"DESC")}),c.sina._createSearchResultSetItemAttribute({id:'LOCATION',valueHighlighted:'',isHighlighted:false,label:'Location',value:'Galapagos',valueFormatted:'Galapagos',metadata:g.getMetadataById(g.metadata2,"LOCATION")}),c.sina._createSearchResultSetItemAttribute({id:'sightinglocation',valueHighlighted:'',isHighlighted:false,label:'Isabela Island, Ecuador',value:'{ "type": "Point", "coordinates": [-91.132139, -0.828628] }',valueFormatted:'{ "type": "Point", "coordinates": [-91.132139, -0.828628] }',metadata:g.getMetadataById(g.metadata2,"LOC_4326")}),c.sina._createSearchResultSetItemAttribute({id:'SCIENTIST',valueHighlighted:'',isHighlighted:false,label:'Scientist',value:'Hannah White',valueFormatted:'Hannah White',metadata:g.getMetadataById(g.metadata2,"SCIENTIST")}),c.sina._createSearchResultSetItemAttribute({id:'PIC',valueHighlighted:'',isHighlighted:false,label:'Picture',value:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/galapagos.jpg',valueFormatted:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/galapagos.jpg',metadata:g.getMetadataById(g.metadata2,"PIC")})];g.searchResultSetItemArray2.push(c.sina._createSearchResultSetItem({dataSource:c.sina.getDataSource("Mysterious_Sightings"),titleAttributes:t,detailAttributes:d,titleDescriptionAttributes:[],defaultNavigationTarget:new c.NavigationTarget({label:'Alien species pathways to the Galapagos Islands, Ecuador',targetUrl:'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5597199/',target:'_blank'})}));t=[c.sina._createSearchResultSetItemAttribute({id:'CAPTION',valueHighlighted:'',isHighlighted:false,label:'Caption',value:'',valueFormatted:'',metadata:g.getMetadataById(g.metadata2,"CAPTION")})];d=[c.sina._createSearchResultSetItemAttribute({id:'SALARY',valueHighlighted:'',isHighlighted:false,label:'Salary',value:'4300',valueFormatted:'4300.00',metadata:g.getMetadataById(g.metadata,"SALARY"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'CURRENCY',valueHighlighted:'',isHighlighted:false,label:'Currency',value:'Euro',valueFormatted:'€',metadata:g.getMetadataById(g.metadata,"CURRENCY")})}),c.sina._createSearchResultSetItemAttribute({id:'HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Height',value:'171',valueFormatted:'171',metadata:g.getMetadataById(g.metadata,"HEIGHT"),unitOfMeasure:c.sina._createSearchResultSetItemAttribute({id:'UOM_HEIGHT',valueHighlighted:'',isHighlighted:false,label:'Unit of Measure for Height',value:'cm',valueFormatted:'cm',metadata:g.getMetadataById(g.metadata,"UOM_HEIGHT")})}),c.sina._createSearchResultSetItemAttribute({id:'LOCATION',valueHighlighted:'',isHighlighted:false,label:'Location',value:'Cyprus',valueFormatted:'Off East Cyprus',metadata:g.getMetadataById(g.metadata2,"LOCATION")}),c.sina._createSearchResultSetItemAttribute({id:'SCIENTIST',valueHighlighted:'',isHighlighted:false,label:'Scientist',value:'Robert Sarmast',valueFormatted:'Robert Sarmast',metadata:g.getMetadataById(g.metadata2,"SCIENTIST")}),c.sina._createSearchResultSetItemAttribute({id:'sightinglocation',valueHighlighted:'',isHighlighted:false,label:'Atlantis, Off East Cyprus',value:'{ "type": "Point", "coordinates": [35.102514, 34.824097] }',valueFormatted:'{ "type": "Point", "coordinates": [35.102514, 34.824097] }',metadata:g.getMetadataById(g.metadata2,"LOC_4326")}),c.sina._createSearchResultSetItemAttribute({id:'DESC',valueHighlighted:'',isHighlighted:false,label:'Quote',value:'The discovery could mean a tourism bonanza for Cyprus once the word gets out',valueFormatted:'"The discovery could mean a tourism bonanza for Cyprus once the word gets out"',metadata:g.getMetadataById(g.metadata2,"DESC")}),c.sina._createSearchResultSetItemAttribute({id:'PIC',valueHighlighted:'',isHighlighted:false,label:'Picture',value:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/atlantis.jpg',valueFormatted:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/atlantis.jpg',metadata:g.getMetadataById(g.metadata2,"PIC")})];g.searchResultSetItemArray2.push(c.sina._createSearchResultSetItem({dataSource:c.sina.getDataSource("Mysterious_Sightings"),titleAttributes:t,detailAttributes:d,titleDescriptionAttributes:[],defaultNavigationTarget:new c.NavigationTarget({label:'Robert Sarmast on the Hunt for Atlantis',targetUrl:'https://www.youtube.com/watch?v=6f8jzITECRM',target:'_blank'})}));t=[c.sina._createSearchResultSetItemAttribute({id:'CAPTION',valueHighlighted:'',isHighlighted:false,label:'Caption',value:'',valueFormatted:'',metadata:g.getMetadataById(g.metadata2,"CAPTION")})];d=[c.sina._createSearchResultSetItemAttribute({id:'LOCATION',valueHighlighted:'',isHighlighted:false,label:'Location',value:'Baalbek',valueFormatted:'Baalbek, Lebanon',metadata:g.getMetadataById(g.metadata2,"LOCATION")}),c.sina._createSearchResultSetItemAttribute({id:'SCIENTIST',valueHighlighted:'',isHighlighted:false,label:'Scientist',value:'Zecharia Sitchin',valueFormatted:'Zecharia Sitchin',metadata:g.getMetadataById(g.metadata2,"SCIENTIST")}),c.sina._createSearchResultSetItemAttribute({id:'sightinglocation',valueHighlighted:'',isHighlighted:false,label:'Stone of the Pregnant Woman (Hajar al-Hibla), Baalbek, Lebanon',value:'{ "type": "Point", "coordinates": [36.199993, 33.999453] }',valueFormatted:'{ "type": "Point", "coordinates": [36.199993, 33.999453] }',metadata:g.getMetadataById(g.metadata2,"LOC_4326")}),c.sina._createSearchResultSetItemAttribute({id:'DESC',valueHighlighted:'',isHighlighted:false,label:'Summary',value:'it would be impossible for ancient humans with their limited technology to accomplish such a thing',valueFormatted:'it would be impossible for ancient humans with their limited technology to accomplish such a thing',metadata:g.getMetadataById(g.metadata2,"DESC")}),c.sina._createSearchResultSetItemAttribute({id:'PIC',valueHighlighted:'',isHighlighted:false,label:'Picture',value:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/megalith.jpg',valueFormatted:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/megalith.jpg',metadata:g.getMetadataById(g.metadata2,"PIC")})];g.searchResultSetItemArray2.push(c.sina._createSearchResultSetItem({dataSource:c.sina.getDataSource("Mysterious_Sightings"),titleAttributes:t,detailAttributes:d,titleDescriptionAttributes:[],defaultNavigationTarget:new c.NavigationTarget({label:'In The News: Baalbek',targetUrl:'http://www.sitchin.com/landplace.htm',target:'_blank'})}));t=[c.sina._createSearchResultSetItemAttribute({id:'CAPTION',valueHighlighted:'',isHighlighted:false,label:'Caption',value:'',valueFormatted:'',metadata:g.getMetadataById(g.metadata2,"CAPTION")})];d=[c.sina._createSearchResultSetItemAttribute({id:'LOCATION',valueHighlighted:'',isHighlighted:false,label:'Location',value:'Baalbek',valueFormatted:'Baalbek, Lebanon',metadata:g.getMetadataById(g.metadata2,"LOCATION")}),c.sina._createSearchResultSetItemAttribute({id:'SCIENTIST',valueHighlighted:'',isHighlighted:false,label:'Scientist',value:'Alan F. Alford',valueFormatted:'Alan F. Alford',metadata:g.getMetadataById(g.metadata2,"SCIENTIST")}),c.sina._createSearchResultSetItemAttribute({id:'sightinglocation',valueHighlighted:'',isHighlighted:false,label:'Temple Compex, Baalbek, Lebanon',value:'{ "type": "Point", "coordinates": [36.204944, 34.006899] }',valueFormatted:'{ "type": "Point", "coordinates": [36.204944, 34.006899] }',metadata:g.getMetadataById(g.metadata2,"LOC_4326")}),c.sina._createSearchResultSetItemAttribute({id:'DESC',valueHighlighted:'',isHighlighted:false,label:'Summary',value:'Was the temple platorm a huge landing site for the aliens who once visited our planet?',valueFormatted:'Was the temple platorm a huge landing site for the aliens who once visited our planet?',metadata:g.getMetadataById(g.metadata2,"DESC")}),c.sina._createSearchResultSetItemAttribute({id:'PIC',valueHighlighted:'',isHighlighted:false,label:'Picture',value:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/heliopolis.jpg',valueFormatted:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/heliopolis.jpg',metadata:g.getMetadataById(g.metadata2,"PIC")})];g.searchResultSetItemArray2.push(c.sina._createSearchResultSetItem({dataSource:c.sina.getDataSource("Mysterious_Sightings"),titleAttributes:t,detailAttributes:d,titleDescriptionAttributes:[],defaultNavigationTarget:new c.NavigationTarget({label:'The Mystery of the Stones at Baalbek',targetUrl:'http://www.eridu.co.uk/Author/Mysteries_of_the_World/Baalbek/baalbek2.html',target:'_blank'})}));t=[c.sina._createSearchResultSetItemAttribute({id:'CAPTION',valueHighlighted:'',isHighlighted:false,label:'Caption',value:'',valueFormatted:'',metadata:g.getMetadataById(g.metadata2,"CAPTION")})];d=[c.sina._createSearchResultSetItemAttribute({id:'LOCATION',valueHighlighted:'',isHighlighted:false,label:'Location',value:'Wycliffe Well',valueFormatted:'Wycliffe Well',metadata:g.getMetadataById(g.metadata2,"LOCATION")}),c.sina._createSearchResultSetItemAttribute({id:'SCIENTIST',valueHighlighted:'',isHighlighted:false,label:'Scientist',value:'Hannah White',valueFormatted:'Hannah White',metadata:g.getMetadataById(g.metadata2,"SCIENTIST")}),c.sina._createSearchResultSetItemAttribute({id:'sightinglocation',valueHighlighted:'',isHighlighted:false,label:'Wycliffe Well, NT, Australia',value:'{ "type": "Point", "coordinates": [134.236761, -20.795279] }',valueFormatted:'{ "type": "Point", "coordinates": [134.236761, -20.795279] }',metadata:g.getMetadataById(g.metadata2,"LOC_4326")}),c.sina._createSearchResultSetItemAttribute({id:'DESC',valueHighlighted:'',isHighlighted:false,label:'Summary',value:'Numerous people have reported seeing strange lights in the sky while staying a Wycliffe.',valueFormatted:'Numerous people have reported seeing strange lights in the sky while staying a Wycliffe.',metadata:g.getMetadataById(g.metadata2,"DESC")}),c.sina._createSearchResultSetItemAttribute({id:'PIC',valueHighlighted:'',isHighlighted:false,label:'Picture',value:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/Wycliffe_Well.jpg',valueFormatted:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/Wycliffe_Well.jpg',metadata:g.getMetadataById(g.metadata2,"PIC")})];g.searchResultSetItemArray2.push(c.sina._createSearchResultSetItem({dataSource:c.sina.getDataSource("Mysterious_Sightings"),titleAttributes:t,detailAttributes:d,titleDescriptionAttributes:[],defaultNavigationTarget:new c.NavigationTarget({label:'Wycliffe Well Australia\'s premier UFO hotspot',targetUrl:'https://www.youtube.com/watch?v=hMDRHqcatyg',target:'_blank'})}));t=[c.sina._createSearchResultSetItemAttribute({id:'CAPTION',valueHighlighted:'',isHighlighted:false,label:'Caption',value:'',valueFormatted:'',metadata:g.getMetadataById(g.metadata2,"CAPTION")})];d=[c.sina._createSearchResultSetItemAttribute({id:'LOCATION',valueHighlighted:'',isHighlighted:false,label:'Location',value:'Göbekli Tepe',valueFormatted:'Göbekli Tepe',metadata:g.getMetadataById(g.metadata2,"LOCATION")}),c.sina._createSearchResultSetItemAttribute({id:'SCIENTIST',valueHighlighted:'',isHighlighted:false,label:'Scientist',value:'Klaus Schmidt',valueFormatted:'Klaus Schmidt',metadata:g.getMetadataById(g.metadata2,"SCIENTIST")}),c.sina._createSearchResultSetItemAttribute({id:'sightinglocation',valueHighlighted:'',isHighlighted:false,label:'Göbekli Tepe, Şanlıurfa',value:'{ "type": "Point", "coordinates": [38.855842, 37.217718] }',valueFormatted:'{ "type": "Point", "coordinates": [38.855842, 37.217718] }',metadata:g.getMetadataById(g.metadata2,"LOC_4326")}),c.sina._createSearchResultSetItemAttribute({id:'DESC',valueHighlighted:'',isHighlighted:false,label:'Summary',value:'11,000 year old stone structures that predate stonehenge by 6,000 years - crafted and arranged by prehistoric people who had not yet developed metal tools or even pottery; but no evidence that people resided there.',valueFormatted:'11,000 year old stone structures that predate stonehenge by 6,000 years - crafted and arranged by prehistoric people who had not yet developed metal tools or even pottery; but no evidence that people resided there.',metadata:g.getMetadataById(g.metadata2,"SCIENTIST")}),c.sina._createSearchResultSetItemAttribute({id:'PIC',valueHighlighted:'',isHighlighted:false,label:'Picture',value:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/Goebekli_Tepe_Urfa.jpg',valueFormatted:'/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/Goebekli_Tepe_Urfa.jpg',metadata:g.getMetadataById(g.metadata2,"PIC")})];g.searchResultSetItemArray2.push(c.sina._createSearchResultSetItem({dataSource:c.sina.getDataSource("Mysterious_Sightings"),titleAttributes:t,detailAttributes:d,titleDescriptionAttributes:[],defaultNavigationTarget:new c.NavigationTarget({label:"Gobekli Tepe: The World's First Temple?",targetUrl:'https://www.smithsonianmag.com/history/gobekli-tepe-the-worlds-first-temple-83613665/',target:'_blank'})}));}return g;};});
