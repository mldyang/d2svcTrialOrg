public class DeskClient {

    private static DeskClient instance = null;
    private String deskSiteUrl;
    private String consumerKey = Label.Recipe_Desk_ConsumerKey;
    private String consumerSecret = Label.Recipe_Desk_ConsumerSecret;
    private String token;
    private String tokenSecret;
    private String recordIdentifier;

    private DeskClient(){

    }

    private DeskClient(String recordIdentifier){
        this.recordIdentifier = recordIdentifier;
        getdeskConfig(recordIdentifier);
    }
    
    private DeskClient(String deskSiteUrl, String token, String tokenSecret){
        this.deskSiteUrl = deskSiteUrl;
        this.token = token;
        this.tokenSecret = tokenSecret;
    }

    private void getDeskConfig(String recordIdentifier){
        try{
            if (deskSiteUrl == null || consumerKey == null || consumerSecret == null || token == null || tokenSecret == null){
                Recipe_Session__c rs = [SELECT id, Desk_Endpoint__c, token__c, Token_Secret__c FROM Recipe_Session__c WHERE Record_Identifier_Token__c = :recordIdentifier];
                deskSiteUrl = rs.Desk_Endpoint__c;
                token = rs.Token__c;
                tokenSecret = rs.Token_Secret__c;

            }
        }catch(Exception e){
            System.debug('Exception Occured!');
        }

    }

    private Boolean compareConfigId(String recordIdentifier){
        return this.recordIdentifier == recordIdentifier;
    }

    public String getDeskSiteUrl(){
        return deskSiteUrl;
    }

   public static DeskClient getInstance(){
        if(instance == null)
	        instance = new DeskClient();

        return instance;
    }
    
    public static DeskClient getInstance(String deskSiteUrl, String token, String tokenSecret){
        if(instance == null)
	        instance = new DeskClient(deskSiteUrl,token,tokenSecret);

        return instance;
    }

    public static DeskClient getInstance(String recordIdentifier){
        if(instance == null || !instance.compareConfigId(recordIdentifier)) {
            instance = new DeskClient(recordIdentifier);
        }

        return instance;
    }
    
    public String getToken(){
        return token;
	}
    
    public String getTokenSecret(){
        return tokenSecret;
	}
    
    public Map<String, Object> getDeskSiteInfo() {
      String endpoint = deskSiteUrl + '/api/v2/site';
      return getDeskData(endpoint, null);
    }
    
    public Map<String, Object> getInboundEmail() {
      String endpoint = deskSiteUrl + '/api/v2/mailboxes/inbound?page=1&per_page=50';
      return getDeskData(endpoint, null);
    }
    
    public Map<String, Object> getOutboundEmail() {
      String endpoint = deskSiteUrl + '/api/v2/mailboxes/outbound?page=1&per_page=50';
      return getDeskData(endpoint, null);
    }

    
    public Map<String, Object> getCustomFields() {
      String endpoint = deskSiteUrl + '/api/v2/custom_fields?per_page=100';
      return getDeskData(endpoint, null);
    }

    public Map<String, Object> getUsers() {
      String endpoint = deskSiteUrl + '/api/v2/users?per_page=1000&fields=deleted%2Cname%2Cemail%2Cid';
      return getDeskData(endpoint, null);
    }

    public Map<String, Object> getGroups() {
      String endpoint = deskSiteUrl + '/api/v2/groups?per_page=1000&fields=deleted%2Cname%2Cid';
      return getDeskData(endpoint, null);
    }

    public Map<String, Object> getLabels() {
      String endpoint = deskSiteUrl + '/api/v2/labels?per_page=1000&fields=name';
      return getDeskData(endpoint, null);
    }
    
    public Map<String, Object> getFacebookAccounts() {
      String endpoint = deskSiteUrl + '/api/v2/facebook_accounts';
      return getDeskData(endpoint, null);
    }
    
    public Map<String, Object> getTwitterAccounts() {
      String endpoint = deskSiteUrl + '/api/v2/twitter_accounts';
      return getDeskData(endpoint, null);
    }
    
    //mxy 2018-05-09 macros
	public Map<String, Object> getMacros(Integer pageNo) {
        String endpoint;
        if (pageNo != null){
      		 endpoint = deskSiteUrl + '/api/v2/macros?page='+pageNo+'&per_page=10&fields=deleted%2Cname%2Cid%2Cdescription';
        }else{
             endpoint = deskSiteUrl + '/api/v2/macros?per_page=10&fields=deleted%2Cname%2Cid%2Cdescription';
        }
      return getDeskData(endpoint, null);
    }
    public Map<String, Object> getMacroActions(Long macroId) {
      String endpoint = deskSiteUrl + '/api/v2/macros/'+macroId+'actions'+'?per_page=100';
      return getDeskData(endpoint, null);
    }
    
    public Boolean getRequestStatus(Map<String, String> credsMap) {
        consumerKey    = credsMap.get('consumerKey');
        consumerSecret = credsMap.get('consumerSecret');
        token          = credsMap.get('token');
        tokenSecret    = credsMap.get('tokenSecret');
        deskSiteUrl    = credsMap.get('endpoint');

        Integer statusCode;
        HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        req.setEndpoint(deskSiteUrl + '/api/v2/users/me');
        req.setHeader('Accept', 'application/json');
        req = signRequest(req);
        Http client = new Http();
        try {
            HttpResponse response = client.send(req);
            statusCode = response.getStatusCode();
            System.debug('STATUS CODE: ' + statusCode);

        } catch(System.CalloutException e) {
            System.debug('EXCEPTION THROWN: ' + e.getMessage());
        }
        if (statusCode == 200) {
          return true;
        } else {
          return false;
        }
    }

    public Map<String,Object> getDeskData(String endPointUrl, String deskApiHeader){
        HttpResponse res = getDeskResponse(endPointUrl, deskApiHeader);
        Map<String, Object> m = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
        return m;
    }


    public HttpResponse getDeskResponse(String endPointUrl, String deskApiHeader) {
        try{
            Map<String, Object> m = new Map<String, Object>();
            Integer calloutFailureCount = 0;
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endPointUrl);
            req.setMethod('GET');
            req.setHeader('Accept', 'application/json');
            if (deskApiHeader != null)
              req.setHeader('X-DESK-API', deskApiHeader);
            req = signRequest(req);
            Http http = new Http();
            HTTPResponse res;
            do{
                try{
                    res = http.send(req);
                    //System.debug('Res Body: '+res.getBody());
                    calloutFailureCount = 0;
                    req.setTimeout( 10 * 1000);
                } catch(System.CalloutException e) {
                    System.debug('Exception'+e.getMessage());
                    calloutFailureCount++;
                    req.setTimeout( 30 * 1000);

                    if(calloutFailureCount >= 2)
                        throw new System.CalloutException(e.getMessage());

                }
            } while(calloutFailureCount > 0 && calloutFailureCount < 3 );
            
        	return res;
        }catch(Exception e){
             
            throw new System.CalloutException(e.getMessage());
        }


    }



    private HTTPRequest signRequest(HTTPRequest req){
        if (String.isNotBlank(consumerKey) && String.isNotBlank(consumerSecret)
            && String.isNotBlank(token) && String.isNotBlank(tokenSecret))
        {
            Map<String, String> params = new Map<String, String>{
                'oauth_consumer_key' => consumerKey,
                'oauth_nonce' => String.valueOf(Crypto.getRandomLong()),
                'oauth_signature_method' => 'HMAC-SHA1',
                'oauth_timestamp' => String.valueOf(DateTime.now().getTime()/1000),
                'oauth_token' => token,
                'oauth_version' => '1.0'
            };

            String[] host = req.getEndpoint().split('\\?');

            // parse get parameters
            if (host.size() == 2) {
                params.putAll(getParams(host[1]));
            }

            // parse body parameters
            if (req.getBody() != null && req.getBody() != '') {
                params.putAll(getParams(req.getBody()));
            }

            // create the base string
            String baseString = '';
            List<String> keyList = new List<String>(params.keySet());
            keyList.sort();
            for (String key : keyList) {
                baseString += key + '=' + params.get(key) + '&';
            }
            baseString = req.getMethod().toUpperCase() + '&' +
                         EncodingUtil.urlEncode(host[0], 'UTF-8') + '&' +
                         EncodingUtil.urlEncode(baseString.substringBeforeLast('&'), 'UTF-8');

            //System.debug('BASE STRING: ' + baseString);

            // create the signature
            Blob sig = Crypto.generateMac('HmacSHA1', Blob.valueOf(baseString), Blob.valueOf(
                            consumerSecret + '&' + tokenSecret
                       ));
            String signature = EncodingUtil.urlEncode(EncodingUtil.base64encode(sig), 'UTF-8');

            // create the header
            String header = 'OAuth ';
            for (String key : params.keySet()) {
                header += key + '="' + params.get(key) + '", ';
            }
            header += 'oauth_signature="' + signature + '"';

            // sign the request
            req.setHeader('Authorization', header);
        }
        return req;
    }

    private Map<String, String> getParams(String paramString){
        Map<String, String> params = new Map<String, String>();

        if (paramString == null || paramString == '') return params;

        for(String s : paramString.split('&')) {
            String[] sl = s.split('=');
            if (sl.size() == 2) {
                params.put(sl[0], sl[1]);
            }
        }

        return params;
    }

}