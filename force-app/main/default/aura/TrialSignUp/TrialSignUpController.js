({
  init: function(cmp, evt, helper) {
  		
  },
   
    sendToVF : function(component, event, helper) {
        //var message = component.get("v.message");
        //var vfOrigin = "https://desktoservice--dev.lightning.force.com";
        //parent.postMessage('hello world', vfOrigin);
    },
    
    trialSignUp: function(cmp, evt, helper) {
        //console.log('checkbox: '+cmp.find('terms-master').get("v.checked"));
        //console.log('checkbox: '+cmp.find('terms-eu').get("v.checked"));
        
        
        var vfOrigin = cmp.get("v.vfHost");
        console.log(vfOrigin);
        parent.postMessage('hello world s2', 'https://'+vfOrigin);
       
        var firstName = cmp.find('firstName').get("v.value");
        var lastName = cmp.find('lastName').get("v.value");
        var email = cmp.find('email').get("v.value");
        var company = cmp.find('company').get("v.value");
        var mydomain = cmp.find('mydomain').get("v.value");
        var country = cmp.find('country').get("v.value");
        var endpoint = cmp.find('endpoint').get("v.value");
        console.log('before signup');
        var action = cmp.get("c.signUp");
        action.setParams({ lastname : lastName,
                          firstname: firstName,
                          mydomain: mydomain,
                          email: email,
                          company: company,
                          deskSiteId: endpoint,
                          scmt: 0});
        action.setCallback(this, function(response) {
        	var state = response.getState();
            if (state === "SUCCESS") {
                var customResult = response.getReturnValue();
                if(customResult.error){
                    if(customResult.errorField == 'email'){
                        console.log('hello');
                        cmp.find('email').set('v.messageWhenBadInput',customResult.errorMessage);
                        cmp.find('email').set('v.validity',{valid:false, badInput :true});
                        cmp.find('email').showHelpMessageIfInvalid();
                    }
                }
            }
            else if (state === "INCOMPLETE") {
                // do something
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
            }
        });
        $A.enqueueAction(action);

        
    },
    
    countryChange: function(cmp, evt, helper){
      	console.log('country: '+cmp.find('country').get("v.value"));
        var selectedCountry = cmp.find('country').get("v.value");
        var showMarketingTermsCountries = ['BE','BG','CZ','DK','DE','EE','IE','EL','ES','FR','HR','IT','CY','LV','LT','LU','HU','MT','NL','AT','PL','PT','RO','SI','SK','FI','SE','UK','CA','JP'];
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
		console.log('in show Japan Details'); 
        cmp.set("v.showMyDomainInfo",!cmp.get("v.showMyDomainInfo"));
	},
    


  authorizeOauth: function(cmp, evt, helper) {
    //helper.checkForExistingCreds(cmp);
    helper.callAuthorizeWrappper(cmp);
  },

  onActive: function(cmp, evt, helper) {
    helper.setNextText('Continue', cmp);

    helper.callApex(cmp, 'c.config', function(rsp) {
      cmp.set('v.configs', rsp.getReturnValue());
    })

    cmp.set('v.hasBack', 'true');
    helper.fireHasBack(cmp);
  },

  populateFields: function(cmp, evt, helper) {
    cmp.set('v.authorized', false);
    var config = cmp.find('selectConfig').get('v.value');
    var configsList = cmp.get('v.configs');
    if (configsList.length > 0) {
      var newConfig = configsList.find(o => o.Label === config);
      if (newConfig) {
        cmp.set('v.privateDeskEndpoint', newConfig.Endpoint);
        cmp.set('v.privateDeskConsumerKey', newConfig.ConsumerKey);
        cmp.set('v.privateDeskConsumerSecret', newConfig.ConsumerSecret);
        cmp.set('v.privateDeskToken', newConfig.Token);
        cmp.set('v.privateDeskTokenSecret', newConfig.TokenSecret);
      } else {
        cmp.set('v.privateDeskEndpoint', null);
        cmp.set('v.privateDeskConsumerKey', null);
        cmp.set('v.privateDeskConsumerSecret', null);
        cmp.set('v.privateDeskToken', null);
        cmp.set('v.privateDeskTokenSecret', null);
      }
    }


  }

})