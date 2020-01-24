public class DeskOauth {

  private static String consumerKey;
  private static String consumerSecret;
  private static String token;
  private static String tokenSecret;
  private static String verifier;
  private static String endpoint;
  private static String authToken;

  public String callbackUrl { get; set; }

  public static Trial_Signup__c trialSignUpObject;



  
  public String startAuthorization(String trialSignUpId, String endpointParam) {
    endpoint = endPointParam;
    //serviceObject = getServiceSettings();
    System.debug('Pos A.0');  
    //userConfigSettings = getUserConfigSettings(endpoint);
    System.debug('Pos A.1');
    consumerKey = Label.Recipe_Desk_ConsumerKey; //Label.Desk_ConsumerKey;
    consumerSecret = Label.Recipe_Desk_ConsumerSecret; //Label.Desk_ConsumerSecret;
        
		String nonce = string.valueof(dateTime.now().getTime()/1000);
    String timestamp = string.valueof(dateTime.now().getTime()/1000);

 		
    Map<String,String> parameters = new Map<String,String>();
    //parameters.put('oauth_callback', EncodingUtil.urlEncode(URL.getSalesforceBaseUrl().toExternalForm() + '/apex/CompleteAuth?endPoint='+endPoint, 'UTF-8'));
    parameters.put('oauth_callback', EncodingUtil.urlEncode('https://desktosvc.secure.force.com/trial/CompleteAuth?trialSignUpId='+trialSignUpId, 'UTF-8'));
    parameters.put('oauth_consumer_key', consumerKey);
    parameters.put('oauth_nonce', nonce);
    parameters.put('oauth_signature_method', 'HMAC-SHA1');
    parameters.put('oauth_timestamp', timestamp);
    parameters.put('oauth_version', '1.0');
      
      System.debug('URL: '+EncodingUtil.urlEncode('https://desktosvc.secure.force.com/trial/CompleteAuth?trialSignUpId='+trialSignUpId, 'UTF-8'));

    //callbackUrl = EncodingUtil.urlEncode('https://'+ApexPages.currentPage().getHeaders().get('Host')+ Page.CompleteAuth.getUrl(),'UTF-8');
	System.debug('Pos A.3');
    HttpRequest req = new HttpRequest();

      
    HttpResponse res;
      
    req.setEndpoint(endpoint + '/oauth/request_token');
    req.setMethod('POST');   
        		 
    String signature = generateSignature(req, consumerSecret, '', parameters);
		//String body = 'oauth_callback=' + URL.getSalesforceBaseUrl().toExternalForm() + '/apex/CompleteAuth?endPoint='+endPoint + '&';
		String body = 'oauth_callback=' + 'https://desktosvc.secure.force.com/trial/CompleteAuth?trialSignUpId='+trialSignUpId + '&';
		body += 'oauth_consumer_key=' + consumerKey + '&';
		body += 'oauth_nonce=' + nonce + '&';
		body += 'oauth_signature_method=HMAC-SHA1&';
		body += 'oauth_timestamp=' + timestamp + '&';
		body += 'oauth_version=1.0&';
		body += 'oauth_signature=' + signature;
        req.setBody(body);

		String authToken = '';
		
    try {
      System.debug('before call');
      Map<String,String> responseItems = getResponseNVP( req );
      authToken = responseItems.get('oauth_token');
      updateToken(trialSignUpId, responseItems);
      System.debug('authToken: '+authToken);

    } catch(Exception e) {
      System.debug(e.getMessage());  
      return null;  
    }

    String authorizationURL = endpoint + '/oauth/authorize';

    if (authorizationURL.contains('?')) {
      return authorizationURL + '&oauth_token=' + EncodingUtil.urlDecode(authToken,'UTF-8') + '&oauth_consumer_key=' + consumerKey;
		} else {
			return authorizationURL + '?oauth_token=' + EncodingUtil.urlDecode(authToken,'UTF-8') + '&oauth_consumer_key=' + consumerKey;
		}
  }

  public boolean completeAuthorization(String token, String verifier, String trialSignUpId) {
    System.debug('record identifier: '+trialSignUpId);
    endpoint = getEndPoint(trialSignUpId);
      System.debug('endpoint: '+endpoint);
    consumerKey = Label.Recipe_Desk_ConsumerKey; //Label.Desk_ConsumerKey;
    consumerSecret = Label.Recipe_Desk_ConsumerSecret; //Label.Desk_ConsumerSecret;
        
		String nonce = string.valueof(dateTime.now().getTime()/1000);
    String timestamp = string.valueof(dateTime.now().getTime()/1000);
   
    Map<String,String> parameters = new Map<String,String>();
    parameters.put('oauth_consumer_key', consumerKey);
    parameters.put('oauth_nonce', nonce);
    parameters.put('oauth_signature_method', 'HMAC-SHA1');
    parameters.put('oauth_timestamp', timestamp);
    parameters.put('oauth_token', token);
    parameters.put('oauth_verifier', verifier);
    parameters.put('oauth_version', '1.0');
      
    System.debug('Token: '+token);
    System.debug('Verifier: '+verifier);     
    
    Http http = new Http();
    HttpRequest req = new HttpRequest();
         
    req.setEndpoint(endpoint + '/oauth/access_token');
    req.setMethod('POST');   
        		 
    String signature = generateSignature(req, consumerSecret, getTemporaryTokenSecret(trialSignUpId), parameters);
		
		String body = 'oauth_consumer_key=' + consumerKey + '&';
		body += 'oauth_nonce=' + nonce + '&';
		body += 'oauth_signature_method=HMAC-SHA1&';
		body += 'oauth_timestamp=' + timestamp + '&';
		body += 'oauth_version=1.0&';
		body += 'oauth_token=' + token + '&';
		body += 'oauth_verifier=' + verifier + '&';
		body += 'oauth_signature=' + signature;		
        req.setBody(body);

    try {
			Map<String,String> responseItems = getResponseNVP( req );
        
     		 updateFinalToken(trialSignUpId, responseItems);
        	 
	    
	    } catch(Exception e) {
    		System.debug(e.getMessage());        
    	}
    return true;
  }

  public static HttpRequest signRequest(HttpRequest req, String trialSignUpId) {
    //endpoint = getEndPoint(trialSignUpId);
    //userConfigSettings = getUserConfigSettings(endpoint);
    consumerKey = Label.Recipe_Desk_ConsumerKey; //Label.Desk_ConsumerKey;
    consumerSecret = Label.Recipe_Desk_ConsumerSecret; //Label.Desk_ConsumerSecret;

    String nonce     = string.valueof(dateTime.now().getTime()/1000);
    String timestamp = string.valueof(dateTime.now().getTime()/1000);

    Map<String,String> parameters = new Map<String,String>();
    parameters.put('oauth_consumer_key', consumerKey);
    parameters.put('oauth_nonce', nonce);
    parameters.put('oauth_signature_method', 'HMAC-SHA1');
    parameters.put('oauth_timestamp', timestamp);
    parameters.put('oauth_token', EncodingUtil.urlEncode(token, 'UTF-8'));
    parameters.put('oauth_version', '1.0');

    String signature = generateSignature(req, consumerSecret, tokenSecret, parameters);
    String header = generateHeader(signature, parameters);
    req.setHeader('Authorization', header);
    req.setHeader('Accept', 'application/json');

    return req;
    }

  private static String generateHeader(String signature, Map<String,String> parameters) {
    String header = 'OAuth ';
    for (String key : parameters.keySet()) {
        header = header + key + '="'+parameters.get(key)+'", ';
    }
    return header + 'oauth_signature="' + signature + '"';
  }
 
  private static String generateSignature(HttpRequest req, String consumerSecret, String tokenSecret, Map<String,String> parameters) {
        String s 	= createBaseString(req, parameters);        
        String key  = EncodingUtil.urlEncode(consumerSecret, 'UTF-8') + '&' + EncodingUtil.urlEncode(tokenSecret, 'UTF-8');
 
        Blob sig = Crypto.generateMac(
           'HmacSHA1'
          , Blob.valueOf(s)
          , Blob.valueOf(key)
        );
        return EncodingUtil.urlEncode( EncodingUtil.base64encode(sig), 'UTF-8');
    }
 
  private static String createBaseString(HttpRequest req, Map<String,String> parameters) {
      Map<String,String> p = parameters.clone();
      String host = req.getEndpoint();
      Integer n = host.indexOf('?');
      if(n>-1) {
          p.putAll(getUrlParams(host.substring(n+1)));
          host = host.substring(0,n);
      }
      List<String> keys = new List<String>();
      keys.addAll(p.keySet());
      keys.sort();
      String s = keys.get(0)+'='+p.get(keys.get(0));
      for(Integer i=1;i<keys.size();i++) {
          s = s + '&' + keys.get(i)+'='+p.get(keys.get(i));
      }

      return req.getMethod().toUpperCase()+ '&' +
          EncodingUtil.urlEncode(host, 'UTF-8') + '&' +
          EncodingUtil.urlEncode(s, 'UTF-8');
  }

  private static Map<String,String> getUrlParams(String value) {
      Map<String,String> res = new Map<String,String>();
      if(value==null || value=='') {
          return res;
      }
      for(String s : value.split('&')) {
          System.debug('getUrlParams: '+s);
          List<String> kv = s.split('=');
          if(kv.size()>1) {
              System.debug('getUrlParams: -> '+kv[0]+','+kv[1]);
              res.put(kv[0],kv[1]);
          }
      }
      return res;
  }

  private static Map<String,String> getResponseNVP(HttpRequest req){
    Http http = new Http();
    HttpResponse res;

    res = http.send(req); 
    String resParams = res.getBody();
    System.debug('response: '+resParams);  
    Map<String,String> rp = new Map<String,String>();    
    for(String s : resParams.split('&')) {
      List<String> kv = s.split('=');
      rp.put(kv[0],kv[1]);
    } 
    return rp;
  }

  private static String getEndPoint(String trialSignUpId) {
      Trial_SignUp__c ts = [SELECT Id, Desk_Endpoint__c FROM Trial_SignUp__c WHERE record_identifier_token__c =: trialSignUpId];
    //Desk_Migration__c dm = [SELECT Id, Desk_Endpoint__c FROM Desk_Migration__c WHERE createdById =:UserInfo.getUserId() LIMIT 1];
    //return dm.desk_Endpoint__c;
    return ts.Desk_Endpoint__c;
  }

  /*private static Desk_Config__mdt getServiceSettings(){
		if (trialSignUpObject != null)
		{
			return trialSingUpObject;
		}	
		try {
        	serviceObject = [SELECT name, Consumer_Key__c, Consumer_Secret__c FROM Trial_SignUp__c WHERE Active__c = true AND Label = 'D2SVC Configuration'];
		} catch(Exception e) {
    		System.debug(e.getMessage());        
    	}   
    return 	serviceObject;							 
	}*/

  private static String getTemporaryTokenSecret(String trialSignUpId) {

  	String temporaryTokenSecret;
    List<Trial_SignUp__c> ts = [SELECT Id, Temporary_Token_Secret__c FROM Trial_SignUp__c WHERE record_identifier_token__c =: trialSignUpId];
    if (ts != null && ts.size() > 0 )
    	temporaryTokenSecret = ts[0].Temporary_Token_Secret__c;
	System.debug('query done: ');
    return temporaryTokenSecret;
  }
    
    private static void deleteRemoteSiteSetting(String trialSignUpId){
      List<Trial_SignUp__c> tsList = [SELECT Id, desk_endpoint__c FROM Trial_SignUp__c WHERE record_identifier_token__c =: trialSignUpId];
      String deskEndPoint;
 	  if (tsList != null && tsList.size() > 0 ){            
			deskEndPoint = tsList[0].desk_endpoint__c;
      }
      ToolingClient.deleteRemoteSiteSetting(Helper.parseEndPoint(deskEndPoint),null,null);
    }

  public static void updateToken(String trialSignUpId, Map<String, String> credsMap) {
    String tempToken = credsMap.get('oauth_token_secret');
    List<Trial_SignUp__c> ts = [SELECT Id, Temporary_Token_Secret__c FROM Trial_SignUp__c WHERE record_identifier_token__c =: trialSignUpId];
	if (ts != null && ts.size() > 0 )
    	ts[0].Temporary_Token_Secret__c = tempToken;
    else
        ts[0] = new Trial_SignUp__c(
        		record_identifier_token__c = tempToken	
        		);
    upsert ts;
 
  }

  /*public static void updateFinalToken(String trialSignUpId, Map<String, String> credsMap) {
    String token = credsMap.get('oauth_token');
    String secret = credsMap.get('oauth_token_secret');
    

   	Trial_SignUp__c ts = [SELECT Id, Temporary_Token_Secret__c, token__c, token_secret__c FROM Trial_SignUp__c WHERE record_identifier_token__c =: trialSignUpId];
    ts.token__c = token;
    ts.token_secret__c = secret;  

    update ts;
  }*/
    
  public static void updateFinalToken(String trialSignUpId, Map<String, String> credsMap) {
    String token = credsMap.get('oauth_token');
    String secret = credsMap.get('oauth_token_secret');
    
    String deskSiteId = getDeskSiteId(trialSignupId,token,secret);  
	deleteRemoteSiteSetting(trialSignUpId);

    Trial_SignUp__c ts = [SELECT Id,Desk_Site_Id__c, Temporary_Token_Secret__c, token__c, token_secret__c FROM Trial_SignUp__c WHERE record_identifier_token__c =: trialSignUpId];
    ts.token__c = token;
    ts.token_secret__c = secret;
    ts.Desk_Site_Id__c = deskSiteId;
    update ts;
  }
    
  public static String getDeskSiteId(String trialSignUpId, String token, String secret) {
     String deskSiteId;  
     Trial_SignUp__c ts = [SELECT Id, desk_endpoint__c FROM Trial_SignUp__c WHERE record_identifier_token__c =: trialSignUpId];
     DeskClient dc = DeskClient.getInstance(ts.Desk_Endpoint__c, token, secret);
     Map<String, Object> deskDataMap = dc.getDeskSiteInfo();
     System.debug('deskDataMap: '+deskDataMap);
     if(deskDataMap != null && deskDataMap.get('id') != null){
        deskSiteId = String.valueOf((Long)deskDataMap.get('id'));
     }
     return deskSiteId;
  } 
    
}