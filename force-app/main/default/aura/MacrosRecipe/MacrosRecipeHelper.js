({
	getDeskMacrosHelper: function (cmp, evt, helper) {
        var action = cmp.get('c.getDeskMacros');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier'),pageNo: cmp.get('v.pageNo')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getDeskMacrosHelper: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var macrosList = res.getReturnValue();
                if(macrosList.length >0){
                    cmp.set('v.totalDeskMacros',macrosList[0].totalDeskMacros);
                    cmp.set('v.startPosition',macrosList[0].startPosition);
                    cmp.set('v.endPosition',macrosList[0].endPosition);
                }
                cmp.set('v.deskMacrosList',res.getReturnValue());
                
                cmp.set('v.isProcessing',false);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get list of Macros from Desk');
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
                cmp.set('v.isInitialising', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    getDeskMacrosActionsHelper: function (cmp, evt, helper) {
        var action = cmp.get('c.getMacrosActions');
        var macrosList = cmp.get('v.deskMacrosList');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier'),macrosListString: JSON.stringify(macrosList)});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getDeskMacrosHelper: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get list of Macros from Desk');
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
                cmp.set('v.isInitialising', false);
            }
        });
        $A.enqueueAction(action);
    }
})