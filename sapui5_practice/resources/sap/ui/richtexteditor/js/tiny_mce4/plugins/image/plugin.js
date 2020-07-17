(function(){var c=(function(){'use strict';var g=tinymce.util.Tools.resolve('tinymce.PluginManager');var h=function(e){return e.settings.image_dimensions===false?false:true;};var d=function(e){return e.settings.image_advtab===true?true:false;};var k=function(e){return e.getParam('image_prepend_url','');};var l=function(e){return e.getParam('image_class_list');};var m=function(e){return e.settings.image_description===false?false:true;};var n=function(e){return e.settings.image_title===true?true:false;};var q=function(e){return e.settings.image_caption===true?true:false;};var r=function(e){return e.getParam('image_list',false);};var s=function(e){return e.getParam('images_upload_url',false);};var v=function(e){return e.getParam('images_upload_handler',false);};var w=function(e){return e.getParam('images_upload_url');};var y=function(e){return e.getParam('images_upload_handler');};var z=function(e){return e.getParam('images_upload_base_path');};var A=function(e){return e.getParam('images_upload_credentials');};var $={hasDimensions:h,hasAdvTab:d,getPrependUrl:k,getClassList:l,hasDescription:m,hasImageTitle:n,hasImageCaption:q,getImageList:r,hasUploadUrl:s,hasUploadHandler:v,getUploadUrl:w,getUploadHandler:y,getUploadBasePath:z,getUploadCredentials:A};var B=typeof window!=='undefined'?window:Function('return this;')();var C=function(p,a){var o=a!==undefined&&a!==null?a:B;for(var i=0;i<p.length&&o!==undefined&&o!==null;++i)o=o[p[i]];return o;};var D=function(p,a){var b=p.split('.');return C(b,a);};var E=function(o,p){if(o[p]===undefined||o[p]===null)o[p]={};return o[p];};var F=function(p,t){var o=t!==undefined?t:B;for(var i=0;i<p.length;++i)o=E(o,p[i]);return o;};var G=function(a,t){var p=a.split('.');return F(p,t);};var H={path:C,resolve:D,forge:F,namespace:G};var I=function(a,b){return H.resolve(a,b);};var J=function(a,b){var e=I(a,b);if(e===undefined||e===null)throw a+' not available on this browser';return e;};var K={getOrDie:J};function L(){var f=K.getOrDie('FileReader');return new f();}var M=tinymce.util.Tools.resolve('tinymce.util.Promise');var N=tinymce.util.Tools.resolve('tinymce.util.Tools');var O=tinymce.util.Tools.resolve('tinymce.util.XHR');var P=function(a,b){return Math.max(parseInt(a,10),parseInt(b,10));};var Q=function(g2,a){var i=document.createElement('img');function b(f,j){if(i.parentNode){i.parentNode.removeChild(i);}a({width:f,height:j});}i.onload=function(){var f=P(i.width,i.clientWidth);var j=P(i.height,i.clientHeight);b(f,j);};i.onerror=function(){b(0,0);};var e=i.style;e.visibility='hidden';e.position='fixed';e.bottom=e.left='0px';e.width=e.height='auto';document.body.appendChild(i);i.src=g2;};var R=function(i,a,b){function e(f,o){o=o||[];N.each(f,function(j){var p={text:j.text||j.title};if(j.menu){p.menu=e(j.menu);}else{p.value=j.value;a(p);}o.push(p);});return o;}return e(i,b||[]);};var S=function(a){if(a){a=a.replace(/px$/,'');}return a;};var T=function(a){if(a.length>0&&/^[0-9]+$/.test(a)){a+='px';}return a;};var U=function(a){if(a.margin){var b=a.margin.split(' ');switch(b.length){case 1:a['margin-top']=a['margin-top']||b[0];a['margin-right']=a['margin-right']||b[0];a['margin-bottom']=a['margin-bottom']||b[0];a['margin-left']=a['margin-left']||b[0];break;case 2:a['margin-top']=a['margin-top']||b[0];a['margin-right']=a['margin-right']||b[1];a['margin-bottom']=a['margin-bottom']||b[0];a['margin-left']=a['margin-left']||b[1];break;case 3:a['margin-top']=a['margin-top']||b[0];a['margin-right']=a['margin-right']||b[1];a['margin-bottom']=a['margin-bottom']||b[2];a['margin-left']=a['margin-left']||b[1];break;case 4:a['margin-top']=a['margin-top']||b[0];a['margin-right']=a['margin-right']||b[1];a['margin-bottom']=a['margin-bottom']||b[2];a['margin-left']=a['margin-left']||b[3];}delete a.margin;}return a;};var V=function(e,a){var i=$.getImageList(e);if(typeof i==='string'){O.send({url:i,success:function(t){a(JSON.parse(t));}});}else if(typeof i==='function'){i(a);}else{a(i);}};var W=function(e,a,i){function b(){i.onload=i.onerror=null;if(e.selection){e.selection.select(i);e.nodeChanged();}}i.onload=function(){if(!a.width&&!a.height&&$.hasDimensions(e)){e.dom.setAttribs(i,{width:i.clientWidth,height:i.clientHeight});}b();};i.onerror=b;};var X=function(b){return new M(function(D,a){var e=new L();e.onload=function(){D(e.result);};e.onerror=function(){a(L.error.message);};e.readAsDataURL(b);});};var Y={getImageSize:Q,buildListItems:R,removePixelSuffix:S,addPixelSuffix:T,mergeMargins:U,createImageList:V,waitLoadImage:W,blobToDataUri:X};var Z=tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');var _=function(x){if(x===null)return'null';var t=typeof x;if(t==='object'&&Array.prototype.isPrototypeOf(x))return'array';if(t==='object'&&String.prototype.isPrototypeOf(x))return'string';return t;};var a1=function(t){return function(a){return _(a)===t;};};var b1={isString:a1('string'),isObject:a1('object'),isArray:a1('array'),isNull:a1('null'),isBoolean:a1('boolean'),isUndefined:a1('undefined'),isFunction:a1('function'),isNumber:a1('number')};var c1=function(o,a){return a;};var d1=function(o,a){var b=b1.isObject(o)&&b1.isObject(a);return b?f1(o,a):a;};var e1=function(a){return function(){var o=new Array(arguments.length);for(var i=0;i<o.length;i++)o[i]=arguments[i];if(o.length===0)throw new Error('Can\'t merge zero objects');var b={};for(var j=0;j<o.length;j++){var e=o[j];for(var f in e)if(e.hasOwnProperty(f)){b[f]=a(b[f],e[f]);}}return b;};};var f1=e1(d1);var g1=e1(c1);var h1={deepMerge:f1,merge:g1};var i1=Z.DOM;var j1=function(c){if(c.style.marginLeft&&c.style.marginRight&&c.style.marginLeft===c.style.marginRight){return Y.removePixelSuffix(c.style.marginLeft);}else{return'';}};var k1=function(c){if(c.style.marginTop&&c.style.marginBottom&&c.style.marginTop===c.style.marginBottom){return Y.removePixelSuffix(c.style.marginTop);}else{return'';}};var l1=function(c){if(c.style.borderWidth){return Y.removePixelSuffix(c.style.borderWidth);}else{return'';}};var m1=function(c,a){if(c.hasAttribute(a)){return c.getAttribute(a);}else{return'';}};var n1=function(c,a){return c.style[a]?c.style[a]:'';};var o1=function(c){return c.parentNode!==null&&c.parentNode.nodeName==='FIGURE';};var p1=function(c,a,b){c.setAttribute(a,b);};var q1=function(c){var f=i1.create('figure',{class:'image'});i1.insertAfter(f,c);f.appendChild(c);f.appendChild(i1.create('figcaption',{contentEditable:true},'Caption'));f.contentEditable='false';};var r1=function(c){var f=c.parentNode;i1.insertAfter(c,f);i1.remove(f);};var s1=function(c){if(o1(c)){r1(c);}else{q1(c);}};var t1=function(c,J1){var a=c.getAttribute('style');var b=J1(a!==null?a:'');if(b.length>0){c.setAttribute('style',b);c.setAttribute('data-mce-style',b);}else{c.removeAttribute('style');}};var u1=function(a,J1){return function(c,a,b){if(c.style[a]){c.style[a]=Y.addPixelSuffix(b);t1(c,J1);}else{p1(c,a,b);}};};var v1=function(c,a){if(c.style[a]){return Y.removePixelSuffix(c.style[a]);}else{return m1(c,a);}};var w1=function(c,a){var p=Y.addPixelSuffix(a);c.style.marginLeft=p;c.style.marginRight=p;};var x1=function(c,a){var p=Y.addPixelSuffix(a);c.style.marginTop=p;c.style.marginBottom=p;};var y1=function(c,a){var p=Y.addPixelSuffix(a);c.style.borderWidth=p;};var z1=function(c,a){c.style.borderStyle=a;};var A1=function(c){return n1(c,'borderStyle');};var B1=function(e){return e.nodeName==='FIGURE';};var C1=function(){return{src:'',alt:'',title:'',width:'',height:'',class:'',style:'',caption:false,hspace:'',vspace:'',border:'',borderStyle:''};};var D1=function(J1,a){var c=document.createElement('img');p1(c,'style',a.style);if(j1(c)||a.hspace!==''){w1(c,a.hspace);}if(k1(c)||a.vspace!==''){x1(c,a.vspace);}if(l1(c)||a.border!==''){y1(c,a.border);}if(A1(c)||a.borderStyle!==''){z1(c,a.borderStyle);}return J1(c.getAttribute('style'));};var E1=function(J1,a){var c=document.createElement('img');I1(J1,h1.merge(a,{caption:false}),c);p1(c,'alt',a.alt);if(a.caption){var f=i1.create('figure',{class:'image'});f.appendChild(c);f.appendChild(i1.create('figcaption',{contentEditable:true},'Caption'));f.contentEditable='false';return f;}else{return c;}};var F1=function(J1,c){return{src:m1(c,'src'),alt:m1(c,'alt'),title:m1(c,'title'),width:v1(c,'width'),height:v1(c,'height'),class:m1(c,'class'),style:J1(m1(c,'style')),caption:o1(c),hspace:j1(c),vspace:k1(c),border:l1(c),borderStyle:n1(c,'borderStyle')};};var G1=function(c,o,a,b,e){if(a[b]!==o[b]){e(c,b,a[b]);}};var H1=function(a,J1){return function(c,b,e){a(c,e);t1(c,J1);};};var I1=function(J1,a,c){var o=F1(J1,c);G1(c,o,a,'caption',function(c,b,e){return s1(c);});G1(c,o,a,'src',p1);G1(c,o,a,'alt',p1);G1(c,o,a,'title',p1);G1(c,o,a,'width',u1('width',J1));G1(c,o,a,'height',u1('height',J1));G1(c,o,a,'class',p1);G1(c,o,a,'style',H1(function(c,b){return p1(c,'style',b);},J1));G1(c,o,a,'hspace',H1(w1,J1));G1(c,o,a,'vspace',H1(x1,J1));G1(c,o,a,'border',H1(y1,J1));G1(c,o,a,'borderStyle',H1(z1,J1));};var J1=function(e,a){var b=e.dom.styles.parse(a);var f=Y.mergeMargins(b);var i=e.dom.styles.parse(e.dom.styles.serialize(f));return e.dom.styles.serialize(i);};var K1=function(e){var i=e.selection.getNode();var f=e.dom.getParent(i,'figure.image');if(f){return e.dom.select('img',f)[0];}if(i&&(i.nodeName!=='IMG'||i.getAttribute('data-mce-object')||i.getAttribute('data-mce-placeholder'))){return null;}return i;};var L1=function(e,f){var a=e.dom;var t=a.getParent(f.parentNode,function(b){return e.schema.getTextBlockElements()[b.nodeName];});if(t){return a.split(t,f);}else{return f;}};var M1=function(e){var c=K1(e);return c?F1(function(a){return J1(e,a);},c):C1();};var N1=function(e,a){var b=E1(function(j){return J1(e,j);},a);e.dom.setAttrib(b,'data-mce-id','__mcenew');e.focus();e.selection.setContent(b.outerHTML);var i=e.dom.select('*[data-mce-id="__mcenew"]')[0];e.dom.setAttrib(i,'data-mce-id',null);if(B1(i)){var f=L1(e,i);e.selection.select(f);}else{e.selection.select(i);}};var O1=function(e,c){e.dom.setAttrib(c,'src',c.getAttribute('src'));};var P1=function(e,c){if(c){var a=e.dom.is(c.parentNode,'figure.image')?c.parentNode:c;e.dom.remove(a);e.focus();e.nodeChanged();if(e.dom.isEmpty(e.getBody())){e.setContent('');e.selection.setCursorLocation();}}};var Q1=function(e,a){var c=K1(e);I1(function(b){return J1(e,b);},a,c);O1(e,c);if(B1(c.parentNode)){var f=c.parentNode;L1(e,f);e.selection.select(c.parentNode);}else{e.selection.select(c);Y.waitLoadImage(e,a,c);}};var R1=function(e,a){var c=K1(e);if(c){if(a.src){Q1(e,a);}else{P1(e,c);}}else if(a.src){N1(e,a);}};var S1=function(e){return function(a){var b=e.dom;var f=a.control.rootControl;if(!$.hasAdvTab(e)){return;}var i=f.toJSON();var j=b.parseStyle(i.style);f.find('#vspace').value('');f.find('#hspace').value('');j=Y.mergeMargins(j);if(j['margin-top']&&j['margin-bottom']||j['margin-right']&&j['margin-left']){if(j['margin-top']===j['margin-bottom']){f.find('#vspace').value(Y.removePixelSuffix(j['margin-top']));}else{f.find('#vspace').value('');}if(j['margin-right']===j['margin-left']){f.find('#hspace').value(Y.removePixelSuffix(j['margin-right']));}else{f.find('#hspace').value('');}}if(j['border-width']){f.find('#border').value(Y.removePixelSuffix(j['border-width']));}else{f.find('#border').value('');}if(j['border-style']){f.find('#borderStyle').value(j['border-style']);}else{f.find('#borderStyle').value('');}f.find('#style').value(b.serializeStyle(b.parseStyle(b.serializeStyle(j))));};};var T1=function(e,a){a.find('#style').each(function(b){var f=D1(function(i){return J1(e,i);},h1.merge(C1(),a.toJSON()));b.value(f);});};var U1=function(e){return{title:'Advanced',type:'form',pack:'start',items:[{label:'Style',name:'style',type:'textbox',onchange:S1(e)},{type:'form',layout:'grid',packV:'start',columns:2,padding:0,defaults:{type:'textbox',maxWidth:50,onchange:function(a){T1(e,a.control.rootControl);}},items:[{label:'Vertical space',name:'vspace'},{label:'Border width',name:'border'},{label:'Horizontal space',name:'hspace'},{label:'Border style',type:'listbox',name:'borderStyle',width:90,maxWidth:90,onselect:function(a){T1(e,a.control.rootControl);},values:[{text:'Select...',value:''},{text:'Solid',value:'solid'},{text:'Dotted',value:'dotted'},{text:'Dashed',value:'dashed'},{text:'Double',value:'double'},{text:'Groove',value:'groove'},{text:'Ridge',value:'ridge'},{text:'Inset',value:'inset'},{text:'Outset',value:'outset'},{text:'None',value:'none'},{text:'Hidden',value:'hidden'}]}]}]};};var V1={makeTab:U1};var W1=function(a,b){a.state.set('oldVal',a.value());b.state.set('oldVal',b.value());};var X1=function(a,f){var b=a.find('#width')[0];var e=a.find('#height')[0];var i=a.find('#constrain')[0];if(b&&e&&i){f(b,e,i.checked());}};var Y1=function(a,b,i){var o=a.state.get('oldVal');var e=b.state.get('oldVal');var f=a.value();var j=b.value();if(i&&o&&e&&f&&j){if(f!==o){j=Math.round(f/o*j);if(!isNaN(j)){b.value(j);}}else{f=Math.round(j/e*f);if(!isNaN(f)){a.value(f);}}}W1(a,b);};var Z1=function(a){X1(a,W1);};var $1=function(a){X1(a,Y1);};var _1=function(){var a=function(e){$1(e.control.rootControl);};return{type:'container',label:'Dimensions',layout:'flex',align:'center',spacing:5,items:[{name:'width',type:'textbox',maxLength:5,size:5,onchange:a,ariaLabel:'Width'},{type:'label',text:'x'},{name:'height',type:'textbox',maxLength:5,size:5,onchange:a,ariaLabel:'Height'},{name:'constrain',type:'checkbox',checked:true,text:'Constrain proportions'}]};};var a2={createUi:_1,syncSize:Z1,updateSize:$1};var b2=function(e,a){var b,p,f;var i=e.meta||{};var j=e.control;var o=j.rootControl;var t=o.find('#image-list')[0];if(t){t.value(a.convertURL(j.value(),'src'));}N.each(i,function(u,x){o.find('#'+x).value(u);});if(!i.width&&!i.height){b=a.convertURL(j.value(),'src');p=$.getPrependUrl(a);f=new RegExp('^(?:[a-z]+:)?//','i');if(p&&!f.test(b)&&b.substring(0,p.length)!==p){b=p+b;}j.value(b);Y.getImageSize(a.documentBaseURI.toAbsolute(j.value()),function(u){if(u.width&&u.height&&$.hasDimensions(a)){o.find('#width').value(u.width);o.find('#height').value(u.height);a2.syncSize(o);}});}};var c2=function(e){e.meta=e.control.rootControl.toJSON();};var d2=function(e,i){var a=[{name:'src',type:'filepicker',filetype:'image',label:'Source',autofocus:true,onchange:function(b){b2(b,e);},onbeforecall:c2},i];if($.hasDescription(e)){a.push({name:'alt',type:'textbox',label:'Image description'});}if($.hasImageTitle(e)){a.push({name:'title',type:'textbox',label:'Image Title'});}if($.hasDimensions(e)){a.push(a2.createUi());}if($.getClassList(e)){a.push({name:'class',type:'listbox',label:'Class',values:Y.buildListItems($.getClassList(e),function(b){if(b.value){b.textStyle=function(){return e.formatter.getCssText({inline:'img',classes:[b.value]});};}})});}if($.hasImageCaption(e)){a.push({name:'caption',type:'checkbox',label:'Caption'});}return a;};var e2=function(e,i){return{title:'General',type:'form',items:d2(e,i)};};var f2={makeTab:e2,getGeneralItems:d2};var g2=function(){return K.getOrDie('URL');};var h2=function(b){return g2().createObjectURL(b);};var i2=function(u){g2().revokeObjectURL(u);};var j2={createObjectURL:h2,revokeObjectURL:i2};var k2=tinymce.util.Tools.resolve('tinymce.ui.Factory');function l2(){var f=K.getOrDie('XMLHttpRequest');return new f();}var m2=function(){};var n2=function(p,a){if(p){return p.replace(/\/$/,'')+'/'+a.replace(/^\//,'');}return a;};function o2(a){var b=function(j,o,p,t){var x,S2;x=new l2();x.open('POST',a.url);x.withCredentials=a.credentials;x.upload.onprogress=function(e){t(e.loaded/e.total*100);};x.onerror=function(){p('Image upload failed due to a XHR Transport error. Code: '+x.status);};x.onload=function(){var e;if(x.status<200||x.status>=300){p('HTTP Error: '+x.status);return;}e=JSON.parse(x.responseText);if(!e||typeof e.location!=='string'){p('Invalid JSON: '+x.responseText);return;}o(n2(a.basePath,e.location));};S2=new FormData();S2.append('file',j.blob(),j.filename());x.send(S2);};var u=function(e,j){return new M(function(D,o){try{j(e,D,o,m2);}catch(p){o(p.message);}});};var i=function(e){return e===b;};var f=function(e){return!a.url&&i(a.handler)?M.reject('Upload url missing from the settings.'):u(e,a.handler);};a=N.extend({credentials:false,handler:b},a);return{upload:f};}var p2=function(e){return function(a){var b=k2.get('Throbber');var f=a.control.rootControl;var t=new b(f.getEl());var i=a.control.value();var j=j2.createObjectURL(i);var u=o2({url:$.getUploadUrl(e),basePath:$.getUploadBasePath(e),credentials:$.getUploadCredentials(e),handler:$.getUploadHandler(e)});var o=function(){t.hide();j2.revokeObjectURL(j);};t.show();return Y.blobToDataUri(i).then(function(p){var x=e.editorUpload.blobCache.create({blob:i,blobUri:j,name:i.name?i.name.replace(/\.[^\.]+$/,''):null,base64:p.split(',')[1]});return u.upload(x).then(function(g2){var S2=f.find('#src');S2.value(g2);f.find('tabpanel')[0].activateTab(0);S2.fire('change');o();return g2;});}).catch(function(p){e.windowManager.alert(p);o();});};};var q2='.jpg,.jpeg,.png,.gif';var r2=function(e){return{title:'Upload',type:'form',layout:'flex',direction:'column',align:'stretch',padding:'20 20 20 20',items:[{type:'container',layout:'flex',direction:'column',align:'center',spacing:10,items:[{text:'Browse for an image',type:'browsebutton',accept:q2,onchange:p2(e)},{text:'OR',type:'label'}]},{text:'Drop an image here',type:'dropzone',accept:q2,height:100,onchange:p2(e)}]};};var s2={makeTab:r2};var t2=function(){var x=[];for(var a=0;a<arguments.length;a++){x[a]=arguments[a];}};var u2=function(f){return function(){var x=[];for(var a=0;a<arguments.length;a++){x[a]=arguments[a];}return f();};};var v2=function(f,a){return function(){var x=[];for(var b=0;b<arguments.length;b++){x[b]=arguments[b];}return f(a.apply(null,arguments));};};var w2=function(a){return function(){return a;};};var x2=function(x){return x;};var y2=function(a,b){return a===b;};var z2=function(f){var x=[];for(var a=1;a<arguments.length;a++){x[a-1]=arguments[a];}var b=new Array(arguments.length-1);for(var i=1;i<arguments.length;i++)b[i-1]=arguments[i];return function(){var x=[];for(var a=0;a<arguments.length;a++){x[a]=arguments[a];}var e=new Array(arguments.length);for(var j=0;j<e.length;j++)e[j]=arguments[j];var o=b.concat(e);return f.apply(null,o);};};var A2=function(f){return function(){var x=[];for(var a=0;a<arguments.length;a++){x[a]=arguments[a];}return!f.apply(null,arguments);};};var B2=function(a){return function(){throw new Error(a);};};var C2=function(f){return f();};var D2=function(f){f();};var E2=w2(false);var F2=w2(true);var G2={noop:t2,noarg:u2,compose:v2,constant:w2,identity:x2,tripleEquals:y2,curry:z2,not:A2,die:B2,apply:C2,call:D2,never:E2,always:F2};var H2=function(e,a){var b=a.control.getRoot();a2.updateSize(b);e.undoManager.transact(function(){var f=h1.merge(M1(e),b.toJSON());R1(e,f);});e.editorUpload.uploadImagesAuto();};function I2(a){function b(i){var f=M1(a);var j,p;if(i){p={type:'listbox',label:'Image list',name:'image-list',values:Y.buildListItems(i,function(e){e.value=a.convertURL(e.value||e.url,'src');},[{text:'None',value:''}]),value:f.src&&a.convertURL(f.src,'src'),onselect:function(e){var u=j.find('#alt');if(!u.value()||e.lastControl&&u.value()===e.lastControl.text()){u.value(e.control.text());}j.find('#src').value(e.control.value()).fire('change');},onPostRender:function(){p=this;}};}if($.hasAdvTab(a)||$.hasUploadUrl(a)||$.hasUploadHandler(a)){var t=[f2.makeTab(a,p)];if($.hasAdvTab(a)){t.push(V1.makeTab(a));}if($.hasUploadUrl(a)||$.hasUploadHandler(a)){t.push(s2.makeTab(a));}j=a.windowManager.open({title:'Insert/edit image',data:f,bodyType:'tabpanel',body:t,onSubmit:G2.curry(H2,a)});}else{j=a.windowManager.open({title:'Insert/edit image',data:f,body:f2.getGeneralItems(a,p),onSubmit:G2.curry(H2,a)});}a2.syncSize(j);}function o(){Y.createImageList(a,b);}return{open:o};}var J2=function(e){e.addCommand('mceImage',I2(e).open);};var K2={register:J2};var L2=function(a){var b=a.attr('class');return b&&/\bimage\b/.test(b);};var M2=function(a){return function(b){var i=b.length,e;var t=function(e){e.attr('contenteditable',a?'true':null);};while(i--){e=b[i];if(L2(e)){e.attr('contenteditable',a?'false':null);N.each(e.getAll('figcaption'),t);}}};};var N2=function(e){e.on('preInit',function(){e.parser.addNodeFilter('figure',M2(true));e.serializer.addNodeFilter('figure',M2(false));});};var O2={setup:N2};var P2=function(e){e.addButton('image',{icon:'image',tooltip:'Insert/edit image',onclick:I2(e).open,stateSelector:'img:not([data-mce-object],[data-mce-placeholder]),figure.image'});e.addMenuItem('image',{icon:'image',text:'Image',onclick:I2(e).open,context:'insert',prependToContext:true});};var Q2={register:P2};g.add('image',function(e){O2.setup(e);Q2.register(e);K2.register(e);});function R2(){}return R2;}());})();