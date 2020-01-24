({
    
    vcShowRecommendedTab: function (cmp,evt,helper){
        console.log('changing tab to two for VC');
        cmp.find('multiple-emailtemplate-tabs').set("v.selectedTabId",'two');
    },
    
    vcShowTemplatesTab: function (cmp,evt,helper){
        console.log('changing tab to one for VC');
        cmp.find('multiple-emailtemplate-tabs').set("v.selectedTabId",'one');
    },
    
    validateModelSelection: function (cmp, evt, help){
        var modelOptions = cmp.get('v.modelOptions');
        if(!(modelOptions['common'] || modelOptions['customPerChannel'])){
            return false;
        }else{
            return true;
        }
    },
    
	getOrgWideEmailAddresses: function (cmp, evt, helper) {
        var action = cmp.get('c.getOrgWideEmailAddressesApex');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getOrgWideEmailAddressesApex: ',res.getState());            
            if (state === 'SUCCESS') {
                var orgWideEmailAddresses = res.getReturnValue();
                var existingEmailToCase = cmp.get('v.existingEmailToCase');
                var orgWideEmailAddressesValidated = new Array();
                var orgWideEmailAddressesValidatedVerified = new Array();
                var orgWideEmailAddressesValidatedUnverified = new Array();
                var exists = false;
                for(var num in orgWideEmailAddresses){
				    exists = false;
                    for(var key in existingEmailToCase){
                        if(orgWideEmailAddresses[num].email == existingEmailToCase[key].email){
                            exists = true;
                        }
                    }
                    if(!exists){
                        orgWideEmailAddressesValidated.push(orgWideEmailAddresses[num]);
                    }
                }
                
                for(var key in orgWideEmailAddressesValidated){
                    if(orgWideEmailAddressesValidated[key].verified){
                        orgWideEmailAddressesValidatedVerified.push(orgWideEmailAddressesValidated[key]);
                    }else{
                        orgWideEmailAddressesValidatedUnverified.push(orgWideEmailAddressesValidated[key]);
                    }
                }
                
                cmp.set('v.orgWideEmailAddresses', orgWideEmailAddressesValidatedVerified);
                cmp.set('v.orgWideEmailAddressesUnverified', orgWideEmailAddressesValidatedUnverified);
                
                
                var verifiedEmailExists = false;
                for(var key in orgWideEmailAddressesValidated){
                    if(orgWideEmailAddressesValidated[key].verified){
                        verifiedEmailExists = true;
                        break;
                    }
                }
                
                //cmp.set('v.fromEmailOptions',fromEmailOptions);
                helper.getCurrentUser(cmp,evt,helper,verifiedEmailExists);
                //cmp.set('v.isProcessingOrgWideAddress',false);
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing from emails from Salesforce');
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
    
   	createOrgWideEmailAddress: function (cmp, evt, helper) {
        var action = cmp.get('c.createOrgWideEmailAddressApex');
        var fromEmail = cmp.get('v.fromEmail');
        var fromName = cmp.get('v.fromName');
        var orgWideEmailAddressesUnverified = cmp.get('v.orgWideEmailAddressesUnverified');
        var existingMatchingUnverifiedId = null;
        for(var existingUnverifiedEmail of orgWideEmailAddressesUnverified){
            if (fromEmail == existingUnverifiedEmail.email){
                existingMatchingUnverifiedId = existingUnverifiedEmail.recordId;
            }
        }
        action.setParams({email: fromEmail, displayName: fromName, existingMatchingUnverifiedId: existingMatchingUnverifiedId, authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('createOrgWideEmailAddressesApex: ',res.getState());            
            if (state === 'SUCCESS') {
                var retValue = res.getReturnValue();
                var sectionDisplay = cmp.get('v.sectionDisplay');
                cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['verifyEmail'],
                                   'verifyEmail',
                                   cmp.get('v.highlightTimestampsMap')['verifyEmail'],
                                           null,800
                                  );
                sectionDisplay['fromAddress'] = false;
                sectionDisplay['verify'] = true;
                //cmp.find('backButton').set('v.disabled',true);
               	cmp.set('v.fromEmailId',retValue);
                cmp.set('v.isProcessingOrgWideAddress',false);
                cmp.set('v.sectionDisplay',sectionDisplay);
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to add email to Salesforce');
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
    
    checkIfOrgWideEmailAddressVerified: function (cmp, evt, helper) {
        var action = cmp.get('c.checkIfOrgWideEmailAddressVerifiedApex');
        var fromEmailId = cmp.get('v.fromEmailId');
        action.setParams({id: fromEmailId, authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('verifyOrgWideEmailAddressesApex: ',res.getState());            
            if (state === 'SUCCESS') {
                var retValue = res.getReturnValue();
                if(retValue){
                    var sectionDisplay = cmp.get('v.sectionDisplay');
                    sectionDisplay['verify'] = false;
                    if($A.util.isEmpty(cmp.get('v.existingEmailToCase'))){
                        sectionDisplay['content'] = true;
                        helper.getTemplateInfo(cmp,event,helper);
                    }else{
                        sectionDisplay['reply'] = true;
                        cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['customerReply'],
                                   'customerReply',
                                   cmp.get('v.highlightTimestampsMap')['customerReply'],
                                                   null,800
                                  );
                    }
                    cmp.set('v.isVerifying',false);
                    cmp.set('v.sectionDisplay',sectionDisplay);
                    cmp.find('backButton').set('v.disabled',false);
                }else{
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage',cmp.get('v.fromEmail')+' has not been verified');
                    cmp.set('v.isVerifying',false);
                }
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get from email information from Salesforce');
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
    
    
    
    
    /* This method is not being used. 
     * Instead the method below, getCurrentUser is used
     * since autoresponse from address can only be set to that of current user.
     */
    getUsers: function (cmp, evt, helper) {
        var action = cmp.get('c.getUsersApex');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getUsers: ',res.getState());            
            if (state === 'SUCCESS') {
                var users = res.getReturnValue();
                cmp.set('v.users', users);
                cmp.set('v.isFetchingUsers',false);
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get user info from Salesforce');
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
    
    getCurrentUser: function (cmp, evt, helper,verifiedEmailExists) {
        var action = cmp.get('c.getCurrentUser');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getCurrentUser: ',res.getState());            
            if (state === 'SUCCESS') {
                var currentUser = res.getReturnValue();
                cmp.set('v.currentUser', currentUser);
                if(verifiedEmailExists){
                    if($A.util.isEmpty(cmp.get('v.existingAutoresponse')) || cmp.get('v.toShowModelOptions')['customPerChannel']){
                        cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['fromAddressWithIntroWithExistingEmail'],
                                   'fromAddressWithIntroWithExistingEmail',
                                   cmp.get('v.highlightTimestampsMap')['fromAddressWithIntroWithExistingEmail'],
                                   null,850
                                  );
                    }else{
                        cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['fromAddressWithoutIntroWithExistingEmail'],
                                   'fromAddressWithoutIntroWithExistingEmail',
                                   cmp.get('v.highlightTimestampsMap')['fromAddressWithoutIntroWithExistingEmail'],
                                   null,850
                                  );
                    }
                    var fromEmailOptions = [
                        {'label': 'Add a new from email address (verification required)', 'value': 'new'},
                        {'label': 'Choose an existing verified from Email address (cannot be any of your support emails)', 'value': 'existing'},                                                             
                        {'label': 'Use your email ('+ currentUser[1] +') as from email address', 'value': 'user'}
                   ];
                } else {
                    if($A.util.isEmpty(cmp.get('v.existingAutoresponse')) || cmp.get('v.toShowModelOptions')['customPerChannel']){
                        cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['fromAddressWithIntroWithoutExistingEmail'],
                                   'fromAddressWithIntroWithoutExistingEmail',
                                   cmp.get('v.highlightTimestampsMap')['fromAddressWithIntroWithoutExistingEmail'],
                                   null, 850
                                  );
                    }else{
                        cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['fromAddressWithoutIntroWithoutExistingEmail'],
                                   'fromAddressWithoutIntroWithoutExistingEmail',
                                   cmp.get('v.highlightTimestampsMap')['fromAddressWithoutIntroWithoutExistingEmail'],
                                   null,850
                                  );
                    }
                    var fromEmailOptions = [
                        {'label': 'Add a new from email address (verification required)', 'value': 'new'},
                        {'label': 'Use your email ('+ currentUser[1] +') as from email address', 'value': 'user'}
                   ];
                }
                cmp.set('v.fromEmailOptions',fromEmailOptions);
                
                //cmp.set('v.isFetchingUsers',false);
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get user info from Salesforce');
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
            cmp.set('v.isProcessingOrgWideAddress',false);
        });
        $A.enqueueAction(action);
    },
    
    /* This method is used when the model is one email template for all channels 
     * -> calls createEmailTemplate
    */
    getTemplateInfo: function (cmp, evt, helper) {
        var action = cmp.get('c.getEmailTemplateInfo');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getTemplateInfo: ',res.getState());            
            if (state === 'SUCCESS') {
                var templateInfo = res.getReturnValue();
                console.log('templateInfo: ', templateInfo);
                cmp.set('v.templateInfo',templateInfo);
                if(!templateInfo){
                    var templateToCreate = [];
                    var emailTemplate = {};
                    emailTemplate.name = 'Auto Response Email To Customer';               
                    emailTemplate.fullName = 'Services_Templates/Auto_Response_Email_to_Customer';
                    emailTemplate.description = 'Auto Response Email Template for Email Channel';
                    templateToCreate.push(emailTemplate);
                    helper.createEmailTemplate(cmp,evt,helper,templateToCreate)
                }else{
                	cmp.set('v.isProcessing', false);
                    cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['emailTemplateSingle'],
                                   'emailTemplateSingle',
                                   cmp.get('v.highlightTimestampsMap')['emailTemplateSingle'],
                                   null,750
                                  );
                }
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing template information from Salesforce');
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
    
    /* This method is used when it is different email template for each channel 
     * -> calls createEmailTemplates
    */
    getAllTemplateInfo: function (cmp, evt, helper) {
        var action = cmp.get('c.getAllEmailTemplateInfo');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getAllTemplateInfo: ',res.getState());            
            if (state === 'SUCCESS') {
                var allTemplateInfo = res.getReturnValue();
                //console.log('alltemplateInfo: ', allTemplateInfo);
                cmp.set('v.allTemplateInfo',allTemplateInfo);
                var templatesToCreate = [];
                
                var emails = cmp.get('v.existingEmailToCase');
                var templateExists;
                for(let email of emails){
                    templateExists = false;
                    for(let template of allTemplateInfo){
                        if(template.developerName == 'Auto_Response_Email_to_Customer_'+email.name.split(' ').join('_').replace(/[^a-zA-Z_]/g, "_").replace(/_+/g,'_').replace(/_$/,'').replace(/^_/,'')){
                            templateExists = true;
                            template.email = email;
                            template.caseOrigin = email.caseOrigin;
                            template.selected = true;
                            template.fullName = 'Services_Templates/Auto_Response_Email_to_Customer_'+email.name.split(' ').join('_').replace(/[^a-zA-Z_]/g, "_").replace(/_+/g,'_').replace(/_$/,'').replace(/^_/,'');
                        }
                    }
                    if(!templateExists){
                        var emailTemplate = {};
                        emailTemplate.name = 'Auto Response Email To Customer - '+email.name;
                        emailTemplate.fullName = 'Services_Templates/Auto_Response_Email_to_Customer_'+email.name.split(' ').join('_').replace(/[^a-zA-Z_]/g, "_").replace(/_+/g,'_').replace(/_$/,'').replace(/^_/,'');
                        emailTemplate.description = 'Auto Response Email Template for emails from '+email.name+' email channel';
                        templatesToCreate.push(emailTemplate);
                    }
                }
                if(templatesToCreate.length > 0){
                    helper.createEmailTemplates(cmp,evt,helper,templatesToCreate);
                }else{
					cmp.set('v.isProcessing', false);
                    cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['emailTemplateMultiple'],
                                   'emailTemplateMultiple',
                                   cmp.get('v.highlightTimestampsMap')['emailTemplateMultiple']
                                  );
                }
                cmp.set('v.allTemplateInfo',allTemplateInfo);
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing template information from Salesforce');
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
                cmp.set('v.isFetchingTemplate', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    createEmailTemplate: function (cmp, evt, helper, emailTemplateToCreate) {
        var action = cmp.get('c.createEmailTemplates');
        action.setParams({emailTemplatesListString: JSON.stringify(emailTemplateToCreate), authenticationId: cmp.get('v.oauthRecordIdentifier') });
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('createEmailTemplates: ',res.getState());            
            if (state === 'SUCCESS') {
                helper.getTemplateInfo(cmp,evt,helper);
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to create email templates');
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
    
    createEmailTemplates: function (cmp, evt, helper, emailTemplatesToCreate) {
        var action = cmp.get('c.createEmailTemplates');
        action.setParams({emailTemplatesListString: JSON.stringify(emailTemplatesToCreate), authenticationId: cmp.get('v.oauthRecordIdentifier') });
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('createEmailTemplates: ',res.getState());            
            if (state === 'SUCCESS') {
                helper.getAllTemplateInfo(cmp,evt,helper);
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to create email templates');
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
    
    /* 
     * INIT process starts here
     * getExistingEmailToCaseHelper 
     * -> getExistingCaseAutoResponseRuleInit
     * -> getAllTemplateInfoInit
     * 
     */
    
    getExistingEmailToCaseHelper: function (cmp, evt, helper) {
        cmp.set('v.isInitialising', true);
        var action = cmp.get('c.getExistingEmailToCaseApex');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getExistingEmailToCaseHelper: ',res.getState(),res.getError());             
            if (state === 'SUCCESS') {
                var retValue = res.getReturnValue();
                var emails = retValue.emails;
                var verifiedEmails = [];
                for(let email of emails){
                    email.viewLabel = email.name.split(' ').join('_');
                    if(email.verified){verifiedEmails.push(email);}
                }
                
                console.log('getExistingEmailToCaseHelper: ',emails); 
                /*for (var num in emails){
                    if(!emails[num].verified){
                        emails.splice(num,1);
                    }
                }*/
                cmp.set('v.existingEmailToCase', verifiedEmails);
                if(verifiedEmails.length > 1){
                    var modelOptions = cmp.get('v.toShowModelOptions');
                    modelOptions['customPerChannel'] = true;
                    cmp.set('v.toShowModelOptions',modelOptions);
                    
                }else if (verifiedEmails.length == 0){
                    cmp.set('v.showError',true);
                	cmp.find('toast').set('v.type','error');
                    cmp.set('v.errorMessage','A verified email channel does not exist. Add an email channel before setting up Auto-response.');
                    cmp.set('v.isInitialising', false);
                    cmp.find('nextButton').set('v.disabled','true');
                    cmp.set('v.noVerifiedEmail',true);
                    return;
                }
                helper.getExistingCaseAutoResponseRuleInit(cmp,evt,helper);
                //cmp.set('v.isInitialising', false);
                
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
                cmp.set('v.isInitialising', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    getExistingCaseAutoResponseRuleInit: function (cmp, evt, helper) {
        cmp.set('v.processingMessage','Checking existing Auto-response rules ...');
        var action = cmp.get('c.getCaseAutoResponseRuleApex');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getUsers: ',res.getState());            
            if (state === 'SUCCESS') {
                
                var existingCaseAutoResponseRules = res.getReturnValue();
                console.log('existingCaseAutoResponseRules: ', existingCaseAutoResponseRules);
                var autoResponseRuleSet = new Set();
                var knownModel = true;
                for(var num in existingCaseAutoResponseRules){
                    autoResponseRuleSet.add(existingCaseAutoResponseRules[num].fullName.toLowerCase());
                    if(existingCaseAutoResponseRules[num].isActive){
                        cmp.set('v.existingAutoresponse',existingCaseAutoResponseRules[num]);
                        for(let ruleEntry of existingCaseAutoResponseRules[num].ruleEntryList){
                            for(let filterItem of ruleEntry.filterItems){
                                if(filterItem.field != 'Case.Origin' || filterItem.filterOperation != 'equals'){
                                    if(!(filterItem.field == 'Case.Origin' && filterItem.value.startsWith('Email') && filterItem.filterOperation == 'startsWith')){
                                    	knownModel = false;
                                    }
                                }
                            }
                        }
                        existingCaseAutoResponseRules[num].knownModel = knownModel;
                    }
                }
                
                //rulename
                var count = 0;
                var ruleName = 'Standard';
                var ruleNameFinal = ruleName;
                while(autoResponseRuleSet.has(ruleNameFinal.toLowerCase())){
                    count++;
                    ruleNameFinal = ruleName+count;
                }
                cmp.set('v.ruleName',ruleNameFinal);
                
                var emails = cmp.get('v.existingEmailToCase');
                if(knownModel && !$A.util.isEmpty(cmp.get('v.existingAutoresponse'))){
                    var ruleEntryList = cmp.get('v.existingAutoresponse').ruleEntryList
                    for(let ruleEntry of ruleEntryList){
                        
                            for(let filterItem of ruleEntry.filterItems){
                                for(let email of emails){
                                    if(filterItem.value == email.caseOrigin){
                                       email.emailTemplate = ruleEntry.emailTemplate;
                                    }else if(filterItem.value == 'Email' && 
                                             emails.length == 1){
                                       email.emailTemplate = ruleEntry.emailTemplate; 
                                    }else if(filterItem.value == 'Email' && 
                                             filterItem.fitlerOperation == 'startsWith'){
                                       email.emailTemplate = ruleEntry.emailTemplate; 
                                    }
                                }
                            }
                        
                    }
                    cmp.set('v.existingEmailToCase',emails);
                    helper.getAllTemplateInfoInit(cmp,evt,helper);
                }else{
                    var sectionDisplay = cmp.get('v.sectionDisplay');
                    if(cmp.get('v.toShowModelOptions')[['customPerChannel']]){
                        cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['modelWithIntro'],
                                   'modelWithIntro',
                                   cmp.get('v.highlightTimestampsMap')['modelWithIntro'],
                                   null,850
                                  );
                        sectionDisplay['existing'] = false;
                        sectionDisplay['model'] = true;
                        
                    }else{
                        sectionDisplay['existing'] = false;
                        sectionDisplay['fromAddress'] = true;
                        cmp.get('v.modelOptions').common = true;
                        cmp.set('v.isProcessingOrgWideAddress',true);
                        helper.getOrgWideEmailAddresses(cmp,event,helper);
                    }
                    cmp.set('v.sectionDisplay',sectionDisplay);
                    cmp.set('v.isInitialising', false);  
                }
                
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
    
    getAllTemplateInfoInit: function (cmp, evt, helper) {
        var action = cmp.get('c.getAllEmailTemplateInfo');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getAllTemplateInfo: ',res.getState());            
            if (state === 'SUCCESS') {
                var allTemplateInfo = res.getReturnValue();
                //console.log('alltemplateInfo: ', allTemplateInfo);
                cmp.set('v.allTemplateInfo',allTemplateInfo);
                var emails = cmp.get('v.existingEmailToCase');
                for(let ruleEntry of cmp.get('v.existingAutoresponse').ruleEntryList){
                    for(let filterItem of ruleEntry.filterItems){
                        for(let email of emails){
                            if(email.emailTemplate){
                                for(let template of allTemplateInfo){
                                    var templateName = email.emailTemplate.split('/')[1];
                                    if(templateName == template.developerName){
                                        email.emailTemplateId = template.Id;
                                        email.url = template.url;
                                        email.sessionId = template.sessionId;
                                    }
                                }
                            }
                        }
                    }
                }
                
                var singleModel = {};
                var count = 0;
                for(let email of emails){
                    if(email.emailTemplateId){
                        count++;
                        if(!singleModel.emailTemplateId){
                            singleModel.emailTemplateId = email.emailTemplateId;
                            singleModel.url = email.url;
                            singleModel.sessionId = email.sessionId;
                            singleModel.emails = email.email;
                        }else{
                            if(singleModel.emailTemplateId != email.emailTemplateId){
                                singleModel = null;
                                break;
                            }else{
                                singleModel.emails += ', '+ email.email;
                            }
                        }
                    }
                }
                if(count == 1){
                    singleModel = null;
                }
                cmp.set('v.singleModel',singleModel)
                cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['existing'],
                               'existing',
                    		   cmp.get('v.highlightTimestampsMap')['existing'],
                                null, 800
                              );
                /*cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['complete'],
                               'complete',
                    		   cmp.get('v.highlightTimestampsMap')['complete'],
                                null, 800
                              );*/
                cmp.set('v.isInitialising', false);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing template information from Salesforce');
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
                cmp.set('v.isFetchingTemplate', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    
    
    /* Starting point for creating autoresponse rules
     * gets exsting auto response rules 
     * -> [NO MORE] calls getCaseOriginPicklistValues
     * -> [NO MORE] calls createCaseOriginPicklistValues if required (if all case origin values are not there)
     * -> [NO MORE] calls back getCaseOriginPicklistValue to confirm all picklist values have been created
     * -> calls createCaseAutoResponseRule
     */
    getExistingCaseAutoResponseRule: function (cmp, evt, helper) {
        cmp.set('v.processingMessage','Checking existing Auto-response rules ...');
        var action = cmp.get('c.getCaseAutoResponseRuleApex');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getUsers: ',res.getState());            
            if (state === 'SUCCESS') {
                
                var existingCaseAutoResponseRules = res.getReturnValue();
                console.log('existingCaseAutoResponseRules: ', existingCaseAutoResponseRules);
                var autoResponseRuleSet = new Set();
                for(var num in existingCaseAutoResponseRules){
                    autoResponseRuleSet.add(existingCaseAutoResponseRules[num].fullName.toLowerCase());
                }
                var count = 0;
                var ruleName = 'Standard';
                var ruleNameFinal = ruleName;
                while(autoResponseRuleSet.has(ruleNameFinal.toLowerCase())){
                    count++;
                    ruleNameFinal = ruleName+count;
                }
                cmp.set('v.ruleName',ruleNameFinal);
                //helper.getCaseOriginPicklistValues(cmp,evt,helper,false);
                helper.createCaseAutoResponseRule(cmp,event,helper)
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
    
    createCaseAutoResponseRule: function (cmp, evt, helper) {
        cmp.set('v.processingMessage','Creating Auto-response rules ...')
        var ruleName = cmp.get('v.ruleName');
        var action = cmp.get('c.createCaseAutoResponseApex');
        var model = cmp.get('v.modelOptions');
        var caseAutoResponseString = {isActive: true, fullName: ruleName};
        var replyToEmail;
        var fromEmail = cmp.get('v.fromEmail');
        var fromName = cmp.get('v.fromName');
        var ruleEntryList;
        var filterItems;
        if(model.customPerChannel){
            var allTemplates = cmp.get('v.allTemplateInfo');
            ruleEntryList = [];
            for(let template of allTemplates){
                if(template.selected && template.email){
                    if(cmp.get('v.replyEmailSelectedOption') == 'yes'){
                    	replyToEmail = template.email.email;
                    }else{
                        replyToEmail = null; //cmp.get('v.fromEmail');
                    }
                    //filterItems = [{field: 'Case.Origin', filterOperation: 'equals', value: 'Email - ' + template.email.name}];
                    filterItems = [{field: 'Case.Origin', filterOperation: 'equals', value: template.caseOrigin}];
                    ruleEntryList.push({replyToEmail: replyToEmail, senderEmail: fromEmail, senderName: fromName, emailTemplate: template.fullName, notifyCcRecipients: true, filterItems: filterItems});
                    
                }
            }
            caseAutoResponseString.ruleEntryList = ruleEntryList;
        }else if(model.common){
            var emailTemplate = 'Services_Templates/Auto_Response_Email_to_Customer';
            var isActive = true;
            var emails = cmp.get('v.existingEmailToCase');
            replyToEmail = $A.util.isEmpty(cmp.get('v.replyEmail')) ? cmp.get('v.fromEmail') : cmp.get('v.replyEmail');
            if(cmp.get('v.replyEmailSelectedOption') == 'yes'){
                ruleEntryList = [];
                for(let email of emails){
                    filterItems = [{field: 'Case.Origin', filterOperation: 'equals', value: (emails.length == 1 || !email.caseOrigin) ? 'Email' : email.caseOrigin}];
                    ruleEntryList.push({replyToEmail: email.email, senderEmail: fromEmail, senderName: fromName, emailTemplate: emailTemplate, notifyCcRecipients: true, filterItems: filterItems});
                }
                caseAutoResponseString.ruleEntryList = ruleEntryList;
            }else{
                caseAutoResponseString = {isActive: true, fullName: ruleName, ruleEntryList: [
                    {replyToEmail: replyToEmail, senderEmail: fromEmail, senderName: fromName, emailTemplate: emailTemplate, notifyCcRecipients: true,
                     filterItems:[{field: 'Case.Origin', filterOperation: 'startsWith', value: 'Email'}]}]};
            }
        }
        console.log('caseAutoResponseStringParam: ',JSON.stringify(caseAutoResponseString));
        
        action.setParams({caseAutoResponseString: JSON.stringify(caseAutoResponseString), authenticationId: cmp.get('v.oauthRecordIdentifier') });
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('createCaseAutoResponseRule: ',res.getState());            
            if (state === 'SUCCESS') {
                var retValue = res.getReturnValue();
                var sectionDisplay = cmp.get('v.sectionDisplay');
                sectionDisplay['content'] = false;
                sectionDisplay['contentMultiple'] = false;
                sectionDisplay['complete'] = true;
                cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['complete'],
                                   'complete',
                                   cmp.get('v.highlightTimestampsMap')['complete'],
                                           125,800
                                  );
               	cmp.set('v.fromEmailId',retValue);
                cmp.set('v.isProcessing',false);
                cmp.set('v.sectionDisplay',sectionDisplay);
                helper.createRecipeActivity(cmp,{action: 'Complete', recipe: 'Auto-response', feature:'Recipe'});
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to create auto-response');
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
    
    getCaseOriginPicklistValues: function (cmp, evt, helper,afterCreate) {
        cmp.set('v.processingMessage','Checking Case Origin picklist values ...')
        var action = cmp.get('c.getCaseOriginPicklistValues');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier') });
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log(Date.now() + ': getCaseOriginPicklistValues responded');
            console.log('getCaseOriginPicklistValues state: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
               	cmp.set('v.caseOrigin',res.getReturnValue());
                var emails = cmp.get('v.existingEmailToCase');
                var expectedCaseOriginValues = [];
                
                if(emails.length == 1){
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
	                    helper.createCaseOriginPicklistValues(cmp,event,helper,caseOriginValuesToCreate);
                    }else{
                        cmp.set('v.errorMessage','Failed to create Case Origin Values.');
						cmp.set('v.showError',true);
                        cmp.find('toast').set('v.type','error');
                        cmp.find('nextButton').set('v.disabled','true');                        
                    }
                }else{
                    helper.createCaseAutoResponseRule(cmp,event,helper);
                }
                cmp.set('v.processing',false);
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
        cmp.set('v.processingMessage','Creating Case Origin Picklist values. This will take 40 seconds ...')
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
    },
    
    validateEmailHelper: function (email) {
        if(email == null) return false;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    
    validateNewFromEmail: function (cmp,evt,helper){
        var email = cmp.get('v.fromEmail');
        var name = cmp.get('v.fromName');
        if(!(email && name)){
            cmp.set('v.showError',true);
            cmp.set('v.errorMessage','Please Enter Name and Email Address.');
            cmp.set('v.isProcessingOrgWideAddress',false);
            return false;
        }
        if(!helper.validateEmailHelper(email)){
            cmp.set('v.showError',true);
            cmp.set('v.errorMessage','Review errors shown');
            cmp.set('v.isProcessingOrgWideAddress',false);
            return false;
        }else{
            //var enteredEmail = evt.getSource().get('v.value');
            var existingEmails = cmp.get('v.orgWideEmailAddresses');
            var existingEmailToCase = cmp.get('v.existingEmailToCase');
            for(var key in existingEmails){
                if(existingEmails[key].email == email ){
                    cmp.set('v.emailErrorMessage','This email exists in your Salesforce Org');
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage','Review errors shown');
                    cmp.set('v.isProcessingOrgWideAddress',false);
                    return false;
                }
            }
            key = 0;
            for(key in existingEmailToCase){
                if(existingEmailToCase[key].email == email ){
                    cmp.set('v.emailErrorMessage','Support channel emails cannot be used');
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage','Review errors shown');
                    cmp.set('v.isProcessingOrgWideAddress',false);
                    return false;
                }
            }
                
        }
        return true;
    }
})