/* Ephox link checker plugin
 *
 * Copyright 2010-2017 Ephox Corporation.  All rights reserved.
 *
 * Version: 1.1.1-58
 */
!function(){"use strict";var n,t,r,e,o,u,i=function(e,o){return function(){for(var n=[],t=0;t<arguments.length;t++)n[t]=arguments[t];var r=e.console;r&&o in r&&r[o].apply(r,arguments)}},l={log:i(window,"log"),error:i(window,"error"),warn:i(window,"warm")},c=function(n){return parseInt(n,10)},a=function(n){return function(){return n}},f=function(n,t,r){return{major:a(n),minor:a(t),patch:a(r)}},s=function(n,t){var r=n-t;return 0===r?0:0<r?1:-1},p=function(n){var t=/([0-9]+)\.([0-9]+)\.([0-9]+)(?:(\-.+)?)/.exec(n);return t?f(c(t[1]),c(t[2]),c(t[3])):f(0,0,0)},m=function(n,t){var r=s(n.major(),t.major());if(0!==r)return r;var e=s(n.minor(),t.minor());if(0!==e)return e;var o=s(n.patch(),t.patch());return 0!==o?o:0},d=function(n){return n?p([(t=n).majorVersion,t.minorVersion].join(".").split(".").slice(0,3).join(".")):null;var t},h=function(n,t){return m(d(n),p(t))<0},v=function(t,r){var e,n;return(n=function(){var n=arguments;clearTimeout(e),e=setTimeout(function(){t.apply(this,n)},r)}).stop=function(){clearTimeout(e)},n},g=function(n){return function(){return n}},y=g(!1),w=g(!0),k={noop:function(){for(var n=[],t=0;t<arguments.length;t++)n[t]=arguments[t]},noarg:function(r){return function(){for(var n=[],t=0;t<arguments.length;t++)n[t]=arguments[t];return r()}},compose:function(r,e){return function(){for(var n=[],t=0;t<arguments.length;t++)n[t]=arguments[t];return r(e.apply(null,arguments))}},constant:g,identity:function(n){return n},tripleEquals:function(n,t){return n===t},curry:function(u){for(var n=[],t=1;t<arguments.length;t++)n[t-1]=arguments[t];for(var i=new Array(arguments.length-1),r=1;r<arguments.length;r++)i[r-1]=arguments[r];return function(){for(var n=[],t=0;t<arguments.length;t++)n[t]=arguments[t];for(var r=new Array(arguments.length),e=0;e<r.length;e++)r[e]=arguments[e];var o=i.concat(r);return u.apply(null,o)}},not:function(r){return function(){for(var n=[],t=0;t<arguments.length;t++)n[t]=arguments[t];return!r.apply(null,arguments)}},die:function(n){return function(){throw new Error(n)}},apply:function(n){return n()},call:function(n){n()},never:y,always:w},b=k.never,x=k.always,O=function(){return T},T=(e={fold:function(n,t){return n()},is:b,isSome:b,isNone:x,getOr:r=function(n){return n},getOrThunk:t=function(n){return n()},getOrDie:function(n){throw new Error(n||"error: getOrDie called on none.")},or:r,orThunk:t,map:O,ap:O,each:function(){},bind:O,flatten:O,exists:b,forall:x,filter:O,equals:n=function(n){return n.isNone()},equals_:n,toArray:function(){return[]},toString:k.constant("none()")},Object.freeze&&Object.freeze(e),e),j=function(r){var n=function(){return r},t=function(){return o},e=function(n){return n(r)},o={fold:function(n,t){return t(r)},is:function(n){return r===n},isSome:x,isNone:b,getOr:n,getOrThunk:n,getOrDie:n,or:t,orThunk:t,map:function(n){return j(n(r))},ap:function(n){return n.fold(O,function(n){return j(n(r))})},each:function(n){n(r)},bind:e,flatten:n,exists:e,forall:e,filter:function(n){return n(r)?o:T},equals:function(n){return n.is(r)},equals_:function(n,t){return n.fold(b,function(n){return t(r,n)})},toArray:function(){return[r]},toString:function(){return"some("+r+")"}};return o},E={some:j,none:O,from:function(n){return null==n?T:j(n)}},A=function(t){return function(n){return function(n){if(null===n)return"null";var t=typeof n;return"object"===t&&Array.prototype.isPrototypeOf(n)?"array":"object"===t&&String.prototype.isPrototypeOf(n)?"string":t}(n)===t}},S={isString:A("string"),isObject:A("object"),isArray:A("array"),isNull:A("null"),isBoolean:A("boolean"),isUndefined:A("undefined"),isFunction:A("function"),isNumber:A("number")},D=void 0===(o=Array.prototype.indexOf)?function(n,t){return q(n,t)}:function(n,t){return o.call(n,t)},C=function(n,t){return-1<D(n,t)},M=function(n,t){for(var r=n.length,e=new Array(r),o=0;o<r;o++){var u=n[o];e[o]=t(u,o,n)}return e},R=function(n,t){for(var r=0,e=n.length;r<e;r++)t(n[r],r,n)},_=function(n,t){for(var r=[],e=0,o=n.length;e<o;e++){var u=n[e];t(u,e,n)&&r.push(u)}return r},q=function(n,t){for(var r=0,e=n.length;r<e;++r)if(n[r]===t)return r;return-1},P=Array.prototype.push,L=function(n){for(var t=[],r=0,e=n.length;r<e;++r){if(!Array.prototype.isPrototypeOf(n[r]))throw new Error("Arr.flatten item "+r+" was not an array, input: "+n);P.apply(t,n[r])}return t},I=function(n,t){for(var r=0,e=n.length;r<e;++r)if(!0!==t(n[r],r,n))return!1;return!0},N=(Array.prototype.slice,S.isFunction(Array.from)&&Array.from,M),B=R,U=_,F=function(n,t,r){return R(n,function(n){r=t(r,n)}),r},W=function(n,t){for(var r=0,e=n.length;r<e;r++){var o=n[r];if(t(o,r,n))return E.some(o)}return E.none()},z=L,V=I,H=C,$=function(n){var r=E.none(),t=[],e=function(n){o()?i(n):t.push(n)},o=function(){return r.isSome()},u=function(n){B(n,i)},i=function(t){r.each(function(n){setTimeout(function(){t(n)},0)})};return n(function(n){r=E.some(n),u(t),t=[]}),{get:e,map:function(r){return $(function(t){e(function(n){t(r(n))})})},isReady:o}},Y={nu:$,pure:function(t){return $(function(n){n(t)})}},J=function(r){return function(){var n=Array.prototype.slice.call(arguments),t=this;setTimeout(function(){r.apply(t,n)},0)}},X=function(t){var n=function(n){t(J(n))};return{map:function(e){return X(function(r){n(function(n){var t=e(n);r(t)})})},bind:function(r){return X(function(t){n(function(n){r(n).get(t)})})},anonBind:function(r){return X(function(t){n(function(n){r.get(t)})})},toLazy:function(){return Y.nu(n)},get:n}},K={nu:X,pure:function(t){return X(function(n){n(t)})}},G=function(r){return{is:function(n){return r===n},isValue:k.always,isError:k.never,getOr:k.constant(r),getOrThunk:k.constant(r),getOrDie:k.constant(r),or:function(n){return G(r)},orThunk:function(n){return G(r)},fold:function(n,t){return t(r)},map:function(n){return G(n(r))},each:function(n){n(r)},bind:function(n){return n(r)},exists:function(n){return n(r)},forall:function(n){return n(r)},toOption:function(){return E.some(r)}}},Q=function(r){return{is:k.never,isValue:k.never,isError:k.always,getOr:k.identity,getOrThunk:function(n){return n()},getOrDie:function(){return k.die(String(r))()},or:function(n){return n},orThunk:function(n){return n()},fold:function(n,t){return n(r)},map:function(n){return Q(r)},each:k.noop,bind:function(n){return Q(r)},exists:k.never,forall:k.always,toOption:E.none}},Z={value:G,error:Q},nn={pure:k.compose(K.pure,Z.value),failed:k.compose(K.pure,Z.error),foldSync:function(n,t,r){return n.map(function(n){return n.fold(t,r)})},bindSync:function(n,t){return n.map(function(n){return n.bind(t)})},bindAsync:function(n,t){return n.bind(function(n){return n.bind(t)})},mapSync:function(n,t){return n.map(function(n){return n.map(t)})},handle:function(n,t,r){return n.get(function(n){return n.fold(t,r)})}},tn=void 0===(u=Object.keys)?function(n){var t=[];for(var r in n)n.hasOwnProperty(r)&&t.push(r);return t}:u,rn=function(n,t){for(var r=tn(n),e=0,o=r.length;e<o;e++){var u=r[e];t(n[u],u,n)}},en=function(e,o){var u={};return rn(e,function(n,t){var r=o(n,t,e);u[r.k]=r.v}),u},on=function(n,r){var e=[];return rn(n,function(n,t){e.push(r(n,t))}),e},un=function(n){return on(n,function(n){return n})},cn={bifilter:function(n,r){var e={},o={};return rn(n,function(n,t){(r(n,t)?e:o)[t]=n}),{t:e,f:o}},each:rn,map:function(n,e){return en(n,function(n,t,r){return{k:t,v:e(n,t,r)}})},mapToArray:on,tupleMap:en,find:function(n,t){for(var r=tn(n),e=0,o=r.length;e<o;e++){var u=r[e],i=n[u];if(t(i,u,n))return E.some(i)}return E.none()},keys:tn,values:un,size:function(n){return un(n).length}},an=function(i){if(!S.isArray(i))throw new Error("cases must be an array");if(0===i.length)throw new Error("there must be at least one case");var c=[],r={};return B(i,function(n,e){var t=cn.keys(n);if(1!==t.length)throw new Error("one and only one name per case");var o=t[0],u=n[o];if(void 0!==r[o])throw new Error("duplicate key detected:"+o);if("cata"===o)throw new Error("cannot have a case named cata (sorry)");if(!S.isArray(u))throw new Error("case arguments must be an array");c.push(o),r[o]=function(){var n=arguments.length;if(n!==u.length)throw new Error("Wrong number of arguments to case "+o+". Expected "+u.length+" ("+u+"), got "+n);for(var r=new Array(n),t=0;t<r.length;t++)r[t]=arguments[t];return{fold:function(){if(arguments.length!==i.length)throw new Error("Wrong number of arguments to fold. Expected "+i.length+", got "+arguments.length);return arguments[e].apply(null,r)},match:function(n){var t=cn.keys(n);if(c.length!==t.length)throw new Error("Wrong number of arguments to match. Expected: "+c.join(",")+"\nActual: "+t.join(","));if(!V(c,function(n){return H(t,n)}))throw new Error("Not all branches were specified when using match. Specified: "+t.join(", ")+"\nRequired: "+c.join(", "));return n[o].apply(null,r)},log:function(n){console.log(n,{constructors:c,constructor:o,params:r})}}}}),r},fn=an([{invalid:["invalidUrl"]},{unknown:["unknownUrl"]},{valid:["validUrl"]}]),ln=function(n,t,r,e){return n.fold(t,r,e)},sn=function(n,t){return"VALID"===t?fn.valid(n):"INVALID"===t?fn.invalid(n):fn.unknown(n)},pn=function(n){return n&&/^https?:\/\//.test(n)},mn=function(n){return 0===n.indexOf("mailto:")||"#"===n.charAt(0)},dn=function(n){return/^\w+:/.test(n)},hn=tinymce.DOM,vn=tinymce.util.Tools,gn="data-mce-linkchecker-status",yn="data-mce-linkchecker-focus",wn=function(n,t){hn.setAttrib(n,gn,t)},kn=function(n){return{url:n}},bn=function(t,n){return vn.map(n,function(n){return{url:t(kn(hn.getAttrib(n,"href"))).url,elm:n}})},xn=function(n,t){return vn.grep(n,function(n){return n.url===t})},On=function(t){return function(n){vn.each(n,function(n){n.attr(t,null)})}},Tn=function(n){var t=hn.select("a[href]",n);return vn.map(t,function(n){return kn(hn.getAttrib(n,"href"))})},jn=function(n){wn(n,null)},En=function(n,t,r){var e=bn(t,hn.select("a[href]",n));vn.each(r,function(n,t){vn.each(xn(e,t),function(t){ln(n.result,function(n){wn(t.elm,"invalid")},function(n){wn(t.elm,"unknown")},function(n){wn(t.elm,"valid")})})})},An=function(n,t,r){var e=bn(t,hn.select("a[href]",n));vn.each(r,function(n){vn.each(xn(e,n.url),function(n){wn(n.elm,"invalid")})})},Sn=function(n){return"invalid"===hn.getAttrib(n,gn)},Dn=function(n,t){return hn.setAttrib(n,yn,t?"true":null)},Cn=function(n){n.addTempAttr(gn),n.addTempAttr(yn),n.addAttributeFilter(gn,On(gn)),n.addAttributeFilter(yn,On(gn))},Mn=function(c){return function(n){var t,r,e,o=n.url.trim(),u=!1===pn(t=o)&&dn(t)?o:c.documentBaseURI.toAbsolute(o),i=(0===u.indexOf("//")?location.protocol+u:u).replace(/ /g,"%20");return kn((r=i,(e=document.createElement("a")).href=r,pn(r)?e.href:r))}},Rn=function(n){return function(){n.execCommand("mceLink")}},_n=function(n,t){return function(){!function(n){if(!tinymce.Env.ie||10<tinymce.Env.ie){var t=document.createElement("a");t.target="_blank",t.href=n,t.rel="noreferrer noopener";var r=document.createEvent("MouseEvents");r.initMouseEvent("click",!0,!0,window,!0,0,0,0,0,!1,!1,!1,!1,0,null),t.dispatchEvent(r)}else{var e=window.open("","_blank");if(e){e.opener=null;var o=e.document;o.open(),o.write('<meta http-equiv="refresh" content="0; url='+tinymce.DOM.encode(n)+'">'),o.close()}}}(Mn(n)({url:tinymce.DOM.getAttrib(t,"href")}).url)}},qn=function(n,t){return function(){n.undoManager.transact(function(){tinymce.DOM.remove(t,!0)})}},Pn=function(n,t){return function(){n.add(t.href),jn(t)}},Ln=tinymce.DOM,In=function(n,t,r){var e,o,u,i,c,a,f,l=new tinymce.ui.Factory.create("menu",{items:[(e=n,e.plugins.link?{text:"Link",icon:"link",onclick:Rn(e)}:null),{text:"Open link",icon:"newtab",onclick:_n(n,t)},{text:"Remove link",icon:"unlink",onclick:qn(n,t)},{text:"-"},{text:"Ignore",onclick:Pn(r,t)}],context:"contextmenu",onhide:function(){l.remove(),Dn(t,!1)}});l.renderTo(document.body),o=n,u=l,i=t,c=Ln.getPos(o.getContentAreaContainer()),a=o.dom.getPos(i),"BODY"===(f=o.dom.getRoot()).nodeName?(a.x-=f.ownerDocument.documentElement.scrollLeft||f.scrollLeft,a.y-=f.ownerDocument.documentElement.scrollTop||f.scrollTop):(a.x-=f.scrollLeft,a.y-=f.scrollTop),c.x+=a.x,c.y+=a.y,u.moveTo(c.x,c.y+i.offsetHeight+1),Dn(t,!0)},Nn=function(n,t){var r,e;n.on("contextmenu",(r=n,e=t,function(n){var t=r.dom.getParent(n.target,"a[href]");Sn(t)&&(n.preventDefault(),n.stopImmediatePropagation(),In(r,t,e))}),!0)},Bn=tinymce.util.Tools,Un=function(n,t){return Bn.grep(n,function(n){return!1===t.has(n.url)})},Fn=function(t){return function(n){return pn(n.url)===t}},Wn=function(n,t,r,e,o){var u,i=Bn.grep(Bn.map(Tn(o),r),Fn(!1)),c=Un((u=i,Bn.grep(u,function(n){return!1===mn(n.url)})),t);An(o,r,c)},zn=function(n,t,r,e,o){var u,i,c,a,f,l,s,p=o.getBody();u=n,i=t,c=r,a=e,f=p,l=Bn.grep(Bn.map(Tn(f),c),Fn(!0)),s=u.checkMany(Un(l,i)),nn.handle(s,function(n){a.showError(n)},function(n){En(f,c,n)}),Wn(0,t,r,0,p)},Vn=function(n,t,r,e,o,u){var i,c,a=v(zn,500);Cn(n.serializer),n.dom.loadCSS((i=n.settings,c=u,i.linkchecker_content_css||c+"/content.min.css")),n.on("change setContent undo redo",function(){a(e,t,r,o,n)}),zn(e,t,r,o,n),Nn(n,t)},Hn=function(n,t){return function(){return{status:n,message:t}}},$n=Hn("invalid","Url does not seem to be valid"),Yn=Hn("none",""),Jn=Hn("valid","The url seem to be valid"),Xn=function(n,e,t){var o,u,i=v((o=n,u=t,function(n,t){var r=u.checkOne(n.url,o);nn.handle(r,function(n){t({status:"none",message:""})},function(n){ln(n.result,function(n){t($n())},function(n){t(Yn())},function(n){t(Jn())})})}),500);return function(n,t){var r=e({url:n.url});!pn(r.url)&&mn(r.url)?t(Jn()):pn(r.url)?i(r,t):t(Yn())}},Kn=function(n,t,r,e){"filepicker_validator_handler"in n==0&&(n.filepicker_validator_handler=Xn(t,r,e))},Gn=function(i){return function(){for(var n=new Array(arguments.length),t=0;t<n.length;t++)n[t]=arguments[t];if(0===n.length)throw new Error("Can't merge zero objects");for(var r={},e=0;e<n.length;e++){var o=n[e];for(var u in o)o.hasOwnProperty(u)&&(r[u]=i(r[u],o[u]))}return r}},Qn=Gn(function(n,t){return S.isObject(n)&&S.isObject(t)?Qn(n,t):t}),Zn=Gn(function(n,t){return t}),nt={deepMerge:Qn,merge:Zn},tt=(an([{bothErrors:["error1","error2"]},{firstError:["error1","value2"]},{secondError:["value1","error2"]},{bothValues:["value1","value2"]}]),function(n){var t=[],r=[];return B(n,function(n){n.fold(function(n){t.push(n)},function(n){r.push(n)})}),{errors:t,values:r}}),rt=function(n){return k.compose(Z.error,z)(n)},et=function(n,t){var r,e,o=tt(n);return 0<o.errors.length?rt(o.errors):(r=o.values,e=t,Z.value(nt.deepMerge.apply(void 0,[e].concat(r))))},ot=function(n){var t=tt(n);return 0<t.errors.length?rt(t.errors):Z.value(t.values)},ut=function(n,t){return e=t,(r=n).hasOwnProperty(e)?E.from(r[e]):E.none();var r,e},it=function(n,t){var r={};return r[n]=t,r},ct=function(n,t){return r=t,e={},B(n,function(n){var t=n[r];e[t]=n}),e;var r,e},at=function(n){return n.slice(0).sort()},ft=function(n,t){throw new Error("All required keys ("+at(n).join(", ")+") were not specified. Specified keys were: "+at(t).join(", ")+".")},lt=function(n){throw new Error("Unsupported keys for object: "+at(n).join(", "))},st=function(t,n){if(!S.isArray(n))throw new Error("The "+t+" fields must be an array. Was: "+n+".");B(n,function(n){if(!S.isString(n))throw new Error("The value "+n+" in the "+t+" fields was not a string.")})},pt=function(n){var r=at(n);W(r,function(n,t){return t<r.length-1&&n===r[t+1]}).each(function(n){throw new Error("The field: "+n+" occurs more than once in the combined fields: ["+r.join(", ")+"].")})},mt={immutable:function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];return function(){for(var r=[],n=0;n<arguments.length;n++)r[n]=arguments[n];if(t.length!==r.length)throw new Error('Wrong number of arguments to struct. Expected "['+t.length+']", got '+r.length+" arguments");var e={};return B(t,function(n,t){e[n]=k.constant(r[t])}),e}},immutableBag:function(o,u){var i=o.concat(u);if(0===i.length)throw new Error("You must specify at least one required or optional field.");return st("required",o),st("optional",u),pt(i),function(t){var r=cn.keys(t);V(o,function(n){return H(r,n)})||ft(o,r);var n=U(r,function(n){return!H(i,n)});0<n.length&&lt(n);var e={};return B(o,function(n){e[n]=k.constant(t[n])}),B(u,function(n){e[n]=k.constant(Object.prototype.hasOwnProperty.call(t,n)?E.some(t[n]):E.none())}),e}}},dt={now:function(){return(new Date).getTime()}},ht=36e5,vt=an([{strict:[]},{defaultedThunk:["fallbackThunk"]},{asOption:[]},{asDefaultedOptionThunk:["fallbackThunk"]},{mergeWithThunk:["baseThunk"]}]),gt=vt.strict,yt=(vt.asOption,vt.defaultedThunk,vt.asDefaultedOptionThunk,vt.mergeWithThunk,an([{setOf:["validator","valueType"]},{arrOf:["valueType"]},{objOf:["fields"]},{itemOf:["validator"]},{choiceOf:["key","branches"]},{thunk:["description"]},{func:["args","outputSchema"]}])),wt=an([{field:["name","presence","type"]},{state:["name"]}]),kt="undefined"!=typeof window?window:Function("return this;")(),bt=function(n,t){for(var r=null!=t?t:kt,e=0;e<n.length&&null!=r;++e)r=r[n[e]];return r},xt=function(n,t){var r=n.split(".");return bt(r,t)},Ot={getOrDie:function(n,t){var r=xt(n,t);if(null==r)throw n+" not available on this browser";return r}},Tt=function(){return Ot.getOrDie("JSON")},jt={parse:function(n){return Tt().parse(n)},stringify:function(n,t,r){return Tt().stringify(n,t,r)}},Et=function(n){return S.isObject(n)&&100<cn.keys(n).length?" removed due to size":jt.stringify(n,null,2)},At=function(n,t){return Z.error([{path:n,getErrorInfo:t}])},St=an([{field:["key","okey","presence","prop"]},{state:["okey","instantiator"]}]),Dt=function(r,e,o){return ut(e,o).fold(function(){return n=o,t=e,At(r,function(){return'Could not find valid *strict* value for "'+n+'" in '+Et(t)});var n,t},Z.value)},Ct=function(n,t,r){var e=ut(n,t).fold(function(){return r(n)},k.identity);return Z.value(e)},Mt=function(o,c,n,a){return n.fold(function(u,t,n,r){var e=function(n){return r.extract(o.concat([u]),a,n).map(function(n){return it(t,a(n))})},i=function(n){return n.fold(function(){var n=it(t,a(E.none()));return Z.value(n)},function(n){return r.extract(o.concat([u]),a,n).map(function(n){return it(t,a(E.some(n)))})})};return n.fold(function(){return Dt(o,c,u).bind(e)},function(n){return Ct(c,u,n).bind(e)},function(){return(n=c,t=u,Z.value(ut(n,t))).bind(i);var n,t},function(n){return(t=c,r=u,e=n,o=ut(t,r).map(function(n){return!0===n?e(t):n}),Z.value(o)).bind(i);var t,r,e,o},function(n){var t=n(c);return Ct(c,u,k.constant({})).map(function(n){return nt.deepMerge(t,n)}).bind(e)})},function(n,t){var r=t(c);return Z.value(it(n,a(r)))})},Rt=function(e){return{extract:function(r,n,t){return e(t,n).fold(function(n){return t=n,At(r,function(){return t});var t},Z.value)},toString:function(){return"val"},toDsl:function(){return yt.itemOf(e)}}},_t=function(c){return{extract:function(n,t,r){return e=n,o=r,u=t,i=N(c,function(n){return Mt(e,o,n,u)}),et(i,{});var e,o,u,i},toString:function(){return"obj{\n"+N(c,function(n){return n.fold(function(n,t,r,e){return n+" -> "+e.toString()},function(n,t){return"state("+n+")"})}).join("\n")+"}"},toDsl:function(){return yt.objOf(N(c,function(n){return n.fold(function(n,t,r,e){return wt.field(n,r,e)},function(n,t){return wt.state(n)})}))}}},qt=k.constant(Rt(Z.value)),Pt=k.compose(function(o){return{extract:function(r,e,n){var t=N(n,function(n,t){return o.extract(r.concat(["["+t+"]"]),e,n)});return ot(t)},toString:function(){return"array("+o.toString()+")"},toDsl:function(){return yt.arrOf(o)}}},_t),Lt=(St.state,St.field),It=Rt(Z.value),Nt=function(n,t,r){return e=n,o=k.identity,u=r,t.extract([e],o,u).fold(function(n){return Z.error({input:u,errors:n})},Z.value);var e,o,u},Bt=function(n,t,r){return Nt(n,t,r).fold(function(n){throw new Error(Ut(n))},k.identity)},Ut=function(n){return"Errors: \n"+(t=n.errors,r=10<t.length?t.slice(0,10).concat([{path:[],getErrorInfo:function(){return"... (only showing first ten failures)"}}]):t,N(r,function(n){return"Failed path: ("+n.path.join(" > ")+")\n"+n.getErrorInfo()}))+"\n\nInput object: "+Et(n.input);var t,r},Ft=(k.constant(It),an([{get:[]},{post:[]},{put:[]},{del:[]}])),Wt={get:Ft.get,post:Ft.post,put:Ft.put,del:Ft.del},zt=function(n,t,r,e){var o=n.bind(function(n){return n.match({file:function(){return E.none()},form:function(){return E.some("application/x-www-form-urlencoded; charset=UTF-8")},json:function(){return E.some("application/json")},plain:function(){return E.some("text/plain")},html:function(){return E.some("text/html")}})}),u=r.match({none:E.none,xhr:k.constant(E.some(!0))}),i=t.match({json:E.none,blob:k.constant(E.some("blob")),xml:k.constant(E.some("document")),html:k.constant(E.some("document")),text:k.constant(E.some("text"))}),c=t.match({json:k.constant("application/json, text/javascript"),blob:k.constant("application/octet-stream"),text:k.constant("text/plain"),html:k.constant("text/html"),xml:k.constant("application/xml, text/xml")})+", */*; q=0.01",a=e;return{contentType:k.constant(o),credentials:k.constant(u),responseType:k.constant(i),accept:k.constant(c),headers:k.constant(a)}},Vt=function(r,n){n.contentType().each(function(n){r.setRequestHeader("Content-Type",n)});var t=n.accept();r.setRequestHeader("Accept",t),n.credentials().each(function(n){r.withCredentials=n}),n.responseType().each(function(n){r.responseType=n});var e=n.headers();cn.each(e,function(n,t){S.isString(t)||S.isString(n)?r.setRequestHeader(t,n):console.error("Request header data was not a string: ",t," -> ",n)})};function Ht(t){return K.nu(function(r){var n=new(Ot.getOrDie("FileReader"));n.onload=function(n){var t=n.target;r(t.result)},n.readAsText(t)})}var $t,Yt,Jt,Xt,Kt,Gt=function(n){try{var t=jt.parse(n);return Z.value(t)}catch(n){return Z.error("Response was not JSON")}},Qt=mt.immutableBag(["message","status","responseText"],[]),Zt={handle:function(r,n,e){var t=function(){return K.pure(e.response)};return n.match({json:function(){return Gt(e.response).fold(t,K.pure)},blob:function(){return n=e,E.from(n.response).map(Ht).getOr(K.pure("no response content"));var n},text:t,html:t,xml:t}).map(function(n){var t=0===e.status?"Unknown HTTP error (possible cross-domain request)":'Could not load url "'+r+'": '+e.statusText;return Qt({message:t,status:e.status,responseText:n})})},nu:Qt},nr=Object.assign||function(n){for(var t,r=1,e=arguments.length;r<e;r++)for(var o in t=arguments[r])Object.prototype.hasOwnProperty.call(t,o)&&(n[o]=t[o]);return n},tr=function(u){return nr({},u,{bindFuture:function(t){return tr(u.bind(function(n){return n.fold(function(){return u},function(n){return t(n)})}))},bindResult:function(t){return tr(u.map(function(n){return n.bind(t)}))},mapResult:function(t){return tr(u.map(function(n){return n.map(t)}))},foldResult:function(t,r){return u.map(function(n){return n.fold(t,r)})},withTimeout:function(n,o){return tr(K.nu(function(t){var r=!1,e=window.setTimeout(function(){r=!0,t(Z.error(o()))},n);u.get(function(n){r||(window.clearTimeout(e),t(n))})}))}})},rr=function(n){return tr(K.nu(n))},er=function(n){return tr(K.pure(Z.value(n)))},or=rr,ur=er,ir=function(n){return tr(K.pure(Z.error(n)))},cr=function(n,t){var r,e,o=function(){return ur(t.response)};return n.match({json:function(){return Gt(t.response).fold(function(n){return ir(Zt.nu({message:n,status:t.status,responseText:t.responseText}))},ur)},blob:o,text:o,html:o,xml:(r="Invalid XML document",e=o,function(){return e().bindResult(function(n){return null===n?Z.error(r):Z.value(n)})})})},ar=function(n,t){return t+n},fr=function(n,t){return n+t},lr=function(n,t){return n.substring(t)},sr=function(n,t){return n.substring(0,n.length-t)},pr=function(n){return""===n?E.none():E.some(n.substr(0,1))},mr=function(n){return""===n?E.none():E.some(n.substring(1))},dr=function(n,t,r){return""===t||!(n.length<t.length)&&n.substr(r,r+t.length)===t},hr=function(n,t){return dr(n,t,0)},vr=function(n,t){return dr(n,t,n.length-t.length)},gr={supplant:function(n,o){return n.replace(/\${([^{}]*)}/g,function(n,t){var r,e=o[t];return"string"==(r=typeof e)||"number"===r?e:n})},startsWith:hr,removeLeading:function(n,t){return hr(n,t)?lr(n,t.length):n},removeTrailing:function(n,t){return vr(n,t)?sr(n,t.length):n},ensureLeading:function(n,t){return hr(n,t)?n:ar(n,t)},ensureTrailing:function(n,t){return vr(n,t)?n:fr(n,t)},endsWith:vr,contains:function(n,t){return-1!==n.indexOf(t)},trim:function(n){return n.replace(/^\s+|\s+$/g,"")},lTrim:function(n){return n.replace(/^\s+/g,"")},rTrim:function(n){return n.replace(/\s+$/g,"")},capitalize:function(n){return pr(n).bind(function(t){return mr(n).map(function(n){return t.toUpperCase()+n})}).getOr(n)}},yr=function(u,i,c,a,f,n){var l=void 0!==n?n:{};return or(function(t){var n=i.match({get:k.constant("get"),put:k.constant("put"),post:k.constant("post"),del:k.constant("delete")}),r=new(Ot.getOrDie("XMLHttpRequest"));r.open(n,u,!0);var e=zt(c,a,f,l);Vt(r,e);var o=function(){Zt.handle(u,a,r).get(function(n){t(Z.error(n))})};r.onload=function(){0!==r.status||gr.startsWith(u,"file:")?r.status<100||400<=r.status?o():cr(a,r).get(t):o()},r.onerror=o,c.fold(function(){r.send()},function(n){var t=n.match({file:k.identity,form:k.identity,json:jt.stringify,plain:k.identity,html:k.identity});r.send(t)})}).toLazy()},wr=function(n,t,r,e){var o=Wt.get();return yr(n,o,E.none(),t,r,e)},kr=function(n,t,r,e,o){var u=Wt.post();return yr(n,u,E.some(t),r,e,o)},br=an([{file:["data"]},{form:["data"]},{json:["data"]},{plain:["data"]},{html:["data"]}]),xr={file:br.file,form:br.form,json:br.json,plain:br.plain,html:br.html},Or=an([{none:[]},{xhr:[]}]),Tr={none:Or.none,xhr:Or.xhr},jr=an([{json:[]},{blob:[]},{text:[]},{html:[]},{xml:[]}]),Er={json:jr.json,blob:jr.blob,text:jr.text,html:jr.html,xml:jr.xml,cata:function(n,t,r,e,o,u){return n.match({json:t,blob:r,text:e,html:o,xml:u})}},Ar=function(n,t){var r=-1===n.indexOf("?")?"?":"&";return t?n+r+"apiKey="+encodeURIComponent(t):n},Sr=function(n){return n.hasOwnProperty("tiny-api-key")?n["tiny-api-key"]:n.hasOwnProperty("tinymce-api-key")?n["tinymce-api-key"]:n["textbox-api-key"]},Dr=function(n){return n.fold(function(n){var t=n.responseText(),r=S.isObject(t)?t:n.message();return Z.error(r)},Z.value)},Cr=function(o,u,i,c){var a=Sr(c);return{execute:function(n){var t=Bt(o+".ajax.service.get",u,n),r=cn.map(t,function(n){return S.isBoolean(n)?String(n):n}),e=Ar(gr.supplant(i,r),a);return wr(e,Er.json(),Tr.xhr(),c).map(Dr)}}},Mr=function(r,e,o,u){var i=Sr(u);return{execute:function(n){var t=Bt(r+".ajax.service.post",e,n);return kr(Ar(o,i),xr.json(t),Er.json(),Tr.xhr(),u).map(Dr)}}},Rr=function(t,o,n,u,r){return!0===r?{known:{},unknown:n}:F(n,function(r,n){var e=u(n);return t(o,e).fold(function(){return{known:r.known,unknown:r.unknown.concat([n])}},function(n){var t=it(e,n);return{known:nt.merge(r.known,t),unknown:r.unknown}})},{known:{},unknown:[]})},_r=function(n,t,r,e,o){return(!0===o?E.none():t.get(e,r)).fold(function(){return n(r,o).map(function(n){return n.map(function(n){return t.set(r,n,e),n})})},function(n){return nn.pure(n)})},qr=function(n,t,r,e,o,u,i){var c,a,f,l,s,p,m,d=Rr(t.get,u,r,o,i);return 0===d.unknown.length?nn.pure(d.known):(c=n,a=t,f=d.known,l=d.unknown,s=e,p=u,m=c(l,i),nn.mapSync(m,function(n){var t=s(n);return cn.each(t,function(n,t){a.set(t,n,p)}),nt.deepMerge(f,t)}))},Pr=[(Xt="url",Lt(Xt,Xt,gt(),qt())),($t="fresh",Yt=!1,Lt($t,$t,(Jt=Yt,vt.defaultedThunk(k.constant(Jt))),qt()))],Lr=_t(Pr),Ir=_t([Lt("urls","urls",gt(),(Kt=Pr,Pt(Kt)))]),Nr={one:k.constant(Lr),many:k.constant(Ir)};function Br(n,t,r){var e,o,u,i,c,a,f,l,s=(e=r,c=void 0!==o?o:ht,a=mt.immutable("result","timestamp"),f={},l=function(n,t,r){f[n]=a(t,r)},S.isObject(e)&&(u=e,i=dt.now(),cn.map(u,function(n,t){i-n.timestamp<c&&l(t,n.result,n.timestamp)})),{set:l,get:function(t,n){return E.from(f[n]).filter(function(n){return t-n.timestamp()<c}).map(function(n){return n.result()})},dump:function(){return cn.map(f,function(n){return{result:n.result(),timestamp:n.timestamp()}})}}),p=Cr("ephox.link.service.one",Nr.one(),n+"/1/check?url=${url}&fresh=${fresh}",t),m=Mr("ephox.link.service.many",Nr.many(),n+"/1/check",t),d=function(n){return{url:n.url,result:sn(n.url,n.result)}};return{checkOne:function(r,n){var t=dt.now(),e=_r(function(n,t){return p.execute({url:encodeURIComponent(r),fresh:t})},s,r,t,void 0!==n&&n);return nn.mapSync(e,d)},checkMany:function(n,t){var r=dt.now(),e=qr(function(n,t){return m.execute({urls:n})},s,n,function(n){return ct(n.results,"url")},function(n){return n.url},r,void 0!==t&&t);return nn.mapSync(e,function(n){return cn.map(n,d)})},dumpCache:s.dump}}var Ur=function(n){var t,r,e,o,u=(t=n.linkchecker_service_url,o=(e=n).api_key,r=o||e.linkchecker_api_key,Br(t,r?{"tinymce-api-key":r}:{}));return{checkOne:function(n){return u.checkOne(n)},checkMany:function(n){return u.checkMany(n)}}},Fr=function(n,t){var r=t.getBoundingClientRect(),e=n.inline?{top:0,left:0}:n.getContentAreaContainer().getBoundingClientRect(),o=n.dom.getViewPort();return{top:r.top+e.top+o.y-r.height,center:r.left+e.left+o.x+r.width/2}},Wr=function(){var l,s=function(){void 0!==l&&(l.parentNode.removeChild(l),l=void 0)};return{add:function(n,t){s();var r,e,o=Fr(n,t);r="This link seems to be invalid.",(e=document.createElement("div")).className="mce-widget mce-tooltip mce-tooltip-s",e.setAttribute("role","presentation"),e.innerHTML='<div class="mce-tooltip-arrow"></div><div style="white-space:pre;" class="mce-tooltip-inner">'+r+"</div>",l=e,document.body.appendChild(l);var u=l.getBoundingClientRect(),i=n.getBody().getBoundingClientRect(),c=o.top-u.height/2,a=o.center-u.width/2;a<=0?(l.className="mce-widget mce-tooltip mce-tooltip-sw",a=o.center):o.center+u.width/2-20>i.width&&(l.className="mce-widget mce-tooltip mce-tooltip-se",a=o.center-u.width);var f="position:absolute;top:"+c+"px;left:"+a+"px;";l.setAttribute("style",f)},remove:s}};tinymce.PluginManager.add("linkchecker",function(a,n){if(h(tinymce,"4.4.3"))return l.error('The "linkchecker" plugin requires at least 4.4.3 version of TinyMCE.'),function(){};var t,r,e,o=Ur(a.settings),u=(t={},{add:function(n){t[n]=!0},has:function(n){return n in t}}),i=Mn(a),c=(r=a,e=0,{showError:function(n){if(e++<5&&!r.removed){var t="string"==typeof n?n:"Unknown error";r.notificationManager.open({text:"Link checker error: "+t,type:"error"})}}}),f=Wr();return a.on("SkinLoaded",function(){"string"!=typeof a.settings.linkchecker_service_url?c.showError("You need to specify the linkchecker_service_url setting"):(Vn(a,u,i,o,c,n),Kn(a.settings,u,i,o))}),a.on("mouseover mouseout",function(n){var t,r,e,o,u,i=n.target,c="mouseover"===n.type;t=f,e=i,o=c,u=(r=a).dom.getParent(e,"a[href]"),Sn(u)&&!0===o?t.add(r,u):t.remove()}),a.on("remove",function(){f.remove()}),{}})}();
