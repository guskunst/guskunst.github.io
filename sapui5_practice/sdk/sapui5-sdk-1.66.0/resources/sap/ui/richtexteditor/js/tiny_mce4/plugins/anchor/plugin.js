(function(){var a=(function(){'use strict';var g=tinymce.util.Tools.resolve('tinymce.PluginManager');var b=function(i){return/^[A-Za-z][A-Za-z0-9\-:._]*$/.test(i);};var c=function(e){var i=e.selection.getNode();var q=i.tagName==='A'&&e.dom.getAttrib(i,'href')==='';return q?i.id||i.name:'';};var d=function(e,i){var q=e.selection.getNode();var t=q.tagName==='A'&&e.dom.getAttrib(q,'href')==='';if(t){q.removeAttribute('name');q.id=i;e.undoManager.add();}else{e.focus();e.selection.collapse(true);e.execCommand('mceInsertContent',false,e.dom.createHTML('a',{id:i}));}};var $={isValidId:b,getId:c,insert:d};var f=function(e,i){if(!$.isValidId(i)){e.windowManager.alert('Id should start with a letter, followed only by letters, numbers, dashes, dots, colons or underscores.');return true;}else{$.insert(e,i);return false;}};var o=function(i){var q=$.getId(i);i.windowManager.open({title:'Anchor',body:{type:'textbox',name:'id',size:40,label:'Id',value:q},onsubmit:function(e){var t=e.data.id;if(f(i,t)){e.preventDefault();}}});};var h={open:o};var r=function(e){e.addCommand('mceAnchor',function(){h.open(e);});};var j={register:r};var k=function(e){return!e.attr('href')&&(e.attr('id')||e.attr('name'))&&!e.firstChild;};var s=function(e){return function(q){for(var i=0;i<q.length;i++){if(k(q[i])){q[i].attr('contenteditable',e);}}};};var l=function(e){e.on('PreInit',function(){e.parser.addNodeFilter('a',s('false'));e.serializer.addNodeFilter('a',s(null));});};var m={setup:l};var n=function(e){e.addButton('anchor',{icon:'anchor',tooltip:'Anchor',cmd:'mceAnchor',stateSelector:'a:not([href])'});e.addMenuItem('anchor',{icon:'anchor',text:'Anchor',context:'insert',cmd:'mceAnchor'});};var p={register:n};g.add('anchor',function(e){m.setup(e);j.register(e);p.register(e);});function P(){}return P;}());})();
