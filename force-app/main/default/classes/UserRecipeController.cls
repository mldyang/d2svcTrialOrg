public class UserRecipeController {
    
    @auraenabled
    public static Map<String, String> getProfile(String authenticationId){
         try{
            Map<String,String> profileMap = new Map<String,String>();
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> userProfiles = rc.getUserProfile();            
            for(Object userProfileObject:userProfiles){
                Map<String,Object> userProfile = (Map<String,Object>)userProfileObject;
                profileMap.put((String)userProfile.get('Id'),(String)userProfile.get('Name'));
                /*if((String)userProfile.get('Name') == 'Support Agent'){
                   profileMap.put((String)userProfile.get('Id'),'Support Agent');
                }
                if((String)userProfile.get('Name') == 'Support Manager'){
                   profileMap.put((String)userProfile.get('Id'),'Support Manager');
                }
                if((String)userProfile.get('Name') == 'System Administrator'){
                   profileMap.put((String)userProfile.get('Id'),'System Administrator');
                }*/
            }
            return profileMap;
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    }
    
    @auraenabled
    public static Map<String, Integer> getLicenseInfo(String authenticationId){
         try{
            Map<String,Integer> LicenseInfoMap = new Map<String,Integer>();
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> LicenseInfoList = rc.getUserLicense(); 
            System.debug('Licenses: '+LicenseInfoList);
             if(LicenseInfoList.size() >0){
                 LicenseInfoMap.put('TotalLicenses',(Integer)((Map<String,Object>)LicenseInfoList[0]).get('TotalLicenses'));
                 LicenseInfoMap.put('UsedLicenses',(Integer)((Map<String,Object>)LicenseInfoList[0]).get('UsedLicenses'));
             }
            return LicenseInfoMap;
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    }
    
    @auraenabled
    public static List<UserDAO> getUsers(String authenticationId){
        List<UserDAO> users = new List<UserDAO>();
        Map<String,UserDAO> deskUserMap = new Map<String,UserDAO>();
        try{
            DeskClient dc = DeskClient.getInstance(authenticationId);
            
            Map<String, Object> responseMap = dc.getUsers();
            List<Object> entries = (List<object>)((Map<String, Object>)responseMap.get('_embedded')).get('entries');
           
            for (Object entry:entries){
                Map<String, Object> c = (Map<String, Object>)entry;
                if(!(Boolean)c.get('deleted')){
                    UserDAO deskUser = new UserDAO();
                    deskUser.deskUserId = String.valueOf(c.get('id'));
                    deskUser.email = (String)c.get('email');
                    //deskUser.sfUsername = (String)c.get('email');
                    deskUser.name = (String)c.get('name');
                    deskUser.inDesk = true;
                    //deskUser.selected = false;
                    users.add(deskUser);
                    deskUserMap.put(deskUser.email.toLowerCase(),deskUser);
                }
            }
            
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> sfUsers = rc.getUsers();
            for(Object userAsObject:sfUsers){
                Map<String,Object> sfUserInfo = (Map<String,Object>)userAsObject;
                String email = (String)sfUserInfo.get('Email');
                System.debug('sfUserInfo: '+sfUserInfo);
                //if(deskUserMap.get(username) != null){
                if(deskUserMap.get(email) != null){
                    deskUserMap.get(email).sfUserId = (String)sfUserInfo.get('Id');
                    if(deskUserMap.get(email).sfUsername != null && deskUserMap.get(email).sfUsername.trim().length() >0){
                        deskUserMap.get(email).sfUsername = deskUserMap.get(email).sfUsername +', '+ (String)sfUserInfo.get('Username');
                    }else{
                        deskUserMap.get(email).sfUsername = (String)sfUserInfo.get('Username');
                    } 
                    if(deskUserMap.get(email).sfProfileId != null && deskUserMap.get(email).sfProfileId.trim().length() >0 && 
                       deskUserMap.get(email).sfProfileId != (String)sfUserInfo.get('ProfileId')
                      ){
                   		deskUserMap.get(email).sfProfileId = deskUserMap.get(email).sfProfileId +','+(String)sfUserInfo.get('ProfileId');
                    }else{
                        deskUserMap.get(email).sfProfileId = (String)sfUserInfo.get('ProfileId');
                    }
                    if(deskUserMap.get(email).sfUserId != null && deskUserMap.get(email).sfUserId.trim().length() >0){
                   		deskUserMap.get(email).sfUserId = deskUserMap.get(email).sfUserId +','+(String)sfUserInfo.get('Id');
                    }else{
                        deskUserMap.get(email).sfUserId = (String)sfUserInfo.get('Id');
                    }
                    
                }
                
                	
                UserDAO sfUser = new UserDAO();
                sfUser.sfUserId = (String)sfUserInfo.get('Id');
                sfUser.email = (String)sfUserInfo.get('Email');
                if(sfUserInfo.get('FirstName') != null){
                    sfUser.name = ((String)sfUserInfo.get('FirstName') + ' ' + (String)sfUserInfo.get('LastName')).trim();
                }else{
                    sfUser.name = (String)sfUserInfo.get('LastName');
                }
                sfUser.firstName = (String)sfUserInfo.get('FirstName');
                sfUser.lastName = (String)sfUserInfo.get('LastName');
                sfUser.inSalesforce = true;
                sfUser.sfUsername = (String)sfUserInfo.get('Username');
                sfUser.sfProfileId= (String)sfUserInfo.get('ProfileId');
                sfUser.isActive = (Boolean)sfUserInfo.get('IsActive');
                //sfUser.selected = false;
                users.add(sfUser);
                    //userMap.put(sfUser.email,sfUser);
                
            }
            
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        return users; 
    }
    
    @auraenabled
    public static List<UserDAO> updateUsers(String usersString, String authenticationId){
        List<UserDAO> users = (List<UserDAO>)JSON.deserialize(usersString, List<UserDAO>.class);
        Map<String, UserDAO> userMap = new Map<String, UserDAO>();
        String jsonString;
         try{
            if(users.size() > 0){
                for(UserDAO user:users){
                    userMap.put(user.sfUserId,user);                    
                }
                jsonString = '{ "allOrNone" : false, "records" : [';
                for(UserDAO user:users){
                    jsonString += '{ "attributes" : {"type" : "User"},';
                    jsonString +=  '"id": "'+user.sfUserId + '", "ProfileId": "'+ user.sfProfileId +'", "Username": "' + user.sfUsername + '",';
                    //if(!user.isActive){
                    	jsonString += ' "IsActive" :' + user.isActive + '},';
                    /*}else{
                        jsonString += '},';
                    }*/
                }
                jsonString = jsonString.removeEnd(',');
	        	jsonString += ']}';
                System.debug('udpateJSONString: '+jsonString);
                RestClient rc = RestClient.getInstance(authenticationId);
                List<Object> responseList = rc.updateRecords(jsonString);
                String errorString;
                Integer count = 0;
                for(Object record:responseList){
                    Map<String, Object> values = (Map<String,Object>)record;
                    UserDAO currentUser = users[count];
                    if((Boolean)values.get('success')){
                       count ++;
                    }else{
                        /* Sample Error Response
                         * [
                         * 	  {
                                "success": false,
                                "errors": [
                                  {
                                    "statusCode": "MALFORMED_ID",
                                    "message": "Profile ID: id value of incorrect type: 00ef2000001mBGUAA3",
                                    "fields": [
                                      "ProfileId"
                                    ]
                                  }
                                ]
                              }
                            ]
                         */
                       	List<Object> errorList = (List<Object>)values.get('errors');
                        for(Object errorObject:errorList){
                            Map<String,Object> errorMap = (Map<String,Object>)errorObject;
                        	currentUser.errorStatusCode = (String)errorMap.get('statusCode');
                            currentUser.errorMessage = (String)errorMap.get('message');
                            List<Object> errorFields =	(List<Object>)errorMap.get('fields');
                            String errorFieldString;
                            for(Object errorField:errorFields){
                                    if(errorFieldString == null) errorFieldString = (String)errorField;
                                    else errorFieldString += ', '+ (String)errorField;
                            }
                            currentUser.errorField = errorFieldString;
                        }
                    }
                }
             }             
         }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        } 
        return users;
        
    }
    
    @auraenabled
    public static List<UserDAO> activateDeactivateUsers(String usersString, Boolean activeValue, String authenticationId){
        List<UserDAO> users = (List<UserDAO>)JSON.deserialize(usersString, List<UserDAO>.class);
        Map<String, UserDAO> userMap = new Map<String, UserDAO>();
        String jsonString;
         try{
            if(users.size() > 0){
                for(UserDAO user:users){
                    userMap.put(user.sfUserId,user);                    
                }
                jsonString = '{ "allOrNone" : false, "records" : [';
                for(UserDAO user:users){
                    jsonString += '{ "attributes" : {"type" : "User"},';
                    jsonString +=  '"id: '+user.sfUserId+'", "IsActive" : '+ activeValue +'},';
                }
                jsonString = jsonString.removeEnd(',');
	        	jsonString += ']}';
                
                RestClient rc = RestClient.getInstance(authenticationId);
                List<Object> responseList = rc.updateRecords(jsonString);
                String errorString;
                for(Object record:responseList){
                    Map<String, Object> values = (Map<String,Object>)record;
                    UserDAO currentUser = userMap.get((String)values.get('id'));
                    if((Boolean)values.get('success')){
                        currentUser.isActive = !activeValue;
                    }else{
                        errorString = '';
                        List<Object> errorList = (List<Object>)values.get('errors');
                        for(Object error:errorList){
                            errorString += (string)error;
                        }
                        currentUser.errorMessage = errorString;
                    }
                }
             }             
         }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        } 
        return users;
        
    }
    
    @auraenabled
    public static List<UserDAO> createUsers(String usersString, String authenticationId){
        
    	List<UserDAO> users = (List<UserDAO>)JSON.deserialize(usersString, List<UserDAO>.class);
        System.debug('users: '+users);
    	//List<UserDAO> users = UserRecipeController.getUsers(authenticationId);
        Map<String, UserDAO> userMap = new Map<String, UserDAO>();
        Map<String, UserDAO> returnUserMap = new Map<String, UserDAO>();
        Integer retryCount = 0;
        Integer count = 0;
        try{
            for(UserDAO user:users){
                if(user.sfUsername == null || user.sfUsername.trim().length() == 0 ){
                    if(!user.email.substringBefore('@').endsWith('-svc')){
                          user.sfUsername = user.email.substringBefore('@')+'-svc@'+user.email.substringAfter('@');
                    }
                }
                count++;
                userMap.put('user-'+ count, user);
                returnUserMap.put('user-'+ count, user);
            }
            RestClient rc = RestClient.getInstance(authenticationId);
            returnUserMap = userMap;
    
            while(retryCount <= 1 && userMap.size() > 0){
                String referenceId;
                String jsonString = createUserCreateJson(userMap);
                System.debug('JSON: '+jsonString);
                Map<String,Object> responseMap = rc.createUsers(jsonString);
                System.debug('response'+retryCount+': '+responseMap);
                if(!(Boolean)responseMap.get('hasErrors')){
                    for(Object retValue:(List<Object>)responseMap.get('results')){
                        Map<String,Object> retUser = (Map<String,Object>)retValue;
                        referenceId = (String)retUser.get('referenceId');
                        UserDAO user = userMap.get(referenceId);
                        user.sfUserId = (String)retUser.get('id');
                        returnUserMap.put(referenceId, user);
                    }
                    return userMap.values();
                }else{
                    for(Object retValue:(List<Object>)responseMap.get('results')){
                        Map<String,Object> retUser = (Map<String,Object>)retValue;
                        referenceId = (String)retUser.get('referenceId');
                        UserDAO user = userMap.get(referenceId);
                        userMap.remove(referenceId);
                        List<Object> errorList = (List<Object>)retUser.get('errors');
                        for(Object errorObject:errorList){
                            Map<String,Object> error = (Map<String,Object>)errorObject;
                            /*if((String)error.get('statusCode') == 'DUPLICATE_USERNAME'){
                                if(retryCount == 2){
                                user.errorStatusCode = (String)error.get('statusCode');
                                user.errorMessage = (String)error.get('message');
                                }else{
                                String username = user.sfUsername;
                                if(!username.substringBefore('@').endsWith('-trial')){
                                username = username.substringBefore('@')+'-trial@'+username.substringAfter('@');
                                }else if(username.substringBefore('@').endsWith('-trial')){
                                username = username.substringBefore('@').replace('-trial','-trial1@') +username.substringAfter('@');
                                }
                                user.sfUsername = username;
                                }
                                }else{*/
                            user.errorStatusCode = (String)error.get('statusCode');
                            user.errorMessage = (String)error.get('message');
                            List<Object> errorFields =	(List<Object>)error.get('fields');
                            String errorFieldString;
                            for(Object errorField:errorFields){
                                    if(errorFieldString == null) errorFieldString = (String)errorField;
                                    else errorFieldString += ', '+ (String)errorField;
                            }
                            user.errorField = errorFieldString;
                            returnUserMap.put(referenceId, user);
                            //}
                            break;
                        }
                        user.sfUserId = (String)retUser.get('id');
                    }
                }
                retryCount++;
            }
            //return userMap.values();
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        return returnUserMap.values();
        
        
        /* Error Message on Duplicate Username
         * 
         * {
            "hasErrors": true,
            "results": [{
                "referenceId": "user-1",
                "errors": [{
                    "statusCode": "DUPLICATE_USERNAME",
                    "message": "Duplicate Username.<br>The username already exists in this or another Salesforce organization. Usernames must be unique across all Salesforce organizations. To resolve, use a different username (it doesn't need to match the user's email address). ",
                    "fields": ["Username"]
                	}]
            }]
			}
		*/
        
        /* Success Response
         * 
         * 
         *  {
              "hasErrors" : false,
              "results" : [ {
                "referenceId" : "user-1",
                "id" : "005f4000000TkvuAAC"
              }, {
                "referenceId" : "user-2",
                "id" : "005f4000000TkvvAAC"
              } ]
            }
		*/	

 

    }
    
    private static String createUserCreateJson(Map<String,UserDAO> userMap){
        String jsonString;
        if(userMap.size() > 0){
            jsonString = '{ "records" : [';
            for (string ref:userMap.keyset()){
                UserDAO user = userMap.get(ref);
                System.debug('user in createjson: '+user.name);
                System.debug('errorStatusCode: '+user.errorStatusCode);
                System.debug('sfUserId: ' + user.errorStatusCode);
                if (user.errorStatusCode != null) System.debug('errorStatusCode len: '+user.errorStatusCode.length());
                if (user.sfUserId != null) System.debug('sfUserId len: '+user.sfUserId.length());
                
                if((user.errorStatusCode == null || user.errorStatusCode.length() == 0) && 
                   (user.sfUserId == null || user.sfUserId.length() == 0)){
                       System.debug('creating json');
                    jsonString += '{ "attributes" : {"type" : "User", "referenceId" : "' +  ref +'"},';
                    if (user.firstName != null && user.firstName.length()>0){
                        jsonString += '"FirstName" : "'+ user.firstName +'",';
                    }
                    if (user.lastName != null && user.lastName.length()>0){
                        jsonString += '"LastName" : "'+ user.LastName +'",';
                        jsonString += '"Alias" : "'+ user.lastName.left(5) +'",';
                    }else{
                        jsonString += '"LastName" : "'+ user.name +'",';
                        System.debug('+name: '+user.name);
                        jsonString += '"Alias" : "'+ user.name.left(5) +'",';
                        System.debug('+after name');
                    }
                    jsonString += '"Email" : "'+ user.email +'",' ;   
                    if (user.sfUserName != null && user.sfUserName.length()>0){
                        jsonString += '"UserName" : "'+ user.sfUserName +'",';
                    }else{
                        user.sfUserName = user.email;
                        jsonString += '"UserName" : "'+ user.email +'",'  ;      
                    }
                    if(user.sfProfileId == null || user.sfProfileId.length() == 0) user.sfProfileId = '00ef4000001UVPyAAO';
                    jsonString += '"ProfileId" : "'+ user.sfProfileId +'",';
                    jsonString += '"UserPermissionsSupportUser" : true, "IsActive" : false, "LocaleSidKey" : "en_US", "TimezoneSidKey" : "America/Los_Angeles", "LanguageLocaleKey" : "en_US", "EmailEncodingKey" : "ISO-8859-1"},'; 
                       
                }
                
            }
            jsonString = jsonString.removeEnd(',');
	        jsonString += ']}';
        }
        return jsonString;
    }
    
    @auraenabled
    public static Boolean activateAndSendEmail(String usersString, String authenticationId){
    //public static Boolean activateAndSendEmail(String authenticationId){
        //List<UserDAO> users = UserRecipeController.getUsers(authenticationId);
        try{
        List<UserDAO> users = (List<UserDAO>)JSON.deserialize(usersString, List<UserDAO>.class);
        Map<String,UserDAO> userMap = new Map<String,UserDAO>();
        ToolingClient tc = ToolingClient.getInstance(authenticationId);
        String userList = '';
        String userMapString = '';
        String url = tc.getSalesforceEndpoint();
        List<User> usersToActivate = new List<User>();
        for (UserDAO userRec:users){
            if(userRec.sfUserId != null && userRec.sfUserId.trim().length() > 0){
                //if(userRec.sfUserId == '005f4000000TlNwAAK' || userRec.sfUserId == '005f4000000TkvuAAC'){
                    userList += '\''+userRec.sfUserId+'\', ';
                    userMapString += '\''+userRec.sfUserId+'\' => \''+userRec.sfUsername+'\', ';
                    userMap.put(userRec.sfUserId,userRec);
                //}
            }
        }
        userList = userList.removeEnd(', ');
        userMapString = userMapString.removeEnd(', ');
        String stmtToExec = 
            'public class IntentionalException extends Exception {}'+'\n'+
        	'string url = \''+url+'\';'+'\n'+
            'String passwords = \'\';'+'\n'+
            'List<String> userIds = new List<String> { '+ userList +' };'+'\n'+
            'Map<String, String> userMap = new Map<String,String>{'+ userMapString +'};'+'\n'+
            'List<user> userstoActivate = new List<user>();' +'\n'+
            'for(String userId:userIds){'+'\n'+
            '	User u = new user(Id= userId,IsActive=true);'+'\n'+
            '	userstoActivate.add(u);'+'\n'+
            '}' +'\n'+
            'update userstoActivate;'+'\n'+
            'for(String userId:userIds){'+'\n'+
            '    System.ResetPasswordResult rs = System.resetPassword(userId, true);'+'\n'+
            //'    System.ResetPasswordResult rs = System.resetPassword(userId, false);'+'\n'+
            '	 passwords += userId+\',\'+rs.getPassword()+\';\';' +'\n'+
            '}'+'\n'+
            'System.debug(LoggingLevel.Error, \'Passwords: \'+passwords);'+'\n';
            
            System.debug('stmtToExec: '+stmtToExec);
            
        	Map<String,Object> tcReturnVal = tc.executeAnonymous(stmtToExec);
       		System.debug('tcReturnVal++!!: '+ tcReturnVal);
        	
        	/*if((Boolean)tcReturnVal.get('success')){
 				RestClient rc = RestClient.getInstance(authenticationId);
                String retValue = rc.getDebugLog();
                System.debug('rcReturnVal++!!: '+retValue);
                if(retValue != null && retValue.trim().length() >0){
                    Map<String,String> userPasswordMap = new Map<String,String>();
                    if(retValue.contains('ERROR|Passwords:')){
                        retValue = retValue.substringafter('ERROR|Passwords:').trim();
                        
                        List<String> valuePair = retValue.split(';');
                        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
                        
                        for(String value:valuePair){
                            if(value!=null && value.contains(',')){
                                System.debug('RETVALUE++!!: '+ value);
                                String userId = value.split(',')[0];
                                String password = value.split(',')[1];
                                userPasswordMap.put(userId,password);
                                System.debug('userMap: '+userMap);
                                try{
                                	emails.add(createWelcomeEmail(userMap.get(userId).email,userMap.get(userId).sfUsername,password,url));
                                }catch(Exception e){
                                    throw new FailedException('Email Failed');
                                }
                        	}
                        }
                        system.debug('UserPasswordMap: '+userPasswordMap);
                        if(emails.size() > 0){
                            List<Messaging.SendEmailResult> emailResultList = Messaging.sendEmail(emails, true);
                            for(Messaging.SendEmailResult emailResult:emailResultList){
                                if(!emailResult.isSuccess()){
                                    throw new FailedException('Failed');
                                }
                            }
                            //TO DO
                            System.debug('email errors: '+emailResultList);
                        }
                    }else{
                        throw new FailedException('Email Failed');
                    } 
            	}
            }else{
                throw new FailedException('Email Failed');
            }*/
        }catch(FailedException e){
            if (e.getMessage() == 'Email Failed'){
	            throw new AuraHandledException('Email Failed');
            }else{
                throw new AuraHandledException('Failed');
            }
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }       
        return true;
    }
    
    private static Messaging.SingleEmailMessage createWelcomeEmail(String email, String username, String Password, String url){
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            Messaging.reserveSingleEmailCapacity(1);
            mail.setSaveAsActivity(false);
        	mail.setToAddresses(new String[] {email});
            mail.setSenderDisplayName('Salesforce Support');    
        	mail.setSubject('Welcome to Salesforce');
            mail.setBccSender(false);
            mail.setUseSignature(false);
            mail.setHtmlBody('<html lang="en">'+
                                 '  <head>'+
                                 '    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'+
                                 '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />'+
                                 '    <title>Thanks for signing up with Salesforce!</title>'+
                                 '  </head>'+
                                 '  <body style="padding: 0; margin: 0;">'+
                                 ''+
                                 '  <style type="text/css">'+
                                 '  '+
                                 '      @font-face {'+
                                 '          font-family: "SalesforceSansLight";'+
                                 '          src: url("https://www2.sfdcstatic.com/system/shared/common/assets/fonts/SalesforceSans/SalesforceSans-Light.woff2") format("woff2"),'+
                                 '               url("https://www2.sfdcstatic.com/system/shared/common/assets/fonts/SalesforceSans/SalesforceSans-Light.woff") format("woff");'+
                                 '          font-style: normal;'+
                                 '          font-weight: 300;'+
                                 '      }'+
                                 '      '+
                                 '      @font-face {'+
                                 '          font-family: "SalesforceSans";'+
                                 '          src: url("https://www2.sfdcstatic.com/system/shared/common/assets/fonts/SalesforceSans/SalesforceSans-Regular.woff2") format("woff2"),'+
                                 '               url("https://www2.sfdcstatic.com/system/shared/common/assets/fonts/SalesforceSans/SalesforceSans-Regular.woff") format("woff");'+
                                 '          font-style: normal;'+
                                 '          font-weight: 400;'+
                                 '      }'+
                                 '  '+
                                 '      #outlook a { padding: 0; }'+
                                 '      /* hotmail */'+
                                 '      .ReadMsgBody { width: 100%; }'+
                                 '      .ExternalClass { width: 100%; }'+
                                 '      .ExternalClass * { line-height: 100%; }'+
                                 '      body {'+
                                 '          /* outlook */'+
                                 '          mso-line-height-rule: exactly;'+
                                 '          -webkit-text-size-adjust: none;'+
                                 '      }'+
                                 '      @-ms-viewport {'+
                                 '          width: device-width;'+
                                 '      }'+
                                 '      .appleLinks a {'+
                                 '          color: inherit;'+
                                 '          text-decoration: none;'+
                                 '      }'+
                                 '  '+
                                 '      /* This class probably won\'t stick in most email clients. They probably don\t want to make the background of the whole body some random color. But one can try. */'+
                                 '      body {'+
                                 '          background-color: #f4f6f9;'+
                                 '          font-family: SalesforceSans, Helvetica Neue, Helvetica, Arial;'+
                                 '      }'+
                                 ''+
                                 '      /* Small screen CSS. When the screen is less wide than the actual content. */'+
                                 '      @media (max-width: 660px) {'+
                                 '          .email-content-table, .email-content-table td {'+
                                 '              font-size: 14px;'+
                                 '              max-width: 656px !important;'+
                                 '              width: 100% !important;'+
                                 '          }'+
                                 '          .email-content-table {'+
                                 '              width: 90% !important;'+
                                 '          }'+
                                 '          .email-content-table-sub,'+
                                 '              .email-content-table-actual {'+
                                 '                  table-layout: fixed;'+
                                 '                  max-width: 656px !important;'+
                                 '                  width: 100% !important;'+
                                 '          }'+
                                 ''+
                                 '          /* Some different styles for the small screen. */'+
                                 '          td.td-outer {'+
                                 '              border-top: 2px solid #2B96D4 !important;'+
                                 '          }'+
                                 '          td.td-title {'+
                                 '              font-size: 20px !important;'+
                                 '              padding-top: 30px !important;'+
                                 '          }'+
                                 '          td.td-content {'+
                                 '              font-size: 14px !important;'+
                                 '              line-height: 125% !important;'+
                                 '          }'+
                                 '              td.td-content a.href-button {'+
                                 '                  line-height: 200% !important;'+
                                 '              }'+
                                 '          span.span-user-name {'+
                                 '              font-size: 14px !important;'+
                                 '              display: block;'+
                                 '              max-width: 280px !important;'+
                                 '          }'+
                                 '          img.img-logo {'+
                                 '              width: 80px;'+
                                 '          }'+
                                 '          .login-href {'+
                                 '              font-size: 14px !important;'+
                                 '          }'+
                                 '          '+
                                 '          /* Create rounded corners and shadow. */'+
                                 '          /* When an email clients sees this code (inside media queries), we will hide the rows with image corners. */'+
                                 '          /* Instead we use CSS to create rounded corners and box shadow. */'+
                                 '          /* The assumption here is: if the client can read this, it understands media queries. */'+
                                 '          /* If the client understands media queries, it understands border-radius and box-shadow. */'+
                                 '          /* If that assumption is wrong, the worse thing that happens is that the email is rendered with square corners and no shadow. */'+
                                 '          /* Why are we doing this? It greatly simplifies the structure of the html table, */'+
                                 '          /* which makes it a lot easier to have the main image be responsive (scale down when the screen is small). */'+
                                 '          .tr-top,'+
                                 '              .tr-bottom,'+
                                 '              .tr-top td,'+
                                 '              .tr-bottom td {'+
                                 '                  display: none;'+
                                 '          }'+
                                 '          td.shadow-pixel-td {'+
                                 '              display: none;'+
                                 '          }'+
                                 '          .email-content-table-sub-with-actual {'+
                                 '              border-collapse: separate;'+
                                 '          }'+
                                 '              .email-content-table-sub-with-actual td {'+
                                 '                  border-radius: 8px;'+
                                 '                  box-shadow: 0 2px 3px rgba(0,0,0,0.1);'+
                                 '              }'+
                                 '                .email-content-table-sub-with-actual table.email-content-table-actual td {'+
                                 '                    border-top-left-radius: 0;'+
                                 '                    border-top-right-radius: 0;'+
                                 '                }'+
                                 '                '+
                                 '                .email-content-table-sub-with-actual table.email-content-table-actual-top td {'+
                                 '                    border-top-left-radius: 8px;'+
                                 '                    border-top-right-radius: 8px;'+
                                 '                }'+
                                 '      }'+
                                 ''+
                                 '      @media (max-width: 479px) {'+
                                 '          /* At a certain width, we make the button 100% wide. */'+
                                 '          /* For instance: iPhone portrait mode, but not iPhone landscape mode. */'+
                                 '          a.href-button {'+
                                 '              display: block !important;'+
                                 '              padding-left: 10px;'+
                                 '              padding-right: 10px;'+
                                 '          } '+
                                 '      }'+
                                 '  </style>'+
                                 '        '+
                                 ''+
                                 '  <!-- center -->'+
                                 '  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f6f9" class="email-content-table-outer">'+
                                 '    <tr>'+
                                 '      <td valign="top" align="center" style="border-top: 4px solid #2B96D4; font-family: SalesforceSans, Helvetica Neue, Helvetica, Arial; font-size: 14px;" class="td-outer">'+
                                 '        '+
                                 '        <table cellpadding="0" cellspacing="0" border="0" class="email-content-table" style="width: 656px; border: 0; padding: 0; margin: 0;">'+
                                 '          <tr>'+
                                 '            <td style="border: 0; padding: 0; margin: 0;">'+
                                 '            '+
                                 '              <table width="656" cellpadding="0" cellspacing="16" border="0" class="email-content-table-sub" style="border: 0; padding: 0; margin: 0;">'+
                                 '                <tr>'+
                                 '                  <td align="center" class="layout-td-width td-logo" style="border: 0; padding: 0; margin: 0; font-size: 0px;"><img src="https://na50.salesforce.com/img/welcomeEmail/logo_company.png" style="display:block;" border="0" class="img-logo" /></td>'+
                                 '                </tr>'+
                                 '              </table>'+
                                 '              '+
                                 '            </td>'+
                                 '          </tr>'+
                                 '          <tr class="tr-top">'+
                                 '            <td style="border: 0; padding: 0; margin: 0;">'+
                                 '            '+
                                 '              <table width="656" cellpadding="0" cellspacing="0" border="0" class="email-content-table-sub" style="border: 0; padding: 0; margin: 0;">'+
                                 '                <tr>'+
                                 '                  <td align="right" valign="bottom" style="width: 16px; height: 17px; font-size: 0;" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/layout_left_top.png" width="16" height="17" style="display:block;" border="0" /></td>'+
                                 '                  <td align="center" bgcolor="#4B9EE4" style="width: 624px; height: 17px; font-size: 0;" class="layout-td-width"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="624" height="17" class="layout-img-width" style="display:block;" border="0"  /></td>'+
                                 '                  <td align="left" valign="bottom" style="width: 16px; height: 17px; font-size: 0;" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/layout_right_top.png" width="16" height="17" style="display:block;" border="0" /></td>'+
                                 '                </tr>'+
                                 '              </table>'+
                                 '              '+
                                 '            </td>'+
                                 '          </tr>'+
                                 '          <tr>'+
                                 '            <td style="border: 0; padding: 0; margin: 0;">'+
                                 '            '+
                                 '              <table width="656" cellpadding="0" cellspacing="0" border="0" class="email-content-table-sub email-content-table-sub-with-actual" style="border: 0; padding: 0; margin: 0;">'+
                                 '                <tr>'+
                                 '                  <td bgcolor="#efefef" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                  <td bgcolor="#e9e9e9" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                  <td bgcolor="#e0e0e0" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                  <td bgcolor="#4B9EE4" width="650" class="layout-td-width">'+
                                 '                    '+
                                 '                    <table width="650" cellpadding="0" cellspacing="0" border="0" class="email-content-table-actual email-content-table-actual-top">'+
                                 '                      <tr>'+
                                 '                        <td align="center" bgcolor="#4B9EE4" style="width: 650px; background: #4B9EE4; color: #ffffff; font-family: SalesforceSansLight, Helvetica Neue, Helvetica, Arial; font-size: 32px; padding: 16px 0 24px 0;" class="layout-td-width td-title"><span style="padding: 0 20px; display: block;">Thanks for signing up with Salesforce!</span></td>'+
                                 '                      </tr>'+
                                 '                      <tr>'+
                                 '                        <td align="center" style="width: 650px; font-size: 0;" class="layout-td-width"><img src="https://na50.salesforce.com/img/welcomeEmail/welcome_email_graphic.png" style="max-width: 100% !important; width: 100% !important; height: auto !important; display: inline-block;" /></td>'+
                                 '                      </tr>'+
                                 '                    </table>'+
                                 ''+
                                 '                  </td>'+
                                 '                  <td bgcolor="#e0e0e0" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                  <td bgcolor="#e9e9e9" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                  <td bgcolor="#efefef" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                </tr>'+
                                 '                <tr>'+
                                 '                  <td bgcolor="#efefef" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                  <td bgcolor="#e9e9e9" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                  <td bgcolor="#e0e0e0" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                  <td bgcolor="#ffffff" width="650" class="layout-td-width">'+
                                 '                    '+
                                 '                    <table width="650" cellpadding="0" cellspacing="0" border="0" class="email-content-table-actual" style="border: 0; padding: 0; margin: 0;">'+
                                 '                      <tr>'+
                                 '                        <td background-color="#ffffff" align="center" style="width: 650px; background: #ffffff; color: #1e4483; font-family: SalesforceSans, Helvetica Neue, Helvetica, Arial; font-size: 14px; padding: 0 0 20px 0; line-height: 150%;" class="td-content layout-td-width">'+
                                 '                          <span style="padding: 0 20px; display: block;">&nbsp;<br />'+
                                 '                          Click below to set your password.<br />'+
                                 '                          &nbsp;<br />'+
                                 '                          <a href="https://login.salesforce.com/login.jsp?un='+EncodingUtil.urlEncode(username, 'UTF-8')+'&pw='+ EncodingUtil.urlEncode(password, 'UTF-8') +'" target="_blank" style="padding: 6px 40px; display: inline-block; background: #1173cf; color: #ffffff; text-decoration: none; font-size: 125%; border-radius: 4px; line-height: 200%;" class="href-button">Set Your Password</a><br />'+
                                 '                          &nbsp;<br />'+
                                 '                          To easily log in later, save this URL:<br />'+
                                 '                          <a href="'+ url +'" style="font-size:125%" target="_blank" class="login-href">'+ url +'</a><br />'+
                                 '                          &nbsp;<br />'+
                                 '                          Username:<br />'+
                                 '                          <span style="font-size: 125%; display: inline-block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 600px;" class="span-user-name">'+ username +'</span><br />'+
                                 '                          &nbsp;<br />'+
                                 '                          <span>Again, welcome to Salesforce!</span>'+
                                 '                          </span>'+
                                 '                        </td>'+
                                 '                      </tr>'+
                                 '                    </table>'+
                                 ''+
                                 '                  </td>'+
                                 '                  <td bgcolor="#e0e0e0" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                  <td bgcolor="#e9e9e9" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                  <td bgcolor="#efefef" width="1" class="shadow-pixel-td"><img src="https://na50.salesforce.com/img/welcomeEmail/p.gif" width="1" style="display:block;" border="0" /></td>'+
                                 '                </tr>'+
                                 '              </table>'+
                                 '            '+
                                 '            </td>'+
                                 ''+
                                 '          </tr>'+
                                 '          <tr class="tr-bottom">'+
                                 '            <td style="border: 0; padding: 0; margin: 0;">'+
                                 ''+
                                 '              <table width="656" cellpadding="0" cellspacing="0" border="0" class="email-content-table-sub" style="border: 0; padding: 0; margin: 0;">'+
                                 '                <tr>'+
                                 '                  <td align="right" valign="top" style="width: 16px; height: 17px; font-size: 0;"><img src="https://na50.salesforce.com/img/welcomeEmail/layout_left_bottom.png" width="16" height="17" style="display:block;" border="0" /></td>'+
                                 '                  <td align="center" style="width:624px; height: 17px; font-size: 0;"><img src="https://na50.salesforce.com/img/welcomeEmail/layout_bottom.png" width="624" height="17" class="layout-img-width" style="display:block;" border="0" /></td>'+
                                 '                  <td align="left" valign="top" style="width: 16px; height: 17px; font-size: 0;"><img src="https://na50.salesforce.com/img/welcomeEmail/layout_right_bottom.png" width="16" height="17" style="display:block;" border="0" /></td>'+
                                 '                </tr>'+
                                 '              </table>'+
                                 '              '+
                                 '            </td>'+
                                 '          </tr>'+
                                 '          <tr>'+
                                 '            <td style="border: 0; padding: 0; margin: 0;">'+
                                 ''+
                                 '              <table width="656" cellpadding="0" cellspacing="0" border="0" class="email-content-table-sub" style="border: 0; padding: 0; margin: 0;">'+
                                 '                <tr>'+
                                 '                  <td align="left" style="width: 656px; padding: 20px; font-family: SalesforceSans, Helvetica Neue, Helvetica, Arial; font-size: 12px; color: #798188;" class="td-footer">'+
                                 '                    &copy; Copyright 2000-2015 salesforce.com, inc. All rights reserved. Various trademarks held by their respective owners.<br />'+
                                 '                    &nbsp;<br />'+
                                 '                    Salesforce.com, inc. The Landmark at One Market, Suite 300, San Francisco, CA, 94105, United States'+
                                 '                  </td>'+
                                 '                </tr>'+
                                 '              </table>'+
                                 ''+
                                 '            </td>'+
                                 '          </tr>'+
                                 '        </table>'+
                                 '        '+
                                 '      </td>'+
                                 '    </tr>'+
                                 '  </table>'+
                                 '  <!-- /center -->'+
                                 '  </body>'+
                                 '</html>');
        return mail;
        //Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        
        
    }
    
    @auraenabled
    public static String getCurrentUserId(String authenticationId){
        try{
            RestClient rc = RestClient.getInstance(authenticationId);
            return rc.getUserId();            
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        //return null;
    }
    

}