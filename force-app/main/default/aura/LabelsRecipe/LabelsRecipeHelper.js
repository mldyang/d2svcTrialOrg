({
    
    callApex: function(cmp,evt,helper,name, params, error, callback) {
    
        var action = cmp.get(name);
    
        action.setParams(params);
        action.setCallback(this, function(res) {
          var state = res.getState();
          if (cmp.isValid() && state === 'SUCCESS') {
              callback(cmp,evt,helper,res);
          } else if (state === 'ERROR') {
              if (typeof error === 'function') {
                  error(cmp,evt,helper);
              }
              else{
                  var errors = res.getError();
                  console.log('errors: ',errors);
                  if (errors && errors.length > 0) {
                      if(errors[0].message == 'Unauthorized'){
                          cmp.set('v.errorMessage','Unable to access Salesforce');
                      }if(errors[0].message == 'Failed'){
                          cmp.set('v.errorMessage',error);
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
              
          }
        });
        $A.enqueueAction(action);
  	},
    
	getDeskLabels: function (cmp, evt, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Getting Labels from Desk ...');
        var params = {authenticationId: cmp.get('v.oauthRecordIdentifier')};
        helper.callApex(cmp,evt,helper,'c.getDeskLabels',params,'Failed to get Labels from Desk',helper.getDeskLabelsCallback);   
    },
    
    getDeskLabelsCallback: function(cmp,evt,helper,res){
    	console.log(res.getReturnValue());
        cmp.set('v.deskLabels',res.getReturnValue());
        helper.getCaseTypePicklistValues(cmp,evt,helper);
	},
    
    getCaseTypePicklistValues: function (cmp,evt,helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Getting Case Type Picklist values from Salesforce ...');
        var params = {authenticationId: cmp.get('v.oauthRecordIdentifier')};
        helper.callApex(cmp,evt,helper,'c.getCaseTypeValuesApex',params,'Failed to get CaseType Picklist values from Salesforce',
                        helper.getCaseTypePicklistValuesCallback);   
    },
    
    getCaseTypePicklistValuesCallback: function (cmp,evt,helper,res) {
        console.log(res.getReturnValue());
        var caseTypePicklistValues = res.getReturnValue();
        var deskLabels = new Set();
        var caseTypeLabels = [];
        
        for(var label of cmp.get('v.deskLabels')){
            deskLabels.add(label.label);
        }
        
        var existingInSalesforceCount = 0;
        for(var picklistValue of caseTypePicklistValues){
            if(deskLabels.has(picklistValue)){
                caseTypeLabels.push({label: picklistValue.label, salesforceField: 'CaseType', existingInSalesforce: true, newToSalesforce: false});
                existingInSalesforceCount++;
            }
        }
        
        for(var i=0; i<3;i++){
            caseTypeLabels.push({label: null, salesforceField: 'CaseType', existingInSalesforce: false, newToSalesforce: true});
        }
        
        cmp.set('v.labelsCaseType',caseTypeLabels);
    	console.log(caseTypeLabels);
        
        var sectionDisplay = cmp.get('v.sectionDisplay');
        sectionDisplay['intro'] = false;
        sectionDisplay['casetype'] = true;
        cmp.set('v.sectionDisplay',sectionDisplay);
        cmp.set('v.isProcessing',false);
    }
    
})