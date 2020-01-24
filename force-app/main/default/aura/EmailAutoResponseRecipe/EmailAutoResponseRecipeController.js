({
	
    init : function(cmp, event, helper) {
    	helper.getExistingEmailToCaseHelper(cmp,event,helper);
    	//helper.getOrgWideEmailAddresses(cmp,event,helper);
    	cmp.get('v.highlightTimestampsMap').emailTemplateMultiple[1] = helper.vcShowTemplatesTab;
    	cmp.get('v.highlightTimestampsMap').emailTemplateMultiple[24] = helper.vcShowRecommendedTab;
        helper.createRecipeActivity(cmp,{action: 'Load', recipe: 'Auto-response', feature:'Recipe'});
    },
    
    modelOptions : function(cmp, event, helper) {
		var modelOptions = cmp.get('v.modelOptions');        
        
        //If either common or customPerChannel is deselected, businesssHours will be deselected as well
        if(!(modelOptions['common'] || modelOptions['customPerChannel'])){
            modelOptions['businessHours'] = false;
            cmp.set('v.modelOptions',modelOptions);
        }
	},
    
    next : function(cmp, event, helper) {
        cmp.set('v.showError',false);
        var section;
        var sectionDisplay = cmp.get('v.sectionDisplay');
        if(sectionDisplay['existing']){
            section = 'existing';
            if(cmp.get('v.modelOptions')['customPerChannel']){
                sectionDisplay['existing'] = false;
           		sectionDisplay['model'] = true;
                cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['modelWithoutIntro'],
                                   'modelWithoutIntro',
                                   cmp.get('v.highlightTimestampsMap')['modelWithoutIntro'],
                                   null,850
                                  );
            }else{
                sectionDisplay['existing'] = false;
                sectionDisplay['fromAddress'] = true;
                cmp.get('v.modelOptions').common = true;
                cmp.set('v.isProcessingOrgWideAddress',true);
                helper.getOrgWideEmailAddresses(cmp,event,helper);
            }
        } else if(sectionDisplay['model']){
            section = 'model';
            if(!helper.validateModelSelection(cmp,event,helper)){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Please select a model to proceed');
                return;
            } else{
                sectionDisplay['model'] = false;
                sectionDisplay['fromAddress'] = true;
                cmp.set('v.isProcessingOrgWideAddress',true);
                helper.getOrgWideEmailAddresses(cmp,event,helper);
            }
        } else if (sectionDisplay['fromAddress']){
            section = 'fromAddress';
            var selectedOption = cmp.get('v.fromEmailSelectedOption');
            if(selectedOption == 'new'){
                cmp.set('v.isProcessingOrgWideAddress',true);
                cmp.set('v.processingMessage','Adding email to Salesforce')
                if(helper.validateNewFromEmail(cmp,event,helper)){
                    helper.createOrgWideEmailAddress(cmp,event,helper);
                }
            }
            if(selectedOption == 'existing' || selectedOption == 'user'){
                if($A.util.isEmpty(cmp.get('v.fromEmail'))){
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage','Choose a from Email address');
                    return;
                }
                if(selectedOption == 'user'){
                    var email = cmp.get('v.fromEmail')
                    var existingEmailToCase = cmp.get('v.existingEmailToCase');
                    for(var key in existingEmailToCase){
                        if(existingEmailToCase[key].email == email ){
                            cmp.set('v.showError',true);
                            cmp.set('v.errorMessage','The user email is also being used as a support channel email which makes this option invalid.');
                            return false;
                        }
                    }
                }
            	sectionDisplay['fromAddress'] = false;	
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
            }
            console.log('existingEmailSelected: ',cmp.get('v.fromEmail'))
                      
        } else if (sectionDisplay['verify']){
            section = 'verify';
            if(!cmp.get('v.verifyEmailSelected')){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','No email selected to confirm verification')
                return;
            }
            helper.checkIfOrgWideEmailAddressVerified(cmp,event,helper);
        } else if (sectionDisplay['reply']){
            section = 'reply';
  			 cmp.set('v.isProcessing',true);
             cmp.set('v.processingMessage','Fetching Email Template Information');

             var model = cmp.get('v.modelOptions');
             if(model.common){
                 sectionDisplay['reply'] = false;
             	 sectionDisplay['content'] = true;
   		         helper.getTemplateInfo(cmp,event,helper);
             }else if (model.customPerChannel){
                 sectionDisplay['reply'] = false;
                 sectionDisplay['contentMultiple'] = true;
                 helper.getAllTemplateInfo(cmp,event,helper);
             }
        } else if (sectionDisplay['content']){
            section = 'content';
           	cmp.set('v.isProcessing',true);
            cmp.set('v.processingMessage','Creating Auto-response');	
            cmp.find('backButton').set('v.label','Exit');
  			helper.getExistingCaseAutoResponseRule(cmp,event,helper);
        }else if (sectionDisplay['contentMultiple']){
             section = 'contentMultiple';
           	cmp.set('v.isProcessing',true);
            cmp.set('v.processingMessage','Creating Auto-response');	
            cmp.find('backButton').set('v.label','Exit');
  			helper.getExistingCaseAutoResponseRule(cmp,event,helper);
        }else if (sectionDisplay['complete']){
            section = 'complete';
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();         
        }
        cmp.set('v.sectionDisplay',sectionDisplay);
        helper.createRecipeActivity(cmp,{action: 'Next', recipe: 'Auto-response', feature:'Recipe', section: section});

	},
    
    back : function(cmp, event, helper) {
        var section;
        var sectionDisplay = cmp.get('v.sectionDisplay');
        if(sectionDisplay['existing']){
            section = 'existing';
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }else if(sectionDisplay['model']){
            section = 'model';
            //if(cmp.get('v.existingEmailToCase') && cmp.get('v.existingEmailToCase').length > 0 ){
            if(cmp.get('v.existingAutoresponse') && cmp.get('v.existingAutoresponse').knownModel){
                sectionDisplay['existing'] = true;
                 sectionDisplay['model'] = false;  
                 helper.getExistingEmailToCaseHelper(cmp,event,helper);
            }else{
                var myEvent = cmp.getEvent("recipeComponentChange");
                myEvent.setParams({"componentName": 'RecipeList'});
                myEvent.fire();
            }
        } else if (sectionDisplay['fromAddress']){
            section = 'fromAddress';
            var modelOptions = cmp.get('v.toShowModelOptions');
            if(modelOptions['customPerChannel']){
                sectionDisplay['model'] = true;
                sectionDisplay['fromAddress'] = false;
                cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['modelWithoutIntro'],
                               'modelWithIntro',
                    		   cmp.get('v.highlightTimestampsMap')['modelWithoutIntro'],
                               null,850
                              );
            }else if(cmp.get('v.existingAutoresponse') && cmp.get('v.existingAutoresponse').knownModel){
                sectionDisplay['existing'] = true;
                sectionDisplay['fromAddress'] = false;  
                helper.getExistingEmailToCaseHelper(cmp,event,helper);
                cmp.find('vc').changeVideo(null);
            }else{
                var myEvent = cmp.getEvent("recipeComponentChange");
                myEvent.setParams({"componentName": 'RecipeList'});
                myEvent.fire();
            }
        } else if (sectionDisplay['verify']){
            section = 'verify';
            sectionDisplay['fromAddress'] = true;
  			sectionDisplay['verify'] = false;
            cmp.set('v.isProcessingOrgWideAddress',true);
            helper.getOrgWideEmailAddresses(cmp,event,helper);
        } else if (sectionDisplay['reply']){
            section = 'reply';
            cmp.set('v.isProcessingOrgWideAddress',true);
            helper.getOrgWideEmailAddresses(cmp,event,helper);
            sectionDisplay['reply'] = false;
            sectionDisplay['fromAddress'] = true;
        } else if (sectionDisplay['content']){
            section = 'content';
            if(!$A.util.isEmpty(cmp.get('v.existingEmailToCase')) && cmp.get('v.existingEmailToCase').length > 0 ){
                sectionDisplay['reply'] = true;
            	sectionDisplay['content'] = false;
                cmp.find('vc').changeVideo(cmp.get('v.vcVideos')['customerReply'],
                               'customerReply',
                    		   cmp.get('v.highlightTimestampsMap')['customerReply'],
                               null,850
                              );
            } else{
                cmp.set('v.isProcessingOrgWideAddress',true);
                helper.getOrgWideEmailAddresses(cmp,event,helper);
                sectionDisplay['fromAddress'] = true;
            	sectionDisplay['content'] = false;
            }
        } else if (sectionDisplay['contentMultiple']){
            section = 'contentMultiple';
            if(!$A.util.isEmpty(cmp.get('v.existingEmailToCase')) && cmp.get('v.existingEmailToCase').length > 0 ){
                sectionDisplay['reply'] = true;
            	sectionDisplay['contentMultiple'] = false;
            } else{
                sectionDisplay['fromAddress'] = true;
            	sectionDisplay['contentMultiple'] = false;
            }
        }else if (sectionDisplay['complete']){
            section = 'complete';
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }
        cmp.set('v.sectionDisplay',sectionDisplay);
        helper.createRecipeActivity(cmp,{action: 'Back', recipe: 'Auto-response', feature:'Recipe', section: section});
	},
    
    fromAddressOptionSelect: function(cmp, event, helper){
        var currentOption = cmp.get('v.fromEmailSelectedOption');
        var users = cmp.get('v.users');
        cmp.set('v.fromName','');
        cmp.set('v.fromEmail','');
        if(currentOption == 'user'){
            cmp.set('v.fromEmail',cmp.get('v.currentUser')[1]);
            cmp.set('v.fromName',cmp.get('v.currentUser')[0]);            
            //helper.getUsers(cmp,event,helper);
        }
            
        
    },
    
    validateEmail: function (cmp, evt, helper) {
        if(!evt.getSource().get('v.value')){           	
            cmp.set('v.emailErrorMessage','');
            return;
        }
        if(!helper.validateEmailHelper(evt.getSource().get('v.value'))){
            cmp.set('v.emailErrorMessage','Email is invalid');
            return;
        }else{
            cmp.set('v.emailErrorMessage','');
            var enteredEmail = evt.getSource().get('v.value');
            var existingEmails = cmp.get('v.orgWideEmailAddresses');
            var existingEmailToCase = cmp.get('v.existingEmailToCase');
            for(var key in existingEmails){
                if(existingEmails[key].email == enteredEmail ){
                    cmp.set('v.emailErrorMessage','This email exists in your Salesforce Org');
                    return;
                }
            }
            key = 0;
            for(key in existingEmailToCase){
                if(existingEmailToCase[key].email == enteredEmail ){
                    cmp.set('v.emailErrorMessage','Support channel emails cannot be used');
                    return;
                }
            }
        }
    },
    
    showDisplayName: function(cmp,event,helper){
        var currentOption = cmp.get('v.fromEmailSelectedOption');
        if (currentOption == 'existing'){
            var orgWideEmailAddresses = cmp.get('v.orgWideEmailAddresses');
            var selectedEmail = cmp.get('v.fromEmail');
            
            for(var num in orgWideEmailAddresses){
                if(orgWideEmailAddresses[num].email == selectedEmail){
                    cmp.set('v.fromName',orgWideEmailAddresses[num].name);
                    break;
                }
            }
        }
        if (currentOption == 'user'){
            var users = cmp.get('v.users');
            var selectedEmail = cmp.get('v.fromEmail');
            
            for(var num in users){
                if(users[num].email == selectedEmail){
                    cmp.set('v.fromName',users[num].name);
                    break;
                }
            }
        }
        
    },
    
    customizeLink: function(cmp,event,helper){
        console.log('In Url');  
        cmp.find('frontdoor-form').getElement().submit();
    },
    
    customizeLinkMultipleEmail: function(cmp,event,helper){
        console.log('In Url');
        event.target.previousElementSibling.submit();
    }
    
    
})