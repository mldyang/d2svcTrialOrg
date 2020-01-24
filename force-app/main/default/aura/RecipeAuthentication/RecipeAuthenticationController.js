({
    init: function(cmp,event,helper){
        
        //var oauthRecordIdentifier = sessionStorage.getItem('oauthRecordIdentifier');
        //console.log('oauthRecordIdentifier',oauthRecordIdentifier);
     
        if(sessionStorage.getItem('oauthRecordIdentifier')){
            cmp.set('v.authInProgress',true);
            console.log('inside found oauthRecordIdentifier: ',sessionStorage.getItem('oauthRecordIdentifier'));
            cmp.set('v.oauthRecordIdentifier',sessionStorage.getItem('oauthRecordIdentifier'));
			helper.checkIfAuthenticated(cmp,event,helper);
            history.pushState({
                id: 'Setup Recipes Dev3'
            }, 'Setup Recipes', 'https://dev3-desktosvc.cs26.force.com/trial/setuprecipes');
        }else if (helper.getGetParameter('recordIdentifier')){
            cmp.set('v.authInProgress',true);
            sessionStorage.setItem('oauthRecordIdentifier',helper.getGetParameter('recordIdentifier'));
            window.location.replace('https://dev3-desktosvc.cs26.force.com/trial/setuprecipes');
            //cmp.set('v.oauthRecordIdentifier',helper.getGetParameter('recordIdentifier'));
            //helper.checkIfAuthenticated(cmp,event,helper);
        }else if (helper.getGetParameter('instance')){
            cmp.set('v.authInProgress',true);
            cmp.set('v.sfMyDomain',helper.getGetParameter('instance'));
            console.log('instance',helper.getGetParameter('instance'));
            helper.sfAuthenticateHelper(cmp,event,helper);
        	
        }
    },
    
    authenticateDesk : function(cmp, event, helper) {
		helper.deskAuthenticateHelper(cmp, event, helper);
	},
    
    authenticateSalesforce : function(cmp, event, helper) {
		helper.sfAuthenticateHelper(cmp, event, helper);
	}
})