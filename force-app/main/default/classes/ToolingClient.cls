public class ToolingClient {
    
    //private static final string host = 'https://scmt.herokuapp.com';
    private static final string host = 'https://desk2svc-recipe.herokuapp.com';
    private static final String API_URL = 'https://desktoservice.my.salesforce.com/services/Soap/u/41.0/' + UserInfo.getOrganizationId();
	public static final String TOOLING_URL = URL.getSalesforceBaseUrl().toExternalForm() + '/services/data/v41.0/tooling';
    
    private String recordIdentifier;
    private String salesforce_endpoint;
    private String TOOLING_URL_CUST;
    private String access_token;
    private static ToolingClient instance;
    private String userId;
    
    private ToolingClient(){
        
    }
    
    private static ToolingClient getToolingClient(String recordIdentifier){
        Recipe_Session__c rs = [select salesforce_access_token__c, Salesforce_instance_url__c, Salesforce_user_id__c from recipe_session__c where Record_Identifier_Token__c = :recordIdentifier];
        if(rs!= null){
            instance = new ToolingClient();
            instance.salesforce_endpoint = rs.Salesforce_instance_url__c;
            instance.TOOLING_URL_CUST = rs.Salesforce_instance_url__c + '/services/data/v42.0/tooling';
            instance.access_token = rs.Salesforce_Access_Token__c;
            instance.userId = rs.Salesforce_user_id__c.substringAfterLast('/');
        }
        return instance;
    }
    
    private Boolean compareId(String recordIdentifier){
        return this.recordIdentifier == recordIdentifier;
    }


    public static ToolingClient getInstance(String recordIdentifier){
        if(instance == null || !instance.compareId(recordIdentifier)) {
            instance = getToolingClient(recordIdentifier);
        }

        return instance;
    }
    
    public String getAccessToken(){
        return access_token;
    }
    
    public String getSalesforceEndpoint(){
        return salesforce_endpoint;
    }

    /**
   * Sends an HTTP request to the Java Endpoint (https://scmt.herokuapp.com) to create a Remote Site Setting.
   * @param String fullName The qualified API name for the remote site setting
   * @param String url The full url for the remote site setting (https://domain.desk.com)
   * @param String description A description for the remote site setting
   * @return Boolean
   */
  public static Boolean createRemoteSiteSetting(String fullName, String url, String description) {
    try {
        
      System.debug('RemoteSiteSetting Before: '+ '{"fullName":"' + fullName + '","url":"' + url + '","description":"' + description + '"}');  
        
      HttpResponse res = SimpleHttpClient.post(host + '/meta/remotesite')
                                        .salesforce(API_URL, Helper.getSessionId())
                                        .body('{"fullName":"' + fullName + '","url":"' + url + '","description":"' + description + '"}')
                                        .compressed(false)
                                        .send();
        System.debug('RemoteSiteSetting Res: '+res.getBody());
        if (res.getStatusCode() >= 200 && res.getStatusCode() < 300){
            
        	return true;
        }
    } catch (System.CalloutException ex) {
      if (ex.getMessage().contains('ZLIB')) return true;
    }

    return false;
  }
    
    public static Boolean deleteRemoteSiteSetting(String fullName, String url, String description) {
    try {
      HttpResponse res = SimpleHttpClient.del(host + '/meta/remotesite')
                                        .salesforce(API_URL, Helper.getSessionId())
                                        .body('{"fullName":"' + fullName + '","url":"' + url + '","description":"' + description + '"}')
                                        .compressed(false)
                                        .send();
        System.debug('RemoteSiteSetting Res: '+res.getBody());
        if (res.getStatusCode() >= 200 && res.getStatusCode() < 300){
            
        	return true;
        }
    } catch (System.CalloutException ex) {
      if (ex.getMessage().contains('ZLIB')) return true;
    }

    return false;
  }
    
    public String getDebugLevel(){
		String debugLevelId;
		String toExec = 'Select id, developerName from DebugLevel';
		HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        req.setEndpoint(TOOLING_URL_CUST + '/query/?q='+Encodingutil.urlEncode(toExec, 'UTF-8'));
        req.setHeader('Authorization', 'Bearer ' + this.access_token);
        Http client = new Http();
        HttpResponse res = client.send(req);		

        
		/*HttpResponse res = SimpleHttpClient.get(TOOLING_URL_CUST +'/query/?q=Select id, developerName from DebugLevel')
                                            //.header('Content-Type','application/json')
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();*/
        System.debug('Response: '+res.getBody());
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           List<Object> recordList = (List<Object>)response.get('records');
            if(recordList.size() > 0){
                debugLevelId = (String)((Map<String,Object>)recordList[0]).get('Id');
            }
        }else{
           throw new FailedException();
        }
       return debugLevelId;
    
    }
    
    public String getStandardPicklistValues(String fieldMasterLabel){
		String debugLevelId;
		String toExec = 'SELECT id,durableid,metadata,fullname,masterlabel FROM StandardValueSet where masterlabel=\''+fieldMasterLabel+'\'';
		HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        req.setEndpoint(TOOLING_URL_CUST + '/query/?q='+Encodingutil.urlEncode(toExec, 'UTF-8'));
        req.setHeader('Authorization', 'Bearer ' + this.access_token);
        Http client = new Http();
        HttpResponse res = client.send(req);		

        System.debug('Response: '+res.getBody());
        if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           List<Object> recordList = (List<Object>)response.get('records');
            if(recordList.size() > 0){
                debugLevelId = (String)((Map<String,Object>)recordList[0]).get('Id');
            }
        }else{
           throw new FailedException();
        }
       return res.getBody();
    
    }
    
    public String setTrace(){
        String traceId;

        String body = '{ "ApexCode": "Finest", "ApexProfiling": "Error", "Callout": "Error", "Database": "Error", "StartDate": "'+  Datetime.now().formatGMT('yyyy-MM-dd HH:mm:ss').replace(' ','T') +'", "ExpirationDate": "' + Datetime.now().addMinutes(5).formatGMT('yyyy-MM-dd HH:mm:ss').replace(' ','T') +'", "TracedEntityId": "' + this.userId +'", "Validation": "Error", "Visualforce": "Error", "Workflow": "Error", "System": "Error", "DebugLevelId": "' + getDebugLevel() +'", "LogType": "USER_DEBUG" }';
        System.debug('body: '+body);
         HttpResponse resu = SimpleHttpClient.post(TOOLING_URL_CUST + '/sobjects/traceFlag')
             								.body(body)
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        if(resu.getStatusCode()==201){
        	traceId = (String)((Map<String,Object>)JSON.deserializeuntyped(resu.getBody())).get('id');
            System.debug('Id:'+traceId);
		}
        
            System.debug('test Res: '+resu.getBody());
        	System.debug('test Status: '+resu.getStatusCode());
        return traceId;
    }
    
    public String delTrace(String traceId){

         HttpResponse resu = SimpleHttpClient.del(TOOLING_URL_CUST + '/sobjects/traceFlag/'+traceId)
                                            .auth('Bearer '+this.access_token)
                                            .compressed(false)
                                            .send();
        
            System.debug('test delRes: '+resu.getBody());
        	System.debug('test delStatus: '+resu.getStatusCode());
        return traceId;
    }
    
   
    
    public Map<String,Object> executeAnonymous(String toExec) {
    try {
        
        String traceId = setTrace();
        HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        req.setEndpoint(TOOLING_URL_CUST + '/executeAnonymous/?anonymousBody='+Encodingutil.urlEncode(toExec, 'UTF-8'));
        req.setHeader('Authorization', 'Bearer ' + this.access_token);
        Http client = new Http();
        HttpResponse res = client.send(req);
        delTrace(traceId);
        //System.debug('Response Status: '+res.getStatusCode());
        System.debug('Response Body: '+res.getBody());
        /*for(String key:res.getHeaderKeys()){
            System.debug('Header '+key+': '+res.getHeader(key));
        }*/
        return (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
        
            
    } catch (System.CalloutException ex) {
     	System.debug('Exception: '+ex.getMessage());
    }
	return null;
  }
    
    
  public String query(String query){

		HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        req.setEndpoint(TOOLING_URL_CUST + '/query/?q='+Encodingutil.urlEncode(query, 'UTF-8'));
        req.setHeader('Authorization', 'Bearer ' + this.access_token);
        Http client = new Http();
        HttpResponse res = client.send(req);		

        System.debug('Response: '+res.getBody());
        /*if(res.getStatusCode() == 200){
           Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
           List<Object> recordList = (List<Object>)response.get('records');
            if(recordList.size() > 0){
                debugLevelId = (String)((Map<String,Object>)recordList[0]).get('Id');
            }
        }else{
           throw new FailedException();
        }*/
       return res.getBody();
    
    }  
    
  /**
   * Loads the SessionId visualforce page and grabs the Api Session Id.
   * @return String
   */
  public static String getSessionId() {
      String jString = '';

      if (Test.IsRunningTest()) {
          jString = '{"sessionId":""}';
      } else {
          jString = Page.SessionId.getContent().toString();
      }

      Map<String, Object> m = (Map<String, Object>) JSON.deserializeUntyped(jString);
      return (String) m.get('sessionId');
  }
}