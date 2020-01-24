({
	getExistingActiveAssignmentRule: function (cmp, evt, helper) {
        cmp.set('v.isProcessing',true);
        //var action = cmp.get('c.getExistingActiveAssignmentRuleApex');
        var action = cmp.get('c.getAllExistingAssignmentRulesApex');
        action.setParams({recordIdentifier: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getExistingAssignmentRules: ',res.getReturnValue()); 
            if (state === 'SUCCESS') {
                    var assignmentRules = res.getReturnValue();
                    var ruleEntries = null;
                    cmp.set('v.existingAssignmentRules',assignmentRules);
                    var activeAssignmentRule;
                    for(let assignmentRule of assignmentRules){
                        if(assignmentRule.isActive){
                            activeAssignmentRule = assignmentRule;
                        }
                    }
                    if (activeAssignmentRule){
                    	ruleEntries = activeAssignmentRule.ruleEntryList;
                    }
                if(ruleEntries != null && ruleEntries.length > 0){
                    var advancedModel = false;
                    activeAssignmentRule.advancedModel = advancedModel;
                    
                    //check if the active assignment rule is based on one of the models we support
                    // 1st model (all cases assigned to a user or queue): only one rule entry
                    // Will have only one RuleEntry with no filterItem
                    // 2nd model (cases assigned by channel): each rule entry will have only one filterItem, and the field will be case origin
                    // All ruleEntries will only have one filterItem. All filter Items will have field set as "Origin". Last one could be catch All
                    // 3rd model (case assigned based on customer): each rule entry will have only one filterItem, and the field will be web email
                    // all ruleEntries will only have one filterItem. All filter Items will have field set as "Web Email"
                    // 4th model (assign based on keywords): each rule entry can have two filterItems, and the field will be subject or description
                    // all ruleEntries can have max of two fitlerItems. All fitlerItems will have field set as "Subject" or "Description"
                    // 5th model (none of the above)
                    // 
                    // create the displayText for each ruleEntry
                    
                    /*if(ruleEntries.length == 1){
                        var filterItems = ruleEntries[0].filterItems;
                        if (filterItems.length == 0){
                            ruleEntries[0].displayText = 'Catch All';
                        }else{
                            advancedModel = true;
                            activeAssignmentRule.advancedModel = advancedModel;
                        }
                    }else{*/

                        var filterItems = ruleEntries[0].filterItems;
                        if (filterItems.length == 0 && ruleEntries.length == 1){
                            ruleEntries[0].displayText = 'Catch All';
                    	} else{
                        var count = 0;
                        loop1:
                        for(let ruleEntry of ruleEntries){
                            count++;
                            if(ruleEntry.filterItems.length == 0 && count == ruleEntries.length){
                                 ruleEntry.displayText = 'All other cases';
                            }else if (ruleEntry.filterItems.length == 0){
                                advancedModel = true;
                                activeAssignmentRule.advancedModel = advancedModel;
                                break loop1;
                            }
                            else if (ruleEntry.filterItems.length == 1){
                                if(ruleEntry.filterItems[0].field == 'Case.Origin'){
                                    ruleEntry.displayText = 'Channel: ' + ruleEntry.filterItems[0].value;
                                }
                                else if(ruleEntry.filterItems[0].field == 'Case.SuppliedEmail' && ruleEntry.filterItems[0].filterOperation == 'contains'){
                                    ruleEntry.displayText = 'Customer email domain = ' + ruleEntry.filterItems[0].value;
                                }
                                else if(ruleEntry.filterItems[0].field == 'Case.Subject' && ruleEntry.filterItems[0].filterOperation == 'contains'){
                                    ruleEntry.displayText = 'Subject contains keyword: ' + ruleEntry.filterItems[0].value;
                                }
                                else if(ruleEntry.filterItems[0].field == 'Case.Description' && ruleEntry.filterItems[0].filterOperation == 'contains'){
                                    ruleEntry.displayText = 'Description contains keyword: ' + ruleEntry.filterItems[0].value;
                                }
                                else{
                                    advancedModel = true;
                                    activeAssignmentRule.advancedModel = advancedModel;
                                    break loop1;
                                }
                            }
                            else{
                                var displayTextBuilder = ['','','',''];
                                loop2:
                                for (let filterItem of ruleEntry.filterItems){
                                    if(filterItem.field == 'Case.Subject'){
                                        displayTextBuilder[0] = 'Subject'
                                        displayTextBuilder[2] = filterItem.value;
                                        if(displayTextBuilder[3] && displayTextBuilder[3] != displayTextBuilder[2]){
                                           advancedModel = true;
                                           activeAssignmentRule.advancedModel = advancedModel;
                                           break loop1; 
                                        }
                                    }else if (filterItem.field == 'Case.Description'){
                                        displayTextBuilder[1] = 'Description'
                                        displayTextBuilder[3] = filterItem.value;
                                        if(displayTextBuilder[2] && displayTextBuilder[3] != displayTextBuilder[2]){
                                           advancedModel = true;
                                           activeAssignmentRule.advancedModel = advancedModel;
                                           break loop1; 
                                        }
                                    }else{
                                        advancedModel = true;
                                        activeAssignmentRule.advancedModel = advancedModel;
                                        break loop1;
                                    }
                                }
                                if(displayTextBuilder[2] && displayTextBuilder[3]){
                                    ruleEntry.displayText = displayTextBuilder[0] + ' or ' + displayTextBuilder[1] + ' contains keywords: ' +  displayTextBuilder[2]
                                }else{
                                    ruleEntry.displayText = displayTextBuilder[0] + displayTextBuilder[1] + ' contains keywords: ' +  displayTextBuilder[2] + displayTextBuilder[3];
                                }
                            }
                        }
                    }
                    
                    cmp.set('v.existingActiveAssignmentRule',activeAssignmentRule);
                    //cmp.set('v.isProcessing',false);
                }else{
                    var sectionDisplay = cmp.get('v.sectionDisplay');
                    sectionDisplay['existing'] = false;
                    sectionDisplay['model'] = true;
                    cmp.set('v.sectionDisplay',sectionDisplay);
                    //cmp.set('v.isProcessing',false);
                }
                helper.getExistingSFUsers(cmp,event,helper);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing assignment rules from Salesforce');
                    }
                    if(errors[0].message == 'Unknown'){
                        cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                    }
                    
                } else {
                    console.error('Unknown Error occurred');
                    cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                }
                cmp.set('v.showError',true);
                cmp.find('toast').set('v.type','error');
                cmp.find('nextButton').set('v.disabled','true');
                cmp.set('v.isProcessingOrgWideAddress',false);
            }
        });
        $A.enqueueAction(action);
    },
    
    getUrlSessionInfo: function (cmp, evt, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching Salesforce Authentication Info ...');
        var action = cmp.get('c.getUrlSessionInfoMethod');
        action.setParams({recordIdentifier: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getUrlSessionInfoApex: ',res.getReturnValue());            
            if (state === 'SUCCESS') {
                if(res.getReturnValue()){
                	cmp.set('v.sfUrl',res.getReturnValue()[0]);
                	cmp.set('v.sfSessionId',res.getReturnValue()[1]);
                }
                cmp.set('v.isProcessing',false);
                window.scrollTo(0, 0, 'smooth');
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get authentication information for Salesforce');
                    }
                    if(errors[0].message == 'Unknown'){
                        cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                    }
                    
                } else {
                    console.error('Unknown Error occurred');
                    cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                }
                cmp.set('v.showError',true);
                cmp.find('toast').set('v.type','error');
                cmp.find('nextButton').set('v.disabled','true');
                cmp.set('v.isProcessing',false);
            }
            
        });
        $A.enqueueAction(action);
    },
    
    
    getExistingSFUsers: function (cmp, evt, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching Users from Salesforce');
        var action = cmp.get('c.getExistingSFUsersApex');
        action.setParams({recordIdentifier: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getExistingSFUsers: ',res.getReturnValue());            
            if (state === 'SUCCESS') {
                var existingSFUsers = res.getReturnValue();
                cmp.set('v.users',existingSFUsers);
                //var existingSFActiveUsers = new List();
                var existingSFActiveUsers = [];
                var usernameMap = new Map();
                
                for(let sfUser of existingSFUsers){
                    usernameMap.set(sfUser.sfUsername,sfUser.name);
                    if (sfUser.isActive){
                        existingSFActiveUsers.push(sfUser);
                    }
                    //check if user active and 
                }
                cmp.set('v.existingSFActiveUsers',existingSFActiveUsers);
                var activeAssignmentRule = cmp.get('v.existingActiveAssignmentRule');
                if (activeAssignmentRule){
                    var ruleEntries = activeAssignmentRule.ruleEntryList;
                    for (let ruleEntry of ruleEntries){
                        if(ruleEntry.assignedToType == 'User'){
                            ruleEntry.assignedToName = usernameMap.get(ruleEntry.assignedTo);
                        }else{
                            ruleEntry.assignedToName = ruleEntry.assignedTo;
                        }
                    }
                }
                helper.getExistingQueuesHelper(cmp,event,helper);
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing users from Salesforce');
                    }
                    if(errors[0].message == 'Unknown'){
                        cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                    }
                    
                } else {
                    console.error('Unknown Error occurred');
                    cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                }
                cmp.set('v.showError',true);
                cmp.find('toast').set('v.type','error');
                cmp.find('nextButton').set('v.disabled','true');
                cmp.set('v.isProcessing',false);
            }
            
        });
        $A.enqueueAction(action);
    },
    
    getExistingQueuesHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching Queues from Salesforce');
        var action = cmp.get('c.getQueues');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getQueues: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var queues = res.getReturnValue();
                var queueMap = new Map();
                queues.sort(helper.compare);
                for(let queue of queues){
                    queueMap.set(queue.sfDeveloperName,queue.name); 
                }
                var activeAssignmentRule = cmp.get('v.existingActiveAssignmentRule');
                if (activeAssignmentRule){
                    var ruleEntries = activeAssignmentRule.ruleEntryList;
                    for (let ruleEntry of ruleEntries){
                        if(ruleEntry.assignedToType == 'Queue'){
                            ruleEntry.assignedToName = queueMap.get(ruleEntry.assignedTo);
                        }
                    }
                }
                cmp.set('v.queues', queues);
                helper.getUrlSessionInfo(cmp,event,helper);
                //cmp.set('v.isProcessing',false);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing queues from Salesforce');
                    }
                    if(errors[0].message == 'Unknown'){
                        cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                    }
                    
                } else {
                    console.error('Unknown Error occurred');
                    cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                }
                cmp.set('v.showError',true);
                cmp.find('toast').set('v.type','error');
                cmp.find('nextButton').set('v.disabled','true');
                cmp.set('v.isProcessing', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    orderAssignmentRule: function(cmp,event,helper){
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Processing rules ...');
        var newAssignmentRule = cmp.get('v.newAssignmentRule');
        //newAssignmentRule.ruleEntryList = cmp.get('v.newRuleEntryList');
        var newRuleEntryList = [];
        var catchAllRuleEntryList = cmp.get('v.catchAllRuleEntryList');
        var byChannelRuleEntryList = cmp.get('v.byChannelRuleEntryList');
        var byCustomerRuleEntryList = cmp.get('v.byCustomerRuleEntryList');
        var byEmailKeywordsRuleEntryList = cmp.get('v.byEmailKeywordsRuleEntryList');
        var count = 1;
        
        for(let ruleEntry of catchAllRuleEntryList){
            if(ruleEntry.assignedTo){
           		newRuleEntryList.push(ruleEntry);
            }
        }
        
        for(let ruleEntry of byChannelRuleEntryList){
            if(ruleEntry.assignedTo){
                ruleEntry.order = count++;
                ruleEntry.displayText = "Channel: " + ruleEntry.filterItems[0].value; 
            	newRuleEntryList.push(ruleEntry);
            }
        }
        
        for(let ruleEntry of byCustomerRuleEntryList){
            if(ruleEntry.customerDomain && ruleEntry.assignedTo){
                ruleEntry.order = count++;
                ruleEntry.displayText = "Customer email domain = " + ruleEntry.customerDomain;
            	ruleEntry.filterItems[0].value = ruleEntry.customerDomain;
                newRuleEntryList.push(ruleEntry);
            }
        }
        
        for(let ruleEntry of byEmailKeywordsRuleEntryList){
            if(ruleEntry.assignedTo && ruleEntry.keyword){
                ruleEntry.order = count++;
                
                var filterItems = [];
                if (ruleEntry.subject){
                    ruleEntry.displayText = "Subject contains keyword: " + ruleEntry.keyword;
                    filterItems.push({field: 'Case.Subject', filterOperation: 'contains', value:ruleEntry.keyword, valueField: null});
                }
                if (ruleEntry.description){
                    ruleEntry.displayText = "Subject contains keyword: " + ruleEntry.keyword;
                    filterItems.push({field: 'Case.Description', filterOperation: 'contains', value:ruleEntry.keyword, valueField: null});
                }
                if (ruleEntry.subject && ruleEntry.description){
                    ruleEntry.displayText = "Subject or Description contains keyword: " + ruleEntry.keyword;
                    ruleEntry.booleanFilter = '1 OR 2';
                }
                ruleEntry.filterItems = filterItems;
                newRuleEntryList.push(ruleEntry);
            }
        }
        
        //newRuleEntryList = catchAllRuleEntryList.concat(byChannelRuleEntryList).concat(byCustomerRuleEntryList);
        
        newAssignmentRule.ruleEntryList = newRuleEntryList;
        
        var existingSFUsers = cmp.get('v.users');
        var queues = cmp.get('v.queues');
        var usernameMap = new Map();
        var queueMap = new Map();
        
        for(let sfUser of existingSFUsers){
            usernameMap.set(sfUser.sfUsername,sfUser.name);
        }
        
        for(let queue of queues){
            queueMap.set(queue.sfDeveloperName,queue.name); 
        }
        
        for(let ruleEntry of newAssignmentRule.ruleEntryList){
            if(ruleEntry.assignedToType == 'User'){
            	ruleEntry.assignedToName = usernameMap.get(ruleEntry.assignedTo);
            }
            if(ruleEntry.assignedToType == 'Queue'){
            	ruleEntry.assignedToName = queueMap.get(ruleEntry.assignedTo);
            }
        }
        
        cmp.set('v.newAssignmentRule',newAssignmentRule);
        var sectionDisplay = cmp.get('v.sectionDisplay');
        sectionDisplay['catchAll'] = false;
        sectionDisplay['byChannel'] = false;
        sectionDisplay['byCustomer'] = false;
        sectionDisplay['byEmailKeywords'] = false;
        if(newAssignmentRule.ruleEntryList.length > 1){
       		 sectionDisplay['ordering'] = true;
        }else{
            helper.initializeRuleEntry(cmp,event,helper,1,'allOtherCases');
            sectionDisplay['allOtherCases'] = true;
        }
        cmp.set('v.sectionDisplay',sectionDisplay);
       	cmp.set('v.isProcessing',false);
    },
    
    createAssignmentRule: function (cmp,event,helper){
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Creating Assignment Rules ...');
        var newAssignmentRule = cmp.get('v.newAssignmentRule');
        var catchAllRuleEntryList = cmp.get('v.catchAllRuleEntryList');
        var allOtherCasesRuleEntryList = cmp.get('v.allOtherCasesRuleEntryList');
        
        for(let ruleEntry of catchAllRuleEntryList){
            if(ruleEntry.assignedTo){
           		newAssignmentRule.ruleEntryList.push(ruleEntry);
            }
        }
        
        for(let ruleEntry of allOtherCasesRuleEntryList){
            if(ruleEntry.assignedTo){
				newAssignmentRule.ruleEntryList.push(ruleEntry);
            }
        }
        
        /*var newRuleEntryList = [];
        var catchAllRuleEntryList = cmp.get('v.catchAllRuleEntryList');
        var byChannelRuleEntryList = cmp.get('v.byChannelRuleEntryList');
        var byCustomerRuleEntryList = cmp.get('v.byCustomerRuleEntryList');
        var byEmailKeywordsRuleEntryList = cmp.get('v.byEmailKeywordsRuleEntryList');
        
        for(let ruleEntry of catchAllRuleEntryList){
            if(ruleEntry.assignedTo){
           		newRuleEntryList.push(ruleEntry);
            }
        }
        
        for(let ruleEntry of byChannelRuleEntryList){
            if(ruleEntry.assignedTo){
            	newRuleEntryList.push(ruleEntry);
            }
        }
        
        for(let ruleEntry of byCustomerRuleEntryList){
            if(ruleEntry.customerDomain && ruleEntry.assignedTo){
            	ruleEntry.filterItems[0].value = ruleEntry.customerDomain;
                newRuleEntryList.push(ruleEntry);
            }
        }
        
        for(let ruleEntry of byEmailKeywordsRuleEntryList){
            if(ruleEntry.assignedTo && ruleEntry.keyword){
                var filterItems = [];
                if (ruleEntry.subject){
                    filterItems.push({field: 'Case.Subject', filterOperation: 'contains', value:ruleEntry.keyword, valueField: null});
                }
                if (ruleEntry.description){
                    filterItems.push({field: 'Case.Description', filterOperation: 'contains', value:ruleEntry.keyword, valueField: null});
                }
                if (ruleEntry.subject && ruleEntry.description){
                    ruleEntry.booleanFilter = '1 OR 2';
                }
                ruleEntry.filterItems = filterItems;
                newRuleEntryList.push(ruleEntry);
            }
        }
        
        //newRuleEntryList = catchAllRuleEntryList.concat(byChannelRuleEntryList).concat(byCustomerRuleEntryList);
        
        newAssignmentRule.ruleEntryList = newRuleEntryList;*/
        for(let ruleEntry of newAssignmentRule.ruleEntryList){
            if(ruleEntry.sendNotification){
                ruleEntry.emailTemplate = 'Services_Templates/Case_Assignment_Notification';
            }
        }
        
		
        
        var action = cmp.get('c.createAssignmentRuleApex');
        action.setParams({recordIdentifier: cmp.get('v.oauthRecordIdentifier'), assingmentRuleString: JSON.stringify(newAssignmentRule)});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('createAssignmentRule: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                cmp.set('v.isProcessing',false);
                var sectionDisplay = cmp.get('v.sectionDisplay');
                sectionDisplay['catchAll'] = false;
                sectionDisplay['byChannel'] = false;
                sectionDisplay['byCustomer'] = false;
                sectionDisplay['byEmailKeywords'] = false;
                sectionDisplay['ordering'] = false;
                sectionDisplay['allOtherCases'] = false;
                sectionDisplay['complete'] = true;
                cmp.set('v.sectionDisplay',sectionDisplay);
                helper.createRecipeActivity(cmp,{action: 'Complete', recipe: 'Assignment Rules', feature:'Recipe'});
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to create assignment rule');
                    }
                    if(errors[0].message == 'Unknown'){
                        cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                    }
                    
                } else {
                    console.error('Unknown Error occurred');
                    cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                }
                cmp.set('v.showError',true);
                cmp.find('toast').set('v.type','error');
                //cmp.find('nextButton').set('v.disabled','true');
                cmp.set('v.isProcessing', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    initializeNewAssignmentRule: function (cmp,event, helper, count){
        var existingAssignmentRulesNameSet = new Set();
        var existingAssignmentRules = cmp.get('v.existingAssignmentRules');
        for (let assignmentRule of existingAssignmentRules){
            existingAssignmentRulesNameSet.add(assignmentRule.fullName.toLowerCase()); 
        }
        var ruleName = 'Standard';
        var ruleNameFinal = ruleName;
        var count = 0;
        while(existingAssignmentRulesNameSet.has(ruleNameFinal.toLowerCase())){
            count++;
            ruleNameFinal = ruleName+count;
        }
        var newAssignmentRule = {fullName: ruleNameFinal, isActive: true, emailTemplate: "", ruleEntryList: []};
        cmp.set('v.newAssignmentRule',newAssignmentRule);
	},
    
    initializeRuleEntry: function (cmp,event, helper, count,model){
        var newRuleEntryList = [];//cmp.get('v.newRuleEntryList');
        var newRuleEntry;
        for(var i = 1; i <= count; i++){
        	newRuleEntry = {assignedTo: "", assignedToType: "", emailTemplate: null, sendNotification: false, booleanFilter: "", filterItems: []};
        	newRuleEntryList.push(newRuleEntry);
        }
        if (model == 'catchAll'){
            cmp.set('v.catchAllRuleEntryList',newRuleEntryList);
        }
        if (model == 'allOtherCases'){
            cmp.set('v.allOtherCasesRuleEntryList',newRuleEntryList);
        }
        if (model == 'byChannel'){
            cmp.set('v.byChannelRuleEntryList',newRuleEntryList);
        }
        if (model == 'byCustomer'){
            cmp.set('v.byCustomerRuleEntryList',newRuleEntryList);
        }
        if (model == 'byEmailKeywords'){
            cmp.set('v.byEmailKeywordsRuleEntryList',newRuleEntryList);
        }
        
        cmp.set('v.newRuleEntryList',newRuleEntryList);
	},
    
    initializeCriteria: function (cmp,event, helper, model){
        var newRuleEntryList;
        var count = 0;
        if (model == 'byChannel'){
            newRuleEntryList = cmp.get('v.byChannelRuleEntryList');
            var emails = cmp.get('v.existingEmailToCase');
            for(let ruleEntry of newRuleEntryList){
                ruleEntry.email = emails[count].email;
                var filterItems = [{field: 'Case.Origin', filterOperation: 'equals', value:emails[count].caseOrigin, valueField: null}];
                ruleEntry.filterItems = filterItems;
                count++;
            }
            cmp.set('v.byChannelRuleEntryList',newRuleEntryList);
        }else if (model == 'byCustomer'){
            newRuleEntryList = cmp.get('v.byCustomerRuleEntryList');
            for(let ruleEntry of newRuleEntryList){
                ruleEntry.customerDomain = '@';
                var filterItems = [{field: 'Case.SuppliedEmail', filterOperation: 'contains', value:null, valueField: null}];
                ruleEntry.filterItems = filterItems;
                count++;
            }
            cmp.set('v.byCustomerRuleEntryList',newRuleEntryList);
        }
        else if (model == 'byEmailKeywords'){
            newRuleEntryList = cmp.get('v.byEmailKeywordsRuleEntryList');
            for(let ruleEntry of newRuleEntryList){
                ruleEntry.keyword = '';
                ruleEntry.subject = true;
                ruleEntry.description = false;
                var filterItems = [];
                ruleEntry.filterItems = filterItems;
                count++;
            }
            cmp.set('v.byEmailKeywordsRuleEntryList',newRuleEntryList);
        }
        
	},
    
    /*pushRuleEntry: function (cmp,event,helper,model){
        var newRuleEntryList = cmp.get('v.newRuleEntryList');
        var newAssignmentRule = cmp.get('v.newAssignmentRule');
        var newRuleEntryListToBeAdded = [];
        
        if (model == 'catchAll'){
            for (let ruleEntry of newRuleEntryList ){
                if(ruleEntry.assignedTo){
                    newRuleEntryListToBeAdded.push(ruleEntry);
                }
            }
            newAssignmentRule.ruleEntryList = newAssignmentRule.ruleEntryList.concat(newRuleEntryListToBeAdded);
        }
        
        if (model == 'byChannel'){
            for (let ruleEntry of newRuleEntryList ){
                if(ruleEntry.assignedTo){
                    newRuleEntryListToBeAdded.push(ruleEntry);
                }
            }
            newAssignmentRule.ruleEntryList = newAssignmentRule.ruleEntryList.concat(newRuleEntryListToBeAdded);
        }
        if (model == 'byCustomer'){
            for (let ruleEntry of newRuleEntryList ){
                if(ruleEntry.assignedTo && ruleEntry.customerDomain.length > 1){
                    ruleEntry.filterItems[0].value = ruleEntry.customerDomain;
                    newRuleEntryListToBeAdded.push(ruleEntry);
                }
            }
            newAssignmentRule.ruleEntryList = newAssignmentRule.ruleEntryList.concat(newRuleEntryListToBeAdded);
        }
        if (model == 'catchAll'){
            newAssignmentRule.ruleEntryList = newAssignmentRule.ruleEntryList.concat(newRuleEntryList);
        }
        cmp.set('v.newAssignmentRule',newAssignmentRule);
        console.log('pushRuleEntry: ',newAssignmentRule.ruleEntryList);
    },*/
    
    getExistingEmailToCaseHelper: function (cmp, evt, helper) {
        cmp.set('v.isProcessing', true);
        cmp.set('v.processingMessage','Fetching email channels from Salesforce');
        var action = cmp.get('c.getExistingEmailToCaseApex');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getExistingEmailToCaseHelper: ',res.getState(),res.getError());             
            if (state === 'SUCCESS') {
                var retValue = res.getReturnValue();
                var emails = retValue.emails;
                for(let email of emails){
                    email.viewLabel = email.name.split(' ').join('_');
                }
                console.log('getExistingEmailToCaseHelper: ',emails); 
                cmp.set('v.existingEmailToCase', emails);
                helper.initializeRuleEntry(cmp,event,helper,emails.length,'byChannel');
                helper.initializeCriteria(cmp,event,helper,'byChannel');
                cmp.set('v.isProcessing', false);
            } else if (state === 'ERROR') {
                var errors = res.getError();
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing Emails from Salesforce');                        
                    }
                    if(errors[0].message == 'Unknown'){
                        cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                    }  
                } else {
                    console.error('Unknown Error occurred');
                    cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                }
                cmp.set('v.showError',true);
                cmp.find('toast').set('v.type','error');
                cmp.find('nextButton').set('v.disabled','true');
                cmp.set('v.isProcessing', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    validateNewRuleEntries: function (cmp, event, helper, model){
        if(model == 'byCustomer'){
            var error = false;
            var count = 0;
            var byCustomerRuleEntryList = cmp.get('v.byCustomerRuleEntryList');
            for (let ruleEntry of byCustomerRuleEntryList){
                if(ruleEntry.customerDomain.length > 1 && (!ruleEntry.assignedTo)){
                    error = true;
                    count++;
                }
            }
            if(error){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Customer domain entered but User/Queue not selected for '+count+' row(s)');
                return false;
            }else{
                return true;
            }
        }
        if(model == 'byEmailKeywords'){
            var error = false;
            var count = 0;
            var byEmailKeywordsRuleEntryList = cmp.get('v.byEmailKeywordsRuleEntryList');
            for (let ruleEntry of byEmailKeywordsRuleEntryList){
                if(ruleEntry.keyword.length > 1 && (!ruleEntry.assignedTo)){
                    error = true;
                    count++;
                }
            }
            if(error){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Keyword entered but User/Queue not selected for '+count+' row(s)');
                return false;
            }else{
                return true;
            }
        }
    }
})