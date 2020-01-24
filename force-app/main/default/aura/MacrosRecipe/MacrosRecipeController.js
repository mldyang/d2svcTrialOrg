({
	init : function(cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching list of macros from Desk ...');
        helper.getDeskMacrosHelper(cmp,event,helper);

	},
    
     next : function(cmp, event, helper) {
        cmp.set('v.showError',false);
        var sectionDisplay = cmp.get('v.sectionDisplay');
        if(sectionDisplay['macrosList']){
            helper.getDeskMacrosActionsHelper(cmp,event,helper);
        }
        cmp.set('v.sectionDisplay',sectionDisplay); 
     }
    
    
    
})