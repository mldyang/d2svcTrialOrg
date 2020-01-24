({
	doneRendering : function(cmp, event, helper) {
		
	},
    
    handleTrialCreatedEvent: function(cmp, event, helper) {
        var isVCAllowed = event.getParam("isVCAllowed");
        if(!isVCAllowed){
            cmp.find('trialSignUpLandingPageLeft').set('v.isActive',false);
            cmp.find('leftContainer').getElement().setAttribute('style','height: 100vh;');
            cmp.set('v.showSpinner',true);
            cmp.find('arrow').getElement().setAttribute('style','background: #F4F6F9');
            
            window.setTimeout($A.getCallback(function() {
                cmp.find('trialSignUpWorkbookLeft').set('v.isActive',true);
                cmp.set('v.showSpinner',false)
            }), 1500)
        }else{
            cmp.find('trialSignUpLandingPageLeft').set('v.isActive',false);
            cmp.find('leftContainer').getElement().setAttribute('style','height: 100vh;');
            cmp.set('v.showSpinner',true);
            cmp.find('arrow').getElement().setAttribute('style','background: #F4F6F9');
            
            window.setTimeout($A.getCallback(function() {
                cmp.find('trialSignUpVirtualConsultantLeft').set('v.isActive',true);
                cmp.set('v.showSpinner',false)
            }), 1500) 
        }   
    }
})