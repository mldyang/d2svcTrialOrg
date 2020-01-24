public class AutoResponseRecipeController {    
    
    @auraenabled
    public static List<EmailData> getOrgWideEmailAddressesApex(String authenticationId){
		List<EmailData> emailDataList = new List<EmailData>();
        try{
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> orgWideEmailAddresses = rc.getOrgWideEmailAddresses();            
            for(Object orgWideEmailAddressObject:OrgWideEmailAddresses){
                Map<String,Object> orgWideEmailAddress = (Map<String,Object>)orgWideEmailAddressObject;
                EmailData emailDataRecord = new EmailData();
                emailDataRecord.recordId = (String)orgWideEmailAddress.get('Id');
                emailDataRecord.email = (String)orgWideEmailAddress.get('Address');
                emailDataRecord.name = (String)orgWideEmailAddress.get('DisplayName');
                String lastModifiedDate = (String)orgWideEmailAddress.get('LastModifiedDate');
                String createdDate = (String)orgWideEmailAddress.get('CreatedDate');
                if (DateTime.valueOf(lastModifiedDate.substringBefore('.').replace('T',' ')) > DateTime.valueOf(createdDate.substringBefore('.').replace('T',' '))){
                    emailDataRecord.verified = true;
                } else {
                    emailDataRecord.verified = false;
                }
                emailDataRecord.selected = false;
                emailDataRecord.recordId = (String)orgWideEmailAddress.get('Id');
                emailDataList.add(emailDataRecord);
                
            }
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        return emailDataList;
        
    }
    
    @auraenabled
    public static Boolean checkIfOrgWideEmailAddressVerifiedApex(String id, String authenticationId){
        try{
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> orgWideEmailAddresses = rc.getOrgWideEmailAddressById(id);            
            for(Object orgWideEmailAddressObject:OrgWideEmailAddresses){
                Map<String,Object> orgWideEmailAddress = (Map<String,Object>)orgWideEmailAddressObject;
                String lastModifiedDate = (String)orgWideEmailAddress.get('LastModifiedDate');
                String createdDate = (String)orgWideEmailAddress.get('CreatedDate');
                if (DateTime.valueOf(lastModifiedDate.substringBefore('.').replace('T',' ')) > DateTime.valueOf(createdDate.substringBefore('.').replace('T',' '))){
                    return true;
                } else {
                    return false;
                }                
            }
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        return false;
        
    }
    
    @auraenabled
    public static List<EmailData> getUsersApex(String authenticationId){
		List<EmailData> emailDataList = new List<EmailData>();
        try{
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> userList = rc.getUsers();            
            for(Object userObject:userList){
                Map<String,Object> user = (Map<String,Object>)userObject;
                if(Helper.validateEmail((String)user.get('Email'))){    
                	EmailData emailDataRecord = new EmailData();
                    emailDataRecord.email = (String)user.get('Email');
                    if(user.get('FirstName') != null){
                    	emailDataRecord.name = ((String)user.get('FirstName')+' '+ (String)user.get('LastName')).trim();
                    }else{
                        emailDataRecord.name = ((String)user.get('LastName')).trim();
                    }
                    emailDataRecord.selected = false;
                    emailDataRecord.recordId = (String)user.get('Id');
                    emailDataList.add(emailDataRecord);
                }
            }
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        return emailDataList;
        
    }
    
    @auraenabled
    public static List<String> getCurrentUser(String authenticationId){
        try{
            String systemUserId;
            String systemUserEmail;
            List<String> returnVal = new List<String>();
          	RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> userList = rc.getSystemUser(rc.getUserId());            
            for(Object userObject:userList){
                Map<String,Object> userMap = (Map<String,Object>)userObject;
                 returnVal.add((String)userMap.get('Name'));
                 returnVal.add((String)userMap.get('Email'));                
            }
            return returnVal;
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        //return null;
    }
    
    @auraenabled
    public static Map<String,Object> getExistingEmailToCaseApex(String authenticationId){
        String existingEmailToCaseString;
        Map<String,Object> existingEmailToCase;
        try{
            MetadataClient mc = MetadataClient.getInstance(authenticationId);
        	existingEmailToCaseString = mc.getEmailToCase();
        	//existingEmailToCase = (Map<String,Object>)JSON.deserializeUntyped(existingEmailToCaseString, List<EmailData>.class);
        	existingEmailToCase = (Map<String,Object>)JSON.deserializeUntyped(existingEmailToCaseString);
        }catch(UnauthorizedException e){
            throw new AuraHandledException('Unauthorized');
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        return existingEmailToCase;
    }
    
    @auraenabled
    public static String createOrgWideEmailAddressApex(String email, String displayName, String existingMatchingUnverifiedId, String authenticationId){
        try{
            RestClient rc = RestClient.getInstance(authenticationId);
            if(existingMatchingUnverifiedId == null ||
                (existingMatchingUnverifiedId != null && 
                 rc.deleteOrgWideEmailAddressById(existingMatchingUnverifiedId))){
            	return(rc.createOrgWideEmailAddress(email,displayName));
            }
        }catch(UnauthorizedException e){
            throw new AuraHandledException('Unauthorized');
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }
        return '';
    }
    
    @auraenabled
    public static EmailTemplateDAO getEmailTemplateInfo(String authenticationId){
        try{
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> emailTemplateList = rc.getEmailTemplate();            
            for(Object emailTemplateObject:emailTemplateList){
                Map<String,Object> emailTemplateMap = (Map<String,Object>)emailTemplateObject;
                EmailTemplateDAO eml = new EmailTemplateDAO();
                eml.Id = (String)emailTemplateMap.get('Id');
                eml.sessionId = rc.getAccessToken();
                eml.url = rc.getSalesforceEndpoint();
                return eml;
            }
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        return null;
    }
    
    @auraenabled
    public static List<EmailTemplateDAO> getAllEmailTemplateInfo(String authenticationId){
        List<EmailTemplateDAO> retEmailTemplateList = new List<EmailTemplateDAO>();
        try{
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> emailTemplateList = rc.getAllEmailTemplate(); 
            for(Object emailTemplateObject:emailTemplateList){
                Map<String,Object> emailTemplateMap = (Map<String,Object>)emailTemplateObject;
                String developerName = (String)emailTemplateMap.get('DeveloperName');
                System.debug('developerName: '+ developerName +', '+developerName.startsWith('Auto_Response_Email_to_Customer'));
                if (developerName.startsWith('Auto_Response_Email_to_Customer')){
                    EmailTemplateDAO eml = new EmailTemplateDAO();
                    eml.Id = (String)emailTemplateMap.get('Id');
                    eml.sessionId = rc.getAccessToken();
                    eml.url = rc.getSalesforceEndpoint();
                    eml.name = (String)emailTemplateMap.get('Name');
                    eml.developerName = (String)emailTemplateMap.get('DeveloperName');
                   	eml.content = (String)emailTemplateMap.get('HtmlValue');                    
                    eml.createdDate = Datetime.ValueOf(((String)emailTemplateMap.get('CreatedDate')).replace('T',' ').replace('Z',''));
                    retEmailTemplateList.add(eml);

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
    public static String createEmailTemplates(String emailTemplatesListString, String authenticationId){
        try{
            List<EmailTemplateDAO> emailTemplates = (List<EmailTemplateDAO>)JSON.deserialize(emailTemplatesListString, List<EmailTemplateDAO>.class);
            for (EmailTemplateDAO emailTemplate:emailTemplates){
                emailTemplate.available = true;
                emailTemplate.content = EmailTemplateDAO.standardHTMLContent;
                emailTemplate.encodingKey = 'ISO_8859_1'; 
                emailTemplate.style = 'freeForm';
                emailTemplate.typeString = 'html';
                emailTemplate.letterhead = 'Default_Letterhead';
                emailTemplate.subject = 'Re: {!Case.Subject}';
                emailTemplate.textOnly = EmailTemplateDAO.standardTextContent;
            }
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
    
    @auraenabled
    public static String createCaseAutoResponseApex(String caseAutoResponseString, String authenticationId){
        try{
            MetadataClient mc = MetadataClient.getInstance(authenticationId);
            System.debug('caseAutoResponseString: '+caseAutoResponseString);
            CaseAutoResponseRuleDAO caseAR = (CaseAutoResponseRuleDAO)JSON.deserialize(caseAutoResponseString, CaseAutoResponseRuleDAO.class);
            System.debug('caseAutoResponse: '+caseAR);
            //return 'Success';
        	return mc.createCaseAutoResponse(caseAR);
        }catch(UnauthorizedException e){
            throw new AuraHandledException('Unauthorized');
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }
    
    }
    
    @auraenabled
    public static List<CaseAutoResponseRuleDAO> getCaseAutoResponseRuleApex(String authenticationId){
        try{
            MetadataClient mc = MetadataClient.getInstance(authenticationId);
            List<CaseAutoResponseRuleDAO> arList = mc.getCaseAutoResponseRule();
            for(CaseAutoResponseRuleDAO ar:arList){
                if(ar.isActive){
                    System.debug(ar);
                }
            }
            //System.debug(arList);
           	return mc.getCaseAutoResponseRule();
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    }
    
    @auraenabled
    public static List<PicklistValue> getCaseOriginPicklistValues(String authenticationId){
        try{
            //Map<String,String> picklistValues = new Map<String,String>();
            List<PicklistValue> picklistValueList = new List<PicklistValue>();
            ToolingClient tc = ToolingClient.getInstance(authenticationId);
            String response = tc.getStandardPicklistValues('CaseOrigin');
            List<Object> StandardValuesList = (List<Object>)((Map<String,Object>)((Map<String,Object>)((List<Object>)((Map<String,Object>)JSON.deserializeUntyped(response)).get('records'))[0]).get('Metadata')).get('standardValue');
            for(Object standardValueObject:StandardValuesList){
                Map<String,Object> standardValueMap = (Map<String,Object>)standardValueObject;
                PicklistValue pv = new PicklistValue();
                pv.valueName = (String)standardValueMap.get('valueName');
                pv.label = (String)standardValueMap.get('label');
                picklistValueList.add(pv);
                //picklistValues.put((String)standardValueMap.get('valueName'),(String)standardValueMap.get('label'));
            }           
           	return picklistValueList;
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    }
    
    @auraenabled
    public static Boolean createCaseOriginPicklistValues(String authenticationId, String valuesString){
        try{
			List<String> values = (List<String>)JSON.deserialize(valuesString, List<String>.class);
			HeadlessBrowserClient hbc = HeadlessBrowserClient.getInstance(authenticationId);
            hbc.createStandardPicklistValues('CaseOrigin', values);          
           	return true;
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    }

}