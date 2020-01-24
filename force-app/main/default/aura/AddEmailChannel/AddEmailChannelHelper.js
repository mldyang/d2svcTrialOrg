({
	createEmailToCaseHelper: function(cmp, event, helper) {
        cmp.set('v.processingMessage','Adding your emails as Email-to-Case in Salesforce');
        cmp.set('v.isCreatingEmailToCase',true);
    	var emailsFromDesk = cmp.get('v.emailsFromDesk');
        console.log('emailsFromDesk: ',emailsFromDesk);
        var emailsManual = cmp.get('v.manualEmailRows');
        console.log('emailsManual: ',emailsManual);
        var emails = [];
        var vc = cmp.find('vc');
        for (var num in emailsFromDesk){
            var email = new Object();
            if(emailsFromDesk[num].selected){
                email.name = emailsFromDesk[num].name;
                email.email = emailsFromDesk[num].email;
                email.selected = false;
                email.caseOrigin = 'Email - '+emailsFromDesk[num].name;
                emails.push(email);
            }
        }
        for(var num in emailsManual){
            if(emailsManual[num].name && emailsManual[num].email){
                var email = new Object();
                email.name = emailsManual[num].name;
                email.email = emailsManual[num].email;
                email.caseOrigin = 'Email - '+emailsManual[num].name;
                email.selected = false;
                emails.push(email);
            }
        }
        var existingEmails = cmp.get('v.existingEmailToCase');
        if(existingEmails.length + emails.length == 1 && emails.length > 0){
            emails[0].caseOrigin = 'Email';
        }
        console.log('emails size: ', emails.length);
        cmp.set('v.emailsToVerify',emails);
        console.log('emails', emails);
        var action = cmp.get('c.createEmailToCaseApex');
        action.setParams({ edListString : JSON.stringify(emails), authenticationId: cmp.get('v.oauthRecordIdentifier') });
        action.setCallback(this, function(res) {
          var state = res.getState();
          if (state === 'SUCCESS') {
            var retValue = res.getReturnValue();
              if(retValue = 'Success'){
                  var sectionDisplay = cmp.get('v.sectionDisplay');
                  sectionDisplay['manualEmail'] = false;
                  sectionDisplay['verify'] = true;
                  cmp.find('backButton').set('v.disabled',true);
                  cmp.set('v.sectionDisplay',sectionDisplay);
                  cmp.set('v.isCreatingEmailToCase',false);
                  cmp.set('v.isProcessing',false);
                  cmp.find('backButton').set('v.disabled',true);
        	  	  cmp.find('nextButton').set('v.disabled',false);
                  vc.changeVideo(cmp.get('v.vcVideos')['email-verify'],
                                 'email-verify',
                                cmp.get('v.highlightTimestampsMap')['email-verify']);
                  console.log('createdEmails: ',retValue); 
              } else {
                  cmp.set('v.unknownError',true);
              }
          } else if (state === 'ERROR') {
                var errors = res.getError();
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to create Email-to-case in Salesforce'); 
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
              cmp.set('v.isCreatingEmailToCase',false); 
              cmp.set('v.isProcessing',false);

          }
            
        });
        $A.enqueueAction(action);
	},
    
    
    getDeskEmailsHelper: function (cmp, evt, helper) {
        var action = cmp.get('c.getDeskEmailsApex');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getDeskEmailsHelper: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var retValue = res.getReturnValue();
                var systemUserEmail = cmp.get('v.sfSystemUserEmail');
                for (var num in retValue){
                    if(retValue[num].email == systemUserEmail){
                        retValue.splice(num,1);
                        num--;
                    }
                }
                cmp.set('v.emailsFromDesk', retValue);
                helper.completeInitialization(cmp,evt,helper);
                //cmp.set('v.isLoading', !(retValue && retValue.length > 0));
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get list of inbound/outbound emails from Desk');
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
    
    getExistingEmailToCaseHelper: function (cmp, evt, helper,email) {
        cmp.set('v.isInitialising',true);
        var action = cmp.get('c.getExistingEmailToCaseApex');
        var vc = cmp.find('vc');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')}); 
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getExistingEmailToCaseHelper: ',res.getState(),res.getReturnValue());             
            if (state === 'SUCCESS') {
                var retValue = res.getReturnValue();
                var emails = retValue.emails;
                cmp.set('v.existingEmailToCase', emails);
                cmp.set('v.sfSystemUserEmail',retValue.systemUserEmail);
                if(!retValue.systemUserEmail.includes('.')){
                	  helper.getSystemUserEmailHelper(cmp,evt,helper);
                }
                //cmp.set('v.isLoading', !(retValue && retValue.length > 0));
                if(emails.length == 0){
                 	helper.getDeskEmailsHelper(cmp, evt, helper);
                }else{
                	cmp.set('v.isInitialising',false);
                      vc.changeVideo(cmp.get('v.vcVideos')['email-existing'],
                                   'email-existing',
                                   cmp.get('v.highlightTimestampsMap')['email-existing']); 
                    
                     /* vc.changeVideo(cmp.get('v.vcVideos')['complete'],
                                   'complete',
                                   cmp.get('v.highlightTimestampsMap')['complete']); */
                }
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
    
    getSystemUserEmailHelper: function (cmp, evt, helper,email) {
        var action = cmp.get('c.getSystemUserEmail');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')}); 
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getSystemUserEmail: ',res.getState(),res.getReturnValue());             
            if (state === 'SUCCESS') {
                var retValue = res.getReturnValue();
                cmp.set('v.sfSystemUserEmail',retValue);
            } else if (state === 'ERROR') {
                console.log('Unable to getSystemUserEmail');
            }
        });
        $A.enqueueAction(action);
    },
    
    completeInitialization: function(cmp,event,helper){
    	//cmp.set('v.isLoading', !(retValue && retValue.length > 0));
    	var existingEmailToCase = cmp.get('v.existingEmailToCase');
        var deskEmails = cmp.get('v.emailsFromDesk');
        var deskEmailsValidated = new Array();
        var exists = false;
        var vc = cmp.find('vc');
        for(var num in deskEmails){
            exists = false;
            for(var key in existingEmailToCase){
                if(deskEmails[num].email == existingEmailToCase[key].email){
                    exists = true;
                	break;
                }
            }
            if(!exists){
                deskEmailsValidated.push(deskEmails[num]);
            }
        }
        cmp.set('v.emailsFromDesk',deskEmailsValidated);
        if(deskEmailsValidated.length == 0){
            var sectionDisplay = cmp.get('v.sectionDisplay');
            sectionDisplay['existing'] = false;
            sectionDisplay['deskEmail'] = false;
            sectionDisplay['manualEmail'] = true;
            cmp.set('v.sectionDisplay',sectionDisplay);
            if(deskEmails.length == 0){
            	vc.changeVideo(cmp.get('v.vcVideos')['email-manualEmailNoDeskEmail'],
                               'email-manualEmailNoDeskEmail',
                               cmp.get('v.highlightTimestampsMap')['email-manualEmailNoDeskEmail']
                              );
            }else{
                vc.changeVideo(cmp.get('v.vcVideos')['email-manualEmailYesDeskEmail'],
                               'email-manualEmailYesDeskEmail',
                    		   cmp.get('v.highlightTimestampsMap')['email-manualEmailYesDeskEmail']
                              );
            }
            //cmp.find('backButton').set('v.disabled',true);
        }else{
            var sectionDisplay = cmp.get('v.sectionDisplay');
            sectionDisplay['existing'] = false;
            sectionDisplay['deskEmail'] = true;
            cmp.set('v.sectionDisplay',sectionDisplay);
            if(existingEmailToCase.length == 0){
            	vc.changeVideo(cmp.get('v.vcVideos')['email-deskEmail'],
                               'email-deskEmail',
                              cmp.get('v.highlightTimestampsMap')['email-deskEmail']);
            }else{
                vc.changeVideo(cmp.get('v.vcVideos')['email-deskEmailNoIntro'],
                               'email-deskEmailNoIntro',
                              cmp.get('v.highlightTimestampsMap')['email-deskEmailNoIntro']);
            }
        }

    	cmp.set('v.isInitialising', false);
        console.log('EmailToCase',cmp.get('v.existingEmailToCase'));
	},
    
    nextHelper: function(cmp,event,helper){
        cmp.set('v.showError',false);
        var section;
        var sectionDisplay = cmp.get('v.sectionDisplay');
        var vc = cmp.find('vc');
        if(sectionDisplay['existing']){
        	helper.getDeskEmailsHelper(cmp, event, helper);
            section = 'existing';
        } else if(sectionDisplay['deskEmail']){
            sectionDisplay['deskEmail'] = false;
            sectionDisplay['manualEmail'] = true;
            vc.changeVideo(cmp.get('v.vcVideos')['email-manualEmailYesDeskEmail'],
                           'email-manualEmailYesDeskEmail',
                          cmp.get('v.highlightTimestampsMap')['email-manualEmailYesDeskEmail']);
            cmp.find('backButton').set('v.disabled',false);
            cmp.set('v.sectionDisplay',sectionDisplay);
            section = 'deskEmail';
        } else if (sectionDisplay['manualEmail']){
            if(!helper.validateBeforeAddingEmails(cmp,event,helper)){
                return;
            }
            vc.changeVideo('');
            helper.getCaseOriginPicklistValues(cmp,event,helper,false);
            section = 'manualEmail';
            //helper.createEmailToCaseHelper(cmp,event,helper);            
        } else if (sectionDisplay['verify']){
            helper.confirmEmailVerificationHelper(cmp,event,helper);
            section = 'verify';
        } else if (sectionDisplay['complete']){
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
            section = 'complete';
        }
        helper.createRecipeActivity(cmp,{action: 'Next', recipe: 'Email', feature:'Recipe', section: section});
    },
    
    backHelper: function(cmp,event,helper){
        var sectionDisplay = cmp.get('v.sectionDisplay');
        var section;
        var vc = cmp.find('vc');
        if(sectionDisplay['existing']){
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
            section = 'existing';
        }
        else if(sectionDisplay['deskEmail']){
            if(!$A.util.isEmpty(cmp.get('v.existingEmailToCase')) && cmp.get('v.existingEmailToCase').length > 0){
                sectionDisplay['deskEmail'] = false;
                sectionDisplay['existing'] = true;
                vc.changeVideo(cmp.get('v.vcVideos')['email-existing'],
                                   'email-existing',
                                   cmp.get('v.highlightTimestampsMap')['email-existing']);
            }else{
                var myEvent = cmp.getEvent("recipeComponentChange");
                myEvent.setParams({"componentName": 'EmailRecipe'});
                myEvent.fire();
            }
			section = 'deskEmail';
        } else if (sectionDisplay['manualEmail']){
            if(!$A.util.isEmpty(cmp.get('v.emailsFromDesk')) && cmp.get('v.emailsFromDesk').length >0){
                sectionDisplay['manualEmail'] = false;
                sectionDisplay['deskEmail'] = true;
                cmp.find('backButton').set('v.disabled',false);
                cmp.find('nextButton').set('v.disabled',false);
                vc.changeVideo(cmp.get('v.vcVideos')['email-deskEmailNoIntro'],
                               'email-deskEmailNoIntro',
                              cmp.get('v.highlightTimestampsMap')['email-deskEmailNoIntro']);
            } else if (!$A.util.isEmpty(cmp.get('v.existingEmailToCase')) && cmp.get('v.existingEmailToCase').length > 0){
                sectionDisplay['manualEmail'] = false;
                sectionDisplay['existing'] = true;
                vc.changeVideo(cmp.get('v.vcVideos')['email-existing'],
                               'email-existing',
                               cmp.get('v.highlightTimestampsMap')['email-existing']);
            } else {
              	var myEvent = cmp.getEvent("recipeComponentChange");
                myEvent.setParams({"componentName": 'EmailRecipe'});
                myEvent.fire();  
            }
            section = 'manualEmail';
        } else if (sectionDisplay['verify']){
            section = 'verify';
            //no back button here
        } else if (sectionDisplay['complete']){
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
            section = 'complete';
        }
        cmp.set('v.sectionDisplay',sectionDisplay);
        helper.createRecipeActivity(cmp,{action: 'Back', recipe: 'Email', feature:'Recipe', section: section});
    },
    
     validateEmailHelper: function (email) {
       	//var email = evt.getSource().get("v.value");
        if(email == null) return false;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    
    validateBeforeAddingEmails: function(cmp, evt, helper){
        cmp.set('v.isCreatingEmailToCase',true);
        var existingEmailToCase = cmp.get('v.existingEmailToCase');
        var emailsFromDesk = cmp.get('v.emailsFromDesk');
        var emailsManual = cmp.get('v.manualEmailRows');
        var systemUserEmail = cmp.get('v.sfSystemUserEmail');
    	var emails = [];
        var emailSet = new Set();
        for(var num in emailsManual){
            if(emailsManual[num].email || emailsManual[num].name){
                if(!(emailsManual[num].email && emailsManual[num].name)){
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage','Information entered is not complete');
                    cmp.set('v.isCreatingEmailToCase',false);
                    window.scrollTo(0, 0, 'smooth');
                    return;
                }
            }
        }
        
        for(var num in emailsManual){
            if(emailsManual[num].email && !helper.validateEmailHelper(emailsManual[num].email)){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Review errors shown');
                cmp.set('v.isCreatingEmailToCase',false);
                window.scrollTo(0, 0, 'smooth');
                return false;
            }
            if(emailsManual[num].email && emailsManual[num].email == systemUserEmail){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Review errors shown');
                cmp.set('v.isCreatingEmailToCase',false);
                window.scrollTo(0, 0, 'smooth');
                return false;
            }
        }
        for (var num in emailsFromDesk){
            if(emailsFromDesk[num].selected){
                var email = new Object();
                email.name = emailsFromDesk[num].name;
                email.email = emailsFromDesk[num].email;
                email.selected = emailsFromDesk[num].selected;
                emails.push(email);
                emailSet.add(email.email);
            }
        }
        for(var num in emailsManual){
            for(var key in existingEmailToCase){
                if(emailsManual[num].email && existingEmailToCase[key].email == emailsManual[num].email){
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage','Review errors shown');
                    cmp.set('v.isCreatingEmailToCase',false);
                    window.scrollTo(0, 0, 'smooth');
                    return false;
                }
            }
            for(var key in emailsFromDesk){
                if(emailsManual[num].email && emailsFromDesk[key].email == emailsManual[num].email && emailsFromDesk[key].selected){
                    cmp.set("v.showError",true);
                    cmp.set('v.errorMessage','Review errors shown');
                    cmp.set('v.isCreatingEmailToCase',false);
                    window.scrollTo(0, 0, 'smooth');
                    return false;
                }
            }
            if(emailsManual[num].name && emailsManual[num].email){
              //&& emailsManual[num].name.length != 0 && emailsManual[num].email.length != 0 ){
                if(emailSet.has(emailsManual[num].email)){
                    cmp.set("v.showError",true);
                    cmp.set('v.errorMessage','Duplicate emails entered');
                    cmp.set('v.isCreatingEmailToCase',false);
                    window.scrollTo(0, 0, 'smooth');
                    return false;
                }
                var email = new Object();
                email.name = emailsManual[num].name;
                email.email = emailsManual[num].email;
                email.selected = true;
                emails.push(email);
                emailSet.add(email.email);
            }
        }
        console.log('emails size: ', emails.length);
        if(emails.length==0){
            cmp.set('v.showError',true);
            cmp.set('v.errorMessage','No emails selected to add.');
            cmp.set('v.isCreatingEmailToCase',false);
            window.scrollTo(0, 0, 'smooth');
            return false;
        } else {
            return true;
        } 
    },
    
    confirmEmailVerificationHelper: function (cmp, evt, helper) {
        var action = cmp.get('c.getExistingEmailToCaseApex');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')}); 
        cmp.set('v.isVerifying',true);
        var vc = cmp.find('vc');
        action.setCallback(this, function(res) {
            var state = res.getState();
            var unverifiedEmails;
            var errorMessage;
            if (state === 'SUCCESS') {
                var retValue = res.getReturnValue();
                var existingEmailToCase = retValue.emails;
                cmp.set('v.existingEmailToCase', existingEmailToCase);
                var emailsToVerify = cmp.get('v.emailsToVerify');
                var emailsToVerifySelected;

                for(var num in emailsToVerify){
                    if(emailsToVerify[num].selected){
                        if(!emailsToVerifySelected) {
                            emailsToVerifySelected = [];
                        }
                        emailsToVerifySelected.push(emailsToVerify[num]);
                    }
                    for(var key in existingEmailToCase){
                        if(emailsToVerify[num].selected && emailsToVerify[num].email == existingEmailToCase[key].email)
                           emailsToVerify[num].verified = existingEmailToCase[key].verified;
                    }
                    if(!emailsToVerify[num].verified){
                        if(!unverifiedEmails){
                            unverifiedEmails = emailsToVerify[num].email;
                        } else {
                            unverifiedEmails = unverifiedEmails +', ' + emailsToVerify[num].email;
                        }
                    }
                }
                if(unverifiedEmails && emailsToVerifySelected){
                     
                    if ((unverifiedEmails.match(/,/g) || []).length >= 1){
                        errorMessage = unverifiedEmails + ' have not been verified yet'
                    } else{
                        errorMessage= unverifiedEmails + ' has not been verified yet'
                    }
                    //if(cmp.get('v.verifyConfirmationCount') >= 1){
                        cmp.find('toast').set('v.link','Continue without verification');
                        cmp.find('toast').set('v.linkMessage','bypassVerification');
                        //errorMessage += '. Please note that you will not be able to use the email without verifying.<br/>' + '<a href="#" onClick="{!c.bypassVerification}">Continue without verification</a>';
                    //}
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage',errorMessage);
                    vc.changeVideo(cmp.get('v.vcVideos')['email-verifyError'],
                                   'email-verifyError',
                                  cmp.get('v.highlightTimestampsMap')['email-verifyError']);
                }
                else if(!emailsToVerifySelected){
                    errorMessage = 'No emails selected. Check against the email after verifying'
                    
                   /* if(cmp.get('v.verifyConfirmationCount') >= 1){
                        cmp.find('toast').set('v.link','Continue without verification');
                        cmp.find('toast').set('v.linkMessage','bypassVerification');
                        //errorMessage = '<a href="#" onClick="{!c.bypassVerification}">Continue without verification</a>. Please note that you will not be able to use the email without verifying';
                    }*/
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage',errorMessage);
                } else{
                    var sectionDisplay = cmp.get('v.sectionDisplay');
                    sectionDisplay['verify'] = false;
                    sectionDisplay['complete'] = true;
                    cmp.find('backButton').set('v.label','Exit');
                    cmp.find('backButton').set('v.disabled',false);
                    cmp.set('v.sectionDisplay',sectionDisplay);
                    //vc.changeVideo(cmp.get('v.vcVideos')['complete']);
                    vc.changeVideo(cmp.get('v.vcVideos')['email-complete'],
                                   'email-complete',
                                   cmp.get('v.highlightTimestampsMap')['email-complete']);
                    
                    cmp.set('v.showError',false);
                    helper.createRecipeActivity(cmp,{action: 'Complete', recipe: 'Email', feature:'Recipe'});
                }
                cmp.set('v.verifyConfirmationCount', cmp.get('v.verifyConfirmationCount')+1);
            } else if (state === 'ERROR') {
                var errors = res.getError();
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to check for verified Email-to-case configurations in Salesforce');  
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
                cmp.set('v.isCreatingEmailToCase',false);  
          	}
            cmp.set('v.isVerifying',false);
        });
        $A.enqueueAction(action);
    },   

	getCaseOriginPicklistValues: function (cmp, evt, helper, afterCreate) {
        cmp.set('v.processingMessage','Checking Case Origin picklist values ...')
        cmp.set('v.isProcessing',true);
        cmp.find('backButton').set('v.disabled',true);
        cmp.find('nextButton').set('v.disabled',true);
        var action = cmp.get('c.getCaseOriginPicklistValues');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier') });
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log(Date.now() + ': getCaseOriginPicklistValues responded');
            console.log('getCaseOriginPicklistValues state: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
               	cmp.set('v.caseOrigin',res.getReturnValue());
                var emailsFromDesk = cmp.get('v.emailsFromDesk');
                var emailsManual = cmp.get('v.manualEmailRows');
                var emails = [];
                for (var num in emailsFromDesk){
                    var email = new Object();
                    if(emailsFromDesk[num].selected){
                        email.name = emailsFromDesk[num].name;
                        email.email = emailsFromDesk[num].email;
                        email.selected = false;
                        emails.push(email);
                    }
                }
                for(var num in emailsManual){
                    if(emailsManual[num].name && emailsManual[num].email){
                        var email = new Object();
                        email.name = emailsManual[num].name;
                        email.email = emailsManual[num].email;
                        email.selected = false;
                        emails.push(email);
                    }
                }

                var expectedCaseOriginValues = [];
                var existingEmails = cmp.get('v.existingEmailToCase');
                if(existingEmails.length + emails.length == 1){
                   expectedCaseOriginValues.push('Email');
                }else{
                    for(let email of emails){
                        expectedCaseOriginValues.push('Email - '+email.name);
                    }
                }
                var caseOriginValuesToCreate = [];
                var exists = false;
                for(let co of expectedCaseOriginValues){
                    exists = false;
                    for(let k of res.getReturnValue()){
                        if(k.label == co){
                            exists = true;
                        }
                    }
                    if(!exists){
                        caseOriginValuesToCreate.push(co);
                    }
                }
                console.log('caseOriginValuesToCreate: ',caseOriginValuesToCreate);
                if(caseOriginValuesToCreate.length > 0){
                    if(!afterCreate){
                    	helper.createCaseOriginPicklistValues(cmp,evt,helper,caseOriginValuesToCreate);
                    }else{
                        cmp.set('v.errorMessage','Failed to create Case Origin Values. Try again by clicking the Next button. If failed on retry, contact support@desk.com');
                        cmp.set('v.showError',true);
                        cmp.find('toast').set('v.type','error');
                        //cmp.find('nextButton').set('v.disabled','true');
                        cmp.set('v.isProcessing',false);
                    }
                }else{
                    helper.createEmailToCaseHelper(cmp,evt,helper);
                }
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing Case Origin Values');
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
        console.log(Date.now() + ': getCaseOriginPicklistValues queued');
        $A.enqueueAction(action);
    },
    
    createCaseOriginPicklistValues: function (cmp, evt, helper, picklistValues) {
        cmp.set('v.processingMessage','Creating Case Origin Picklist values. This will take about a minute ...')
        console.log('isProcessing: ', cmp.get('v.isProcessing'));
        var action = cmp.get('c.createCaseOriginPicklistValues');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier'), valuesString: JSON.stringify(picklistValues)});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('createCaseOriginPicklistValues state: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                
                setTimeout(
                    $A.getCallback(function() {
                   	 	helper.getCaseOriginPicklistValues(cmp,event,helper,true);
                    }), 40000);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to create Case Origin Values');
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
    }
    
})