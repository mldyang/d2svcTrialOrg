({
  init: function(cmp, evt, helper) {

  },
   
    sendToVF : function(component, event, helper) {
        //var message = component.get("v.message");
        //var vfOrigin = "https://desktoservice--dev.lightning.force.com";
        //parent.postMessage('hello world', vfOrigin);
        //        var vfOrigin = cmp.get("v.vfHost");
        //console.log(vfOrigin);
        //parent.postMessage('hello world s2', 'https://'+vfOrigin);
    },
    
    validateEmail: function (cmp, evt, helper) {
        if(!helper.validateEmail(cmp, evt, helper)){
            cmp.set("v.invalidEmailFormat",true);
        } else {
            cmp.set("v.invalidEmailFormat",false);
        }
    },
    
    trialSignUp: function(cmp, evt, helper) {
        helper.createTrial(cmp, evt, helper);
    },
    
    
    
    authenticate: function(cmp, evt, helper) {
        //cmp.getEvent("trialCreatedEvent").fire();
        //return false;
        if(!helper.validate(cmp, evt, helper)){
            cmp.set('v.authInProgress',false);  
            return false;
        }
        var recordIdentifierToken = helper.makeid();
        var deskendpoint = cmp.find('endpoint').get("v.value");
        cmp.set('v.trialSignUpId',recordIdentifierToken);
        console.log('recordIdentifierToken',recordIdentifierToken);
        cmp.set('v.authInProgress',true);
        
        var oauthPopup = window.open(
          '/trial/DeskAuth?trialSignUpId='+recordIdentifierToken+'&deskSiteName='+deskendpoint,
          'Authorize Desk',
          'location=no, menubar=no, toolbar=no, scrollbars=no, status=no, copyhistory=no,resizeable=no, top=250, left=500, width=500, height=500'
        );
       	console.log('past validation');
        var firstName = cmp.find('firstName').get("v.value");
        var lastName = cmp.find('lastName').get("v.value");
        var email = cmp.find('email').get("v.value");
        var company = cmp.find('company').get("v.value");
        var mydomain = cmp.find('mydomain').get("v.value");
        var countrycode = cmp.find('country').get("v.value");
         console.log('before marketing terms');
        if(cmp.get('v.showMarketingTerms')){
         	console.log('marketingTerms',cmp.find('terms-marketing').get('v.checked'));
            var marketingTerms = cmp.find('terms-marketing').get('v.checked');
            
        }
        else
            var marketingTerms = false;
        console.log('after marketing terms');
        var action = cmp.get("c.createTrialSignUpRecord");
        action.setParams({ lastname : lastName,
                          firstname: firstName,
                          mydomain: mydomain,
                          email: email,
                          company: company,
                          countrycode: countrycode,
                          deskendpoint: deskendpoint,
                          recordidentifiertoken: recordIdentifierToken,
                          scmt: 0,
                          marketingTerms: marketingTerms});
        action.setCallback(this, function(response) {
            console.log('called back');
        	var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                console.log('result',result);
                if(result.success){
					helper.authorizationPolling(cmp,evt,helper,oauthPopup);
                    cmp.set('v.showError',false);
                }
                else if(result.error){
                    if(result.errorType == 'unknown'){
                        helper.shownUnknownError(cmp);
                    }
                    else{
                        cmp.set('v.showError',true);
                        cmp.set('v.errorMessage',result.errorMessage);
                    }
                    cmp.set('v.authInProgress',false);
                }
                else{
                     helper.shownUnknownError(cmp);
                }
                
            }
            else if (state === "INCOMPLETE") {
                 helper.shownUnknownError(cmp);
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + 
                                 errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
                helper.shownUnknownError(cmp);
            }
              
        });
        $A.enqueueAction(action);

              
    },
    
    
    countryChange: function(cmp, evt, helper){
      	console.log('country: '+cmp.find('country').get("v.value"));
        var selectedCountry = cmp.find('country').get("v.value");
        var showMarketingTermsCountries = ['BE','BG','CZ','DK','DE','EE','IE','EL','ES','FR','HR','IT','CY','LV','LT','LU','HU','MT','NL','AT','PL','PT','RO','SI','SK','FI','SE','GB','JP'];
        if(showMarketingTermsCountries.indexOf(selectedCountry) > -1 )
            cmp.set('v.showMarketingTerms',true);
        else
            cmp.set('v.showMarketingTerms',false);
        
        if(selectedCountry == 'JP'){
            cmp.set('v.showJapanMasterTerms',true);
        	cmp.set('v.showMasterTerms',false);
        }
        else{
    		cmp.set('v.showJapanMasterTerms',false);	
        	cmp.set('v.showMasterTerms',true);
        }
     },	
    
    showJapanDetails: function(cmp,evt,helper){
		console.log('in show Japan Details'); 
        cmp.set("v.showJapanDetail",!cmp.get("v.showJapanDetail"));
	},
    
    toggleMyDomainInfo: function(cmp,evt,helper){
        cmp.set("v.showMyDomainInfo",!cmp.get("v.showMyDomainInfo"));
	},
    
    hideMyDomainInfo: function(cmp,evt,helper){
        if(cmp.get('v.mydomain'))
          cmp.set("v.showMyDomainInfo",true);
        else
          cmp.set("v.showMyDomainInfo",false);  
	},
    
    showMyDomainInfo: function(cmp,evt,helper){
        cmp.set("v.showMyDomainInfo",true); 
	}
    
})