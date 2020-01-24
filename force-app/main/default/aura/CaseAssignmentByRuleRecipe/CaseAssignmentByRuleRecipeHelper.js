({
	getUsersHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching User & Queue information');
        var action = cmp.get('c.getUsers');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getUsers: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var users = res.getReturnValue();
                var activeUsers = new Array();
                for(var key in users){
                    if(users[key].isActive){
                        activeUsers.push(users[key]);
                    }
                }
                users.sort(helper.compare);
                cmp.set('v.users', activeUsers);
                helper.getQueuesHelper(cmp,event,helper);
                
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
                cmp.set('v.isProcessing', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    getExistingEmailToCaseHelper: function (cmp, evt, helper,email) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching email channel information');
        var action = cmp.get('c.getExistingEmailToCaseApex');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')}); 
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getExistingEmailToCaseHelper: ',res.getState(),res.getReturnValue());             
            if (state === 'SUCCESS') {
                var retValue = res.getReturnValue();
                var emails = retValue.emails;
                var verifiedEmails = new Array();
                for (var num in emails){
                    if(emails[num].verified){
                        verifiedEmails.push(emails[num]);
                    }
                }
                cmp.set('v.existingEmailToCase', verifiedEmails);
                cmp.set('v.newEmailToCase', JSON.parse(JSON.stringify(verifiedEmails)));
                cmp.set('v.isProcessing',false);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing emails from Salesforce');                        
                    }
                    if(errors[0].message == 'Unknown'){
                        cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                    }
                    
                } else {
                    console.error('Unknown Error occurred');
                    cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                }
                cmp.set('v.showError',true);
                cmp.find('nextButton').set('v.disabled','true');
                cmp.set('v.isProcessing', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    compare:function (a,b) {
      if (a.name < b.name)
        return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    },
    
    getQueuesHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching Queues from Salesforce');
        var action = cmp.get('c.getQueues');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getQueues: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var queues = res.getReturnValue();
                queues.sort(helper.compare);
                cmp.set('v.queues', queues);
                cmp.set('v.isProcessing',false);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing groups/queues from Desk/Salesforce');
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
    
    updateEmailToCaseHelper: function(cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Setting up channel assignments');
    	var email = cmp.get('v.newEmailToCase');
        
        var newEmails = cmp.get('v.newEmailToCase');
        var existingEmails = cmp.get('v.existingEmailToCase');
        var emailsToUpdate = new Array();
        
        for(var num in newEmails){
            for(var key in existingEmails){
                if(newEmails[num].email == existingEmails[key].email &&
                   newEmails[num].caseOwner != existingEmails[key].caseOwner && 
                  (!$A.util.isEmpty(newEmails[key].caseOwner) ||
                  $A.util.isEmpty(existingEmails[key].caseOwner))){
                    if($A.util.isEmpty(newEmails[key].caseOwner) && $A.util.isEmpty(existingEmails[key].caseOwner)){
                          newEmails[num].caseOwnerType= 'Queue';
                        newEmails[num].caseOwner= '';
                   }
                    emailsToUpdate.push(newEmails[num]);
                }
            }
        }
            
        
        console.log('emailsToUpdate', emailsToUpdate);
        var action = cmp.get('c.updateEmailToCaseApex');
        action.setParams({ edListString : JSON.stringify(emailsToUpdate), authenticationId: cmp.get('v.oauthRecordIdentifier') });
        action.setCallback(this, function(res) {
          var state = res.getState();
          if (state === 'SUCCESS') {
            var retValue = res.getReturnValue();
              if(retValue = 'Success'){
                  var sectionDisplay = cmp.get('v.sectionDisplay');
                  sectionDisplay['channel'] = false;
                  sectionDisplay['complete'] = true;
                  cmp.set('v.sectionDisplay',sectionDisplay);
                  cmp.set('v.completeHeader','Assignments for email channels have been set!');
                  cmp.set('v.isProcessing',false); 
              } else {
                 
                 cmp.set('v.errorMessage','Failed to set up channel assignments');
                 cmp.set('v.showError',true);
                 cmp.find('toast').set('v.type','error');
                  cmp.set('v.isProcessing',false); 
              }
          } else if (state === 'ERROR') {
                var errors = res.getError();
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                        cmp.find('toast').set('v.type','error');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to create Email-to-case in Salesforce'); 
                        cmp.find('toast').set('v.type','error'); 
                    }
                    if(errors[0].message == 'Unknown'){
                        cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');  
                        cmp.find('toast').set('v.type','error');
                    }
                    
                } else {
                    console.error('Unknown Error occurred');
                    cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');
                    cmp.find('toast').set('v.type','error');
                }
				cmp.set('v.showError',true);
              	cmp.set('v.isProcessing',false); 
          }
        });
        $A.enqueueAction(action);
	},
    
    getExistingAssignmentRule: function (cmp, evt, helper) {
        cmp.set('v.processingMessage','Checking existing Assignment rules ...');
        var action = cmp.get('c.getCaseAssignmentRuleApex');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getExistingAssignmentRule: ',res.getState());            
            if (state === 'SUCCESS') {
                
                var existingAssignmentRules = res.getReturnValue();
                console.log('existingAssignmentRules: ', existingCaseAutoResponseRules);
                var autoResponseRuleSet = new Set();
                for(var num in existingAssignmentRules){
                    autoResponseRuleSet.add(existingAssignmentRules[num].fullName);
                }
                var count = 0;
                var ruleName = 'Standard';
                while(autoResponseRuleSet.has(ruleName)){
                    count++;
                    ruleName = 'Standard'+count;
                }
                cmp.set('v.ruleName',ruleName);
                helper.getCaseOriginPicklistValues(cmp,evt,helper,false);
                //helper.createCaseAutoResponseRule(cmp,event,helper,ruleName)
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing auto-response rule information from Salesforce');
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
                cmp.set('v.isFetchingTemplate', false);
            }
        });
        $A.enqueueAction(action);
    },
})