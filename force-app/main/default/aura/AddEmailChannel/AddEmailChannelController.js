({
	init : function(cmp, event, helper) {
       //helper.getDeskEmailsHelper(cmp, event, helper);
       helper.getExistingEmailToCaseHelper(cmp, event, helper);
       //window.history.replaceState(null, null, window.location + "/another-new-url");
       helper.createRecipeActivity(cmp,{action: 'Load', recipe: 'Email', feature:'Recipe'});
	},
    
    next : function(cmp, event, helper) {
        helper.nextHelper(cmp, event, helper);
	},
    
    back : function(cmp, event, helper) {
        helper.backHelper(cmp, event, helper);
	},
    
    validateEmail: function (cmp, evt, helper) {
        if(!evt.getSource().get('v.value')){
            var name = evt.getSource().get('v.name');
            var row = parseInt(name.replace('email',''));
            var manualEmailRows = cmp.get('v.manualEmailRows')
            manualEmailRows[row].error = '';
            cmp.set('v.manualEmailRows',manualEmailRows);
            return;
        }
        if(!helper.validateEmailHelper(evt.getSource().get('v.value'))){
            var name = evt.getSource().get('v.name');
            var row = parseInt(name.replace('email',''));
            var manualEmailRows = cmp.get('v.manualEmailRows');
            manualEmailRows[row].error = 'Email is invalid';
            cmp.set('v.manualEmailRows',manualEmailRows);
            return;
        } else {
            //Resetting the errors to blank
            var name = evt.getSource().get('v.name');
            var row = parseInt(name.replace('email',''));
            var manualEmailRows = cmp.get('v.manualEmailRows');
            manualEmailRows[row].error = '';
            cmp.set('v.manualEmailRows',manualEmailRows);
            var systemUserEmail = cmp.get('v.sfSystemUserEmail');

            //var email = cmp.find('email').get("v.value");
            var email = evt.getSource().get('v.value');
            var existingEmailToCase = cmp.get('v.existingEmailToCase');
            var emailsFromDesk = cmp.get('v.emailsFromDesk');
            
            if(email == systemUserEmail ){
                manualEmailRows[row].error = 'This email cannot be used as it is set as System User Email in Case Settings.';
                cmp.set('v.manualEmailRows',manualEmailRows);
                return;
            }
            
            for(var num in existingEmailToCase){
                if(existingEmailToCase[num].email == email){
                    manualEmailRows[row].error = 'This email exists in your Salesforce org';
                    //cmp.set('v.emailErrorMessage','This email exists in your Salesforce org')
                    cmp.set('v.manualEmailRows',manualEmailRows);
                    return;
                }
            }
            for(var num in emailsFromDesk){
                if(emailsFromDesk[num].email == email && emailsFromDesk[num].selected){
                    manualEmailRows[row].error = 'You have already selected this email from the list of Desk Emails';
                    cmp.set('v.manualEmailRows',manualEmailRows);
                    //cmp.set("v.emailError",true);
                    //cmp.set('v.emailErrorMessage','This email was selected from your Desk emails in the previous step')
                    return;
                }
            }
            
        }
        
        
    },
    
    addManualEmailRow: function(cmp, event, helper) {
    	var emails = cmp.get('v.manualEmailRows');
        var newEmail = {'name':'','email':'', 'error':''};
        emails.push(newEmail);
        cmp.set('v.manualEmailRows',emails);
        console.log(emails.length);        
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
            vc.changeVideo(cmp.get('v.vcVideos')['email-complete'],
                           'email-complete',
                          cmp.get('v.highlightTimestampsMap')['email-complete']);
            helper.createRecipeActivity(cmp,{action: 'Complete', recipe: 'Email', feature:'Recipe'});
        }
    },
    
    /*handleVCEvent: function(cmp,evt,helper){
        var isVideoHighlight = evt.getParam("isVideoHighlight");
        var isVideoPlayPauseEnd = evt.getParam("isVideoPlayPauseEnd");
        var isModal = evt.getParam("isModal");
        var cc = cmp.getConcreteComponent();
        cc.getDef().getHelper().postGetHook(cc);
        
        if(isVideoHighlight){
            //helper.handleVideoHighlight(cmp,evt,helper);
            cc.getDef().getHelper().handleVideoHighlight(cc,evt);
        }
        if(isVideoPlayPauseEnd){
            helper.handleVCPlay(cmp,evt,helper);
        }
        if(isModal){
            helper.handleModal(cmp,evt,helper);
        }
    }*/
    
    
   
})