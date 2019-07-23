sap.ui.define(["sap/base/Log","sap/ui/model/odata/AnnotationHelper","sap/suite/ui/generic/template/js/AnnotationHelper","sap/suite/ui/generic/template/lib/testableHelper"],function(L,A,a,t){"use strict";function b(I,E,s,r,S){var p=r&&r[S];var P=p&&p.Path;if(P){a._actionControlExpand(I,P,E.entityType);s="!!${"+P+"} && "+s;}return s;}function i(I,r,E,p,f,v){return(v===1||!f)&&a.areBooleanRestrictionsValidAndPossible(I,r,E.entityType,"Updatable",p);}i.requiresIContext=true;function g(I,r,E,f,s){var h="!${ui>/editable}";if(f&&s){h=h+" && !${DraftAdministrativeData/DraftIsCreatedByMe}";a.formatWithExpandSimple(I,{Path:"DraftAdministrativeData/DraftIsCreatedByMe"},E);}h=b(I,E,h,r,"Updatable");return"{= "+h+"}";}g.requiresIContext=true;function c(I,r,E,f,v){var s;if(f){s=v===1?"!${ui>/editable}":"${ui>/editable}";}else{s="!${ui>/createMode}";}s=b(I,E,s,r,"Deletable");if(s==="${ui>/editable}"){return"{ui>/editable}";}return"{= "+s+"}";}c.requiresIContext=true;function d(s){return!s||"{path: '"+s+"'}";}function e(I,D){var s=A.format(I,D.Action);var l=A.format(I,D.Label)||"";var f=(D.InvocationGrouping&&D.InvocationGrouping.EnumMember)||"";return"._templateEventHandlers.onCallAction('"+s+"', '"+l+"', '"+f+"')";}e.requiresIContext=true;return{isEditButtonRequired:i,getEditActionButtonVisibility:g,getDeleteActionButtonVisibility:c,getActionControlBreakoutVisibility:d,getCallAction:e};},true);
