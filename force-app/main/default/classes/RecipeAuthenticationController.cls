public class RecipeAuthenticationController {
    
	public class AuthorizationConfirmation{
        @AuraEnabled
        public Boolean sfAuthenticated = false;
        @AuraEnabled
        public Boolean sfAuthorized = false;
        @AuraEnabled
        public Boolean sfSessionInvalid = false;
        @AuraEnabled
        public String sfMyDomain;
        @AuraEnabled
        public Boolean deskAuthorized = false;
    }    
    
   /* @AuraEnabled
    public static String createRecipeSessionRecord(
                                                 String deskendpoint,
                                                 String recordidentifiertoken) {
                                                 
        if ( deskendpoint != null && deskendpoint.trim().length() == 0 &&
            recordidentifiertoken != null && recordidentifiertoken.trim().length() == 0){
               throw new AuraHandledException('Input Parameters not valid');
            }
        
 
       
       Recipe_Session__c rs;                                              
         
        List<Recipe_Session__c> rsList = [SELECT Id, Temporary_Token_Secret__c FROM Recipe_Session__c WHERE record_identifier_token__c =: recordidentifiertoken];
        if (rsList != null && rsList.size() > 0 ){
			rs = rsList[0];
            rs.desk_endpoint__c = deskendpoint;
        }
         else {
                                                     
            rs = new Recipe_Session__c(
                            record_identifier_token__c = recordidentifiertoken,
                            desk_endpoint__c = deskendpoint);
         }
                                                     
        upsert rs;
        return rs.Id;

    }    */

	 @AuraEnabled
    public static Boolean checkRecipeSessionDeskAuthorization(String recordIdentifier) {
        
      Boolean authorized = false;
        try{
          Recipe_Session__c rs = [SELECT Id, token__c, token_secret__c FROM Recipe_Session__c WHERE record_identifier_token__c =: recordIdentifier];
    	  if(rs.token__c != null && rs.token_secret__c != null &&
            rs.token__c.trim().length() > 0 && rs.token_secret__c.trim().length() > 0)
         	 authorized = true;
          else
             authorized = false;
        }catch (Exception e){
            
        }
      return authorized;
    }
    
    @AuraEnabled
    public static Boolean checkRecipeSessionSalesforceAuthorization(String recordIdentifier) {
        
      Boolean authorized = false;
        try{
          Recipe_Session__c rs = [SELECT Id, Salesforce_Access_Token__c FROM Recipe_Session__c WHERE record_identifier_token__c =: recordIdentifier];
    	  if(rs.Salesforce_Access_Token__c != null &&
            rs.Salesforce_Access_Token__c.trim().length() > 0 )
         	 authorized = true;
          else
             authorized = false;
        }catch (Exception e){
            
        }
      return authorized;
    }
    
    @AuraEnabled
    public static AuthorizationConfirmation checkRecipeSessionAuthorized(String recordIdentifier) {
        
      AuthorizationConfirmation ac = new AuthorizationConfirmation();

       
      Boolean authorized = false;
        try{
            Recipe_Session__c rs = [SELECT Id, token__c, token_secret__c,  Salesforce_Access_Token__c, Salesforce_instance_url__c, Desk_Endpoint__c FROM Recipe_Session__c WHERE record_identifier_token__c =: recordIdentifier];
            if(rs.token__c != null && rs.token_secret__c != null &&
               rs.token__c.trim().length() > 0 && rs.token_secret__c.trim().length() > 0){
                   ac.deskAuthorized = true;
                   Boolean remoteSiteResult = ToolingClient.createRemoteSiteSetting(Helper.parseEndPoint(rs.Desk_Endpoint__c), rs.Desk_Endpoint__c , 'Created for Setup Recipes');
            }
            if(rs.Salesforce_Access_Token__c != null  && rs.Salesforce_Access_Token__c.trim().length() > 0){
                //ac.sfAuthorized = true;
                if(rs.Salesforce_instance_url__c != null && rs.Salesforce_instance_url__c.trim().length() > 0){
                    List<String> split = rs.Salesforce_instance_url__c.split('\\.');
                    if (split.size() > 0 ){
                        ac.sfMyDomain = split[0].replace('https://','');
                    }
                }
                String recipeSessionUserId;
                String currentUserId;
                String userProfileId;
                String systemAdminProfileId;
                List<String> returnVal = new List<String>();
                RestClient rc = RestClient.getInstance(recordIdentifier);
                recipeSessionUserId = rc.getUserId();
                Map<String, Object> userInfoMap = rc.getUserInfo();            
                currentUserId = (String)userInfoMap.get('user_id');
                Map<String,Object> userInfoMap2 = rc.getUserInfoById(currentUserId); 
                userProfileId = (String)userInfoMap2.get('ProfileId');
                List<Object> userProfiles = rc.getUserProfile();  
                for(Object userProfileObject:userProfiles){
                    Map<String,Object> userProfile = (Map<String,Object>)userProfileObject;
                    if((String)userProfile.get('Name') == 'System Administrator'){
                        systemAdminProfileId = (String)userProfile.get('Id');
                    }
                }
                System.debug('userProfileId: '+userProfileId);
                System.debug('systemAdminProfileId: '+systemAdminProfileId);                
                if(recipeSessionUserId == currentUserId){
                    ac.sfAuthenticated = true;
                    ac.sfSessionInvalid = false;
                    if (userProfileId == systemAdminProfileId){
                        ac.sfAuthorized = true;
                    }else{
                        ac.sfAuthorized = false;
                    }
                }else{
                    ac.sfAuthenticated = false;
                    ac.sfSessionInvalid = true;
                }
            } else{
                ac.sfAuthenticated = false;
                ac.sfSessionInvalid = false;
            }
        }catch(FailedException e){
            ac.sfAuthenticated = false;
            ac.sfSessionInvalid = true;
        }
        catch (Exception e){
            throw new AuraHandledException('Unknown');
        }
      //return authorized;
      return ac;
    }
    
     @AuraEnabled
    public static Boolean createRemoteSite(String recordIdentifier) {
        
      Boolean authorized = false;
        try{
          Recipe_Session__c rs = [SELECT Id, Salesforce_instance_url__c FROM Recipe_Session__c WHERE record_identifier_token__c =: recordIdentifier];
    	  if(rs.Salesforce_instance_url__c != null &&
             rs.Salesforce_instance_url__c.trim().length() > 0 ) {
                String instance_url = rs.Salesforce_instance_url__c;
  				return(ToolingClient.createRemoteSiteSetting(Helper.parseEndPoint(instance_url), instance_url, instance_url));
           }
        }catch(UnauthorizedException e){
            throw new AuraHandledException('Unauthorized');
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }
        return false;
    }
    
  public String authUrl { get; set; }
  public STring authSuccess { get; set; }

  public PageReference authorize() {
    RecipeOAuth oa = new RecipeOAuth();
    String recordIdentifier = ApexPages.currentPage().getParameters().get('recordIdentifierToken');
    String deskSiteName = ApexPages.currentPage().getParameters().get('deskSiteName');
    System.debug('DeskSiteName: '+deskSiteName);
    Boolean remoteSiteResult = ToolingClient.createRemoteSiteSetting(Helper.parseEndPoint(deskSiteName), deskSiteName , 'Created for Trial Sign Up');
      if(remoteSiteResult){
          authUrl = oa.startAuthorization(recordIdentifier, deskSiteName);
          System.debug(authUrl);
          if(authUrl == null) {
              // this.message = oa.message;
              ToolingClient.deleteRemoteSiteSetting(Helper.parseEndPoint(deskSiteName), null, null);
              return new PageReference('javascript: "window.close()"');
          } else {
              return new PageReference(authUrl);
          }
      }
      return new PageReference('javascript: "window.close()"');
  }
	
    
  public PageReference completeAuthorization() {
    String token = ApexPages.currentPage().getParameters().get('oauth_token');
    String recordIdentifier = ApexPages.currentPage().getParameters().get('recordIdentifier');
      try {
        if(token!=null)
        {
          String verifier = ApexPages.currentPage().getParameters().get('oauth_verifier');
          RecipeOAuth oa = new RecipeOAuth();
          oa.completeAuthorization(token,verifier,recordIdentifier);
          System.debug('Auth Successful');
        }
        else {
          System.debug('Invalid request. Missing parameter oauth_token');
        }
      }catch(Exception e){
          return new PageReference('javascript: "window.close()"');
      }
    return new PageReference('javascript: "window.close()"');
  }
    
    
     public PageReference authorizeSalesforce() {
        String recordIdentifier = ApexPages.currentPage().getParameters().get('recordIdentifierToken');
        String myDomain = ApexPages.currentPage().getParameters().get('instance');
        if(recordIdentifier == null) recordIdentifier = 'abc';
		String consumerKey = Label.Recipe_Salesforce_Consumer_Key;
        //Boolean remoteSiteResult = ToolingClient.createRemoteSiteSetting(Helper.parseEndPoint(deskSiteName), deskSiteName , 'Created for Trial Sign Up'); 
        String retUrl = EncodingUtil.urlEncode('https://desktosvc.secure.force.com/trial/RecipeCompleteSFAuth','UTF-8');
        System.debug('URL: '+ 'https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id='+ consumerKey +
                                 '&redirect_uri=' + retUrl +
                                 '&state='+recordIdentifier);
        //return new PageReference('https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id='+ consumerKey +
         if (myDomain != null && myDomain.trim().length() > 0){
             String instance_url = 'https://'+myDomain+'.my.salesforce.com';
             if(ToolingClient.createRemoteSiteSetting(Helper.parseEndPoint(instance_url), instance_url, instance_url)){
                 return new PageReference('https://'+myDomain+'.my.salesforce.com/services/oauth2/authorize?response_type=code&client_id='+ consumerKey +
                                          '&redirect_uri=' + retUrl +
                                          '&state='+recordIdentifier);
             } else {
                 return new PageReference('https://desktosvc.secure.force.com/trial/RecipesError');
             }
         }else{
             return new PageReference('https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id='+ consumerKey +
                                      '&redirect_uri=' + retUrl +
                                      '&state='+recordIdentifier);
             
         }
 	 }
    
    public PageReference completeSFAuthorization() {
        
        // TO DO
        String authorizationCode = ApexPages.currentPage().getParameters().get('code');
        String recordIdentifier = ApexPages.currentPage().getParameters().get('state');
        
        System.debug('CODE: '+authorizationCode);
        System.debug('state: '+recordIdentifier);
        
        String consumerKey = Label.Recipe_Salesforce_Consumer_Key;
        String url = 'https://login.salesforce.com/services/oauth2/token';
        String retUrl = EncodingUtil.urlEncode('https://desktosvc.secure.force.com/trial/RecipeCompleteSFAuth','UTF-8');
        String body = 'grant_type=authorization_code&' +
            		'client_id=' + 	consumerKey + '&' +
            		'redirect_uri=' + retUrl + '&' +
            		'code=' + authorizationCode;
        
          try {
            if(authorizationCode !=null && recordIdentifier != null)
            {
              	HttpRequest req = new HttpRequest();
                req.setEndpoint(url);
                req.setMethod('POST'); 
                req.setBody(body);
                req.setHeader('Content-Type','application/x-www-form-urlencoded');
                
                Http http = new Http();
                HttpResponse res;
                res = http.send(req);
              	System.debug('Response: '+res.getBody());
                Map<String, Object> params = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
                String access_token = (String)params.get('access_token');
                String refresh_token = (String)params.get('refresh_token');
                String instance_url = (String)params.get('instance_url');
                String user_id = (String)params.get('id');
                Recipe_Session__c rs;
                Recipe_Session__c rsExisting;
                List<Recipe_Session__c> rsList = [select id, token__c, token_secret__c from Recipe_Session__c where record_identifier_token__c =: recordIdentifier];
                if(rsList != null && rsList.size() >0){
                    rs = rsList[0];
                    rs.Salesforce_Access_Token__c = access_token;
                    rs.Salesforce_Refresh_Token__c = refresh_token;
                    rs.Salesforce_instance_url__c = instance_url;
                    rs.Salesforce_User_Id__c = user_id;
                    //update rs;
                } else {
                   rs = new Recipe_Session__c(Salesforce_Access_Token__c = access_token,
                                              Salesforce_Refresh_Token__c = refresh_token,
                                              Salesforce_instance_url__c = instance_url,
                                              Salesforce_User_Id__c = user_id,
                                              record_identifier_token__c = recordIdentifier);
                   //insert rs;
                }
                
                
                
                RestClient rc = RestClient.getInstance(instance_url, access_token, user_id.substringAfterLast('/'), recordIdentifier);
                Map<String, Object> userInfoMap = rc.getUserInfo();            
                String username = (String)userInfoMap.get('preferred_username');
                String userEmail = (String)userInfoMap.get('email');
                String name = (String)userInfoMap.get('name');
                System.debug('URLs' + userInfoMap.get('urls'));
                String orgId = ((String)((Map<String,Object>)userInfoMap.get('urls')).get('enterprise')).substringAfterLast('/');
                String signUpUsername;
                String signupEmail;
                String signupDeskSiteId;
                rs.Username__c = username;
                rs.User_Email__c = userEmail;
                rs.User_Name__c = name;
                rs.OrgId__c = orgId;
                
                //First check if there is a previous recipe session by the same user from the same org, if so copy the desk tokens from there.
                if(rs.token__c == null || rs.token_secret__c == null){
                    List<Recipe_Session__c> rsExistingList = [select id, desk_endpoint__c, token__c, token_secret__c, desk_site_id__c from Recipe_Session__c where OrgId__c =: orgId and token__c != null and token_secret__c != null and desk_endpoint__c != null order by createddate DESC limit 1];
                    if(rsExistingList != null && rsExistingList.size() > 0){
                        rs.token__c = rsExistingList[0].Token__c;
                        rs.Desk_Endpoint__c = rsExistingList[0].Desk_Endpoint__c;
                        rs.Token_Secret__c = rsExistingList[0].token_secret__c;
                        rs.Desk_Site_Id__c = rsExistingList[0].desk_site_id__c;
                    }
                }
                
                //Get token from TrialSignup based on Org Id
                if(rs.token__c == null || rs.token_secret__c == null){
                    List<Trial_SignUp__c> tsList = [select id, desk_endpoint__c, token__c, token_secret__c, desk_site_id__c from Trial_SignUp__c where created_org_15__c =: orgId and token__c != null and token_secret__c != null order by createddate DESC limit 1];
                    if(tsList != null && tsList.size() > 0){
                        rs.token__c = tsList[0].Token__c;
                        rs.Desk_Endpoint__c = tsList[0].Desk_Endpoint__c;
                        rs.Token_Secret__c = tsList[0].token_secret__c;
                        rs.desk_site_id__c = tsList[0].desk_site_id__c;
                    }
                }
                
                //connect to TMO org to get the desk site and signed up user email
                if(rs.token__c == null || rs.token_secret__c == null){
                    List<Object> signUpList = TMORestClient.queryRecords('select Username, Desk_Site_Id__c, SignupEmail from SignupRequest where CreatedOrgId = \'' + orgId + '\'');            
                    for(Object signUpRecord:signUpList){
                         Map<String,Object> signUpInfo = (Map<String,Object>)signUpRecord;
                         signUpUsername = (String)signUpInfo.get('Username');
                         signupEmail  = (String)signUpInfo.get('SignupEmail');
                         signupDeskSiteId = (String)signUpInfo.get('Desk_Site_Id__c');
                         break;
                    }
                    if (signupDeskSiteId != null && signupEmail != null){
                        List<Trial_SignUp__c> tsList = [select id, desk_endpoint__c, token__c, token_secret__c, desk_site_id__c from Trial_SignUp__c where Email__c =: signupEmail and Desk_Endpoint__c =: signupDeskSiteId and token__c != null and token_secret__c != null order by createddate DESC limit 1];
                        if(tsList != null && tsList.size() > 0){
                            rs.token__c = tsList[0].Token__c;
                            rs.Desk_Endpoint__c = tsList[0].Desk_Endpoint__c;
                            rs.Token_Secret__c = tsList[0].token_secret__c;
                            rs.desk_site_id__c = tsList[0].desk_site_id__c;
                        }
                    }
                }
                
                if(!ToolingClient.createRemoteSiteSetting(Helper.parseEndPoint(instance_url), instance_url, instance_url)){
                    return new PageReference('https://desktosvc.secure.force.com/trial/RecipesError');
                }
                upsert rs;
                
                Recipe_Activity__c rac = new Recipe_Activity__c(Action__c = 'Complete', 
                                                                Feature__c = 'Authentication', 
                                                                Section__c = 'Salesforce',
                                                                Recipe_Session__c = rs.Id);
                insert rac;
                
            }
          }catch(Exception e){
              return new PageReference('https://desktosvc.secure.force.com/trial/RecipesError?message='+e.getMessage());
          }
        return new PageReference('https://desktosvc.secure.force.com/trial/setuprecipes?recordIdentifier='+recordIdentifier);
      }
}