({
	init : function(cmp, event, helper) {
		helper.getExistingEmailToCaseHelper(cmp,event,helper);
	},
    
    next : function(cmp, event, helper) {
        cmp.set('v.showError',false);
        var sectionDisplay = cmp.get('v.sectionDisplay');
        if(sectionDisplay['model']){
            if(cmp.get('v.modelSelected')){
            	helper.getUsersHelper(cmp,event,helper);
                sectionDisplay['model'] = false;
                sectionDisplay['channel'] = true;
            }

        } 
        else if(sectionDisplay['channel']){
            var newEmails = cmp.get('v.newEmailToCase');
            var existingEmails = cmp.get('v.existingEmailToCase');
            var changed = false;
            for(var num in newEmails){
                for(var key in existingEmails){
                    if(newEmails[num].email == existingEmails[key].email &&
                       newEmails[num].caseOwner != existingEmails[key].caseOwner){
                        changed = true;
                    }
                }
            }
            if(changed){
                helper.updateEmailToCaseHelper(cmp,event,helper);
            }else{
                sectionDisplay['channel'] = false;
                sectionDisplay['complete'] = true;
            }
            
        }else if(sectionDisplay['complete']){
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }
        cmp.set('v.sectionDisplay',sectionDisplay);
    },
    
    back : function(cmp, event, helper) {
        var sectionDisplay = cmp.get('v.sectionDisplay');
        cmp.set('v.showErrors',false);
        if(sectionDisplay['model']){
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }
        else if(sectionDisplay['channel']){
            sectionDisplay['model'] = true;
            sectionDisplay['channel'] = false;
        }else if(sectionDisplay['complete']){
            sectionDisplay['channel'] = true;
            sectionDisplay['complete'] = false;
        }
		cmp.set('v.sectionDisplay',sectionDisplay);
	},
    
    channelUserSelected: function(cmp,event,helper){
        var name = event.getSource().get('v.name');
        var value = event.getSource().get('v.value');
        var row = parseInt(name.replace('userAssignedTo',''));
        var emails = cmp.get('v.newEmailToCase');
        if(value != ''){
            emails[row].caseOwnerType='User';	
        }else{
            emails[row].caseOwnerType='';
        }
        cmp.set('v.newEmailToCase',emails);
    },
    
    channelQueueSelected: function(cmp,event,helper){
        var name = event.getSource().get('v.name');
        var value = event.getSource().get('v.value');
        var row = parseInt(name.replace('queueAssignedTo',''));
        var emails = cmp.get('v.newEmailToCase');
        if(value != ''){
            emails[row].caseOwnerType='Queue';	
        }else{
            emails[row].caseOwnerType='';
        }
        cmp.set('v.newEmailToCase',emails);
    }
})