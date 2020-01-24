public class RecipeOauth {

  private static String consumerKey;
  private static String consumerSecret;
  private static String token;
  private static String tokenSecret;
  private static String verifier;
  private static String endpoint;
  private static String authToken;

  public String callbackUrl { get; set; }

  public static Trial_Signup__c trialSignUpObject;



  
  public String startAuthorization(String recordIdentifier, String endpointParam) {
    endpoint = endPointParam;
    //serviceObject = getServiceSettings();
    System.debug('Pos A.0');  
    //userConfigSettings = getUserConfigSettings(endpoint);
    System.debug('Pos A.1');
    consumerKey = Label.Recipe_Desk_ConsumerKey;
    consumerSecret = Label.Recipe_Desk_ConsumerSecret;
        
	String nonce = string.valueof(dateTime.now().getTime()/1000);
    String timestamp = string.valueof(dateTime.now().getTime()/1000);

 		
    Map<String,String> parameters = new Map<String,String>();
    //parameters.put('oauth_callback', EncodingUtil.urlEncode(URL.getSalesforceBaseUrl().toExternalForm() + '/apex/CompleteAuth?endPoint='+endPoint, 'UTF-8'));
    parameters.put('oauth_callback', EncodingUtil.urlEncode('https://desktosvc.secure.force.com/trial/RecipeCompleteAuth?recordIdentifier='+recordIdentifier, 'UTF-8'));
    parameters.put('oauth_consumer_key', consumerKey);
    parameters.put('oauth_nonce', nonce);
    parameters.put('oauth_signature_method', 'HMAC-SHA1');
    parameters.put('oauth_timestamp', timestamp);
    parameters.put('oauth_version', '1.0');
      
      System.debug('URL: '+EncodingUtil.urlEncode('https://desktosvc.secure.force.com/trial/RecipeCompleteAuth?recordIdentifier='+recordIdentifier, 'UTF-8'));

    //callbackUrl = EncodingUtil.urlEncode('https://'+ApexPages.currentPage().getHeaders().get('Host')+ Page.CompleteAuth.getUrl(),'UTF-8');
	System.debug('Pos A.3');
    HttpRequest req = new HttpRequest();

      
    HttpResponse res;
      
    req.setEndpoint(endpoint + '/oauth/request_token');
    req.setMethod('POST');   
        		 
    String signature = generateSignature(req, consumerSecret, '', parameters);
		//String body = 'oauth_callback=' + URL.getSalesforceBaseUrl().toExternalForm() + '/apex/CompleteAuth?endPoint='+endPoint + '&';
		String body = 'oauth_callback=' + 'https://desktosvc.secure.force.com/trial/RecipeCompleteAuth?recordIdentifier='+recordIdentifier + '&';
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
      updateToken(recordIdentifier, endpoint,responseItems);
      System.debug('authToken: '+authToken);

    } catch(Exception e) {
      System.debug('Exception temp token: ' + e.getMessage());  
      return null;  
    }

    String authorizationURL = endpoint + '/oauth/authorize';

    if (authorizationURL.contains('?')) {
      return authorizationURL + '&oauth_token=' + EncodingUtil.urlDecode(authToken,'UTF-8') + '&oauth_consumer_key=' + consumerKey;
		} else {
			return authorizationURL + '?oauth_token=' + EncodingUtil.urlDecode(authToken,'UTF-8') + '&oauth_consumer_key=' + consumerKey;
		}
  }

  public boolean completeAuthorization(String token, String verifier, String recordIdentifier) {
    System.debug('record identifier: '+recordIdentifier);
    endpoint = getEndPoint(recordIdentifier);
    System.debug('endpoint: '+endpoint);
    consumerKey = Label.Recipe_Desk_ConsumerKey;
    consumerSecret = Label.Recipe_Desk_ConsumerSecret;
        
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
        		 
    String signature = generateSignature(req, consumerSecret, getTemporaryTokenSecret(recordIdentifier), parameters);
		System.debug('in generate Signature');
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
        
        	 //deleteRemoteSiteSetting(recordIdentifier);
     		 updateFinalToken(recordIdentifier, responseItems);
	    
	    } catch(Exception e) {
    		System.debug(e.getMessage());        
    	}
    return true;
  }

  public static HttpRequest signRequest(HttpRequest req, String recordIdentifier) {
    //endpoint = getEndPoint(trialSignUpId);
    //userConfigSettings = getUserConfigSettings(endpoint);
    consumerKey = Label.Recipe_Desk_ConsumerKey;
    consumerSecret = Label.Recipe_Desk_ConsumerSecret;

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

  private static String getEndPoint(String recordIdentifier) {
      Recipe_Session__c rs = [SELECT Id, Desk_Endpoint__c FROM Recipe_Session__c WHERE record_identifier_token__c =: recordIdentifier];
    //Desk_Migration__c dm = [SELECT Id, Desk_Endpoint__c FROM Desk_Migration__c WHERE createdById =:UserInfo.getUserId() LIMIT 1];
    //return dm.desk_Endpoint__c;
    return rs.Desk_Endpoint__c;
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

  private static String getTemporaryTokenSecret(String recordIdentifier) {

  	String temporaryTokenSecret;
    List<recipe_session__c> ts = [SELECT Id, Temporary_Token_Secret__c FROM recipe_session__c WHERE record_identifier_token__c =: recordIdentifier];
    if (ts != null && ts.size() > 0 )
    	temporaryTokenSecret = ts[0].Temporary_Token_Secret__c;
	System.debug('query done: ');
    return temporaryTokenSecret;
  }
    
    private static void deleteRemoteSiteSetting(String recordIdentifier){
      List<Recipe_Session__c> tsList = [SELECT Id, desk_endpoint__c FROM Recipe_Session__c WHERE record_identifier_token__c =: recordIdentifier];
      String deskEndPoint;
 	  if (tsList != null && tsList.size() > 0 ){            
			deskEndPoint = tsList[0].desk_endpoint__c;
      }
      ToolingClient.deleteRemoteSiteSetting(Helper.parseEndPoint(deskEndPoint),null,null);
    }

  public static void updateToken(String recordIdentifier, String endpoint, Map<String, String> credsMap) {
    System.debug('inside update Token ');
    String tempToken = credsMap.get('oauth_token_secret');
      
    List<Recipe_Session__c> rs_existing = [SELECT Id, Temporary_Token_Secret__c, token__c, token_secret__c FROM Recipe_Session__c WHERE record_identifier_token__c =: recordIdentifier];
    if(rs_existing.size() == 0){
      Recipe_Session__c rs = new Recipe_Session__c(
          record_identifier_token__c = recordIdentifier,
          Temporary_Token_Secret__c = tempToken,
          Desk_Endpoint__c = endpoint
      );
      insert rs;
    } else{
       	rs_existing[0].Temporary_Token_Secret__c = tempToken;
        rs_existing[0].Desk_Endpoint__c = endpoint;
        update rs_existing;
    }
 
  }

  public static void updateFinalToken(String recordIdentifier, Map<String, String> credsMap) {
      System.debug('in update Final Token');
    String token = credsMap.get('oauth_token');
    String secret = credsMap.get('oauth_token_secret');
    

   	Recipe_Session__c ts = [SELECT Id, Temporary_Token_Secret__c, token__c, token_secret__c FROM Recipe_Session__c WHERE record_identifier_token__c =: recordIdentifier];

      if(ts == null) System.debug('in update Final Token null ts: ');  else System.debug('in update final token not null: '+ts);
    ts.token__c = token;
    ts.token_secret__c = secret;  

    update ts;
  }
    
}