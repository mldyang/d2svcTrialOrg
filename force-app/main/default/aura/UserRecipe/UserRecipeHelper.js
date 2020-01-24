({
	getUsersHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching Users from Desk & Salesforce');
        var action = cmp.get('c.getUsers');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getUsers: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var users = res.getReturnValue();
                var profiles = cmp.get('v.profiles');
                var activeSfUserExists = false;
                var inactiveSfUserExists = false;
                var currentUser;
                var allowedProfiles = cmp.get('v.allowedProfiles');
                var existingSFUsers = [];
                /*var allowedProfielsSet = new Set();
                for (var num in allowedProfiles){
                    allowedProfilesSet.add(allowedProfiles[num].sfProfileId);
                }*/
                users.sort(helper.compare);
                for(var num in users){
                   users[num].sfProfileName = profiles[users[num].sfProfileId];
                    /*if(!allowedProfilesSet.has(users[num].sfProfileId)){
                        users[num].unAllowedProfileId = users[num].sfProfileId;
                    }*/
                    if(users[num].sfUserId && !users[num].deskUserId){ 
                        if(users[num].isActive){
                            activeSfUserExists = true;
                        }else{
                            inactiveSfUserExists = true;
                        }
                    }
                    if(users[num].sfUserId && (users[num].sfProfileName == 'Standard User' || users[num].sfProfileName == 'Support Agent' ||  users[num].sfProfileName == 'Support Manager' ||  users[num].sfProfileName == 'System Administrator')){
                        existingSFUsers.push(JSON.parse(JSON.stringify(users[num])));
                    }
                }
                cmp.set('v.existingSFUsers',existingSFUsers);
                /*if(inactiveSfUserExists){
                    modelOptions.push({label: 'Activate existing inactive users', value:'activate'});
                }
                if(activeSfUserExists){
                    modelOptions.push({label: 'Deactivate existing active users', value:'deactivate'});
                }*/
                if(!inactiveSfUserExists && !activeSfUserExists){
                    var sectionDisplay = cmp.get('v.sectionDisplay');
                    sectionDisplay['model'] = false;
                    sectionDisplay['deskUsers'] = true;
                    cmp.set('v.sectionDisplay',sectionDisplay);
                }
                cmp.set('v.users', users);
                cmp.set('v.isProcessing',false);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing users from Salesforce');
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
    
    getProfileHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching Profile information');
        var action = cmp.get('c.getProfile');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getProfile: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var profiles = res.getReturnValue();
                cmp.set('v.profiles',profiles);
                var allowedProfiles = new Array();
                var allowedProfilesForUpdate = new Array();
                for(var key in profiles){
                    if(profiles[key] == 'System Administrator' || profiles[key] == 'Support Agent' || profiles[key] == 'Support Manager'){
                        allowedProfiles.push({profileName: profiles[key], profileId: key});
                        allowedProfilesForUpdate.push({profileName: profiles[key], profileId: key});
                    }
                    if(profiles[key] == 'Standard User'){
                        allowedProfilesForUpdate.push({profileName: profiles[key], profileId: key});
                    }
                    
                }
                cmp.set('v.allowedProfiles',allowedProfiles);
                cmp.set('v.allowedProfilesForUpdate',allowedProfilesForUpdate);
				helper.getCurrentUser(cmp,event,helper);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get profile information from Salesforce');
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
    
    getCurrentUser: function (cmp, evt, helper,verifiedEmailExists) {
        var action = cmp.get('c.getCurrentUserId');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getCurrentUserId: ',res.getState());            
            if (state === 'SUCCESS') {
                cmp.set('v.currentUserId', res.getReturnValue());
                helper.getUsersHelper(cmp,event,helper);
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
    
    updateUsersHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Updating users ...');
        var usersUpdated = [];
        var existingSFUsers = cmp.get('v.existingSFUsers');
        var users = cmp.get('v.users');
        for(let userSF of existingSFUsers){
            userSF.errorStatusCode = null;
            userSF.errorMessage = null;
            userSF.errorField = null;
            for(let user of users){
                 if (userSF.sfUserId == user.sfUserId && (userSF.sfProfileId != user.sfProfileId || 
                                                            (userSF.isActive != user.isActive) || 
                                                         userSF.sfUsername != user.sfUsername)){
                    usersUpdated.push(userSF);
                }
            }
        }
        var action = cmp.get('c.updateUsers');
        action.setParams({usersString: JSON.stringify(usersUpdated), authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('updateUsers: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var usersReturned = res.getReturnValue();
                cmp.set('v.postUpdate',true);
                var users = cmp.get('v.users');
                for (let retUser of usersReturned){
                    for (let user of users){
                        if(retUser.id == user.id && retUser.errorStatusCode){
                            retUser.isActive = user.isActive;
                        }
                    }
                }
                cmp.set('v.users',usersReturned);
                cmp.set('v.existingSFUsers',JSON.parse(JSON.stringify(usersReturned)));
                
                var noOfUsersSuccessful = 0;
                var noOfUsersFailed = 0;
                var userswithDuplicateUserName = false;
                var otherErrors = false;
                var updatedUsersToActivateMap = new Map();
                var updatedUsersToActivate = cmp.get('v.updatedUsersToActivate');
                for(var num in updatedUsersToActivate){
                    updatedUsersToActivateMap.set(updatedUsersToActivate[num].sfUserId,updatedUsersToActivate[num]);
				}
                for(var num in usersReturned){
                    if(!usersReturned[num].errorStatusCode){
                        noOfUsersSuccessful++;
                    }else{
                        noOfUsersFailed++;
                        updatedUsersToActivateMap.delete(usersReturned[num].sfUserId);
                    }
                    if(usersReturned[num].errorStatusCode == 'DUPLICATE_USERNAME'){
                        userswithDuplicateUserName = true;
                    }else if (!$A.util.isEmpty(usersReturned[num].errorStatusCode)){
                        otherErrors = true;
                    }
                    
                }
                var successHeading = '';
                var errorHeading = '';
                var heading;
                var subheading;
                if (noOfUsersSuccessful == 1){
                    successHeading = noOfUsersSuccessful + ' user has been updated successfully.';
                }
                else if (noOfUsersSuccessful > 1){
                    successHeading = noOfUsersSuccessful + ' users have been updated successfully.';
                }
                    
                if(noOfUsersFailed == 1){
                    errorHeading = noOfUsersFailed + ' user has errors.';
                }
                else if (noOfUsersFailed > 1){
                    errorHeading = noOfUsersFailed + ' users have errors.';
                }
                    
                if(!successHeading && !errorHeading){ 
                    heading = 'There seems to be an error. Contact support@desk.com';
                }
                else{
                    heading = successHeading +' '+ errorHeading;
                }
                
                if(userswithDuplicateUserName && otherErrors){
                    subheading = 'Review the duplicate usernames. You can update the usernames and retry. For other errors contact support@desk.com. Include the screenshot of this page in the email.';
                }else if(userswithDuplicateUserName){
                    subheading = 'Review the duplicate usernames. You can update the usernames and retry.';
                }else if(otherErrors){
                    subheading = 'Please contact support@desk.com with help with the error. Include the screenshot of this page in the email.';
                }
                
                updatedUsersToActivate = [];
                for(let val of updatedUsersToActivateMap ) {
                    updatedUsersToActivate.push(val[1]);
                }
                cmp.set('v.updatedUsersToActivate',updatedUsersToActivate);
                cmp.set('v.updateUsersSubHeading',subheading);
                cmp.set('v.updateUsersHeading',heading);
                cmp.set('v.noOfUsersSuccessful',noOfUsersSuccessful);
                cmp.set('v.noOfUsersFailed',noOfUsersFailed);
                if(updatedUsersToActivateMap.size > 0){
                    helper.activateAndSendEmailForUpdateHelper(cmp,event,helper);
                }else{
               	 	cmp.set('v.isProcessing',false);
                }
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to update Users.');
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
                cmp.set('v.isProcessing', false);
                window.scrollTo(0, 0, 'smooth');
            }
        });
        $A.enqueueAction(action);
    },
    
    activateAndSendEmailForUpdateHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Activating and sending welcome email');
        var usersToActivate = cmp.get('v.updatedUsersToActivate');
        cmp.set('v.usersActivated',usersToActivate.length);
        var action = cmp.get('c.activateAndSendEmail');
        action.setParams({usersString: JSON.stringify(usersToActivate), authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('activateAndSendEmailHelper: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var success = res.getReturnValue();
                if(success){
                    var noOfUsersActivated = cmp.get('v.usersActivated');
                	var heading = cmp.get('v.updateUsersHeading');
                    if(noOfUsersActivated == 1){
	                    heading += ' Welcome email has been sent to 1 user.';
                    }else if (noOfUsersActivated > 1){
                        heading += ' Welcome email has been sent to '+ noOfUsersActivated +' users.';
                    }
                    cmp.set('v.updateUsersHeading',heading);
                    cmp.set('v.isProcessing',false);
                }
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Users were updated, but sending of welcome emails failed.');
                    }if(errors[0].message == 'Email Failed'){
                        var heading = cmp.get('v.updateUsersHeading');
                        heading += " Sending of Welcome emails failed."
                        cmp.set('v.errorMessage','Users were updated, but sending of welcome emails failed.');
                    }
                    if(errors[0].message == 'Unknown'){
                        cmp.set('v.errorMessage','Users were updated, but sending of welcome emails failed. Contact support@desk.com');                        
                    }
                    
                } else {
                    console.error('Unknown Error occurred');
                    cmp.set('v.errorMessage','Users were updated, but sending of welcome emails failed. Contact support@desk.com');                        
                }
                cmp.set('v.showError',true);
                cmp.find('toast').set('v.type','warning');
                //cmp.find('nextButton').set('v.disabled','true');
                cmp.set('v.isProcessing', false);
                window.scrollTo(0, 0, 'smooth');
            }
        });
        $A.enqueueAction(action);
    },
    
    activateAndSendEmailHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Activating and sending welcome email');
        //var users = cmp.get('v.users');
        var users = cmp.get('v.usersSuccessful');
        var selectedUsers = new Array();
        for(var num in users){
            if(users[num].selected && (users[num].inDesk || users[num].isManual)){
                selectedUsers.push(users[num]);
            }
        }
        cmp.set('v.usersActivated',selectedUsers.length);
        var action = cmp.get('c.activateAndSendEmail');
        action.setParams({usersString: JSON.stringify(selectedUsers), authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('activateAndSendEmailHelper: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var success = res.getReturnValue();
                if(success){
                    var noOfUsersActivated = cmp.get('v.usersActivated');
                    var completeHeader;
                    if (noOfUsersActivated > 0){
                     	if (noOfUsersActivated == 1) completeHeader = noOfUsersActivated + ' user has been activated and welcome email has been sent!';
                        else completeHeader = noOfUsersActivated + ' users have been activated and welcome email has been sent!';
                    }else{
                        completeHeader = 'No users activated. You have completed Users Recipe.';
                    }
                    //completeHeader = 'User(s) have been activated! You have completed Users Recipe.';
                    cmp.set('v.completeHeader',completeHeader);
                    var sectionDisplay = cmp.get('v.sectionDisplay');
                    sectionDisplay['welcomeEmail'] = false;
                    sectionDisplay['complete'] = true;
                    cmp.set('v.sectionDisplay',sectionDisplay);
                    cmp.set('v.isProcessing',false);
                    cmp.find('backButton').set('v.disabled',true);
                }
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get profile information from Salesforce');
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
                cmp.set('v.isProcessing', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    deActivateHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Deactivating Users');
        //var users = cmp.get('v.users');
        var users = cmp.get('v.users');
        var selectedUsers = new Array();
        for(var num in users){
            if(users[num].selected && users[num].inSalesforce){
                selectedUsers.push(users[num]);
            }
        }
        var action = cmp.get('c.activateDeactivateUsers');
        action.setParams({usersString: JSON.stringify(selectedUsers), activeValue: false, authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('activateDeactivateUsers: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var users = res.getReturnValue();
                var noOfUsersDeActivated = 0;
                for(var num in users){
                    if(!users.errorMessage){
                        noOfUsersDeActivated += 1;
                    }
                }
                
                var completeHeader;
                if (noOfUsersDeActivated > 0){
                    if (noOfUsersDeActivated == 1) completeHeader = noOfUsersActivated + ' user has been deactivated';
                    else completeHeader = noOfUsersActivated + ' users have been deactivated';
                }else{
                    completeHeader = 'No users deactivated. You have completed Users Recipe.';
                }
                cmp.set('v.completeHeader',completeHeader);
                cmp.set('v.sectionDisplay',sectionDisplay);
                cmp.set('v.isProcessing',false);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to deactivate users in Salesforce');
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
                cmp.set('v.isProcessing', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    getLicenseInfoHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching License information');
        var action = cmp.get('c.getLicenseInfo');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getLicenseInfo: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var licenseInfo = res.getReturnValue();
                cmp.set('v.sfLicenseInfo',licenseInfo);
                cmp.set('v.isProcessing',false);
                var sfLicenseSubHeader = 'You have ' + (licenseInfo['TotalLicenses'] - licenseInfo['UsedLicenses']) + ' of ' + licenseInfo['TotalLicenses'] + ' licenses that you can activate. The selected users will be activated and we will send a welcome email to them with the login information.';
                cmp.set('v.sfLicenseSubHeader',sfLicenseSubHeader);
                var sectionDisplay = cmp.get('v.sectionDisplay');
                sectionDisplay['createUsers'] = false;
            	sectionDisplay['welcomeEmail'] = true;
                cmp.set('v.sectionDisplay',sectionDisplay);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get profile information from Salesforce');
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
    
    getLicenseInfoHelperForUpdate: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching License information');
        var action = cmp.get('c.getLicenseInfo');
        action.setParams({authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getLicenseInfo: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var licenseInfo = res.getReturnValue();
                cmp.set('v.sfLicenseInfo',licenseInfo);
                cmp.set('v.isProcessing',false);
                var sfLicenseSubHeader = 'You have ' + (licenseInfo['TotalLicenses'] - licenseInfo['UsedLicenses']) + ' of ' + licenseInfo['TotalLicenses'] + ' licenses that you can activate. Welcome emails are sent to users you activate';
                cmp.set('v.sfLicenseSubHeader',sfLicenseSubHeader);
                var sectionDisplay = cmp.get('v.sectionDisplay');
                sectionDisplay['model'] = false;
                sectionDisplay['update'] = true;
                cmp.set('v.sectionDisplay',sectionDisplay);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get profile information from Salesforce');
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
    
    createUsersHelper: function (cmp, event, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Creating Users in Salesforce');
        var users = cmp.get('v.users');
        var selectedUsers = new Array();
        for(var num in users){
           /* if(!$A.util.isEmpty(users[num].selected) && users[num].selected &&
               (!$A.util.isEmpty(users[num].inDesk) && users[num].inDesk) ||
              (!$A.util.isEmpty(users[num].isManual) && users[num].isManual)){*/
            if(users[num].selected && (users[num].inDesk || users[num].isManual)){
                users[num].errorMessage = '';
                users[num].errorStatusCode = '';
                users[num].errorField = '';
                selectedUsers.push(users[num]);
            }
        }
        var profiles = cmp.get('v.profiles');
        for (var num in selectedUsers){
            selectedUsers[num].sfProfileName = profiles[selectedUsers[num].sfProfileId];
        }
        console.log('users selected: ',selectedUsers);
        var action = cmp.get('c.createUsers');
        action.setParams({usersString: JSON.stringify(selectedUsers), authenticationId: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            var userswithDuplicateUserName = false;
            var otherErrors = false;
            console.log('createUsers: ',res.getState(),res.getReturnValue());            
            if (state === 'SUCCESS') {
                var users = res.getReturnValue();
                var noOfUsersSuccessful = 0;
                var noOfUsersFailed = 0;
                var usersSuccessful = cmp.get('v.usersSuccessful');
                for(var num in users){
                    if(!users[num].errorStatusCode){
                        noOfUsersSuccessful++;
                        usersSuccessful.push(users[num]);
                    }else{
                        noOfUsersFailed++;
                    }
                    var user = users[num];
                    if(user.errorStatusCode == 'DUPLICATE_USERNAME'){
                        userswithDuplicateUserName = true;
                    }else if (!$A.util.isEmpty(user.errorStatusCode)){
                        otherErrors = true;
                    }
                    user.selected = false;
                    //user.errorStatusCode = '';
                    //user.errorMessage = '';
                    
                }
                var successHeading = '';
                var errorHeading = '';
                var heading;
                var subheading;
                if (noOfUsersSuccessful == 1){
                    successHeading = noOfUsersSuccessful + ' user has been created successfully.';
                }
                else if (noOfUsersSuccessful > 1){
                    successHeading = noOfUsersSuccessful + ' users have been created successfully.';
                }
                    
                if(noOfUsersFailed == 1){
                    errorHeading = noOfUsersFailed + ' user has errors';
                }
                else if (noOfUsersFailed > 1){
                    errorHeading = noOfUsersFailed + ' users have errors';
                }
                    
                if(!successHeading && !errorHeading){ 
                    heading = 'There seems to be an error. Contact support@desk.com';
                }
                else{
                    heading = successHeading +' '+ errorHeading;
                }
                
                if(userswithDuplicateUserName && otherErrors){
                    subheading = 'Review the duplicate usernames. You can update the usersnames, selecte the record and click next to retry. For other errors contact support@desk.com. Include the screenshot of this page in the email.';
                }else if(userswithDuplicateUserName){
                    subheading = 'Review the duplicate usernames. You can update the usernames, select the record and click next to retry.';
                }else if(otherErrors){
                    subheading = 'Please contact support@desk.com with help with the error. Include the screenshot of this page in the email.';
                }
                cmp.set('v.createUsersSubHeading',subheading);
                cmp.set('v.createUsersHeading',heading);
     
                cmp.set('v.users', users);
                cmp.set('v.usersSuccessful',usersSuccessful);
                cmp.set('v.noOfUsersSuccessful',noOfUsersSuccessful);
                cmp.set('v.noOfUsersFailed',noOfUsersFailed);
                cmp.set('v.isProcessing',false);
                var sectionDisplay = cmp.get('v.sectionDisplay');
                sectionDisplay['manualUsers'] = false;
            	sectionDisplay['createUsers'] = true;
                cmp.set('v.sectionDisplay',sectionDisplay);
                
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Desk / Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get existing users from Salesforce');
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
    
    compare:function (a,b) {
      if (a.name < b.name)
        return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    },
    
    validateEmailHelper: function (email) {
       	//var email = evt.getSource().get("v.value");
        if(email == null) return false;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    
    validateDeskUsersSelected: function(cmp, event, helper,checkUsernames){
        var users = cmp.get('v.users');
        var atLeastOneUserSelected;
        for(var num in users){
            var user = users[num];
            if(user.selected && (user.inDesk || user.isManual) && !user.inSalesforce){
                atLeastOneUserSelected = true;
            }
            if(user.selected && (user.inDesk || user.isManual) && $A.util.isEmpty(user.sfProfileId)){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Choose profile for selected users.');
                return false;
            }
            if(user.selected && (user.inDesk || user.isManual) && $A.util.isEmpty(user.sfUsername) && checkUsernames){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Usernames not entered');
                cmp.set('v.isProcessing',false);
                return false;
            }
            if(user.selected && (user.inDesk || user.isManual) && user.sfUsername && !helper.validateEmailHelper(user.sfUsername)){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Review errors shown');
                cmp.set('v.isProcessing',false);
                return false;
            }
        }
        /*if(!atLeastOneUserSelected){
             cmp.set('v.showError',true);
            cmp.set('v.errorMessage','Select at least one user to proceed');
            cmp.set('v.isProcessing',false);
            return false;
            
        }*/
       	return true;

    },
    
    validateManualUsersSelected: function(cmp, event, helper){
        var manualUsers = cmp.get('v.manualUsers');
        var atLeastOneUserSelected;
        var manualEmailSet = new Set();
        var selectedDeskUsersEmailSet = new Set();
        var existingSfUserEmailSet = new Set()
        var users = cmp.get('v.users');
        for(var num in users){
            if(users[num].selected){
                selectedDeskUsersEmailSet.add(users[num].email);
            }
            if(users[num].inSalesforce){
                existingSfUserEmailSet.add(users[num].email);
            }
        }
        for(var num in manualUsers){
            var user = manualUsers[num];
            if(!user.firstName && !user.lastName && !user.email && $A.util.isEmpty(user.sfProfileId) ){
                return true;
            }
            if(!user.lastName || !user.email || $A.util.isEmpty(user.sfProfileId)){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Incomplete information. Make sure you have filled in all the fields')
                return false;
            }
            if(!helper.validateEmailHelper(user.email)){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Email not in valid format');
                cmp.set('v.isProcessing',false);
                return false;
            }else if (manualEmailSet.has(user.email)){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Duplicate email entered');
                cmp.set('v.isProcessing',false);
                return false;
            }else if (selectedDeskUsersEmailSet.has(user.email)){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Review errors shown');
                cmp.set('v.isProcessing',false);
                return false;
            }else if(existingSfUserEmailSet.has(user.email)){
                cmp.set('v.showError',true);
                cmp.set('v.errorMessage','Review errors shown');
                cmp.set('v.isProcessing',false);
                return false;
            }else{
                manualEmailSet.add(user.email);
            }
        }
       	return true;

    }


})