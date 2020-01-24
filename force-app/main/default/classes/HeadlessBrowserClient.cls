public class HeadlessBrowserClient {
    
    private static final String host = 'https://d2svcbrowser.herokuapp.com';
    private String recordIdentifier;
    private String API_URL;
    private String access_token;
    private static HeadlessBrowserClient instance;
    
    private static HeadlessBrowserClient getHeadlessBrowserClient(String recordIdentifier){
        Recipe_Session__c rs = [select salesforce_access_token__c, Salesforce_instance_url__c from recipe_session__c where Record_Identifier_Token__c = :recordIdentifier];
        if(rs!= null){
            instance = new HeadlessBrowserClient();
            instance.API_URL = rs.Salesforce_instance_url__c;
            instance.access_token = rs.Salesforce_Access_Token__c;
        }
        return instance;
    }
    
    private Boolean compareId(String recordIdentifier){
        return this.recordIdentifier == recordIdentifier;
    }


    public static HeadlessBrowserClient getInstance(String recordIdentifier){
        if(instance == null || !instance.compareId(recordIdentifier)) {
            instance = getHeadlessBrowserClient(recordIdentifier);
        }
        return instance;
    }
    
    public void createStandardPicklistValues(String field, List<String> values){
        String jsonString = '{"fieldName": "'+field+'", "values": [';
        for(String value:values){
	        jsonString += '"'+value+'", ';
		}
        jsonString = jsonString.removeEndIgnoreCase(', ');
        jsonString += ']}';
        System.debug('jsonString: '+jsonString);
        HttpResponse res = SimpleHttpClient.post(host + '/StandardPicklist')
            .salesforce(this.API_URL, this.access_token)
            //.salesforce(API_URL, sessionid)
            .body(jsonString)
            .compressed(false)
            .send();
        if(res.getStatusCode() != 200){
            throw new FailedException();
        }       
    }
    
    

}