public class Helper {
    
    private static string client_id = '3MVG9CEn_O3jvv0wj46UeBbZOG54FlWrivruQbVhwcdUteFi9ni0DQWF15a26k497XXAm8p_F.A21wGDNxmLX ';
    private static string client_secret = '7921753268483970843';
    
    public static string getSessionId() {
        System.debug('grant_type=refresh_token&refresh_token='+Label.refresh_token+'&client_id='+client_id+'&client_secret='+client_secret);
        HttpResponse res = SimpleHttpClient.post('https://login.salesforce.com/services/oauth2/token')
            							.header('Content-Type','application/x-www-form-urlencoded')
                                        .body('grant_type=refresh_token&refresh_token='+Label.refresh_token+'&client_id='+client_id+'&client_secret='+client_secret)
                                        .compressed(false)
                                        .send();
        if(res.getStatusCode() == 200){
            	String sessionId = (String)((Map<String,Object>)JSON.deserializeUntyped(res.getBody())).get('access_token');
            	System.debug('Session Id response: '+res.getBody());
            	System.debug('Session Id: '+sessionId);
            	return sessionId;
        }
        
        return null;
    
    
    }
    
    public static string parseEndPoint(String endPoint){
       return 'x'+endPoint.replace('-','_').replace('https://','').replace('.','_').replace('/','_').replace('\\','_').left(40);
    }
    
    public static Boolean validateEmail(String email) {
        Boolean res = true;
        String emailRegex = '^[a-zA-Z0-9._|\\\\%#~`=?&/$^*!}{+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'; // source: <a href="http://www.regular-expressions.info/email.html" target="_blank" rel="nofollow">http://www.regular-expressions.info/email.html</a>
        Pattern MyPattern = Pattern.compile(emailRegex);
        Matcher MyMatcher = MyPattern.matcher(email);
    
        if (!MyMatcher.matches()) 
            res = false;
        return res;	
	}
    
    public static List<Object> getEntriesFromDeskApiResponse(Map<String, Object> responseMap){
        return (List<object>)((Map<String, Object>)responseMap.get('_embedded')).get('entries');
    }
    

}