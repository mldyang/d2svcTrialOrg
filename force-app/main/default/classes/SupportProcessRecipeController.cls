public class SupportProcessRecipeController {
    
    @auraenabled
    public static List<EmailTemplateDAO> getAllServicesEmailTemplates(String authenticationId){
        List<EmailTemplateDAO> retEmailTemplateList = new List<EmailTemplateDAO>();
        try{
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> emailTemplateList = rc.getAllServicesEmailTemplates(); 
            for(Object emailTemplateObject:emailTemplateList){
                Map<String,Object> emailTemplateMap = (Map<String,Object>)emailTemplateObject;
                String developerName = (String)emailTemplateMap.get('DeveloperName');
                if (developerName.equals('Open_Case_Notification_to_Case_Owner') ||
                   developerName.equals('Pending_Case_Notification_to_Case_Owner')){
                    EmailTemplateDAO eml = new EmailTemplateDAO();
                    eml.Id = (String)emailTemplateMap.get('Id');
                    eml.sessionId = rc.getAccessToken();
                    eml.url = rc.getSalesforceEndpoint();
                    eml.name = (String)emailTemplateMap.get('Name');
                    eml.developerName = (String)emailTemplateMap.get('DeveloperName');
                   	eml.content =  (String)emailTemplateMap.get('HtmlValue');                    
                    eml.createdDate = Datetime.ValueOf(((String)emailTemplateMap.get('CreatedDate')).replace('T',' ').replace('Z',''));
                    retEmailTemplateList.add(eml);
                    eml.typeString = (String)emailTemplateMap.get('type');
                }
            }
            return retEmailTemplateList;
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    }
    
    @auraenabled
    //public static String createEmailTemplates(String emailTemplatesListString, String authenticationId){
    public static String createEmailTemplates( String authenticationId){
        try{
            //List<EmailTemplateDAO> emailTemplates = (List<EmailTemplateDAO>)JSON.deserialize(emailTemplatesListString, List<EmailTemplateDAO>.class);
            //for (EmailTemplateDAO emailTemplate:emailTemplates){
            	//EmailTemplateDAO emailTemplate = SupportProcessRecipeController.getAllServicesEmailTemplates(authenticationId)[0];
                    
            	List<EmailTemplateDAO> emailTemplates = new List<EmailTemplateDAO>();
            	EmailTemplateDAO emailTemplate= new EmailTemplateDAO();
                emailTemplate.available = true;
            	emailTemplate.description = 'Notification to Case Owner about an Open case that needs attention';
            	emailTemplate.fullName = 'Services_Templates/Open_Case_Notification_to_Case_Owner';
            	emailTemplate.name = 'Open Case Notification to Case Owner';
                emailTemplate.content = 'Hi {!Case.OwnerFirstName}, <br><br>'+
										'Case {!Case.CaseNumber} is open and needs your attention.<br><br>'+
										'{!Case.Link}<br><br>'+
										'Thanks,<br>'+
										'Salesforce Admin';
                emailTemplate.encodingKey = 'ISO-8859-1'; 
                emailTemplate.style = 'none';
                emailTemplate.typeString = 'custom';
                emailTemplate.letterhead = null;
                emailTemplate.subject = '{!Case.CaseNumber} needs your attention';
                emailTemplate.textOnly = 'Hi {!Case.OwnerFirstName},'+
                    					'\n\n'+
										'Case {!Case.CaseNumber} is open and needs your attention.'+
                    					'\n\n'+
										'{!Case.Link}'+
                                        '\n\n'+    
										'Thanks,'+
                                        '\n'+   
										'Salesforce Admin';
            	emailTemplates.add(emailTemplate);
            //}
            MetadataClient mc = MetadataClient.getInstance(authenticationId);
        	return mc.createEmailTemplates(emailTemplates);
        }catch(UnauthorizedException e){
            throw new AuraHandledException('Unauthorized');
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }
    
    }

}