// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sinaDefine(['../../core/core','../../core/util','./template','./template2','../../sina/NavigationTarget'],function(c,u,t,a,N){"use strict";return c.defineClass({id:'sample',instanceCounterStr:"0",_initAsync:function(p){var b=this;b.sina=p.sina;b.NavigationTarget=N;this.sina.util.sampleProviderInstanceCounter++;b.instanceCounterStr=""+this.sina.util.sampleProviderInstanceCounter;var d;var f=0;if(document.location.href.indexOf("use=sample1")>0){f=1;}else if(document.location.href.indexOf("use=sample2")>0){f=2;}if(f===1){b.templateProvider=a;}else if(f===2){b.templateProvider=t;}else if(parseInt(b.instanceCounterStr,10)%2===1){b.templateProvider=t;}else{b.templateProvider=a;}d=b.templateProvider(b);d._init(d);var r=c.Promise.resolve({capabilities:this.sina._createCapabilities({fuzzy:false})});return r;},getSuggestionList:function(b){var l=this._stringify(b);var r=new RegExp("\"valueFormatted\"\:\"([^\"/]+?)\",","g");var m=[];l.replace(r,function(){m.push(arguments[1]);});var s=m.toString().split(' ');s=s.toString().split(',');m=m.concat(s);m=m.filter(function(i,p){if(i!==''){return m.indexOf(i)==p;}});return m;},_stringify:function(o){var b=[];var s=JSON.stringify(o,function(k,v){if(typeof v==='object'&&v!==null){if(b.indexOf(v)!==-1){return undefined;}b.push(v);}return v;});b=null;return s;},adjustImageViewing:function(){var b,d,l;try{$(".sapUshellSearchResultListItem-Image").on('mouseenter',function(){b=$(this).clone();$('body').append(b);d=($(window).height()-$(b).outerHeight())*0.33;l=($(window).width()-$(b).outerWidth())*0.33;b.css({position:"absolute",top:d+"px",left:l+"px"}).show();});$(".sapUshellSearchResultListItem-Image").on('mouseleave',function(){b.remove();});}catch(e){}},applyFilters:function(b,s){var d=[];if(!s.filter.rootCondition.conditions.length>0||!s.filter.rootCondition.conditions[0].conditions.length>0){return b;}var e=[];var f=[];for(var g=0;g<s.filter.rootCondition.conditions.length;g++){var l=s.filter.rootCondition.conditions[g].conditions;for(var h=0;h<l.length;h++){e.push([l[h].attribute,l[h].value]);f.push(l[h].attribute);}}var o=false;for(var i=0;i<b.length;i++){var q=b[i];var r=[];for(var j=0;j<e.length;j++){o=false;for(var k=0;k<q.detailAttributes.length;k++){var v=q.detailAttributes[k];if(v.id===e[j][0]&&v.value===e[j][1]){o=true;}}for(var m=0;m<q.titleAttributes.length;m++){var w=q.titleAttributes[m];if(w.id===e[j][0]&&w.value===e[j][1]){o=true;}}e[j][2]=o;r.push(o);}if(r.toString().match(/false/)===null){d.push(q);}else{var x=[];var y=f.filter(function(q,A){return f.indexOf(q)==A;});for(var n=0;n<y.length;n++){o=false;var z=y[n];for(var p=0;p<e.length;p++){if(e[p][0]===z&&e[p][2]===true){o=true;break;}}x.push(o);}if(x.toString().match(/false/)===null){d.push(q);}}}return d;},adjustHighlights:function(b,s){var n=[];var d="";for(var i=0;i<b.length;i++){var e=b[i];var f=true;d="";e.titleHighlighted=this.addHighlight(e.title,s);if(e.titleHighlighted!==e.title){f=false;}for(var j=0;j<e.detailAttributes.length;j++){var g=e.detailAttributes[j];d=g.metadata.type;if(d==="String"||d==="Integer"){g.valueHighlighted=this.addHighlight(g.valueFormatted,s);if(g.valueHighlighted!==g.valueFormatted){f=false;}}}for(var k=0;k<e.titleAttributes.length;k++){var h=e.titleAttributes[k];d=h.metadata.type;if(d==="String"||d==="Integer"){h.valueHighlighted=this.addHighlight(h.valueFormatted,s);if(h.valueHighlighted!==h.valueFormatted){f=false;}}}if(f===false||s==="*"){n.push(e);}}return n;},addHighlight:function(h,s){if(typeof h!=="string"||typeof s!=="string"){return h;}var p=h.toLowerCase().indexOf(s.toLowerCase());if(p>-1){var b=p+s.length;var n=h.substring(0,p)+'<b>'+h.substring(p,b)+'</b>'+h.substring(b);return n;}return h;},addSuvLinkToSearchResultItem:function(s,b,d){var e=this.sina._createSuvNavTargetResolver();if(!b){b='/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/docs/test.suv';}if(!d){d=['said','aware'];}var f={};f.obj={suvThumbnailAttribute:s,suvTargetMimeTypeAttribute:{value:'application/vnd.sap.universal-viewer+suv'},suvTargetUrlAttribute:{value:b}};e.resolveSuvNavTargets(null,f,d);},augmentDetailAttributes:function(r){for(var i=0;i<r.length;i++){var b=r[i].detailAttributes;for(var j=0;j<b.length;j++){var d=b[j];d=u.addPotentialNavTargetsToAttribute(this.sina,d);}}return r;},executeSearchQuery:function(s){var b=this;b.searchQuery=s;return new c.Promise(function(r,d){var e,f,g;var i=b.templateProvider(b);var h=i.searchResultSetItemArray;h=b.augmentDetailAttributes(h);var j=i.searchResultSetItemArray2;j=b.augmentDetailAttributes(j);var k=h.concat(j);var l=i.searchResultSetItemArray3;b.searchQuery=s;f=s.filter.searchTerm;g=s.filter.dataSource.id;var m=b.generateFacets(s);var n;if(g==="Scientists"||g==="Folklorists"){n=b.adjustHighlights(h,f);n=b.applyFilters(n,s);e=b.sina._createSearchResultSet({items:n,facets:m,type:"",query:s,title:"",totalCount:n.length});}else if(g==="Mysterious_Sightings"||g==="Urban_Legends"){n=b.adjustHighlights(j,f);n=b.applyFilters(n,s);e=b.sina._createSearchResultSet({items:n,facets:m,type:"",query:s,title:"",totalCount:n.length});}else if(g==="Publications"){n=b.adjustHighlights(l,f);n=b.applyFilters(n,s);e=b.sina._createSearchResultSet({items:n,facets:m,type:"",query:s,title:"",totalCount:n.length});}else if(g==="All"){n=b.adjustHighlights(h,f);n=b.applyFilters(n,s);var o=n.length;n=b.adjustHighlights(j,f);n=b.applyFilters(n,s);var p=n.length;m[0].items[0].measureValue=o;m[0].items[0].measureValueFormatted=''+o;m[0].items[1].measureValue=p;m[0].items[1].measureValueFormatted=''+p;n=b.adjustHighlights(k,f);n=b.applyFilters(n,s);e=b.sina._createSearchResultSet({items:n,facets:m,type:"",query:s,title:"",totalCount:n.length});}r(e);});},executeSuggestionQuery:function(q){var b=this;var d=q.filter.searchTerm;var e=this.templateProvider(this);var f=e.searchResultSetItemArray.concat(e.searchResultSetItemArray2).concat(e.searchResultSetItemArray3);var g=this.getSuggestionList(f);var h=g.filter(function(s){var k=new RegExp("^"+d,"gi");return s.match(k);});if(h.length===0){h=g;}var j=[];var S=function(k){var l=b.sina.SuggestionCalculationMode.Data;var m=q.filter.clone();m.setSearchTerm(k);return b.sina._createSearchTermSuggestion({searchTerm:k,calculationMode:l,filter:m,label:k});};for(var i=0;i<h.length;i++){j.push(new S(h[i]));}var r=this.sina._createSuggestionResultSet({title:'Suggestions',query:q,items:j});return new c.Promise(function(k,l){k(r);});},executeChartQuery:function(q){var b=this.generateFacets(q);var w=1;if(q.dimension==="LOCATION"||b.length===1){w=0;}return new c.Promise(function(r,d){r(b[w]);});},getChartResultSetItemsForLocations:function(r){var b=[];var d=this;var l;var e=[];var f,i,j,k,g;for(i=0;i<r.length;i++){g=r[i].detailAttributes;for(j=0;j<g.length;j++){if(g[j].id==="LOCATION"){l=g[j].value;if(e.indexOf(l)===-1){e.push(l);f=d.sina._createChartResultSetItem({filterCondition:d.sina.createSimpleCondition({attribute:"LOCATION",operator:d.sina.ComparisonOperator.Equals,value:l}),dimensionValueFormatted:l,measureValue:1,measureValueFormatted:'1',dataSource:d.searchQuery.filter.dataSource});b.push(f);}else{for(k=0;k<b.length;k++){if(b[k].filterCondition.value===l){b[k].measureValue=b[k].measureValue+1;b[k].measureValueFormatted=''+b[k].measureValue;}}}}}}return b;},getChartResultSetItemsForPublications:function(r){var b=[];var d=this;var l;var e=[];var f,i,j,k,g;for(i=0;i<r.length;i++){g=r[i].detailAttributes;for(j=0;j<g.length;j++){if(g[j].id==="PUBLICATION"){l=g[j].value;if(e.indexOf(l)===-1){e.push(l);f=d.sina._createChartResultSetItem({filterCondition:d.sina.createSimpleCondition({attribute:"PUBLICATION",operator:d.sina.ComparisonOperator.Equals,value:l}),dimensionValueFormatted:l,measureValue:1,measureValueFormatted:'1',dataSource:d.searchQuery.filter.dataSource});b.push(f);}else{for(k=0;k<b.length;k++){if(b[k].filterCondition.value===l){b[k].measureValue=b[k].measureValue+1;b[k].measureValueFormatted=''+b[k].measureValue;}}}}}}return b;},getSientistOrFolkloristFacet:function(s,r){var b=this;var d;var e=[];var f,i,j,k,g,h;var l=[];for(i=0;i<r.length;i++){g=r[i].titleAttributes;if(s.filter.dataSource.id==="Mysterious_Sightings"||s.filter.dataSource.id==="Urban_Legends"||s.filter.dataSource.id==="Publications"){g=r[i].detailAttributes;}for(j=0;j<g.length;j++){if(g[j].id==="SCIENTIST"||g[j].id==="FOLKLORIST"){d=g[j].value;h=g[j].id;if(e.indexOf(d)===-1){e.push(d);f=b.sina._createChartResultSetItem({filterCondition:b.sina.createSimpleCondition({attribute:g[j].id,operator:b.sina.ComparisonOperator.Equals,value:d}),dimensionValueFormatted:d,measureValue:1,measureValueFormatted:'1',dataSource:b.searchQuery.filter.dataSource});l.push(f);}else{for(k=0;k<l.length;k++){if(l[k].filterCondition.value===d){l[k].measureValue=l[k].measureValue+1;l[k].measureValueFormatted=''+l[k].measureValue;}}}}}}return[l,h];},getTopFacetOnly:function(s){var b=this;var d=s.filter.sina.allDataSource;var e=[b.sina._createDataSourceResultSetItem({dataSource:s.filter.sina.dataSources[1],dimensionValueFormatted:d.labelPlural,measureValue:4,measureValueFormatted:'4'}),b.sina._createDataSourceResultSetItem({dataSource:s.filter.sina.dataSources[2],dimensionValueFormatted:d.labelPlural,measureValue:5,measureValueFormatted:'5'}),b.sina._createDataSourceResultSetItem({dataSource:s.filter.sina.dataSources[3],dimensionValueFormatted:d.labelPlural,measureValue:1,measureValueFormatted:'1'})];var f=[b.sina._createDataSourceResultSet({title:s.filter.dataSource.label,titleHighlighted:s.filter.dataSource.label,items:e,query:s})];return f;},generateFacets:function(s){var b=this;if(s.filter.dataSource.id==="All"){return b.getTopFacetOnly(s);}var d=[];var e;var g=this.templateProvider(this);var f=b.sina.createFilter({searchTerm:b.searchQuery.filter.searchTerm,dataSource:b.searchQuery.filter.dataSource,rootCondition:b.searchQuery.filter.rootCondition.clone()});var h=[];var r,i,j;if(s.filter.dataSource.id==="Publications"){r=g.searchResultSetItemArray3;}else if(s.filter.dataSource.id==="Scientists"||s.filter.dataSource.id==="Folklorists"){r=g.searchResultSetItemArray;}else if(s.filter.dataSource.id==="Urban_Legends"||s.filter.dataSource.id==="Mysterious_Sightings"){r=g.searchResultSetItemArray2;}if(s.filter.dataSource.id==="Scientists"||s.filter.dataSource.id==="Mysterious_Sightings"){h=b.getChartResultSetItemsForLocations(r);e=b.sina._createChartResultSet({items:h,query:b.sina.createChartQuery({filter:f,dimension:"LOCATION"}),title:"Locations",type:''});d.push(e);}i=b.getSientistOrFolkloristFacet(s,r);h=i[0];j=i[1];e=b.sina._createChartResultSet({items:h,query:b.sina.createChartQuery({filter:f,dimension:j}),title:j.charAt(0).toUpperCase()+j.slice(1).toLowerCase()+"s",type:''});d.push(e);return d;}});});
