public class TMORestClient {
    
    
        
        public static List<Object> queryRecords(String query){
            List<Object> records;
            //String query = 'select Username,Desk_Site_Id__c, SignupEmail from SignupRequest where CreatedOrgId = \'' + OrgId + '\''; 
            Http http = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint('callout:TrialOrgAPI/services/data/v43.0/query/?q=' + EncodingUtil.urlencode(query,'UTF-8'));
            req.setMethod('GET');
            //req.setHeader('Content-Type', 'application/json');
            
            HTTPResponse res = http.send(req);
            System.Debug('Response Code: '+res.getStatusCode());
            System.debug('Response Body: '+res.getBody());
            if(res.getStatusCode() == 200){
                Map<String,Object> response = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
                return (List<Object>)response.get('records');
            }else{
                throw new FailedException();
            }
    	}
    
   

}