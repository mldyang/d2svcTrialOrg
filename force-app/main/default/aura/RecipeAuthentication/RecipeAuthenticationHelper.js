({
	deskAuthenticateHelper: function(cmp, evt, helper) {
        helper.createRecipeActivity(cmp,{action: 'Load', recipe: null, feature:'Authentication', section: 'Desk'});  
        cmp.set('v.authInProgress',true);
        if(!helper.validateEndpoint(cmp, evt, helper)){
            cmp.find('deskEndpoint').showHelpMessageIfInvalid();
            cmp.set('v.authInProgress',false);
            return;
        } 
        if(!cmp.get('v.oauthRecordIdentifier')){
        	//var recordIdentifierToken = helper.makeid();
        	cmp.set('v.oauthRecordIdentifier',helper.makeid());
            //console.log('recordIdentifierToken',recordIdentifierToken);
        }
        
        var deskendpoint = cmp.find('deskEndpoint').get("v.value");
        var oauthPopup = window.open(
          '/trial/RecipeDeskAuth?recordIdentifierToken='+cmp.get('v.oauthRecordIdentifier')+'&deskSiteName='+deskendpoint,
          'Authorize Desk',
          'location=no, menubar=no, toolbar=no, scrollbars=no, status=no, copyhistory=no,resizeable=no, top=250, left=500, width=500, height=500'
        );
        cmp.set('v.authorizedDesk', false);
        var interval = window.setInterval(
          $A.getCallback(function() {
            console.log('inside getCallback');
            var action = cmp.get('c.checkRecipeSessionDeskAuthorization');
            action.setParams({
              recordIdentifier: cmp.get('v.oauthRecordIdentifier')
            });
            action.setCallback(this, function(res) {
              var state = res.getState();
              if (state === 'SUCCESS') {
                cmp.set('v.authorizedDesk', res.getReturnValue());
                if (res.getReturnValue()) {
                  clearInterval(interval);
                  cmp.set('v.authInProgress',false);
                  if(cmp.get('v.authorizedSalesforce')){
                      helper.createRecipeWrapper(cmp,event,helper);
                  }
                    helper.createRecipeActivity(cmp,{action: 'Complete', recipe: null, feature:'Authentication', section: 'Desk'});  
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
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Authentication with Desk Failed');  
                cmp.set('v.authInProgress',false);  
              }
              
            });
            $A.enqueueAction(action);
          }), 5000)

              
    },
    
    validateEndpoint: function (cmp, evt, helper) {
        console.log('inside validateEndpoint');
       	var endpoint = cmp.find('deskEndpoint').get("v.value");
        if(endpoint == null) return false;
        var re = /^https:\/\/[^\/]+?$/;
        return re.test(endpoint);
    },
    
     makeid: function() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
      for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
      return text+Date.now();
    },
    
    sfAuthenticateHelper: function(cmp, event, helper){
        helper.createRecipeActivity(cmp,{action: 'Load', recipe: null, feature:'Authentication', section: 'Salesforce'});
        if(!cmp.get('v.oauthRecordIdentifier')){
            cmp.set('v.oauthRecordIdentifier',helper.makeid());
        }
        if(cmp.get('v.sfMyDomain')){
        	window.location.replace('https://dev3-desktosvc.cs26.force.com/trial/RecipeSalesforceAuth?recordIdentifierToken='+cmp.get('v.oauthRecordIdentifier')+'&instance='+cmp.get('v.sfMyDomain'));
        }else{
            window.location.replace('https://dev3-desktosvc.cs26.force.com/trial/RecipeSalesforceAuth?recordIdentifierToken='+cmp.get('v.oauthRecordIdentifier'));
        }
        /*var oauthPopup = window.open(
          'https://dev2-desktosvc.cs21.force.com/trial/RecipeSalesforceAuth?recordIdentifierToken='+cmp.get('v.oauthRecordIdentifier'),
          'Authorize Salesforce',
          'location=no, menubar=no, toolbar=no, scrollbars=no, status=no, copyhistory=no,resizeable=no, top=250, left=500, width=500, height=500'
        );
        cmp.set('v.authorizedSalesforce', false);
        cmp.set('v.authInProgress',true);
        var interval = window.setInterval(
          $A.getCallback(function() {
            console.log('inside getCallback');
            var action = cmp.get('c.checkRecipeSessionSalesforceAuthorization');
            action.setParams({
              recordIdentifier: cmp.get('v.oauthRecordIdentifier')
            });
            action.setCallback(this, function(res) {
              var state = res.getState();
              if (state === 'SUCCESS') {
                cmp.set('v.authorizedSalesforce', res.getReturnValue());
                if (res.getReturnValue()) {
                  clearInterval(interval);
                  helper.createRemoteSite(cmp,event,helper); 
                } else if(oauthPopup.closed){
                    clearInterval(interval);
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage','Authentication with Salesforce Failed');
                    cmp.set('v.authInProgress',false);
                }
              } else if (state === 'ERROR') {
                clearInterval(interval);
                var errors = res.getError();
                if (errors) {
                  if (errors[0] && errors[0].message) {
                    console.error("Error message: " +
                      errors[0].message);
                      cmp.set('v.showError',true);
                      cmp.set('v.errorMessage','Authentication with Salesforce Failed: '+ errors[0].message );
                  }else{
                      cmp.set('v.showError',true);
                      cmp.set('v.errorMessage','Authentication with Salesforce Failed: '+ errors[0].message );
                  }
                }else{
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage','Authentication with Salesforce Failed: '+ errors[0].message );
                }
                cmp.set('v.authInProgress',false);  
              }
                 
            });
            $A.enqueueAction(action);
          }), 5000)*/
    },
    
     createRemoteSite: function(cmp, event, helper){
    	var action = cmp.get('c.createRemoteSite');
         action.setParams({
             recordIdentifier: cmp.get('v.oauthRecordIdentifier')
         });
         action.setCallback(this, function(res) {
              var state = res.getState();
              if (state === 'SUCCESS') {
                if (res.getReturnValue()) {
                  var name = 'c:RecipeWrapper';
                  var idrec = cmp.get('v.oauthRecordIdentifier');
                  sessionStorage.setItem('oauthRecordIdentifier',idrec);
                  helper.createRecipeWrapper(cmp,event,helper);  
                } else {
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage','Failed to create Remote Site');
                    cmp.set('v.authInProgress',false);
                }
              } else if (state === 'ERROR') {
                clearInterval(interval);
                var errors = res.getError();
                if (errors) {
                  if (errors[0] && errors[0].message) {
                    console.error("Error message: " +
                      errors[0].message);
                      cmp.set('v.showError',true);
                      cmp.set('v.errorMessage','Failed to create Remote Site: '+ errors[0].message );
                  }else{
                      cmp.set('v.showError',true);
                      cmp.set('v.errorMessage','Failed to create Remote Site' );
                  }
                }else{
                    cmp.set('v.showError',true);
                    cmp.set('v.errorMessage','Failed to create Remote Site' );
                }
                cmp.set('v.authInProgress',false);  
              }
                 
            });
            $A.enqueueAction(action);
     },
    
    createRecipeWrapper: function(cmp, event, helper){
        $A.createComponent(
            'c:RecipeWrapper',
            {
                "oauthRecordIdentifier": cmp.getReference('v.oauthRecordIdentifier')
            },
            function(createdComponent){                
                if (cmp.isValid()) {
                    console.log('created component');
                    var targetCmp = cmp.find('wrapper');
                    targetCmp.set("v.body", createdComponent);
                }
            }
        );   
    },
    
    checkIfAuthenticated: function(cmp, event, helper){
        var action = cmp.get('c.checkRecipeSessionAuthorized');
        action.setParams({
            recordIdentifier: cmp.get('v.oauthRecordIdentifier')
        });
        console.log('checkIfAuthenticated Before: ',cmp.get('v.oauthRecordIdentifier'));
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('checkIfAuthenticated',res.getReturnValue());
            if (state === 'SUCCESS') {
                /*if(res.getReturnValue()){
	               helper.createRecipeWrapper(cmp,event,helper);   
                }*/
                var ret = res.getReturnValue();
                if(ret.sfAuthenticated && ret.sfAuthorized && ret.deskAuthorized){
                    helper.createRecipeWrapper(cmp,event,helper);
                }else if (ret.sfAuthenticated){
                    if(!ret.sfAuthorized){
                        var errors = res.getError();
                        console.error('UnAuthorized Access');
                        cmp.set('v.errorMessage','Only System Admins are allowed to access Setup Recipes');                        
                        cmp.set('v.showError',true);
                        cmp.find('toast').set('v.type','error');
                    }else{
                    	cmp.set('v.authorizedSalesforce',true);
                    }
                    cmp.set('v.authInProgress',false);
                }else if (ret.deskAuthorized){
                    cmp.set('v.authorizedDesk',true);
                    if(ret.sfMyDomain){
                        cmp.set('v.sfMyDomain',ret.sfMyDomain);
                        helper.sfAuthenticateHelper(cmp,event,helper);
                    }else{
                        cmp.set('v.authInProgress',false);
                    }
                }
            }else if (state === 'ERROR') {
                var errors = res.getError();
                console.error('Unknown Error occurred');
                cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
				cmp.set('v.showError',true);
              	cmp.find('toast').set('v.type','error');
              	cmp.set('v.authInProgress',false);
          	} 
        });
       	$A.enqueueAction(action);
                  
    },
    
    getGetParameter: function(paramName){
    	var sPageURL = decodeURIComponent(window.location.search.substring(1)); //You get the whole decoded URL of the page.
        var sURLVariables = sPageURL.split('&'); //Split by & so that you get the key value pairs separately in a list
        var sParameterName;
        var i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('='); //to split the key from the value.

            if (sParameterName[0] === paramName) { //lets say you are looking for param name - firstName
                return sParameterName[1];
            }
        }
         
    }
    

})