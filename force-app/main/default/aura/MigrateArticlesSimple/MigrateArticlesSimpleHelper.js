({
	getUrlSessionInfoLocal: function (cmp, evt, helper) {
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
                    //if(cmp.get('v.orgId')){
                        cmp.set('v.orgId',res.getReturnValue()[2]);
                    cmp.set('v.deskToken',res.getReturnValue()[3]);
                    cmp.set('v.deskTokenSecret',res.getReturnValue()[4]);
                    cmp.set('v.deskEndPoint',res.getReturnValue()[5]);
                    //}
                    helper.createDeskMigration(cmp,evt,helper,'Article');
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
    
    
})