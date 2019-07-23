/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./_Helper","./_Parser","sap/ui/core/format/DateFormat","sap/ui/model/odata/ODataUtils","sap/ui/thirdparty/jquery"],function(_,a,D,O,q){"use strict";var r=/^\/Date\((-?\d+)\)\/$/,d=D.getDateInstance({pattern:"yyyy-MM-dd",UTC:true}),b=/^\/Date\((-?\d+)(?:([-+])(\d\d)(\d\d))?\)\/$/,p={},o=D.getDateTimeInstance({pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSZ"}),c=/\+/g,e=/^([^(]+)(\(.+\))$/,f=/\//g,g=/^PT(?:(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(\.\d+)?S)?)$/i,t=D.getTimeInstance({pattern:"HH:mm:ss",UTC:true});function h(){}h.prototype.mFinalHeaders={"Content-Type":"application/json;charset=UTF-8"};h.prototype.mPredefinedPartHeaders={"Accept":"application/json"};h.prototype.mPredefinedRequestHeaders={"Accept":"application/json","MaxDataServiceVersion":"2.0","DataServiceVersion":"2.0","X-CSRF-Token":"Fetch"};h.prototype.convertBinary=function(v){return v.replace(c,"-").replace(f,"_");};h.prototype.convertDate=function(v){var i,m=r.exec(v);if(!m){throw new Error("Not a valid Edm.DateTime value '"+v+"'");}i=new Date(parseInt(m[1]));if(Number(m[1]%(24*60*60*1000))!==0){throw new Error("Cannot convert Edm.DateTime value '"+v+"' to Edm.Date because it contains a time of day");}return d.format(i);};h.prototype.convertDateTimeOffset=function(v,P){var m=b.exec(v),s,i,j,k,l="yyyy-MM-dd'T'HH:mm:ss",n=P.$Precision,T;if(!m){throw new Error("Not a valid Edm.DateTimeOffset value '"+v+"'");}T=parseInt(m[1]);i=parseInt(m[3]);j=parseInt(m[4]);if(!m[2]||i===0&&j===0){s="Z";}else{k=m[2]==="-"?-1:1;T+=k*(i*60*60*1000+j*60*1000);s=m[2]+m[3]+":"+m[4];}if(n>0){l+="."+"".padEnd(n,"S");}if(!p[l]){p[l]=D.getDateTimeInstance({pattern:l,UTC:true});}return p[l].format(new Date(T))+s;};h.prototype.convertDoubleSingle=function(v){switch(v){case"NaN":case"INF":case"-INF":return v;default:return parseFloat(v);}};h.prototype.convertFilter=function(F,m){var i=a.parseFilter(F),j=this;function k(L,s){var M,T=n(s);if(T.$Type!=="Edm.String"){M=_.parseLiteral(L.value,T.$Type,T.path);L.value=j.formatPropertyAsLiteral(M,T);}}function l(N,M){throw new Error("Cannot convert filter to V2, "+M+" at "+N.at+": "+F);}function n(N){var P;if(N.type){return{$Type:N.type};}if(N.id==="PATH"){P=j.oModelInterface.fetchMetadata(m+"/"+N.value).getResult();if(!P){throw new Error("Invalid filter path: "+N.value);}return{path:N.value,$Type:P.$Type,$v2Type:P.$v2Type};}return n(N.parameters[0]);}function v(N){if(N){if(N.id==="VALUE"&&N.ambiguous){l(N,"ambiguous type for the literal");}v(N.left);v(N.right);if(N.parameters){if(N.value==="contains"){N.value="substringof";N.parameters.push(N.parameters.shift());}N.parameters.forEach(v);}if(N.left&&N.right){if(N.left.id==="VALUE"){if(N.right.id==="VALUE"){l(N,"saw literals on both sides of '"+N.id+"'");}k(N.left,N.right);}else if(N.right.id==="VALUE"){k(N.right,N.left);}}}}v(i);return a.buildFilterString(i);};h.prototype.convertKeyPredicate=function(v,P){var E=this.fetchTypeForPath(_.getMetaPath(P)).getResult(),k=a.parseKeyPredicate(decodeURIComponent(v)),i=this;function j(s,V){var l=E[s];if(l.$Type!=="Edm.String"){V=i.formatPropertyAsLiteral(_.parseLiteral(V,l.$Type,P),l);}return encodeURIComponent(V);}if(""in k){return"("+j(E.$Key[0],k[""])+")";}return"("+E.$Key.map(function(s){return encodeURIComponent(s)+"="+j(s,k[s]);}).join(",")+")";};h.prototype.convertResourcePath=function(R){var I=R.indexOf("?"),Q="",s,S=-1,j=this;if(I>0){Q=R.slice(I);R=R.slice(0,I);}s=R.split("/");return s.map(function(k,i){var m=e.exec(k);S+=k.length+1;if(m){k=m[1]+j.convertKeyPredicate(m[2],"/"+R.slice(0,S));}return k;}).join("/")+Q;};h.prototype.convertTimeOfDay=function(v){var i,m=g.exec(v),T;if(!m){throw new Error("Not a valid Edm.Time value '"+v+"'");}T=Date.UTC(1970,0,1,m[1]||0,m[2]||0,m[3]||0);i=new Date(T);return t.format(i)+(m[4]||"");};h.prototype.convertNonPrimitive=function(i){var P,T,s,v,j=this;if(Array.isArray(i.results)){i.results.forEach(function(I){j.convertNonPrimitive(I);});return i.results;}if(!i.__metadata||!i.__metadata.type){throw new Error("Cannot convert structured value without type information in "+"__metadata.type: "+JSON.stringify(i));}s=i.__metadata.type;T=j.getTypeForName(s);delete i.__metadata;for(P in i){v=i[P];if(v===null){continue;}if(typeof v==="object"){if(v.__deferred){delete i[P];}else{i[P]=this.convertNonPrimitive(v);}continue;}i[P]=this.convertPrimitive(v,T[P],s,P);}return i;};h.prototype.convertPrimitive=function(v,P,T,s){switch(P&&P.$Type){case"Edm.Binary":return this.convertBinary(v);case"Edm.Date":return this.convertDate(v);case"Edm.DateTimeOffset":return this.convertDateTimeOffset(v,P);case"Edm.Boolean":case"Edm.Byte":case"Edm.Decimal":case"Edm.Guid":case"Edm.Int16":case"Edm.Int32":case"Edm.Int64":case"Edm.SByte":case"Edm.String":return v;case"Edm.Double":case"Edm.Single":return this.convertDoubleSingle(v);case"Edm.TimeOfDay":return this.convertTimeOfDay(v);default:throw new Error("Type '"+(P&&P.$Type)+"' of property '"+s+"' in type '"+T+"' is unknown; cannot convert value: "+v);}};h.prototype.doCheckVersionHeader=function(G,R,v){var s=G("DataServiceVersion"),i=!s&&G("OData-Version");if(i){throw new Error("Expected 'DataServiceVersion' header with value '1.0' or '2.0' but "+"received 'OData-Version' header with value '"+i+"' in response for "+this.sServiceUrl+R);}if(!s){return;}s=s.split(";")[0];if(s==="1.0"||s==="2.0"){return;}throw new Error("Expected 'DataServiceVersion' header with value '1.0' or '2.0' but "+"received value '"+s+"' in response for "+this.sServiceUrl+R);};h.prototype.doConvertResponse=function(R,m){var C,i,k,P,j,l=this;R=R.d;i=Array.isArray(R.results);if(!i&&!R.__metadata){k=Object.keys(R);C=R[k[0]];if(k.length===1){if(C===null){return{value:null};}else if(typeof C!=="object"){return{value:this.convertPrimitive(C,this.oModelInterface.fetchMetadata(m).getResult(),m,k[0])};}else if(C.__metadata){R=C;}}}if(i&&!R.results.length){P=[];}else if(i&&!R.results[0].__metadata){j=this.oModelInterface.fetchMetadata(m).getResult();P=R.results.map(function(v){return l.convertPrimitive(v,j,m,"");});}else{P=this.convertNonPrimitive(R);}if(i){P={value:P};if(R.__count){P["@odata.count"]=R.__count;}if(R.__next){P["@odata.nextLink"]=R.__next;}}return P;};h.prototype.doConvertSystemQueryOptions=function(m,Q,R,i,s){var S,j={},k=this;function l(v,E){if(!Array.isArray(v)){v=v.split(",");}v.forEach(function(u){var I=u.indexOf("/");if(I>=0&&u.indexOf(".")<0){u=u.slice(0,I);}j[_.buildPath(E,u)]=true;});}function n(E,u,P){if(!u||typeof u!=="object"){throw new Error("$expand must be a valid object");}Object.keys(u).forEach(function(v){var A=_.buildPath(P,v),w=u[v];E.push(A);if(typeof w==="object"){Object.keys(w).forEach(function(x){switch(x){case"$expand":n(E,w.$expand,A);break;case"$select":l(w.$select,A);break;default:throw new Error("Unsupported query option in $expand: "+x);}});}if(!w.$select){j[A+"/*"]=true;}});return E;}Object.keys(Q).forEach(function(N){var I=N[0]==='$',v=Q[N];if(i&&I){return;}switch(N){case"$count":N="$inlinecount";v=v?"allpages":"none";break;case"$expand":v=n([],v,"");v=(s?v.sort():v).join(",");break;case"$orderby":break;case"$select":l(v);return;case"$filter":v=k.convertFilter(v,m);break;default:if(I){throw new Error("Unsupported system query option: "+N);}}R(N,v);});S=Object.keys(j);if(S.length>0){if(!Q.$select){S.push("*");}R("$select",(s?S.sort():S).join(","));}};h.prototype.formatPropertyAsLiteral=function(v,P){function i(j,V){var k=j.parse(V);if(!k){throw new Error("Not a valid "+P.$Type+" value: "+V);}return k;}if(v===null){return"null";}switch(P.$Type){case"Edm.Boolean":case"Edm.Byte":case"Edm.Decimal":case"Edm.Double":case"Edm.Guid":case"Edm.Int16":case"Edm.Int32":case"Edm.Int64":case"Edm.SByte":case"Edm.Single":case"Edm.String":break;case"Edm.Date":v=i(d,v);break;case"Edm.DateTimeOffset":v=i(o,v);break;case"Edm.TimeOfDay":v={__edmType:"Edm.Time",ms:i(t,v).getTime()};break;default:throw new Error("Type '"+P.$Type+"' in the key predicate is not supported");}return O.formatValue(v,P.$v2Type||P.$Type);};h.prototype.getPathAndAddQueryOptions=function(P,i,m,Q,E){var n,T,j=this;P=P.slice(1,-5);if(i.$IsBound){P=P.slice(P.lastIndexOf(".")+1);if(typeof E==="function"){E=E();}T=this.getTypeForName(i.$Parameter[0].$Type);T.$Key.forEach(function(n){Q[n]=j.formatPropertyAsLiteral(E[n],T[n]);});}if(i.$Parameter){i.$Parameter.forEach(function(k){n=k.$Name;if(n in m){if(k.$isCollection){throw new Error("Unsupported collection-valued parameter: "+n);}Q[n]=j.formatPropertyAsLiteral(m[n],k);delete m[n];}});}for(n in m){delete m[n];}if(i.$v2HttpMethod){m["X-HTTP-Method"]=i.$v2HttpMethod;}return P;};h.prototype.getTypeForName=function(n){var T;this.mTypesByName=this.mTypesByName||{};T=this.mTypesByName[n];if(!T){T=this.mTypesByName[n]=this.oModelInterface.fetchMetadata("/"+n).getResult();}return T;};h.prototype.isActionBodyOptional=function(){return true;};h.prototype.isChangeSetOptional=function(){return false;};h.prototype.ready=function(){return this.oModelInterface.fetchEntityContainer().then(function(){});};return function(R){q.extend(R,h.prototype);R.oModelInterface.reportBoundMessages=function(){};R.oModelInterface.reportUnboundMessages=function(){};};},false);
