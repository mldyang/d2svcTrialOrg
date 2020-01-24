public class TrialSignUpApexController {
    
    static final String ERROR_TYPE_MANDATORY = 'mandatory';
    static final String ERROR_TYPE_DUPLICATE = 'duplicate';
    static final String ERROR_TYPE_INVALID = 'invalid';
    static final String ERROR_TYPE_UNKNOWN = 'unknown';
    
    public class CustomResult
    {
        @AuraEnabled public Boolean error;
        @AuraEnabled public Boolean success;
        @AuraEnabled public String errorType;
        @AuraEnabled public String errorField;
        @AuraEnabled public String errorMessage;
         public Integer usernameCount;
        
        @AuraEnabled public String successMessage;
        @AuraEnabled public String trialSignUpId;

        public CustomResult()
        {
            this.error = false;
            this.success = false;
            this.errorMessage = '';
            this.usernameCount = 0;
        }
    }
    
    private class UserInput {
        public String lastname { get; set; }
        public String firstname { get; set; }
        public String mydomain { get; set; }
        public String email { get; set; }
        public String company { get; set; }
        public String country { get; set; }
        public String deskSiteId { get; set; }
        public Integer scmt { get; set; }
        public String username  { get; set; }
        public Boolean marketingTerms { get; set; }
    }
    
 
    
    @AuraEnabled
    public static CustomResult signUp(String lastname, 
                                      String firstname, 
                                      String mydomain, 
                                      String email, 
                                      String company, 
                                      String country,
                                      String deskSiteId, 
                                      Integer scmt,
                                      Boolean marketingTerms){
        UserInput ui = new UserInput();
        ui.lastname = lastname;
        ui.firstname = firstname;
        ui.mydomain = mydomain;
        ui.email = email;
        ui.company = company;
        ui.country = country;
        ui.deskSiteId = deskSiteId;
        ui.scmt = scmt; 
        ui.marketingTerms = marketingTerms;
        
        System.Debug('Debug: I got called: '+firstname);
        CustomResult cr = new CustomResult();
        if ( (lastname != null && lastname.trim().length() == 0) ||
           (firstname !=null && firstname.trim().length() == 0) ||
           (email != null && email.trim().length() == 0) ||
            (company != null && company.trim().length() == 0) ||
           (mydomain != null && mydomain.trim().length() == 0))
           {
               cr.error = true;
               cr.errorType = ERROR_TYPE_MANDATORY;
               cr.errorMessage = 'Please fill in mandatory fields';
               return cr; 
            }
        
        
        
        if(!validateEmail(email)){
            cr.error = true;
            cr.errorType = ERROR_TYPE_INVALID;
            cr.errorField = 'email';
            cr.errorMessage = 'Invalid email address (not in a proper email address format)';
            return cr;
        }
        
        String username = email.replace('@','-svc@');
        ui.username = username;
        cr = doPreChecks(cr, ui);
        if(cr.error)
            return cr;
        if (cr.usernameCount > 0)
            username = username.replace('-svc@','-svc'+ cr.usernameCount +'@');
        ui.username = username;
        cr = createTrial(cr, ui);
      
        Integer count = 1;
        while(cr.error && cr.errorfield == 'username' && count <=2 ){
            ui.username = ui.username.replace('-svc'+ cr.usernameCount +'@','-svc'+ (cr.usernameCount+1) +'@');
            cr = createTrial(cr, ui);
            count++;
            cr.usernameCount++;
        }
        
        
        
       /* cr.errorField = 'email';
        cr.errorMessage = 'Invalild email address (not in a proper email address format)';
        cr.errorType = ERROR_TYPE_UNKNOWN;
        cr.error = true;
       System.debug('CR: '+cr);*/
       return cr;
        
    }
    
    public static CustomResult createTrial(CustomResult cr, UserInput ui) {
        try{
        JSONGenerator gen = JSON.createGenerator(true);    
        gen.writeStartObject();
        System.debug('Starting to write json create trial: '+
                    'lastname: '+ui.lastname + ', ' + 
                    'firstname: '+ui.firstname + ', ' + 
                    'username: '+ui.username + ', ' + 
                    'signupemail: '+ui.email + ', ' + 
                    'company: '+ui.company + ', ' + 
                    'Desk_Site_Id__c: '+ui.deskSiteId + ', ' + 
                     'mydomain: '+ ui.mydomain + ', ' + 
                     'scmt: '+ ui.scmt
                    );
        gen.writeStringField('LastName',ui.lastname.trim());
        gen.writeStringField('FirstName', ui.firstname.trim());
        gen.writeStringField('Username',ui.username.trim());
        gen.writeStringField('SignupEmail',ui.email.trim());
        gen.writeStringField('Company',ui.company.trim());        
        gen.writeStringField('Country',ui.country);
        gen.writeStringField('Desk_Site_Id__c',ui.deskSiteId.trim());
        gen.writeNumberField('TrialDays',90);
        gen.writeBooleanField('Marketing_Terms__c',ui.marketingTerms);    
        
        String templateId = Label.TrialTemplateId;
        
        if(ui.mydomain.trim().length()> 0)
            gen.writeStringField('Subdomain',ui.mydomain);            
            
        if (Integer.valueof(ui.scmt) == 1)
            gen.writeStringField('TemplateId', '0TT1I000005zUPT');  // not used after Mar 13
        else
            gen.writeStringField('TemplateId', templateId);  
            
        gen.writeEndObject();    
        String jsonS = gen.getAsString();
        System.debug('json: '+jsonS);
        cr.successMessage = jsonS;
        
        System.debug('Before http callout in create trial');        
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:TrialOrgAPI/services/data/v40.0/sobjects/SignupRequest/');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(jsonS);
        
        HTTPResponse res = http.send(req);
        System.Debug('Response Code: '+res.getStatusCode());
        System.Debug('Response Body: '+res.getBody());
        if (res.getStatusCode() == 201){
            System.debug('Response Success: '+res.getBody());
            Map<String, Object> m = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
            if((Boolean)m.get('success')){
                cr = doPostCheck((String)m.get('id'),cr,ui);
                Integer count = 1;
                while(!cr.success && !cr.error && count <=5 ){
                    cr = doPostCheck((String)m.get('id'),cr,ui);
                    count++;
                }
                if(!cr.success && !cr.error){
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_UNKNOWN;
                    createErrorRecord(ui, 'After Post', 0, 'NA' );
                }
            }
        } else if (res.getStatusCode() == 400){ 
            List<Object> l = (List<Object>)JSON.deserializeUntyped(res.getBody());
            System.Debug('List<object>: '+l);
            //Map<String, Object> m = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
            if(l != null && l.size() > 0 ){
                Map<String, Object> m = (Map<String, Object>)l[0];
                if (m.get('errorCode') == 'SUBDOMAIN_IN_USE'){
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_DUPLICATE;
                    cr.errorField='mydomain';
                    cr.errorMessage='This My Domain is already in use. Please enter another My Domain.';       
                }
                else if (m.get('errorCode') == 'INVALID_SUBDOMAIN'){
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_INVALID;
                    cr.errorField='mydomain';
                    cr.errorMessage='This My Domain is not allowed. Please enter another My Domain.';       
                }
                else {
                    System.debug('Response Error: '+res.getBody());
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_UNKNOWN;
                }
            }else{
                System.debug('Response Error: '+res.getBody());
                cr.error = true;    
                cr.errorType = ERROR_TYPE_UNKNOWN;
            }
        } else {
            System.debug('Response Error: '+res.getBody());
            cr.error = true;
            cr.errorType = ERROR_TYPE_UNKNOWN;
        }
        
        if(cr.errortype == ERROR_TYPE_UNKNOWN ){
             createErrorRecord(ui, 'Create', res.getStatusCode(), res.getBody() );
        }
        
        Return cr;
        //Return('Being processed, please check the email/logs');
        } catch(Exception e){
            System.debug('Exception: ' + e.getMessage() + '\n' + e.getStackTraceString());
        }
        return null;
    }
    
    public static Boolean validateEmail(String email) {
        Boolean res = true;
        String emailRegex = '^[a-zA-Z0-9._|\\\\%#~`=?&/$^*!}{+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,5}$'; // source: <a href="http://www.regular-expressions.info/email.html" target="_blank" rel="nofollow">http://www.regular-expressions.info/email.html</a>
        Pattern MyPattern = Pattern.compile(emailRegex);
        Matcher MyMatcher = MyPattern.matcher(email);
    
        if (!MyMatcher.matches()) 
            res = false;
        return res; 
    }
    
    
    public static customResult doPostCheck(String signUpRequestId, CustomResult cr, UserInput ui){

        Http http = new Http();
        HttpRequest postReq = new HttpRequest();
        String endpoint = 'callout:TrialOrgAPI/services/data/v40.0/sobjects/SignupRequest/'+signUpRequestId;
        postReq.setEndpoint(endpoint);    
        postReq.setMethod('GET');
        HTTPResponse postRes = http.send(postReq);
        
        System.Debug('PostRes: '+postRes.getBody());
        
        if (postRes.getStatusCode() == 200){
            Map<String, Object> m = (Map<String, Object>)JSON.deserializeUntyped(postRes.getBody());
            if(m.get('CreatedOrgId') != null){
                cr.successMessage = 'New Trial Created Successfully';
                cr.success = true;
            }else if (m.get('ErrorCode') != null){
                if (m.get('ErrorCode') == 'C-1007'){
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_DUPLICATE;
                    cr.errorField='username';
                    cr.errorMessage='This Username is already in use. Please choose another username.';
                }
                else if (m.get('ErrorCode') == 'C-9999'){
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_UNKNOWN;
                    cr.errorField='';
                    cr.errorMessage='Unknown error.';
                }
                else if (m.get('ErrorCode') == 'S-1006'){
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_INVALID;
                    cr.errorField='email';
                    cr.errorMessage='Invalid email address (not in a proper email address format)';       
                }
                else if (m.get('ErrorCode') == 'S-2006'){
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_INVALID;
                    cr.errorField='country';
                    cr.errorMessage='Invalild country code';       
                }
                else if (m.get('ErrorCode') == 'C-1018' || m.get('ErrorCode') == 'INVALID_SUBDOMAIN' ){
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_INVALID;
                    cr.errorField='mydomain';
                    cr.errorMessage='Invalid My Domain. Enter a valid My Domain';       
                }
                else if (m.get('ErrorCode') == 'C-1019' || m.get('ErrorCode') == 'SUBDOMAIN_IN_USE'){
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_DUPLICATE;
                    cr.errorField='mydomain';
                    cr.errorMessage='This My Domain is already in use. Please enter another My Domain.';       
                }                
                else if (m.get('ErrorCode') == 'C-1015'){
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_UNKNOWN;
                    cr.errorField='mydomain';
                    cr.errorMessage='Error while establishing the new org’s My Domain (subdomain) settings. Contact Salesforce support for assistance.';       
                }
                else {
                    cr.error = true;
                    cr.errorType = ERROR_TYPE_UNKNOWN;
                }   
            } else {
                cr.error = true;
                cr.errorType = ERROR_TYPE_UNKNOWN;
            }            
        }
        else {
            cr.error = true;
            cr.errorType = ERROR_TYPE_UNKNOWN;
        }
        
        if(cr.errortype == ERROR_TYPE_UNKNOWN ){
             createErrorRecord(ui, 'Post', postRes.getStatusCode(), postRes.getBody() );
        }
        return cr;
    }
    
    public static customResult doPreChecks(CustomResult customResult,  UserInput ui){    
        Http http = new Http();
        HttpRequest preReq = new HttpRequest();
        String endpoint = 'callout:TrialOrgAPI/services/apexrest/SignupHelper?Username='+EncodingUtil.urlEncode(ui.username, 'UTF-8')+'&Subdomain='+ui.mydomain;
        preReq.setEndpoint(endpoint);    
        preReq.setMethod('GET');
        HTTPResponse preRes = http.send(preReq);
        
        System.Debug('PreResponse Status: '+preRes.getStatus());
        System.Debug('PreResponse: '+preRes.getBody());
        //Map<String, Object> m = (Map<String, Object>)((List<object>)JSON.deserializeUntyped(preRes.getBody()))[0];
       
        if (preRes.getStatusCode() == 200){
            Map<String, Object> m = (Map<String, Object>)JSON.deserializeUntyped(preRes.getBody());
            if((Boolean)m.get('Username')){
              /*customResult.error = true;
              customResult.errorType= ERROR_TYPE_DUPLICATE;
              customResult.errorField='username';
              customResult.errorMessage='This Username is already in use. Please choose another username.';*/
              customResult.usernameCount = (Integer)m.get('UsernameCount');
              return customResult;
            }
            if((Boolean)m.get('Subdomain')){
              customResult.error = true;
              customResult.errorType = ERROR_TYPE_DUPLICATE;
              customResult.errorField='subdomain';
              customResult.errorMessage='This My Domain is already in use. Please enter another My Domain.';
            }
        }else{
            customResult.error = true;
            customResult.errorType = ERROR_TYPE_UNKNOWN;
        }
        
        if(customResult.errortype == ERROR_TYPE_UNKNOWN ){
             createErrorRecord(ui, 'Pre', preRes.getStatusCode(), preRes.getBody() );
        }
        
        return customResult;
    }
    
    private static void createErrorRecord(Userinput ui, String stage, Integer responseStatusCode, String responseBody){
        Trial_Error__c te = new Trial_Error__c(
                              first_name__c = ui.firstname,
                              last_name__c = ui.lastname,
                              email__c = ui.email,
                              company__c = ui.company,
                              mydomain__c = ui.mydomain,
                              desk_site_id__c = ui.desksiteid,
                              stage__c = stage,
                              Response_Status_Code__c = responseStatusCode,
                              response_body__c = responseBody,
                              username__c = ui.username,
                              marketing_terms__c = ui.marketingTerms,
                              country__c = ui.country
                            );
        insert te;
        
    }
    
    @AuraEnabled
    public static Boolean checkDeskConfigAuthorization(String trialSignUpId) {
        
      Boolean authorized;
        try{
          Trial_SignUp__c ts = [SELECT Id, token__c, token_secret__c FROM Trial_SignUp__c WHERE record_identifier_token__c =: trialSignUpId];
          if(ts.token__c != null && ts.token_secret__c != null &&
            ts.token__c.trim().length() > 0 && ts.token_secret__c.trim().length() > 0)
             authorized = true;
          else
             authorized = false;
        }catch (Exception e){
            
        }
      return authorized;
    }
    
    @AuraEnabled
    public static CustomResult createTrialSignUpRecord(String lastname, 
                                                 String firstname, 
                                                 String mydomain, 
                                                 String email, 
                                                 String company, 
                                                 String countrycode,
                                                 String deskendpoint,
                                                 String recordidentifiertoken,
                                                 Integer scmt,
                                                 Boolean marketingTerms) {
                                                 
          CustomResult cr = new CustomResult();
        if ( (lastname != null && lastname.trim().length() == 0) ||
           (firstname !=null && firstname.trim().length() == 0) ||
           (email != null && email.trim().length() == 0) ||
            (company != null && company.trim().length() == 0) ||
           (mydomain != null && mydomain.trim().length() == 0))
           {
               cr.error = true;
               cr.errorType = ERROR_TYPE_MANDATORY;
               cr.errorMessage = 'Please fill in mandatory fields';
               return cr; 
            }
        
        
        
        if(!validateEmail(email)){
            cr.error = true;
            cr.errorType = ERROR_TYPE_INVALID;
            cr.errorField = 'email';
            cr.errorMessage = 'Invalild email address (not in a proper email address format)';
            return cr;
        }   
       Trial_Signup__c ts;                                              
         
        List<Trial_SignUp__c> tsList = [SELECT Id, Temporary_Token_Secret__c FROM Trial_SignUp__c WHERE record_identifier_token__c =: recordidentifiertoken];
        if (tsList != null && tsList.size() > 0 ){
            ts = tsList[0];
            ts.first_name__c = firstname;
            ts.last_name__c = lastname;
            ts.mydomain__c = mydomain;
            ts.email__c = email;
            ts.company__c = company;
            ts.country_code__c = countrycode;
            ts.desk_endpoint__c = deskendpoint;
            ts.Marketing_Terms__c = marketingTerms;
        }
         else {
                                                     
            ts = new Trial_SignUp__c(
                            first_name__c = firstname,
                            last_name__c = lastname,
                            mydomain__c = mydomain,
                            email__c = email,
                            company__c = company,
                            country_code__c = countrycode,
                            record_identifier_token__c = recordidentifiertoken,
                            desk_endpoint__c = deskendpoint);
         }
                                                     
        upsert ts;
        cr.success = true;
        cr.trialSignUpId = ts.id;

        return cr;

    }
    
    @AuraEnabled
    public static Boolean checkIfVCAllowedApex(String recordidentifiertoken){
        
        String deskSiteId;
        String AOVBand;
        List<Trial_SignUp__c> tsList = [select id, Desk_Endpoint__c, created_Org__c, Desk_Site_Id__c from Trial_Signup__c where 
                                        Record_Identifier_Token__c = :recordidentifiertoken
                                        limit 1];
        if(tsList != null && tsList.size() > 0){
             deskSiteId = tsList[0].Desk_Site_Id__c;
        }
        
        
        if (deskSiteId != null){
            
             List<Desk_Customer_Data__c> dcdl = [select AOV_Band__c from Desk_Customer_Data__c where Desk_Site_Id__c = :deskSiteId limit 1];   
             if(dcdl != null && dcdl.size() > 0){
                 AOVBand = dcdl[0].AOV_Band__c;
             }
             if(AOVBand != null){   
                if(AOVBand.contains('A:')){
                    AOVBand = 'A';
                }else if (AOVBand.contains('B:')){
                    AOVBand = 'B';
                }else if (AOVBand.contains('C:')){
                    AOVBand = 'C';
                }else if (AOVBand.contains('D:')){
                    AOVBand = 'D';
                }else if (AOVBand.contains('E:')){
                    AOVBand = 'E';
                }
                 
                 DateTime currentTime = System.now();
                 Date currDate = currentTime.date();
                 Time currTime = currentTime.time();
                 Datetime local = datetime.newinstance(currDate,currTime);   
                    
                 List<Recipe_Allow_List__c> rall = [select id from Recipe_Allow_List__c where
                                                   start_datetime__c <= :local and (end_datetime__c > :local or end_datetime__c = null) and Allowed_AOV_Bands__c includes (:AOVBand) and Block__c = false];
                
                if(rall != null && rall.size() > 0 ){
                     return true;
                }
             }
        }
        
     	return false;
	}

}