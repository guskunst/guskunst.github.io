// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/EventHub","sap/ushell/Config","sap/ushell/utils","sap/ushell/components/HeaderManager","sap/ushell/components/StateHelper"],function(E,C,u,H,S){"use strict";var b;var c;function a(){return{"home":{"actions":["ContactSupportBtn","EndUserFeedbackBtn"]},"app":{"actions":["ContactSupportBtn","EndUserFeedbackBtn","aboutBtn"]},"minimal":{"actions":["ContactSupportBtn","EndUserFeedbackBtn","aboutBtn"]},"standalone":{"actions":["ContactSupportBtn","EndUserFeedbackBtn","aboutBtn"]},"embedded":{"actions":["ContactSupportBtn","EndUserFeedbackBtn","aboutBtn"]},"embedded-home":{"actions":["ContactSupportBtn","EndUserFeedbackBtn","aboutBtn"]},"lean":{"actions":["ContactSupportBtn","EndUserFeedbackBtn","aboutBtn"]}};}function d(){return{"blank":{"stateName":"blank","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"paneContent":[],"actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[],"search":""},"blank-home":{"stateName":"blank-home","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"paneContent":[],"actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[],"search":""},"home":{"stateName":"home","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"search":"","paneContent":[],"actions":["openCatalogBtn","userSettingsBtn"],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[]},"app":{"stateName":"app","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"paneContent":[],"search":"","actions":["openCatalogBtn","userSettingsBtn"],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[]},"minimal":{"stateName":"minimal","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"paneContent":[],"actions":["openCatalogBtn","userSettingsBtn"],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[],"search":""},"standalone":{"stateName":"standalone","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"paneContent":[],"actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[],"search":""},"embedded":{"stateName":"embedded","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"paneContent":[],"actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[],"search":""},"embedded-home":{"stateName":"embedded-home","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"paneContent":[],"actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[],"search":""},"headerless":{"stateName":"headerless","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"paneContent":[],"actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[],"search":""},"merged":{"stateName":"merged","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"paneContent":[],"actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[],"search":""},"headerless-home":{"stateName":"headerless-home","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"paneContent":[],"actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[],"search":""},"merged-home":{"stateName":"merged-home","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":true,"paneContent":[],"actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[],"search":""},"lean":{"stateName":"lean","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":false,"paneContent":[],"search":"","actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[]},"lean-home":{"stateName":"lean-home","showCurtain":false,"showCatalog":false,"showPane":false,"showRightFloatingContainer":true,"showRecentActivity":false,"paneContent":[],"search":"","actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"toolAreaVisible":false,"floatingContainerContent":[]}};}function r(O,k){return Object.keys(O).reduce(function(o,K){if(!k[K]){o[K]=O[K];}return o;},{});}function v(i,j){return j!==undefined;}function n(){return true;}function g(o,m){var p=m.split("/");var M=o;p.shift();p.forEach(function(P){if(!M){return;}M=M[P];});return M;}function e(m,V,o){var p=m.split("/");var M=o;p.shift();var P=p.pop();p.forEach(function(s){M=M[s];});M[P]=V;}function f(){var o;var s;var k;var A;var m;var I;var l;var p;var t;var q;this.createDefaultTriggers=function(i){var R=function(z,B,D){if(D.sProperty==="actions"){var F=g(D.oModel,D.path);if(F&&F.length===0&&D.aIds&&D.aIds.length>0){this._renderShellState();}}}.bind(this);var j=function(z){function B(O,N){var U=sap.ushell.Container.getService("URLParsing"),F=U.getHash(O),G=U.getHash(N),J=U.parseShellHash(F).appSpecificRoute,K=U.parseShellHash(G).appSpecificRoute;return J!==K;}var D=B(z.oldURL,z.newURL);if(D){this.addHeaderItem(["backBtn"],true);}}.bind(this);this.createTriggersOnBaseStates([{sName:'onAddFirstAction',fnRegister:function(){sap.ui.getCore().getEventBus().subscribe("launchpad","updateShell",R,this);},fnUnRegister:function(){sap.ui.getCore().getEventBus().unsubscribe("launchpad","updateShell",R,this);}}],["blank","blank-home"],i);var x=this;var y;this.createTriggersOnBaseStates([{sName:'onAddFirstAction',fnRegister:function(){window.addEventListener("hashchange",j);var N=0;y=E.on("AppRendered").do(function(){N++;if(N>=2){x.addHeaderItem(["backBtn"],true);}});},fnUnRegister:function(){window.removeEventListener("hashchange",j);if(y){y.off();}}}],["lean","lean-home"],i);};this.init=function(i,j){b=d();c=a();s=C.last("/core/shell/model");o={};m={};I=false;p=false;t=[];q=true;A=j;l=undefined;if(i){jQuery.sap.measure.start("FLP:ElementsModel.init","moveShellHeaderEndItems","FLP");if(i.moveEditHomePageActionToShellHeader){this._removeActionFromMeArea("ActionModeBtn");}if(i.moveContactSupportActionToShellHeader){this._removeCustomDataActionBtnFromMeArea("ContactSupportBtn");}if(i.moveGiveFeedbackActionToShellHeader){this._removeCustomDataActionBtnFromMeArea("EndUserFeedbackBtn");}if(i.moveAppFinderActionToShellHeader){this._removeActionFromMeArea("openCatalogBtn");}if(i.moveUserSettingsActionToShellHeader){this._removeActionFromMeArea("userSettingsBtn");}jQuery.sap.measure.end("FLP:ElementsModel.init");}var x=i&&i.appState?i.appState:"home";this.createDefaultTriggers(x);this.switchState(x);};this.destroy=function(){s=undefined;o=undefined;A=undefined;m=undefined;I=undefined;q=undefined;p=undefined;l=undefined;b=undefined;c=undefined;};this.getModel=function(){var R=sap.ushell.Container.getRenderer("fiori2");if(!R){return undefined;}return R._oShellView.getModel();};this._removeCustomDataActionBtnFromMeArea=function(i){for(var j in c){var x=c[j];var y=x.actions;var z=y.indexOf(i);if(z!==-1){c[j].actions.splice(z,1);}}};this._removeActionFromMeArea=function(B){var i;for(i in b){var j=b[i];if(i==="blank"||i==="blank-home"){continue;}if(B==="ActionModeBtn"&&i==="app"){continue;}var x=j.actions;var y=x.indexOf(B);if(y!==-1){b[i].actions.splice(y,1);}}};this.destroyManageQueue=function(){this._destroyManageQueue(["home","embedded-home","headerless-home","merged-home","blank-home","lean-home"]);};this.switchState=function(i){var j=u.clone(b[i]);var x=r(j,{aTriggers:true});C.emit("/core/shell/model/currentState",x);k=A.customShellState;l=undefined;this._renderShellState();return j;};this.setLeftPaneVisibility=function(V,i,j){this.updateStateProperty("showPane",V,i,j);};this.setHeaderHiding=function(){jQuery.sap.log.warning("Application Life Cycle model: headerHiding property is deprecated and has no effect");};this._createHeaderEventPayload=function(P,V,i,j,D,x){var y={propertyName:P,value:V,aStates:j,bCurrentState:i,action:x,bDoNotPropagate:D};return y;};this.setHeaderVisibility=function(V,i,j){var P=this._createHeaderEventPayload("headerVisible",V,i,j,false);H.updateStates(P);};this.showLogo=function(i,j){this.updateShowLogo(true,i,j,false);};this.updateShowLogo=function(V,i,j,D){var P=this._createHeaderEventPayload("showLogo",V,i,j,D);H.updateStates(P);};this.addHeaderItem=function(i,j,x){if(i.length){var P=this._createHeaderEventPayload("headItems",i,j,x,false);H.updateStates(P);}};this.removeHeaderItem=function(i,j,x){var P=this._createHeaderEventPayload("headItems",i,j,x,false,"remove");H.updateStates(P);};this.addHeaderEndItem=function(i,j,x,D){if(i.length){var P=this._createHeaderEventPayload("headEndItems",i,j,x,D);H.updateStates(P);}};this.removeHeaderEndItem=function(i,j,x){var P=this._createHeaderEventPayload("headEndItems",i,j,x,false,"remove");H.updateStates(P);};this.addSubHeader=function(i,j,x){if(i.length){this._addShellItem("subHeader",i,j,x);}};this.removeSubHeader=function(i,j,x){this._removeShellItem("subHeader",i,j,x);};this.addActionButton=function(i,j,x,y){if(y){this._addActionButtonAtStart("actions",i,j,x);}else{this._addActionButton("actions",i,j,x);}};this.removeActionButton=function(i,j,x){this._removeShellItem("actions",i,j,x);};this.addToolAreaItem=function(i,j,x){if(i.length){this._addToolAreaItem("toolAreaItems",i,j,x);}};this.removeToolAreaItem=function(i,j,x){this._removeShellItem("toolAreaItems",i,j,x);};this.addLeftPaneContent=function(i,j,x){if(i.length){this._addShellItem("paneContent",i,j,x);}};this.removeLeftPaneContent=function(i,j,x){this._removeShellItem("paneContent",i,j,x);};this.addRightFloatingContainerItem=function(i,j,x){if(i.length){this._addRightFloatingContainerItem("RightFloatingContainerItems",i,j,x);}};this.removeRightFloatingContainerItem=function(i,j,x){this._removeShellItem("RightFloatingContainerItems",i,j,x);};this.showSettingsButton=function(i,j){this.addActionButton(["userSettingsBtn"],i,j,false);};this.showSignOutButton=function(i,j){this.addActionButton(["logoutBtn"],i,j,false);};this.showRightFloatingContainer=function(i){this._showRightFloatingContainer(i);};this.addFloatingActionButton=function(i,j,x){if(i.length){this._addShellItem("floatingActions",i,j,x);}};this.removeFloatingActionButton=function(i,j,x){this._removeShellItem("floatingActions",i,j,x);};this.updateStateProperty=function(P,V,i,j,D){if(P.startsWith("application")){var x=this._createHeaderEventPayload(P,V,i,j,false);H.updateStates(x);return;}this._setShellItem(P,V,i,j,v,e,D);};this._handleTriggers=function(N){var T,i,j=[],x={};q=false;while(t.length>0){T=t.pop();if(N[T.sName]){j.push(T);x[T.sName]=T;}else{T.fnUnRegister(this);}}for(var y in N){if(N.hasOwnProperty(y)){if(!x[y]){i=N[y];i.fnRegister(this);j.push(i);}}}t=j;q=true;};this._registerTriggers=function(T){q=false;T.forEach(function(i){i.fnRegister(this);t.push(i);});q=true;};function w(T,i){var j=[];if(!i.aTriggers){i.aTriggers=[];}T.forEach(function(x){var F={sName:x.sName,fnRegister:x.fnRegister,fnUnRegister:x.fnUnRegister};i.aTriggers.push(F);j.push(F);});return j;}this.createTriggersOnState=function(T,i){var j=w(T,b);if(!I){this._registerTriggers(j);}};this.createTriggersOnBaseStates=function(T,B,i){var j=[];B.forEach(function(y){var z=b[y];j=w(T,z);});var x=B.indexOf(i)>=0;if(x&&!I){this._registerTriggers(j);}};this.createTriggers=function(T,i,B){var j=s.currentState;if(i===true){this.createTriggersOnState(T,j);return;}this.createTriggersOnBaseStates(T,B,j.stateName);};this.showShellItem=function(P,j,V){var x=S.getModelStates(j),M="/currentState"+P,B;for(var i=0;i<x.length;i++){B=b[x[i]].stateName;b[B][P.split("/")[1]]=V;}if(s.currentState.stateName===j){e(M,V,s);}};this.addCustomItems=function(i,j,x,y){if(this._isValidStateEntry(i)){this._isValidStateEntry(i).fnAdd(j,x,y);}else{throw new Error("Invalid state entry:"+i);}};this.removeCustomItems=function(i,j,x,y){if(this._isValidStateEntry(i)){this._isValidStateEntry(i).fnRemove(j,x,y);}else{throw new Error("Invalid state entry:"+i);}};this.applyExtendedShellState=function(i){l=i;this._renderShellState();};this.addEntryInShellStates=function(i,j,x,R,y){var z,B;if(!o[i]){o[i]={fnAdd:x,fnHide:R};var D=this._getStatesList();for(z=0;z<D.length;z++){B=D[z];b[B][i]=y[B];}this["remove"+j]=R;this["add"+j]=x;}else{throw new Error("State entry already exsists:"+i);}};this.addElementToManagedQueue=function(i){var j=C.last("/core/shell/model/currentState/stateName"),B,x=i.getId();if(!A){A={extendedShellStates:{},aTriggers:[],customShellState:this._createCustomShellState("custom")};}B=A.extendedShellStates;if(!B[j]){B[j]={managedObjects:[],customState:undefined};}B[j].managedObjects.push(x);var M=m[x];if(M){M.nRefCount++;}else{M={oItem:i,nRefCount:1};m[x]=M;}};this.updateNeededTriggersMap=function(i,T){var j;if(!T){return;}for(j=0;j<T.length;j++){i[T[j].sName]=T[j];}};this._renderShellState=function(){var B=C.last("/core/shell/model/currentState/stateName"),i,j,x=u.clone(b[B]),y=A,z,N={};if(I){return;}if(y&&y.customShellState){z=y.customShellState.currentState;}var D={"currentState":u.clone(x)};s=D;I=true;if(l&&y.extendedShellStates&&y.extendedShellStates[l]){i=y.extendedShellStates[l].customState;j=i.currentState;this._addCustomShellStates(j);}if(z){this._addCustomShellStates(z);}s=C.last("/core/shell/model");if(x&&x.aTriggers){this.updateNeededTriggersMap(N,x.aTriggers);}if(j&&j.aTriggers){this.updateNeededTriggersMap(N,j.aTriggers);}if(z&&z.aTriggers){this.updateNeededTriggersMap(N,z.aTriggers);}if(q){this._handleTriggers(N);}delete D.currentState.aTriggers;var F=r(D.currentState,{aTriggers:true});H.recalculateState(B,l);C.emit("/core/shell/model/currentState",F);I=false;};this._addCustomShellStates=function(T){this.addToolAreaItem(T.toolAreaItems,true);this.addSubHeader(T.subHeader,true);this.addRightFloatingContainerItem(T.RightFloatingContainerItems,true);this.addActionButton(T.actions,true,undefined,false);this.addLeftPaneContent(T.paneContent,true);this.addFloatingActionButton(T.floatingActions,true);this.showRightFloatingContainer(T.showRightFloatingContainer);};this._createCustomShellState=function(i){var j={"currentState":{"stateName":i,"headEndItems":[],"paneContent":[],"headItems":[],"actions":[],"floatingActions":[],"subHeader":[],"toolAreaItems":[],"RightFloatingContainerItems":[],"application":{},"showRightFloatingContainer":undefined,"headerHeading":undefined}};var x=c[i];if(x){jQuery.extend(j.currentState,x);}return j;};this._showRightFloatingContainer=function(i){this._setShellItem("showRightFloatingContainer",i,true,[],v,e);};this._addActionButtonAtStart=function(P,i,j,x){function U(y,z,B){var D=g(B,y),F=[],O=z.indexOf("openCatalogBtn");if(O>-1){z.splice(O,1);F.push("openCatalogBtn");}else if(D[0]==="openCatalogBtn"){D.splice(0,1);F.push("openCatalogBtn");}F=F.concat(z).concat(D);e(y,F,B);}this._setShellItem(P,i,j,x,n,U);};this._addActionButton=function(P,j,x,y){function U(z,B,D){var F=g(D,z);var L=F.indexOf("logoutBtn");if(L>-1){F.splice.apply(F,[L,0].concat(B));}else{F=F.concat(B);}var G=u.removeDuplicatedActions(F);function J(F){var K=[];var O=["recentActivitiesBtn","frequentActivitiesBtn","openCatalogBtn","userSettingsBtn","ActionModeBtn","ContactSupportBtn","EndUserFeedbackBtn"];for(var i=0;i<O.length;i++){var M=F.indexOf(O[i]);if(M>-1){K.push(F.splice(M,1)[0]);}}K=K.concat(F);return K;}var N=J(G);e(z,N,D);}this._setShellItem(P,j,x,y,n,U);};this.setFloatingContainerContent=function(P,i,j,x){function V(y,i,z){return i.length===1;}function U(y,i,z){e(y,i,z);}this._setShellItem(P,i,j,x,V,U);};this._addShellItem=function(P,i,j,x){function V(y,i,z){if(y.length>0){jQuery.sap.log.warning("You can only add one item. Replacing existing item: "+y[0]+" in state: "+z+", with the new item: "+i[0]+".");}return true;}function U(y,z,B){e(y,i.slice(0),B);}this._setShellItem(P,i,j,x,V,U);};this._addRightFloatingContainerItem=function(P,i,j,x){function U(y,z,B){var D=g(B,y);D=D.concat(z);e(y,D,B);}this._setShellItem(P,i,j,x,n,U);};this._addToolAreaItem=function(P,i,j,x){function U(B,i,D){var F=g(D,B);F.push(i);e(B,F,D);}var y,z=S.getPassStates(x);for(y=0;y<z.length;y++){this.showShellItem("/toolAreaVisible",z[y],true);}this._setShellItem(P,i,j,x,n,U);};this._removeShellItem=function(P,i,j,x){function V(y,z){var B,i,D;for(D=0;D<z.length;D++){i=z[D];B=y.indexOf(i);if(B<0){jQuery.sap.log.warning("You cannot remove Item: "+i+", the headItem does not exists.");return false;}}return true;}function U(y,z,B){var D=g(B,y),F,i,G;for(G=0;G<z.length;G++){i=z[G];F=D.indexOf(i);if(F>-1){D.splice(F,1);}}e(y,D,B);}this._setShellItem(P,i,j,x,V,U);};this._setShellItem=function(P,O,x,y,V,U,D){var z,B;var F=Array.isArray(O)?O.slice(0):O;if(x===true){z="/currentState/"+P;B=g(s,z);if(V(B,F,"currentState")===false){return;}if(!p&&!I){U(z,F,k);sap.ui.getCore().getEventBus().publish('launchpad','updateShell',{oModel:s,path:z,aIds:F,sProperty:P});this._renderShellState();}else{U(z,F,s);}}else{var G=D?y:S.getPassStates(y),i,J=s.currentState.stateName;for(i=0;i<G.length;i++){var K=G[i],j;B=g(b[K],"/"+P);if(V(B,F,K)===false){continue;}var M=S.getModelStates(K,D);for(j=0;j<M.length;j++){z="/"+M[j]+"/"+P;U(z,F,b);if(J===M[j]){if(!I){this._renderShellState();}}}}}};this._getStatesList=function(){return Object.keys(b);};this._destroyManageQueue=function(i){var j,x,M,B,y,z;B=A.extendedShellStates;for(y in B){if(B.hasOwnProperty(y)){z=B[y].managedObjects;for(j=0;j<z.length;j++){x=z[j];M=m[x];M.nRefCount--;if(M.nRefCount===0){M.oItem.destroy();m[x]=null;}}delete B[y];}}};this._isValidStateEntry=function(N){return!!o[N];};this.getModelToUpdate=function(){return s;};this.setModelToUpdate=function(M,i){p=i;s=M;};this._getManagedElements=function(){return m;};this.extendStates=function(i){var j;for(j in i){if(i.hasOwnProperty(j)){u.updateProperties(b[j],i[j]);}}};this.getBaseStateMember=function(i,B){return b[i][B];};this.getCustomStateDeltaMember=function(i,j){return c[i][j];};this.getAllStatesInDelta=function(){return Object.keys(c);};}var h=new f();return h;},true);
