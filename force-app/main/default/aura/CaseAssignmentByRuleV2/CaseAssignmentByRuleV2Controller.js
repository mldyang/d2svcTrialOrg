({
	init : function(cmp, event, helper) {
        helper.getExistingActiveAssignmentRule(cmp,event,helper);
        helper.createRecipeActivity(cmp,{action: 'Load', recipe: 'Assignment Rules', feature:'Recipe'});
	},
    
    
    next : function(cmp, event, helper) {
        var section;
        cmp.set('v.showError',false);
        var models = cmp.get('v.model'); 
        var sectionDisplay = cmp.get('v.sectionDisplay');
        if(sectionDisplay['existing']){
            section = 'existing';
            sectionDisplay['existing'] = false;
            sectionDisplay['model'] = true;
        } 
        else if(sectionDisplay['model']){
            section = 'model';
            var showError = true;
            if(!(models.catchAll || models.byChannel || models.byCustomer || models.byEmailKeywords || models.advanced)){
                cmp.set('v.errorMessage','Select one of the models to proceed');
                cmp.set('v.showError',true);
                return;
            }else{
                helper.initializeNewAssignmentRule(cmp,event,helper);
            }
            if(models['catchAll']){
                helper.initializeRuleEntry(cmp,event,helper,1,'catchAll');
                sectionDisplay['catchAll'] = true;
                sectionDisplay['model'] = false;
                cmp.set('v.sectionDisplay',sectionDisplay);
            }else if (models['byChannel']){
                helper.getExistingEmailToCaseHelper(cmp,event,helper);
                sectionDisplay['byChannel'] = true;
                sectionDisplay['model'] = false;
            }else if (models['byCustomer']){
                helper.initializeRuleEntry(cmp,event,helper,3,'byCustomer');
                helper.initializeCriteria(cmp,event,helper,'byCustomer');
                sectionDisplay['byCustomer'] = true;
                sectionDisplay['model'] = false;
            }else if (models['byEmailKeywords']){
                helper.initializeRuleEntry(cmp,event,helper,3,'byEmailKeywords');
                helper.initializeCriteria(cmp,event,helper,'byEmailKeywords');
                sectionDisplay['byEmailKeywords'] = true;
                sectionDisplay['model'] = false;
            }else if (models['advanced']){
                sectionDisplay['complete'] = true;
                sectionDisplay['model'] = false;
            }
        } 
        else if (sectionDisplay['catchAll']){
            section = 'catchAll';
            //helper.pushRuleEntry(cmp,event,helper,'catchAll');
            if (models['byChannel']){
                helper.getExistingEmailToCaseHelper(cmp,event,helper);
                sectionDisplay['byChannel'] = true;
                sectionDisplay['catchAll'] = false;
            }else if (models['byCustomer']){
                helper.initializeRuleEntry(cmp,event,helper,3,'byCustomer');
                helper.initializeCriteria(cmp,event,helper,'byCustomer');
                sectionDisplay['byCustomer'] = true;
                sectionDisplay['catchAll'] = false;
            }else if (models['byEmailKeywords']){
                helper.initializeRuleEntry(cmp,event,helper,3,'byEmailKeywords');
                helper.initializeCriteria(cmp,event,helper,'byEmailKeywords');
                sectionDisplay['byEmailKeywords'] = true;
                sectionDisplay['catchAll'] = false;
            }else{
                //helper.orderAssignmentRule(cmp,event,helper);
                helper.createAssignmentRule(cmp,event,helper);
            }  
        } 
        else if (sectionDisplay['byChannel']){
            section = 'byChannel';
            //helper.pushRuleEntry(cmp,event,helper,'byChannel');
            if (models['byCustomer']){
                helper.initializeRuleEntry(cmp,event,helper,3,'byCustomer');
                helper.initializeCriteria(cmp,event,helper,'byCustomer');
                sectionDisplay['byCustomer'] = true;
                sectionDisplay['byChannel'] = false;
            }else if (models['byEmailKeywords']){
                helper.initializeRuleEntry(cmp,event,helper,3,'byEmailKeywords');
                helper.initializeCriteria(cmp,event,helper,'byEmailKeywords');
                sectionDisplay['byEmailKeywords'] = true;
                sectionDisplay['byChannel'] = false;
            }else{
                helper.orderAssignmentRule(cmp,event,helper);
            	//helper.createAssignmentRule(cmp,event,helper);
            }        
        } 
        else if (sectionDisplay['byCustomer']){
            section = 'byCustomer';
            if(helper.validateNewRuleEntries(cmp,event,helper,'byCustomer')){
                if (models['byEmailKeywords']){
                    helper.initializeRuleEntry(cmp,event,helper,3,'byEmailKeywords');
                    helper.initializeCriteria(cmp,event,helper,'byEmailKeywords');
                    sectionDisplay['byEmailKeywords'] = true;
                    sectionDisplay['byCustomer'] = false;
                }else{
                    helper.orderAssignmentRule(cmp,event,helper);
            		//helper.createAssignmentRule(cmp,event,helper);
                }
            }
                     
        }
        else if (sectionDisplay['byEmailKeywords']){
            section = 'byEmailKeywords';
            if(helper.validateNewRuleEntries(cmp,event,helper,'byEmailKeywords')){
            	helper.orderAssignmentRule(cmp,event,helper);
            	//helper.createAssignmentRule(cmp,event,helper);
            }                     
        }
        else if (sectionDisplay['ordering']){
            section = 'ordering';
            helper.initializeRuleEntry(cmp,event,helper,1,'allOtherCases');
            sectionDisplay['allOtherCases'] = true;
            sectionDisplay['ordering'] = false;
            //helper.createAssignmentRule(cmp,event,helper);                     
        }
        else if (sectionDisplay['allOtherCases']){
            section = 'allOtherCases';
            helper.createAssignmentRule(cmp,event,helper);                     
        }
        else if (sectionDisplay['complete']){
            section = 'complete';
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();         
        }
        cmp.set('v.sectionDisplay',sectionDisplay);
		helper.createRecipeActivity(cmp,{action: 'Next', recipe: 'Assignment Rules', feature:'Recipe', section: section});
	},
    
    back : function(cmp, event, helper) {
        var section;
        var sectionDisplay = cmp.get('v.sectionDisplay');
        var models = cmp.get('v.model');
        if(sectionDisplay['existing']){
            section = 'existing';
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }else if(sectionDisplay['model']){
            section = 'model';
            if($A.util.isEmpty(cmp.get('v.existingActiveAssignmentRule'))){
                var myEvent = cmp.getEvent("recipeComponentChange");
           		myEvent.setParams({"componentName": 'RecipeList'});
            	myEvent.fire();
            }else{
                sectionDisplay['existing'] = true;
             	sectionDisplay['model'] = false; 
            }
        } else if (sectionDisplay['catchAll']){
            section = 'catchAll';
             sectionDisplay['model'] = true;
             sectionDisplay['catchAll'] = false;          
        } else if (sectionDisplay['byChannel']){
            section = 'byChannel';
             sectionDisplay['model'] = true;
             sectionDisplay['byChannel'] = false;          
        } else if (sectionDisplay['byCustomer']){
            section = 'byCustomer';
            if(models['byChannel']){
            	sectionDisplay['byChannel'] = true;
            }else{
                sectionDisplay['model'] = true;
            }
            sectionDisplay['byCustomer'] = false;
        } else if (sectionDisplay['byEmailKeywords']){
            section = 'byEmailKeywords';
            if(models['byCustomer']){
            	sectionDisplay['byCustomer'] = true;
            }
            else if(models['byChannel']){
            	sectionDisplay['byChannel'] = true;
            }else{
                sectionDisplay['model'] = true;
            }
            sectionDisplay['byEmailKeywords'] = false;
        } else if (sectionDisplay['ordering']){
            section = 'ordering';
            if(models['byEmailKeywords']){
            	sectionDisplay['byEmailKeywords'] = true;
            }
            else if(models['byCustomer']){
            	sectionDisplay['byCustomer'] = true;
            }
            else if(models['byChannel']){
            	sectionDisplay['byChannel'] = true;
            }else{
                sectionDisplay['model'] = true;
            }
            sectionDisplay['ordering'] = false;
        } else if (sectionDisplay['allOtherCases']){
            section = 'allOtherCases';
            if (cmp.get('v.newAssignmentRule').ruleEntryList.length > 1){
                sectionDisplay['ordering'] = true;
            }
            else if(models['byEmailKeywords']){
            	sectionDisplay['byEmailKeywords'] = true;
            }
            else if(models['byCustomer']){
            	sectionDisplay['byCustomer'] = true;
            }
            else if(models['byChannel']){
            	sectionDisplay['byChannel'] = true;
            }else{
                sectionDisplay['model'] = true;
            }
            sectionDisplay['allOtherCases'] = false;
        }  
        else if (sectionDisplay['complete']){
            section = 'complete';
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }
        cmp.set('v.sectionDisplay',sectionDisplay);
        helper.createRecipeActivity(cmp,{action: 'Back', recipe: 'Assignment Rules', feature:'Recipe', section: section});
	},
    
    addAtValueToCustomerDomain: function(cmp,event,helper){
        var name = event.getSource().get('v.name');
        var value = event.getSource().get('v.value');
        var row = parseInt(name.replace('customerDomain',''));
        var rules = cmp.get('v.newRuleEntryList');
        if(value != '' && !value.startsWith('@')){
            rules[row].customerDomain ='@'+value;	
        }
        cmp.set('v.newRuleEntryList',rules);
    },
    
    channelUserSelected: function(cmp,event,helper){
        var name = event.getSource().get('v.name');
        var value = event.getSource().get('v.value');
        var row = parseInt(name.replace('userAssignedTo',''));
        var sectionDisplay = cmp.get('v.sectionDisplay');
        var rules;
        if(sectionDisplay['catchAll']){
        	rules = cmp.get('v.catchAllRuleEntryList');
        }
        if(sectionDisplay['byChannel']){
            rules = cmp.get('v.byChannelRuleEntryList');
        }
        if(sectionDisplay['byCustomer']){
            rules = cmp.get('v.byCustomerRuleEntryList');
        }
        if(sectionDisplay['byEmailKeywords']){
            rules = cmp.get('v.byEmailKeywordsRuleEntryList');
        }
        if(sectionDisplay['allOtherCases']){
            rules = cmp.get('v.allOtherCasesRuleEntryList');
        }
        
        if(value != ''){
            rules[row].assignedToType ='User';	
        }else{
            rules[row].assignedToType ='';
            rules[row].sendNotification = false;
        }
        
        if(sectionDisplay['catchAll']){
        	cmp.set('v.catchAllRuleEntryList',rules);
        }
        if(sectionDisplay['byChannel']){
            cmp.set('v.byChannelRuleEntryList',rules);
        }
        if(sectionDisplay['byCustomer']){
            cmp.set('v.byCustomerRuleEntryList',rules);
        }
        if(sectionDisplay['byEmailKeywords']){
            cmp.set('v.byEmailKeywordsRuleEntryList',rules);
        }
        if(sectionDisplay['allOtherCases']){
            cmp.set('v.allOtherCasesRuleEntryList',rules);
        }
    },
    
    channelQueueSelected: function(cmp,event,helper){
        var name = event.getSource().get('v.name');
        var value = event.getSource().get('v.value');
        var row = parseInt(name.replace('queueAssignedTo',''));
        var sectionDisplay = cmp.get('v.sectionDisplay');
        var rules = cmp.get('v.newRuleEntryList');
        
        if(sectionDisplay['catchAll']){
        	rules = cmp.get('v.catchAllRuleEntryList');
        }
        if(sectionDisplay['byChannel']){
            rules = cmp.get('v.byChannelRuleEntryList');
        }
        if(sectionDisplay['byCustomer']){
            rules = cmp.get('v.byCustomerRuleEntryList');
        }
        if(sectionDisplay['byEmailKeywords']){
            rules = cmp.get('v.byEmailKeywordsRuleEntryList');
        }
        if(sectionDisplay['allOtherCases']){
            rules = cmp.get('v.allOtherCasesRuleEntryList');
        }
        
        if(value != ''){
            rules[row].assignedToType ='Queue';	
        }else{
            rules[row].assignedToType ='';
            rules[row].sendNotification = false;
        }
        
        if(sectionDisplay['catchAll']){
			cmp.set('v.catchAllRuleEntryList',rules);
        }
        if(sectionDisplay['byChannel']){
            cmp.set('v.byChannelRuleEntryList',rules);
        }
        if(sectionDisplay['byCustomer']){
            cmp.set('v.byCustomerRuleEntryList',rules);
        }
        if(sectionDisplay['byEmailKeywords']){
            cmp.set('v.byEmailKeywordsRuleEntryList',rules);
        }
        if(sectionDisplay['allOtherCases']){
            cmp.set('v.allOtherCasesRuleEntryList',rules);
        }
    },
    
    handleToastClick: function (cmp, evt, helper) {
        var message = evt.getParam("message");
        if(message = 'bypassVerification'){
           var vc = cmp.find('vc'); 
           var sectionDisplay = cmp.get('v.sectionDisplay');
            sectionDisplay['verify'] = false;
            sectionDisplay['complete'] = true;
            cmp.find('toast').set('v.link','');
            cmp.find('backButton').set('v.label','Exit');
            cmp.find('backButton').set('v.disabled',false);
            cmp.set('v.sectionDisplay',sectionDisplay);
            cmp.set('v.showError',false);
            vc.changeVideo(cmp.get('v.vcVideos')['complete'],
                           'complete',
                          cmp.get('v.highlightTimestampsMap')['complete']);
        }
    },
    
    addRow: function(cmp, event, helper) {
        var rules;
        var newRuleEntry;
        var sectionDisplay = cmp.get('v.sectionDisplay');
        if(sectionDisplay['byCustomer']){
            rules = cmp.get('v.byCustomerRuleEntryList');
            newRuleEntry = {assignedTo: "", assignedToType: "", emailTemplate: null, sendNotification: false, booleanFilter: "", customerDomain: "@", 
                            filterItems: [{field: 'Case.SuppliedEmail', filterOperation: 'contains', value:null, valueField: null}]};
            cmp.set('v.byCustomerRuleEntryList',rules.concat(newRuleEntry));
        }
        if(sectionDisplay['byEmailKeywords']){
            rules = cmp.get('v.byEmailKeywordsRuleEntryList');
            newRuleEntry = {assignedTo: "", assignedToType: "", emailTemplate: null, sendNotification: false, booleanFilter: "", keyword: '', subject: true, description: false, 
                            filterItems: []};
            cmp.set('v.byEmailKeywordsRuleEntryList',rules.concat(newRuleEntry));
        }
	},
    
    delRow: function(cmp, event, helper) {
        var rules;
        var afterDelRules = [];
        var newRuleEntry;
        var sectionDisplay = cmp.get('v.sectionDisplay');
        var name = event.target.name;
        var row = parseInt(name.replace('row',''));
        if(sectionDisplay['byCustomer']){
            rules = cmp.get('v.byCustomerRuleEntryList');
            for(var key in rules){
                if (key < row){
                    afterDelRules.push(rules[key]);
                }else if (key > row){
                    rules[key-1].assignedTo = rules[key].assignedTo;
                    rules[key-1].assignedToType = rules[key].assignedToType;
                    rules[key-1].sendNotification = rules[key].sendNotification;
                    rules[key-1].customerDomain = rules[key].customerDomain;
                    afterDelRules.push(rules[key-1]);
                }
            }
            rules.splice(row,1);
            if(rules.length == 0){
           		 newRuleEntry = {assignedTo: "", assignedToType: "", emailTemplate: null, sendNotification: false, booleanFilter: "", customerDomain: "@", 
                            filterItems: [{field: 'Case.SuppliedEmail', filterOperation: 'contains', value:null, valueField: null}]};
            	cmp.set('v.byCustomerRuleEntryList',newRuleEntry);
            }else{
                cmp.set('v.byCustomerRuleEntryList',afterDelRules);
            }
        }
        if(sectionDisplay['byEmailKeywords']){
            rules = cmp.get('v.byEmailKeywordsRuleEntryList');
            for(var key in rules){
                if (key < row){
                    afterDelRules.push(rules[key]);
                }else if (key > row){
                    rules[key-1].assignedTo = rules[key].assignedTo;
                    rules[key-1].assignedToType = rules[key].assignedToType;
                    rules[key-1].sendNotification = rules[key].sendNotification;
                    rules[key-1].keyword = rules[key].keyword;
                    rules[key-1].subject = rules[key].subject;
                    rules[key-1].description = rules[key].description;
                    afterDelRules.push(rules[key-1]);
                }
            }
            if(rules.length == 0){
           		 newRuleEntry = {assignedTo: "", assignedToType: "", emailTemplate: null, sendNotification: false, booleanFilter: "", keyword: '', subject: true, description: false, 
                            filterItems: []};
            	cmp.set('v.byEmailKeywordsRuleEntryList',newRuleEntry);
            }else{
                cmp.set('v.byEmailKeywordsRuleEntryList',afterDelRules);
            }
        }
	},
    
    reorderRules: function(cmp, event, helper){
        var newAssignmentRule = cmp.get('v.newAssignmentRule');
        var rules = newAssignmentRule.ruleEntryList;
        var name = event.getSource().get('v.name');
        var row = parseInt(name.replace('row',''));
        var count = 0;
        var swap;
        var reOrderedRules = [];
        if (!rules[row].order){
            rules[row].order = row+1;
            newAssignmentRule.ruleEntryList = rules;
       		cmp.set('v.newAssignmentRule',newAssignmentRule);
            return;
        }
        if(rules[row].order <= 1){
            rules[row].order = 1;
            newAssignmentRule.ruleEntryList = rules;
       		cmp.set('v.newAssignmentRule',newAssignmentRule);
        }
        if(rules[row].order >= rules.length){
            rules[row].order = rules.length;
            newAssignmentRule.ruleEntryList = rules;
       		cmp.set('v.newAssignmentRule',newAssignmentRule);
        }
        if(row != rules[row].order - 1){
            swap = rules[row];
            for(var key in rules){
                if(key == rules[row].order-1 || (key == rules.length-1 && rules[row].order >= rules.length)){
                   reOrderedRules.push(swap); 
                }
                if(rules[row].order-1 > row){
                    if (key >= row && key < rules[row].order-1){
                        rules[parseInt(key)+1].order--;
                        reOrderedRules.push(rules[parseInt(key)+1]);
                    }
                    else if (key != rules[row].order-1){
                        reOrderedRules.push(rules[key]);
                    }
                }
                if(rules[row].order-1 < row){
                    if (key <= row && key > rules[row].order-1){
                        rules[parseInt(key)-1].order++;
                        reOrderedRules.push(rules[parseInt(key)-1]);
                    }
                    else if (key != rules[row].order-1){
                        reOrderedRules.push(rules[key]);
                    }
                }
            }
            newAssignmentRule.ruleEntryList = reOrderedRules;
       		cmp.set('v.newAssignmentRule',newAssignmentRule);
        }
        
    },
    
    customizeLink: function(cmp,event,helper){
        console.log('In Url');  
        cmp.find('frontdoor-form').getElement().submit();
    },
})