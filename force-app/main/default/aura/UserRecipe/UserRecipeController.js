({
	init : function(cmp, event, helper) {
        helper.getProfileHelper(cmp, event, helper);
        helper.createRecipeActivity(cmp,{action: 'Load', recipe: 'User', feature:'Recipe'});
	},
    
    next : function(cmp, event, helper) {
        var section;
        cmp.set('v.showError',false);
        var sectionDisplay = cmp.get('v.sectionDisplay');
        if(sectionDisplay['model']){
            section = 'model';
            var selectedModel = cmp.get('v.modelSelectedOption');
            if(!selectedModel){
                cmp.set('v.errorMessage','Select one of options to proceed');
                cmp.set('v.showError',true);
                return;
            }else if (selectedModel == 'new'){
                sectionDisplay['model'] = false;
                sectionDisplay['deskUsers'] = true;
            }else if (selectedModel == 'update'){
                helper.getLicenseInfoHelperForUpdate(cmp,event,helper);
            }
        } 
        else if(sectionDisplay['deskUsers']){
            section = 'deskUsers';
            if(helper.validateDeskUsersSelected(cmp,event,helper,false)){
                sectionDisplay['deskUsers'] = false;
                sectionDisplay['manualUsers'] = true;
                //sectionDisplay['createUsers'] = true;
                //helper.createUsersHelper(cmp,event,helper);   
            }else {
                window.scrollTo(0, 0, 'smooth');
            }
        } 
        else if(sectionDisplay['manualUsers']){
            section = 'manualUsers';
            if(helper.validateManualUsersSelected(cmp,event,helper)){
                var users = cmp.get('v.users');
                var manualUsersCopy = cmp.get('v.manualUsers').slice();
                
                for(var num in manualUsersCopy){
                    var user = manualUsersCopy[num];
                    if(user.lastName && user.email && !$A.util.isEmpty(user.sfProfileId)){
                        user.isManual = true;
                        user.selected = true;
                        user.name = (user.firstName +' '+user.lastName).trim();
                	}else{
                        manualUsersCopy.splice(num,1);
                    }
                }
                users = users.concat(manualUsersCopy);
                var atLeastOneUserSelected = false;
                for(var num in users){
                    var user = users[num];
                    if(user.selected && (user.inDesk || user.isManual) && !user.inSalesforce){
                        atLeastOneUserSelected = true;
                    }
                }
                if(!atLeastOneUserSelected){
                    cmp.set('v.errorMessage','No user selected');
                    cmp.set('v.showError',true);
                    return;
                }
                cmp.set('v.users',users);
                console.log('users: ',users);
                window.scrollTo(0, 0, 'smooth');
         		helper.createUsersHelper(cmp,event,helper);
            }   
        }
        else if(sectionDisplay['createUsers']){
            section = 'createUsers';
            var users = cmp.get('v.users');
            for(var num in users){
                var user = users[num];
                if(users[num].selected && (users[num].inDesk || users[num].isManual)){
                    if(helper.validateDeskUsersSelected(cmp,event,helper,true)){
                   		helper.createUsersHelper(cmp, event, helper);
                    }
                    return;
                }
            }
            var noOfUsersSuccessful = cmp.get('v.noOfUsersSuccessful');
            if(noOfUsersSuccessful > 0){
                window.scrollTo(0, 0, 'smooth');
	            helper.getLicenseInfoHelper(cmp,event,helper);
            } else {
                sectionDisplay['createUsers'] = false;
                sectionDisplay['complete'] = true;
                cmp.set('v.goBackTo','createUsers');
            }
        }else if(sectionDisplay['welcomeEmail']){
            section = 'welcomeEmail';
            var users = cmp.get('v.users');
            var selectedUsers = new Array();
            for(var num in users){
                if(users[num].selected && (users[num].inDesk || users[num].isManual)){
                    selectedUsers.push(users[num]);
                }
            }
            if(selectedUsers.length>0){
                var licenseInfo = cmp.get('v.sfLicenseInfo');
                if(licenseInfo['TotalLicenses'] - licenseInfo['UsedLicenses'] < selectedUsers.length){
                    cmp.set('v.errorMessage','You do not have license available to activate '+selectedUsers.length+ ' users');
                    cmp.set('v.showError',true);
                    return;
                }
                window.scrollTo(0, 0, 'smooth');
                helper.activateAndSendEmailHelper(cmp,event,helper);
            }else{
                cmp.set('v.welcomeEmailHeader','No users activated. You have completed Users Recipe');
                sectionDisplay['welcomeEmail'] = false;
                sectionDisplay['complete'] = true;
                cmp.set('v.goBackTo','welcomeEmail');
            }
        	
        	cmp.set('v.noOfUsersActivated',selectedUsers.length)
        }else if(sectionDisplay['update']){
            section = 'update';
            cmp.set('v.showError',false);
            var usersUpdated = false;
            var usersActivated = false;
            var noOfUsersActivated = true;
            var noOfActiveUsers = 0;
            var existingSFUsers = cmp.get('v.existingSFUsers');
            var updatedUsersToActivate = new Set();
            var users = cmp.get('v.users');
            for(let userSF of existingSFUsers){
                for(let user of users){
                    if (userSF.sfUserId == user.sfUserId && (userSF.sfProfileId != user.sfProfileId || 
                                                            (userSF.isActive != user.isActive) ||
                                                            userSF.sfUsername != user.sfUsername)){
                        usersUpdated = true;
                    }
                    if(userSF.sfUserId == user.sfUserId && (userSF.isActive && !user.isActive)){
                        usersActivated = true;
                        updatedUsersToActivate.add(userSF);
                    }
                }
                if(userSF.isActive){
                    noOfActiveUsers ++;
                }
            }
            
            var licenseInfo = cmp.get('v.sfLicenseInfo');
            if(licenseInfo['TotalLicenses'] < noOfActiveUsers){
                cmp.set('v.errorMessage','You do not have licenses available to have '+ noOfActiveUsers +' active users');
                cmp.set('v.showError',true);
                window.scrollTo(0, 0, 'smooth');
                return;
            }
            
            var updatedUsersToActivateList = [];
            for(let current of updatedUsersToActivate){
                updatedUsersToActivateList.push(current);   
            }
	           
        	cmp.set('v.updatedUsersToActivate',updatedUsersToActivateList);
            if(usersUpdated){
            	helper.updateUsersHelper(cmp,event,helper);
            }else if(usersActivated){
                
            }else if(cmp.get('v.postUpdate')){
                cmp.set('v.completeHeader','You have completed the Users Recipe!');
                sectionDisplay['update'] = false;
                sectionDisplay['complete'] = true;
                cmp.find('backButton').set('v.disabled',true);
            }
            else{
                cmp.set('v.errorMessage','No Updates detected');
                cmp.set('v.showError',true);
                window.scrollTo(0, 0, 'smooth');
                return;
            }
        }else if(sectionDisplay['complete']){
            section = 'complete';
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }
        cmp.set('v.sectionDisplay',sectionDisplay);
        helper.createRecipeActivity(cmp,{action: 'Next', recipe: 'User', feature:'Recipe', section: section});
    },
    
    back : function(cmp, event, helper) {
        var sectionDisplay = cmp.get('v.sectionDisplay');
        var section;
        cmp.set('v.showErrors',false);
        if(sectionDisplay['model']){
            section = 'model';
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }
        else if(sectionDisplay['deskUsers']){
            section = 'deskUsers';
           	sectionDisplay['model'] = true;
            sectionDisplay['deskUsers'] = false;
            helper.getProfileHelper(cmp, event, helper);
        }
        else if(sectionDisplay['manualUsers']){
            section = 'manualUsers';
            sectionDisplay['deskUsers'] = true;
            sectionDisplay['manualUsers'] = false;
            cmp.find('nextButton').set('v.disabled','false');

        }
        else if(sectionDisplay['createUsers']){
            section = 'createUsers';
            sectionDisplay['manualUsers'] = true;
            sectionDisplay['createUsers'] = false;
            cmp.find('nextButton').set('v.disabled','false');
            helper.getUsersHelper(cmp,event,helper);
        }else if(sectionDisplay['welcomeEmail']){
            section = 'welcomeEmail';
            sectionDisplay['createUsers'] = true;
            sectionDisplay['welcomeEmail'] = false;
        }else if(sectionDisplay['complete']){
            section = 'complete';
            sectionDisplay[cmp.get('v.goBackTo')] = true;
            sectionDisplay['complete'] = false;
        }else if(sectionDisplay['update']){
            section='update';
            sectionDisplay['model'] = true;
            sectionDisplay['update'] = false;
            cmp.set('v.postUpdate',false);
            helper.getProfileHelper(cmp, event, helper);
        }
		cmp.set('v.sectionDisplay',sectionDisplay);
        helper.createRecipeActivity(cmp,{action: 'Back', recipe: 'User', feature:'Recipe', section: section});
	},
    
    usersChange: function(cmp, event, helper){
		console.log(cmp, event);
    },
    
    validateUserName: function(cmp, event, helper){
        
    	var username = event.getSource().get('v.value');
        var name = event.getSource().get('v.name');
        var users = cmp.get('v.users');
        var row = parseInt(name.replace('username',''));
        if(!helper.validateEmailHelper(username)){
            users[row].usernameError = 'Username should be in email format';
        }else{
            users[row].usernameError = '';
        }
        cmp.set('v.users',users);
        console.log('username:',username);
    },
    
    validateUserNameForUpdate: function(cmp, event, helper){
        
    	var username = event.getSource().get('v.value');
        var name = event.getSource().get('v.name');
        var users = cmp.get('v.existingSFUsers');
        var row = parseInt(name.replace('username',''));
        if(!helper.validateEmailHelper(username)){
            users[row].usernameError = 'Username should be in email format';
        }else{
            users[row].usernameError = '';
        }
        cmp.set('v.existingSFUsers',users);
        console.log('username:',username);
    },
    
    validateEmail: function(cmp, event, helper){
        
    	var email = event.getSource().get('v.value');
        var name = event.getSource().get('v.name');
        var manualUsers = cmp.get('v.manualUsers');
        var row = parseInt(name.replace('email',''));
        var selectedDeskUsersEmailSet = new Set();
        var existingSfUserEmailSet = new Set()
        var users = cmp.get('v.users');
        var manualEmailSet = new Set();
        
        for(var num in users){
            if(users[num].selected){
                selectedDeskUsersEmailSet.add(users[num].email);
            }
            if(users[num].inSalesforce){
                existingSfUserEmailSet.add(users[num].email);
            }
        }
        
        for(var num in manualUsers){
            if(num != row){
           		manualEmailSet.add(manualUsers[num].email);
            }
        }
        
        if(email && !helper.validateEmailHelper(email)){
			manualUsers[row].emailError = 'Format is invalid';
        }else if (email && manualEmailSet.has(email)){
            manualUsers[row].emailError = 'Duplicate Email';
        }else if (email && selectedDeskUsersEmailSet.has(email)){
            manualUsers[row].emailError = 'User already selected from list of Desk Users';
        }else if(email && existingSfUserEmailSet.has(email)){
            manualUsers[row].emailError = 'User exists in Salesforce';
        }else{
            manualUsers[row].emailError = '';
        }
        cmp.set('v.manualUsers',manualUsers);
    },
    
    addManualUserRow: function(cmp, event, helper) {
    	var manualUsers = cmp.get('v.manualUsers');
        var newUser = {firstName: '', lastName: '', email: '', emailError: '', profileId: ''};
        manualUsers.push(newUser);
        cmp.set('v.manualUsers',manualUsers);
        console.log(manualUsers.length);        
	},
    
    delManualUserRow: function(cmp, event, helper) {
        var name = event.target.name;
        var row = parseInt(name.replace('del',''));
        var manualUsers = cmp.get('v.manualUsers')
        manualUsers.splice(row,1);
        cmp.set('v.manualUsers',manualUsers);
        return;
    },
    
    setSelectedProfileForUpdate: function(cmp, event, helper){
        
    }
    
    
    
})