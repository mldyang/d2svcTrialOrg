public class CaseAssignmentByRuleRecipeController {
   	
    @auraenabled
    public static List<UserDAO> getUsers(String authenticationId){
        List<UserDAO> users = new List<UserDAO>();
        try{
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> sfUsers = rc.getUsers();
            for(Object userAsObject:sfUsers){
                Map<String,Object> sfUserInfo = (Map<String,Object>)userAsObject;
                UserDAO sfUser = new UserDAO();
                sfUser.sfUserId = (String)sfUserInfo.get('Id');
                sfUser.email = (String)sfUserInfo.get('Email');
                if(sfUserInfo.get('FirstName') != null){
                    sfUser.name = ((String)sfUserInfo.get('FirstName') + ' ' + (String)sfUserInfo.get('LastName')).trim();
                }else{
                    sfUser.name = (String)sfUserInfo.get('LastName');
                }
                sfUser.firstName = (String)sfUserInfo.get('FirstName');
                sfUser.lastName = (String)sfUserInfo.get('LastName');
                sfUser.inSalesforce = true;
                sfUser.sfUsername = (String)sfUserInfo.get('Username');
                sfUser.sfProfileId= (String)sfUserInfo.get('ProfileId');
                sfUser.isActive = (Boolean)sfUserInfo.get('IsActive');
                users.add(sfUser);
            }
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        return users; 
	}
    
    @auraenabled
    public static List<QueueDAO> getQueues(String authenticationId){
        List<QueueDAO> queues = new List<QueueDAO>();
        Map<String,String> queueTypeMap = new Map<String,String>();
        try{
            
            RestClient rc = RestClient.getInstance(authenticationId);
            List<Object> sfQueues = rc.getQueues();
            List<Object> sfQueueTypes = rc.getQueueType();
            for(Object QueueTypeAsObject:sfQueueTypes){
                Map<String,Object> queueTypeInfo = (Map<String,Object>)QueueTypeAsObject;
                queueTypeMap.put((String)queueTypeInfo.get('QueueId'),(String)queueTypeInfo.get('SobjectType'));
            }
            for(Object QueueAsObject:sfQueues){
                Map<String,Object> queueInfo = (Map<String,Object>)QueueAsObject;
                String name = (String)queueInfo.get('Name');
                System.debug('queueInfo: '+queueInfo);
                
                if(queueTypeMap.get((String)queueInfo.get('Id')) == 'Case'){ 
                    QueueDAO sfQueue = new QueueDAO();
                    sfQueue.sfQueueId = (String)queueInfo.get('Id');
                    sfQueue.sfQueueEmail = (String)queueInfo.get('Email');
                    sfQueue.name= (String)queueInfo.get('Name');
                    sfQueue.sfDeveloperName = (String)queueInfo.get('DeveloperName');
                    sfQueue.sfQueueDoesSendEmailToMembers = (Boolean)queueInfo.get('DoesSendEmailToMembers');
                    sfQueue.inSalesforce = true;
                    queues.add(sfQueue);
                }

            }
            
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        return queues; 
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
    public static string updateEmailToCaseApex(String edListString, String authenticationId){
        try{
            List<EmailData> edList = (List<EmailData>)JSON.deserialize(edListString, List<EmailData>.class);
            System.debug('edList: '+edList);
            //return 'Success';
       		MetadataClient mc = MetadataClient.getInstance(authenticationId);
        	return mc.updateEmailToCase(edList);
        }catch(UnauthorizedException e){
            throw new AuraHandledException('Unauthorized');
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }
    
    }
    
    @auraenabled
    public static List<AssignmentRuleDAO> getAssignmentRuleApex(String authenticationId){
        try{
            MetadataClient mc = MetadataClient.getInstance(authenticationId);
           	return mc.getAssignmentRule();
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    }
    
    @auraenabled
    public static String createAssignmentRuleApex(String assignmentRuleString, String authenticationId){
        try{
            MetadataClient mc = MetadataClient.getInstance(authenticationId);
            System.debug('caseAutoResponseString: '+assignmentRuleString);
            assignmentRuleDAO ar = (AssignmentRuleDAO)JSON.deserialize(assignmentRuleString, AssignmentRuleDAO.class);
            //System.debug('caseAutoResponse: '+caseAR);
            //return 'Success';
        	return mc.createAssignmentRule(ar);
        }catch(UnauthorizedException e){
            throw new AuraHandledException('Unauthorized');
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }
    
    }
}