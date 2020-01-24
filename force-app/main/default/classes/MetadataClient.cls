public class MetadataClient {
    
    private static final String host = 'https://desk2svc-recipe.herokuapp.com';
    //private static final String API_URL = URL.getSalesforceBaseUrl().toExternalForm() + '/services/Soap/u/41.0/' + UserInfo.getOrganizationId();
    ////private static final String API_URL = 'https://trial30.my.salesforce.com' + '/services/Soap/u/41.0/' + '00D1N000002qgzG';
    //private static final String sessionid = '00D1N000002qgzG!AQ0AQGkptSUfgxqAirbJCz.LamDnBPXZZ6ZiXjPrytCh.RFpYRbG.FUQ83I95dChOf5TiAfj_siA43ZQBn4tizHLD3bOBXmP';

    
    private String recordIdentifier;
    private String API_URL;
    private String access_token;
    private static MetadataClient instance;
    
    private MetadataClient(){
        
    }
    
    private static MetadataClient getMetadataClient(String recordIdentifier){
        Recipe_Session__c rs = [select salesforce_access_token__c, Salesforce_instance_url__c from recipe_session__c where Record_Identifier_Token__c = :recordIdentifier];
        if(rs!= null){
            instance = new MetadataClient();
            instance.API_URL = rs.Salesforce_instance_url__c + '/services/Soap/u/41.0/' + rs.Salesforce_Access_Token__c.left(15);
            instance.access_token = rs.Salesforce_Access_Token__c;
        }
        return instance;
    }
    
    private Boolean compareId(String recordIdentifier){
        return this.recordIdentifier == recordIdentifier;
    }


    public static MetadataClient getInstance(String recordIdentifier){
        if(instance == null || !instance.compareId(recordIdentifier)) {
            instance = getMetadataClient(recordIdentifier);
        }

        return instance;
    }
        
        public String createEmailToCase (List<EmailData> edList){
            
            String jsonString = json.serialize(edList);
            System.debug('jsonString: '+jsonString);
            HttpResponse res = SimpleHttpClient.post(host + '/meta/emailtocase')
                                       .salesforce(this.API_URL, this.access_token)
                                       //.salesforce(API_URL, sessionid)
                                       .body(jsonString)
                                       .compressed(false)
                                       .send();
            if(res.getStatusCode() == 401){
                throw new UnauthorizedException();
            }else if(res.getStatusCode() == 200){
                throw new FailedException();
            }
            return res.getBody();
        }
    
    public String updateEmailToCase (List<EmailData> edList){
            
            String jsonString = json.serialize(edList);
            System.debug('jsonString: '+jsonString);
            HttpResponse res = SimpleHttpClient.put(host + '/meta/emailtocase')
                                       .salesforce(this.API_URL, this.access_token)
                                       //.salesforce(API_URL, sessionid)
                                       .body(jsonString)
                                       .compressed(false)
                                       .send();
            if(res.getStatusCode() == 401){
                throw new UnauthorizedException();
            }else if(res.getStatusCode() == 200){
                throw new FailedException();
            }
            return res.getBody();
        }
    
    public String getEmailToCase (){

            HttpResponse res = SimpleHttpClient.get(host + '/meta/emailtocase')
                                       .salesforce(this.API_URL, this.access_token)
                                       //.salesforce(API_URL, sessionId)
                                       .compressed(false)
                                       .send();
        if(res.getStatusCode() == 401){
            throw new UnauthorizedException();
        }else if(res.getStatusCode() == 200){
            throw new FailedException();
        }
            
        return res.getBody();
        
        }
    
    public String createCaseAutoResponse (CaseAutoResponseRuleDAO caseAutoResponseRule){
        	
        
        	String jsonString = json.serialize(caseAutoResponseRule);
            System.debug('jsonString: '+jsonString);
            HttpResponse res = SimpleHttpClient.post(host + '/meta/caseautoresponse')
                                       .salesforce(this.API_URL, this.access_token)
                                       //.salesforce(API_URL, sessionid)
                                       .body(jsonString)
                                       .compressed(false)
                                       .send();
            if(res.getStatusCode() == 401){
                throw new UnauthorizedException();
            }else if(res.getStatusCode() == 200){
                throw new FailedException();
            }
            return res.getBody();
   	}
    
    public List<CaseAutoResponseRuleDAO> getCaseAutoResponseRule (){
       
        HttpResponse res = SimpleHttpClient.get(host + '/meta/caseautoresponse')
           .salesforce(this.API_URL, this.access_token)
            //.salesforce(API_URL, sessionid)
            //.body(jsonString)
            .compressed(false)
            .send();
        if(res.getStatusCode() == 401){
            throw new UnauthorizedException();
        }else if(res.getStatusCode() == 200){
            throw new FailedException();
        }
        List<CaseAutoResponseRuleDAO> carrd = (List<CaseAutoResponseRuleDAO>)JSON.deserialize(res.getBody(), List<CaseAutoResponseRuleDAO>.class);
        return carrd;    
        //System.debug(res.getBody());
   	}
    
    public List<AssignmentRuleDAO> getAssignmentRule (){
       
        HttpResponse res = SimpleHttpClient.get(host + '/meta/assignmentrule')
           .salesforce(this.API_URL, this.access_token)
            //.salesforce(API_URL, sessionid)
            //.body(jsonString)
            .compressed(false)
            .send();
        if(res.getStatusCode() == 401){
            throw new UnauthorizedException();
        }else if(res.getStatusCode() == 200){
            throw new FailedException();
        }
        List<AssignmentRuleDAO> carrd = (List<AssignmentRuleDAO>)JSON.deserialize(res.getBody(), List<AssignmentRuleDAO>.class);
        return carrd;    
        //System.debug(res.getBody());
   	}
    
    public String createAssignmentRule (AssignmentRuleDAO assignmentRule){
        	
        	System.debug('inside MC');
        	String jsonString = json.serialize(assignmentRule);
            System.debug('jsonString: '+jsonString);
            HttpResponse res = SimpleHttpClient.post(host + '/meta/assignmentrule')
                                       .salesforce(this.API_URL, this.access_token)
                                       //.salesforce(API_URL, sessionid)
                                       .body(jsonString)
                                       .compressed(false)
                                       .send();
            if(res.getStatusCode() == 401){
                throw new UnauthorizedException();
            }else if(res.getStatusCode() == 200){
                throw new FailedException();
            }
            return res.getBody();
   	}
    
    public String createEmailTemplates (List<EmailTemplateDAO> emailTemplates){
        	String jsonString = json.serialize(emailTemplates);
        	jsonString = jsonString.replace('"typeString"','"type"');
            System.debug('jsonString: '+jsonString);
            HttpResponse res = SimpleHttpClient.post(host + '/meta/emailtemplate')
                                       .salesforce(this.API_URL, this.access_token)
                                       //.salesforce(API_URL, sessionid)
                                       .body(jsonString)
                                       .compressed(false)
                                       .send();
            if(res.getStatusCode() == 401){
                throw new UnauthorizedException();
            }else if(res.getStatusCode() == 200){
                throw new FailedException();
            }
            return res.getBody();
   	}

}