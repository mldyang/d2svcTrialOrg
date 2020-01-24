({
	init : function(cmp, event, helper) {
		helper.getQueuesHelper(cmp,event,helper);
        helper.createRecipeActivity(cmp,{action: 'Load', recipe: 'Queue', feature:'Recipe'});
	},
    
    next : function(cmp, event, helper) {
        var section;
        var sectionDisplay = cmp.get('v.sectionDisplay');
        var atLeastOneQueueSelected = false;
        if(sectionDisplay['deskGroups']){
            section = 'deskGroups';
            var atLeastOneQueueSelected = false;
            var queues = cmp.get('v.queues');
            queues = helper.createQueueDeveloperNames(cmp,event,helper, queues);
            cmp.set('v.queues',queues);
            sectionDisplay['deskGroups'] = false;
            sectionDisplay['manualQueues'] = true;
        } 
        else if(sectionDisplay['manualQueues']){
            section = 'manualQueues';
            var queues = cmp.get('v.queues');
            var manualqueuesCopy = cmp.get('v.manualQueues').slice();
            for(var num in manualqueuesCopy){
                if(!manualqueuesCopy[num].name){
                    manualqueuesCopy.splice(num,1);
                }
            }
            queues = queues.concat(manualqueuesCopy);
            cmp.set('v.queues',queues);
            
            var atLeastOneQueueSelected = false;
            for(var num in queues){
                var queue = queues[num];
                if(queue.selected){
                    atLeastOneQueueSelected = true;
                    break;
                }
            }
            if(!atLeastOneQueueSelected){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','No Group/Queue Selected');
                cmp.set('v.isProcessing',false);
                return false;
            }
         	helper.createQueuesHelper(cmp,event,helper);  
            sectionDisplay['manualQueues'] = false;
            sectionDisplay['createQueues'] = true;
        }
        else if(sectionDisplay['createQueues']){
            section = 'createQueues';
            var queues = cmp.get('v.queues');
            for(var num in queues){
                var queue = queues[num];
                if(queue.selected && (queue.inDesk || queue.isManual)){
                    if(helper.validateDeskGroupsSelected(cmp,event,helper,true)){
                   		helper.createQueuesHelper(cmp, event, helper);
                    }
                    return;
                }
            }
            sectionDisplay['createQueues'] = false;
            sectionDisplay['complete'] = true;
            cmp.set('v.goBackTo','createQueues');
            
        }else if(sectionDisplay['complete']){
            section = 'complete';
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }
        cmp.set('v.sectionDisplay',sectionDisplay);
        helper.createRecipeActivity(cmp,{action: 'Next', recipe: 'Queue', feature:'Recipe', section: section});
    },
    
    back : function(cmp, event, helper) {
        var sectionDisplay = cmp.get('v.sectionDisplay');
        var section;
        cmp.set('v.showErrors',false);
        if(sectionDisplay['deskGroups']){
            section = 'deskGroups';
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }
        else if(sectionDisplay['manualQueues']){
            section = 'manualQueues';
            sectionDisplay['deskGroups'] = true;
            sectionDisplay['manualQueues'] = false; 
        }
        else if(sectionDisplay['createQueues']){
            section = 'createQueues';
            sectionDisplay['manualQueues'] = true;
            sectionDisplay['createQueues'] = false;
            helper.getQueuesHelper(cmp,event,helper);
            cmp.find('nextButton').set('v.disabled','false');
        }else if(sectionDisplay['complete']){
            section = 'complete';
            sectionDisplay['createQueues'] = true;
            sectionDisplay['complete'] = false;
        }
		cmp.set('v.sectionDisplay',sectionDisplay);
        helper.createRecipeActivity(cmp,{action: 'Back', recipe: 'Queue', feature:'Recipe', section: section});
	},
    
    validateDeveloperName: function(cmp, event, helper){
        
    	var developerName = event.getSource().get('v.value');
        var name = event.getSource().get('v.name');
        var queues = cmp.get('v.queues');
        var row = parseInt(name.replace('sfDeveloperName',''));
        if(!helper.validateDeveloperName(developerName)){
            queues[row].sfDeveloperNameError = 'Developer name must begin with a letter and use only alphanumeric characters and underscores. The name cannot end with an underscore or have two consecutive underscores.';
        }else{
            queues[row].sfDeveloperNameError = '';
        }
        cmp.set('v.queues',queues);
        console.log('developerName:',developerName);
    },
    
    validateQueue: function(cmp, event, helper){
        var queuename = event.getSource().get('v.value');
        var name = event.getSource().get('v.name');
        var queues = cmp.get('v.manualQueues');
        var row = parseInt(name.replace('queue',''));
        var queueDeveloperName = queuename.split(' ').join('_');
        if(!helper.validateDeveloperName(queueDeveloperName)){
            queues[row].queuenameError = 'The Queue Name field can only contain underscores and alphanumeric characters. It must be unique, begin with a letter, not end with an underscore, and not contain two consecutive underscores.';
        }else{
            queues[row].queuenameError = '';
            queues[row].sfDeveloperName = queueDeveloperName;
            queues[row].isManual = true;
            queues[row].selected = true;
        }
        
        cmp.set('v.manualQueues',queues);
        console.log('manualQueueName:',queuename);
        
    },

    addManualQueueRow: function(cmp, event, helper){
        var queues = cmp.get('v.manualQueues');
        var newQueue = {'name':'', 'error':''};
        queues.push(newQueue);
        cmp.set('v.manualQueues', queues);
        console.log(queues.length);
    },
    
    delManualQueueRow: function(cmp, event, helper) {
        var name = event.target.name;
        var row = parseInt(name.replace('del',''));
        var manualQueues = cmp.get('v.manualQueues')
        manualQueues.splice(row,1);
        cmp.set('v.manualQueues',manualQueues);
        return;
    }
})