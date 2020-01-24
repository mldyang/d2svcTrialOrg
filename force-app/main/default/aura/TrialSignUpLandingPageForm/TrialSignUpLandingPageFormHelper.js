/*
 * Copyright (c) 2017, Salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

({
  
    validate: function(cmp,evt,helper){
        console.log('inside validate');
        var country = cmp.find('country').get("v.value")
        var error = false;
        
        if( country != 'JP' && !cmp.find('terms-master').get('v.checked')){
            cmp.find('terms-master').set('v.showError',true);
            error = true;
        }
        else if (country != 'JP')
            cmp.find('terms-master').set('v.showError',false);
        
        if( country == 'JP' && !cmp.find('terms-jp').get('v.checked')){
            console.log('inside JP check');
            cmp.find('terms-jp').set('v.showError',true);
            error=true;
        } else if (country == 'JP') {
            cmp.find('terms-jp').set('v.showError',false);
        }
        
        if( country == 'JP' && !cmp.find('terms-marketing').get('v.checked')){
            console.log('inside JP check');
            cmp.find('terms-marketing').set('v.showError',true);
            error=true;
        } else if (country == 'JP')  {
            cmp.find('terms-marketing').set('v.showError',false);
        }
        
        if(!helper.validateEmail(cmp, evt, helper)){
            cmp.set("v.invalidEmailFormat",true);
            error = true;
        } else 
            cmp.set("v.invalidEmailFormat",false);
        
        if(!helper.validateEndpoint(cmp, evt, helper)){
            cmp.find('endpoint').showHelpMessageIfInvalid();;
            error = true;
        } 
     
        console.log('past individual checks');
    
        if( !cmp.find('firstName').get("v.validity").valid ||
    	!cmp.find('lastName').get("v.validity").valid ||
        !cmp.find('email').get("v.validity").valid ||
        !cmp.find('company').get("v.validity").valid ||
        !cmp.find('mydomain').get("v.validity").valid ||
        !cmp.find('country').get("v.validity").valid ||
        !cmp.find('endpoint').get("v.validity").valid || 
    	error){
    		cmp.set('v.showError',true);
        	cmp.set('v.errorMessage','There are errors in the form');
            cmp.find('firstName').showHelpMessageIfInvalid();
            cmp.find('lastName').showHelpMessageIfInvalid();
            cmp.find('email').showHelpMessageIfInvalid();
            cmp.find('company').showHelpMessageIfInvalid();
            cmp.find('mydomain').showHelpMessageIfInvalid();
            cmp.find('country').showHelpMessageIfInvalid();
            cmp.find('endpoint').showHelpMessageIfInvalid();
    		return false;
		}else
            return true;
    },
    
    validateEmail: function (cmp, evt, helper) {
        
       	var email = cmp.find('email').get("v.value");
        if(email == null) return true;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    
    validateEndpoint: function (cmp, evt, helper) {
        console.log('inside validateEndpoint');
       	var endpoint = cmp.find('endpoint').get("v.value");
        if(endpoint == null) return false;
        var re = /^https:\/\/[^\/]+?$/;
        return re.test(endpoint);
    },
    
    createTrial: function(cmp, evt, helper) {

        //console.log('trialSingUp Called');
        //cmp.set('v.authInProgress',true);
        var showError = cmp.get('v.showError');
        if(!helper.validate(cmp, evt, helper)){ 
            return false;
        }
        helper.showAuthenticationSuccess(cmp);
        cmp.set('v.progressMessage','Successfully Authenticated. Creating your trial ...');
        var formData = cmp.get('v.formData');
        if (formData == null){
            formData = {};
        }
       	console.log('create Trial');
        var firstName = cmp.find('firstName').get("v.value");
        var lastName = cmp.find('lastName').get("v.value");
        var email = cmp.find('email').get("v.value");
        var company = cmp.find('company').get("v.value");
        var mydomain = cmp.find('mydomain').get("v.value");
        var country = cmp.find('country').get("v.value");
        var endpoint = cmp.find('endpoint').get("v.value");
        if(cmp.get('v.showMarketingTerms'))
         	var marketingTerms = cmp.find('terms-marketing').get('v.checked');
        else
            var marketingTerms = false;
        
        var formInfoUpdated = false;
        
        if(cmp.get('v.showForm') && showError){
            if (formData.firstName != firstName ||
                formData.lastName != lastName ||
                formData.email != email || 
                formData.company != company ||
                formData.mydomain != mydomain ||
                formData.country != country){
                formInfoUpdated = true;
                
            }
    	}
        
        formData.firstName = firstName;
        formData.lastName = lastName;
        formData.email = email;
        formData.company = company;
        formData.mydomain = mydomain;
        formData.country = country;
        formData.endpoint = endpoint;
        formData.marketingTerms = marketingTerms;
        cmp.set('v.formData',formData);
        
        console.log('before signup', country);
        var action = cmp.get("c.signUp");
        action.setParams({ lastname : lastName,
                          firstname: firstName,
                          mydomain: mydomain,
                          email: email,
                          company: company,
                          country: country,
                          deskSiteId: endpoint,
                          scmt: 0,
                          marketingTerms: marketingTerms});
        action.setCallback(this, function(response) {
        	var state = response.getState();
            console.log('response state',state,response.getReturnValue());
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                console.log('result',result);
                if(result.success){
                    cmp.set('v.signUpSuccess',true);
                    cmp.set('v.showForm',false);
                    cmp.set('v.showProgressMessage',false);
                    cmp.find('formContainer').getElement().setAttribute("style","height:500px;");
                    //cmp.getEvent("trialCreatedEvent").fire();
                    helper.checkIfVCAllowed(cmp,evt,helper);
                    if(formInfoUpdated){
                        helper.updateTrialSignupRecord(cmp,evt,helper);
                    }
                }
                else if(result.error){
                    if(formInfoUpdated){
                        helper.updateTrialSignupRecord(cmp,evt,helper);
                    }
                    if(result.errorType == 'unknown'){
                        console.log('before show unknown error');
                        helper.showUnknownError(cmp);
                    }
                    else{
                        cmp.set('v.showProgressMessage',false);
                        //cmp.set('v.showForm',true);
                        cmp.find('formDiv').getElement().setAttribute("style","display:block;");  
                        cmp.set('v.showError',true);
                        cmp.set('v.errorMessage',result.errorMessage);
                        cmp.find('formContainer').getElement().setAttribute("style","");  
                    }
                }
                else{
                    helper.showUnknownError(cmp); 
                }
                    
                
            }
            else if (state === "INCOMPLETE") {
                helper.showUnkownError(cmp);
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
               	helper.showUnknownError(cmp); 
            }
           
        });
        $A.enqueueAction(action);

              
    },
    
    checkIfVCAllowed: function(cmp, evt, helper){
        var recordIdentifierToken = cmp.get('v.trialSignUpId');
        var action = cmp.get("c.checkIfVCAllowedApex");
        action.setParams({ recordidentifiertoken: recordIdentifierToken	});
        action.setCallback(this, function(response) {
        	var state = response.getState();
            console.log('checkIfVCAllowed',state,response.getReturnValue());
            var event = cmp.getEvent("trialCreatedEvent");
            if (state === "SUCCESS") {
                event.setParams({"isVCAllowed": response.getReturnValue()});  
            }
            else {
                event.setParams({"isVCAllowed": false});
            }
            event.fire();
        });
        $A.enqueueAction(action);
    },
    
	updateTrialSignupRecord: function(cmp, evt, helper){
        var formData = cmp.get('v.formData');
        var firstName = formData.firstName;
        var lastName = formData.lastName;
        var email = formData.email;
        var company = formData.company;
        var mydomain = formData.mydomain;
        var countrycode = formData.country;
        var deskendpoint = formData.endpoint;
        var marketingTerms = formData.marketingTerms;
        var recordIdentifierToken = cmp.get('v.trialSignUpId');

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
                          marketingTerms: marketingTerms	});
        action.setCallback(this, function(response) {
        	var state = response.getState();
            console.log('response state',state,response.getReturnValue());
            if (state === "SUCCESS") {
               
            }
            else if (state === "INCOMPLETE") {
                helper.showUnkownError(cmp);
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
               	helper.showUnknownError(cmp); 
            }
           
        });
        $A.enqueueAction(action);
        
    },
    
  authorizationPolling: function(cmp, evt, helper, oauthPopup) {
    console.log('In authorization polling');
    var trialSignUpId = cmp.get('v.trialSignUpId');
    cmp.set('v.authorized', false);
    var interval = window.setInterval(
      $A.getCallback(function() {
        console.log('inside getCallback');
        var action = cmp.get('c.checkDeskConfigAuthorization');
        action.setParams({
          trialSignUpId: cmp.get('v.trialSignUpId')
        });
        action.setCallback(this, function(res) {
          var state = res.getState();
          if (state === 'SUCCESS') {
            cmp.set('v.authorized', res.getReturnValue());
            if (cmp.get('v.authorized')) {
              clearInterval(interval);
              cmp.set('v.authorized', true);
              helper.createTrial(cmp,evt,helper)

            } else if(oauthPopup.closed){
                clearInterval(interval);
                cmp.set('v.showError',true);
        		cmp.set('v.errorMessage','Authentication with Desk Failed');
                cmp.set('v.authInProgress',false); 
            }
          } else if (state === 'ERROR') {
            clearInterval(interval);
            var errors = res.getError();
            if (errors) {
              if (errors[0] && errors[0].message) {
                console.error("Error message: " +
                  errors[0].message);
              }
            }
            helper.showUnknownError(cmp);  
          }
        });
        $A.enqueueAction(action);
      }), 5000
    );
  },

  
    showUnknownError: function(cmp){
        console.log('inside showUnknownError');
        cmp.set('v.unknownError',true);
        cmp.set('v.showForm',false);        
        cmp.find('formContainer').getElement().setAttribute("style","height:500px;");  
        cmp.set('v.authInProgress',false);
        cmp.set('v.showProgressMessage',false);
    },
    
    showAuthenticationSuccess: function(cmp){
        cmp.find('formContainer').getElement().setAttribute("style","height:500px;");
        cmp.set('v.authInProgress',false);  
        cmp.set('v.showError',false);
        cmp.find('formDiv').getElement().setAttribute("style","display:none;"); 
        cmp.set('v.showProgressMessage',true); 
        cmp.set('v.progressMessage','Successfully Authenticated ...');  

    },
    
    
    makeid: function() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
      for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
      return text+Date.now();
    }

})