(function(){var a=(function(){'use strict';var g=tinymce.util.Tools.resolve('tinymce.PluginManager');var b=tinymce.util.Tools.resolve('tinymce.util.Tools');var c=function(e,A,B){var C=A==='UL'?'InsertUnorderedList':'InsertOrderedList';e.execCommand(C,false,B===false?null:{'list-style-type':B});};var $={applyListFormat:c};var r=function(e){e.addCommand('ApplyUnorderedListStyle',function(A,B){$.applyListFormat(e,'UL',B['list-style-type']);});e.addCommand('ApplyOrderedListStyle',function(A,B){$.applyListFormat(e,'OL',B['list-style-type']);});};var d={register:r};var f=function(e){var A=e.getParam('advlist_number_styles','default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman');return A?A.split(/[ ,]/):[];};var h=function(e){var A=e.getParam('advlist_bullet_styles','default,circle,disc,square');return A?A.split(/[ ,]/):[];};var i={getNumberStyles:f,getBulletStyles:h};var j=function(e,A){return e.$.contains(e.getBody(),A);};var k=function(e){return e&&/^(TH|TD)$/.test(e.nodeName);};var l=function(e){return function(A){return A&&/^(OL|UL|DL)$/.test(A.nodeName)&&j(e,A);};};var m=function(e){var A=e.dom.getParent(e.selection.getNode(),'ol,ul');return e.dom.getStyle(A,'listStyleType')||'';};var n={isTableCellNode:k,isListNode:l,getSelectedStyleType:m};var s=function(e){return e.replace(/\-/g,' ').replace(/\b\w/g,function(A){return A.toUpperCase();});};var t=function(e){return b.map(e,function(A){var B=s(A);var C=A==='default'?'':A;return{text:B,data:C};});};var o={toMenuItems:t};var p=function(e,A){for(var B=0;B<e.length;B++){var C=e[B];if(A(C)){return B;}}return-1;};var q=function(A,B){return function(e){var C=e.control;A.on('NodeChange',function(e){var D=p(e.parents,n.isTableCellNode);var E=D!==-1?e.parents.slice(0,D):e.parents;var F=b.grep(E,n.isListNode(A));C.active(F.length>0&&F[0].nodeName===B);});};};var u=function(A){return function(e){var B=n.getSelectedStyleType(A);e.control.items().each(function(C){C.active(C.settings.data===B);});};};var v=function(A,B,C,D,E,F){A.addButton(B,{active:false,type:'splitbutton',tooltip:C,menu:o.toMenuItems(F),onPostRender:q(A,E),onshow:u(A),onselect:function(e){$.applyListFormat(A,E,e.control.settings.data);},onclick:function(){A.execCommand(D);}});};var w=function(e,A,B,C,D,E){e.addButton(A,{active:false,type:'button',tooltip:B,onPostRender:q(e,D),onclick:function(){e.execCommand(C);}});};var x=function(e,A,B,C,D,E){if(E.length>0){v(e,A,B,C,D,E);}else{w(e,A,B,C,D,E);}};var y=function(e){x(e,'numlist','Numbered list','InsertOrderedList','OL',i.getNumberStyles(e));x(e,'bullist','Bullet list','InsertUnorderedList','UL',i.getBulletStyles(e));};var z={register:y};g.add('advlist',function(e){var A=function(e,B){var C=e.settings.plugins?e.settings.plugins:'';return b.inArray(C.split(/[ ,]/),B)!==-1;};if(A(e,'lists')){z.register(e);d.register(e);}});function P(){}return P;}());})();