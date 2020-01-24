public class EmailRecipeController {
    
    @auraenabled
    public static List<EmailData> getDeskEmailsApex(String authenticationId){
         List<EmailData> emailDataList = new List<EmailData>();
        List<String> emailList = new List<String>();
        String email;
        String name;
        try{
            DeskClient dc = DeskClient.getInstance(authenticationId);
            Map<String, Object> responseMap = dc.getInboundEmail();
            List<Object> entries = (List<object>)((Map<String, Object>)responseMap.get('_embedded')).get('entries');
           
            for (Object entry:entries){
                Map<String, Object> c = (Map<String, Object>)entry;
                if(c.get('email') != null){
                    email = (String)c.get('email');
                    name = (String)c.get('name');
                    if(!email.contains('.desk-mail.com') && !emailList.contains(email)){
                        emailDataList.add(new EmailData(name,email));
                        emailList.add(email);
                    }
                }    
            }
            
            responseMap = dc.getOutboundEmail();
            entries = (List<object>)((Map<String, Object>)responseMap.get('_embedded')).get('entries');
            for (Object entry:entries){
                Map<String, Object> c = (Map<String, Object>)entry;
                if(c.get('from_email') != null){
                    email = (String)c.get('from_email');
                    name = (String)c.get('from_name');
                    if(!email.contains('.desk-mail.com') && !emailList.contains(email)){
                        emailDataList.add(new EmailData(name,email));
                        emailList.add(email);
                    }
                }    
            }
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        } 
        System.debug('DESK EMAIL RETURNED: '+emailDataList);
        return emailDataList;
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
    //public static string createEmailToCase(List<EmailRecipeController.EmailData> edList){
    public static string createEmailToCaseApex(String edListString, String authenticationId){
        try{
            List<EmailData> edList = (List<EmailData>)JSON.deserialize(edListString, List<EmailData>.class);
            System.debug('edList: '+edList);
            //return 'Success';
       		MetadataClient mc = MetadataClient.getInstance(authenticationId);
        	return mc.createEmailToCase(edList);
        }catch(UnauthorizedException e){
            throw new AuraHandledException('Unauthorized');
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }
    
    }
    
    @auraenabled
    public static string getSystemUserEmail(String authenticationId){
        try{
            String systemUserId;
            String systemUserEmail;
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> orgInfoList = rc.getOrganizationInfo();            
            for(Object orgInfoObject:orgInfoList){
                Map<String,Object> orgInfoMap = (Map<String,Object>)orgInfoObject;
                systemUserId = (String)orgInfoMap.get('CreatedById');
            }
            System.debug(systemUserId);
            if(systemUserId != null && systemUserId.length() > 0){
                List<Object> systemUserList = rc.getSystemUser(systemUserId);            
                for(Object systemUserObject:systemUserList){
                    Map<String,Object> systemUserMap = (Map<String,Object>)systemUserObject;
                    systemUserEmail = (String)systemUserMap.get('Email');
                }
            }
            return systemUserEmail;
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        //return null;
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