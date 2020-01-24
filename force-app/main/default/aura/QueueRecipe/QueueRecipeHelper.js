({
	getQueuesHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching Queues from Desk & Salesforce');
        var action = cmp.get('c.getGroupsAndQueues');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getGroupsAndQueues: ',res.getState(),res.getReturnValue());            
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
    
    createQueueDeveloperNames: function (cmp, event, helper, queues) {
        //var queues = cmp.get('v.queues');
        for(var num in queues){
            var name = queues[num].name;
            //name = name.replace(' ','_');
            var regex = /[ \-!@#$%^&*(),.?:{}|<>]/g;
            name = name.replace(regex,'_').replace('"','_');
            regex = /_{2,}/g;
            name = name.replace(regex,'_');
            regex = /_$/g;
            name = name.replace(regex,'');
            //name = name.split(' ').join('_');
            queues[num].sfDeveloperName = name;
        }
        return queues;
        //cmp.set('v.queues',queues);
    },
    
    createQueuesHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Creating Queues in Salesforce');
        var queues = cmp.get('v.queues');
        var selectedQueues = new Array();
        for(var num in queues){
            if(queues[num].selected && (queues[num].inDesk || queues[num].isManual)){
                queues[num].errorMessage = '';
                queues[num].errorStatusCode = '';
                queues[num].errorField = '';
                selectedQueues.push(queues[num]);
            }
        }
        selectedQueues = helper.createQueueDeveloperNames(cmp,event,helper, selectedQueues);
        console.log('queues selected: ',selectedQueues);
        var action = cmp.get('c.createQueues');
        action.setParams({queueString: JSON.stringify(selectedQueues), authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            var queueswithDuplicateDeveloperNames = false;
            var otherErrors = false;
            console.log('createQueues: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var queues = res.getReturnValue();
                var noOfQueuesSuccessful = 0;
                var noOfQueuesFailed = 0;
                for(var num in queues){
                    if(!queues[num].errorStatusCode){
                        noOfQueuesSuccessful++;
                    }else{
                        noOfQueuesFailed++;
                    }
                    var queue = queues[num];
                    if(queue.errorStatusCode == 'DUPLICATE_DEVELOPER_NAME'){
                        queueswithDuplicateDeveloperNames = true;
                    }else if (!$A.util.isEmpty(queue.errorStatusCode)){
                        otherErrors = true;
                    }
                    queue.selected = false;
                    //user.errorStatusCode = '';
                    //user.errorMessage = '';
                    
                }
                var successHeading = '';
                var errorHeading = '';
                var heading;
                var subheading;
                if (noOfQueuesSuccessful == 1){
                    successHeading = noOfQueuesSuccessful + ' queue has been created successfuly.';
                }
                else if (noOfQueuesSuccessful > 1){
                    successHeading = noOfQueuesSuccessful + ' queues have been created successfuly.';
                }
                    
                if(noOfQueuesFailed == 1){
                    errorHeading = noOfQueuesFailed + ' queue has errors';
                }
                else if (noOfQueuesFailed > 1){
                    errorHeading = noOfQueuesFailed + ' queues have errors';
                }
                    
                if(!successHeading && !errorHeading){ 
                    heading = 'There seems to be an error. Contact support@desk.com';
                }
                else{
                    heading = successHeading +' '+ errorHeading;
                }
                
                if(queueswithDuplicateDeveloperNames && otherErrors){
                    subheading = 'Review the duplicate developer names. You can update the developer names, select the record and click next to retry. For other errors contact support@desk.com. Include the screenshot of this page in the email.';
                }else if(queueswithDuplicateDeveloperNames){
                    subheading = 'Review the duplicate developer names. You can update the developer names, select the record and click next to retry.';
                }else if(otherErrors){
                    subheading = 'Please contact support@desk.com with help with the error. Include the screenshot of this page in the email.';
                }
                cmp.set('v.createQueuesSubHeading',subheading);
                cmp.set('v.createQueuesHeading',heading);
     
                cmp.set('v.queues', queues);
                cmp.set('v.noOfQueuesSuccessful',noOfQueuesSuccessful);
                cmp.set('v.noOfQueuesFailed',noOfQueuesFailed);
                cmp.set('v.isProcessing',false);
                var sectionDisplay = cmp.get('v.sectionDisplay');
                sectionDisplay['deskGroups'] = false;
            	sectionDisplay['createQueues'] = true;
                cmp.set('v.sectionDisplay',sectionDisplay);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to create Queues in Salesforce');
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
    
    compare:function (a,b) {
      if (a.name < b.name)
        return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    },
    
    validateDeveloperName:function(developerName){
        //The name must begin with a letter and use only alphanumeric characters and underscores. 
        //The name cannot end with an underscore or have two consecutive underscores.
        if(developerName == null) return false;
        var re = /^[A-Za-z][A-Za-z0-9_]*$/;
        return re.test(developerName) && !developerName.includes('__') && !developerName.endsWith('_');
    },
    
    validateDeskGroupsSelected: function(cmp, event, helper,checkDeveloperNames){
        var queues = cmp.get('v.queues');
        var atLeastOneQueueSelected;
        for(var num in queues){
            var queue = queues[num];
            if(queue.selected){
                atLeastOneQueueSelected = true;
            }
            if(queue.selected && (queue.inDesk || queue.isManual) && $A.util.isEmpty(queue.sfDeveloperName) && checkDeveloperNames){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Developer Name not entered');
                cmp.set('v.isProcessing',false);
                return false;
            }
            if(queue.selected && (queue.inDesk || queue.isManual) && queue.sfDeveloperName && !helper.validateDeveloperName(queue.sfDeveloperName)){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Review errors shown');
                cmp.set('v.isProcessing',false);
                return false;
            }
        }
	    return true;
    }
})