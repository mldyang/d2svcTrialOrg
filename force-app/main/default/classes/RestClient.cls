public class RestClient {
    public static final String API_URL_TEST = URL.getSalesforceBaseUrl().toExternalForm() + '/services/data/v41.0';
   	public static final String access_token_test = '00Dq0000000CVjK!ARAAQJrn4g0SwBg7fR1EUWEOhz4uTWDgEvFKXYZgQHasv3Y7WbIk9PyVAAzK.PShUDwn5LZyeKP.mj1ToKMQEyyXUsYvzqt6';
    
	private String recordIdentifier;
    private String salesforce_endpoint;
    private String API_URL;
    private String access_token;
    private static RestClient instance;
    private String userId;
    private String orgId;
    
    private RestClient(){
        
    }
    
    private static RestClient getRestClient(String recordIdentifier){
        Recipe_Session__c rs = [select salesforce_access_token__c, Salesforce_instance_url__c, Salesforce_user_id__c, OrgId__c from recipe_session__c where Record_Identifier_Token__c = :recordIdentifier];
        if(rs!= null){
            instance = new RestClient();
            instance.salesforce_endpoint = rs.Salesforce_instance_url__c;
            instance.API_URL = rs.Salesforce_instance_url__c + '/services/data/v43.0';
            instance.access_token = rs.Salesforce_Access_Token__c;
            instance.userId = rs.Salesforce_user_id__c.substringAfterLast('/');
            instance.recordIdentifier = recordIdentifier;
            instance.orgId = rs.OrgId__c;
        }
        return instance;
    }
    
    private static RestClient getRestClient(String salesforce_endpoint, String access_token, String userId, String recordIdentifier){
        instance = new RestClient();
        instance.salesforce_endpoint = salesforce_endpoint;
        instance.API_URL = salesforce_endpoint + '/services/data/v43.0';
        instance.access_token = access_token;
        instance.userId = userId;
        instance.recordIdentifier = recordIdentifier;
        return instance;
    }
    
    private Boolean compareId(String recordIdentifier){
        return this.recordIdentifier == recordIdentifier;
    }


    public static RestClient getInstance(String recordIdentifier){
        if(instance == null || !instance.compareId(recordIdentifier)) {
            instance = getRestClient(recordIdentifier);
        }

        return instance;
    }
    
    public static RestClient getInstance(String salesforce_endpoint, String access_token, String userId, String recordIdentifier){
        if(instance == null || !instance.compareId(recordIdentifier)) {
            instance = getRestClient(salesforce_endpoint, access_token, userId, recordIdentifier);
        }

        return instance;
    }
    
    public String getAccessToken(){
        return access_token;
    }
    
    public String getSalesforceEndpoint(){
        return salesforce_endpoint;
    }
    
    public String getUserId(){
        return userId;
    }
    
    public String getOrgId(){
        return orgId;
    }
    
    public Map<String,Object> getUserInfo(){
        HttpResponse res = SimpleHttpClient.get('https://login.salesforce.com/services/oauth2/userinfo')
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return response;
        }else{
           throw new FailedException();
        }
    }
    
    public Map<String,Object> getUserInfoById(String userId){
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/sobjects/User/'+userId)
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        System.debug('response2: '+res.getBody());
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return response;
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> getOrgWideEmailAddresses(){
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=Select+id,DisplayName,Address,IsAllowAllProfiles,CreatedDate,LastModifiedDate+from+OrgWideEmailAddress')
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> getOrgWideEmailAddressById(String id){
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=Select+id,DisplayName,Address,IsAllowAllProfiles,CreatedDate,LastModifiedDate+from+OrgWideEmailAddress+where+id=\''+id+'\'')
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public Boolean deleteOrgWideEmailAddressById(String id){
        HttpResponse res = SimpleHttpClient.del(this.API_URL +'/sobjects/OrgWideEmailAddress/'+id)
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        if(res.getStatusCode() >= 200 && res.getStatusCode() < 300){
           return true;
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> query(String query){
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q='+ Encodingutil.urlEncode(query, 'UTF-8'))
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public String createOrgWideEmailAddress(String email, String displayName){
        HttpResponse res = SimpleHttpClient.post(this.API_URL +'/sobjects/OrgWideEmailAddress')
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
            .body('{"Address": "'+email+'", "DisplayName": "'+displayName+'", "IsAllowAllProfiles": true}')
                                            .compressed(false)
                                            .send();
		System.debug('Response: '+res.getBody());
        if(res.getStatusCode() == 201){
           	Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
            return (String)response.get('id');
        }else{
            throw new FailedException();
        }
           
    }
    
    public String createDeskMigration(String jsonString){
        HttpResponse res = SimpleHttpClient.post(this.API_URL +'/sobjects/DESKSCMT__Desk_Migration__c')
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
            								.body(jsonString)
                                            .compressed(false)
                                            .send();
		System.debug('Response: '+res.getBody());
        if(res.getStatusCode() == 201){ 
           	Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
            return (String)response.get('id');
        }else{
            throw new FailedException();
        }
           
    }
    
    public List<Object> queryRecords(String query){
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=' + EncodingUtil.urlencode(query,'UTF-8'))
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
         if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
     public List<Object> getUsers(){
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=Select+id,FirstName,LastName,email,username,isactive,profileid+from+User+where+usertype=\'Standard\'')
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
         if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
     public List<Object> getQueues(){
        String queueQuery = 'select id, name, developerName, DoesSendEmailToMembers, Email from Group where Type = \'Queue\'';
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=' + EncodingUtil.urlencode(queueQuery,'UTF-8'))
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
         if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> getQueueType(){
        String query = 'SELECT QueueId,SobjectType FROM QueueSobject';
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=' + EncodingUtil.urlencode(query,'UTF-8'))
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
         if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> getQueueMembers(){
        String query = 'SELECT GroupId,UserOrGroupId FROM GroupMember';
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=' + EncodingUtil.urlencode(query,'UTF-8'))
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
         if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> updateRecords(String jsonString){
        HttpResponse res = SimpleHttpClient.post(this.API_URL +'/composite/sobjects?_HttpMethod=PATCH')
                                            .header('Content-Type','application/json')
                                            .body(jsonString)
                                            .auth('Bearer '+access_token)
                                            .compressed(false)
                                            .send();
        
        if(res.getStatusCode() == 200){
           //System.debug('Response in RestClient: '+res.getBody()); 
           List<Object> response = (List<Object>)JSON.deserializeUntyped(res.getBody());
           return response;
        }else{
           throw new FailedException();
        }
    }
    
    public Map<String,Object> createQueues(String jsonString){
        HttpResponse res = SimpleHttpClient.post(this.API_URL +'/composite/tree/Group')
                                            .header('Content-Type','application/json')
                                            .body(jsonString)
                                            .auth('Bearer '+access_token)
                                            .compressed(false)
                                            .send();
        
        if(res.getStatusCode() == 201 || res.getStatusCode() == 400){
           //System.debug('Response in RestClient: '+res.getBody()); 
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return response;
        }else{
           throw new FailedException();
        }
    }
    
    public Map<String,Object> createQueueType(String jsonString){
        HttpResponse res = SimpleHttpClient.post(this.API_URL +'/composite/tree/QueueSobject')
                                            .header('Content-Type','application/json')
                                            .body(jsonString)
                                            .auth('Bearer '+access_token)
                                            .compressed(false)
                                            .send();
        
        if(res.getStatusCode() == 201 || res.getStatusCode() == 400){
           //System.debug('Response in RestClient: '+res.getBody()); 
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return response;
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> getOrganizationInfo(){
        String query = 'select createdbyid from organization';
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q='+Encodingutil.urlEncode(query, 'UTF-8'))
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> getSystemUser(String Id){
        String query = 'select name, email from user where Id = \''+Id+'\'';
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q='+Encodingutil.urlEncode(query, 'UTF-8'))
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> getEmailTemplate(){
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=Select+id,htmlvalue,subject+from+emailtemplate+where+folder.developername=\'Services_Templates\'+and+developername+=+\'Auto_Response_Email_to_Customer\'')
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> getAllEmailTemplate(){
        String query = 'Select id,developername,htmlvalue,createddate,subject from emailtemplate where folder.developername=\'Services_Templates\' and developername LIKE \'Auto_Response_Email_to_Customer%\'';
        //String query = 'Select id,developername,createddate,subject from emailtemplate where folder.developername=\'Services_Templates\' and developername LIKE \'Auto_Response_Email_to_Customer%\'';
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=' +EncodingUtil.urlencode(query,'UTF-8'))
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> getAllServicesEmailTemplates(){
        String query = 'Select id,developername,htmlvalue,createddate,subject from emailtemplate where folder.developername=\'Services_Templates\'';
        //String query = 'Select id,developername,createddate,subject,type from emailtemplate where folder.developername=\'Services_Templates\' and developername LIKE \'Auto_Response_Email_to_Customer%\'';
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=' +EncodingUtil.urlencode(query,'UTF-8'))
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public List<Object> getUserLicense(){
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=Select+id,Name,TotalLicenses,UsedLicenses+from+UserLicense+where+Name=\'Salesforce\'')
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+access_token)
                                            .compressed(false)
                                            .send();
        
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public String getDebugLog(){
        String debugId;
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=Select+id+from+ApexLog+where+Operation+LIKE+\'%25executeAnonymous%25\'+order+by+SystemModstamp+Desc+Limit+1')
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+access_token)
                                            .compressed(false)
                                            .send();
        System.debug('Response Id: '+res.getBody());
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           List<Object> recordList = (List<Object>)response.get('records');
            if(recordList.size() > 0){
                debugId = (String)((Map<String,Object>)recordList[0]).get('Id');
            }
            System.debug('Id: '+debugId);
            //return recordList;
        }else{
           throw new FailedException();
        }
       
        if(debugId != null && debugId.trim().length() > 0){
            res = SimpleHttpClient.get(this.API_URL +'/sobjects/ApexLog/'+debugId+'/Body/')
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+access_token)
                                            .compressed(false)
                                            .send();
            System.debug('Response Body:'+res.getBody());
            return res.getBody();
        }
        return '';
    }
    
    public List<Object> getUserProfile(){
        HttpResponse res = SimpleHttpClient.get(this.API_URL +'/query/?q=Select+id,Name+from+Profile')
                                            .header('Content-Type','application/json')
                                            .auth('Bearer '+access_token)
                                            .compressed(false)
                                            .send();
        System.debug(res.getBody());
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return (List<Object>)response.get('records');
        }else{
           throw new FailedException();
        }
    }
    
    public Map<String,Object> createUsers(String jsonString){
        HttpResponse res = SimpleHttpClient.post(this.API_URL +'/composite/tree/User')
                                            .header('Content-Type','application/json')
                                            .body(jsonString)
                                            .auth('Bearer '+access_token)
                                            .compressed(false)
                                            .send();
        
        if(res.getStatusCode() == 201 || res.getStatusCode() == 400){
           //System.debug('Response in RestClient: '+res.getBody()); 
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           return response;
        }else{
           throw new FailedException();
        }
    }
    

}