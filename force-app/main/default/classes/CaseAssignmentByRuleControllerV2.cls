public class CaseAssignmentByRuleControllerV2 {
    
    /*@auraenabled
    public static AssignmentRuleDAO getExistingActiveAssignmentRuleApex(String recordIdentifier){
        try{
            MetadataClient mc = MetadataClient.getInstance(recordIdentifier);
            AssignmentRuleDAO activeAssignmentRule;
            List<AssignmentRuleDAO> assignmentRules = mc.getAssignmentRule();
            
            for(AssignmentRuleDAO assignmentRule:assignmentRules){
                if(assignmentRule.isActive){
                    activeAssignmentRule = assignmentRule;
                    break;
                }
            }
            return activeAssignmentRule;
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    }*/
    
    @auraenabled
    public static List<String> getUrlSessionInfoMethod(String recordIdentifier){
        RestClient rc = RestClient.getInstance(recordIdentifier);
        List<String> ret = new List<String>();
        try{
            ret.add(rc.getSalesforceEndpoint());
            ret.add(rc.getAccessToken());
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        } 
        return ret;
    }
    
    @auraenabled
    public static List<AssignmentRuleDAO> getAllExistingAssignmentRulesApex(String recordIdentifier){
        try{
            MetadataClient mc = MetadataClient.getInstance(recordIdentifier);
            AssignmentRuleDAO activeAssignmentRule;
            List<AssignmentRuleDAO> assignmentRules = mc.getAssignmentRule();

            return assignmentRules;
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    }
    
    @auraenabled
    public static String createAssignmentRuleApex(String recordIdentifier, String assingmentRuleString){
        try{
            AssignmentRuleDAO assignmentRule = (AssignmentRuleDAO)JSON.deserialize(assingmentRuleString, AssignmentRuleDAO.class);
            System.debug('+++' + recordIdentifier);
            MetadataClient mc = MetadataClient.getInstance(recordIdentifier);
                        System.debug('---');
            String res = mc.createAssignmentRule(assignmentRule);
            return res;
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    }
    
    @auraenabled
    public static List<UserDAO> getExistingSFUsersApex(String recordIdentifier){
        List<UserDAO> users = new List<UserDAO>();
        try{
            RestClient rc = RestClient.getInstance(recordIdentifier);
            List<Object> sfUsers = rc.getUsers();
            for(Object userAsObject:sfUsers){   
                Map<String, Object> userData = (Map<String, Object>)userAsObject;
                UserDAO sfUser = new UserDAO();
                sfUser.sfUserId = (String)userData.get('Id');
                sfUser.email = (String)userData.get('Email');
                if(userData.get('FirstName') != null){
                    sfUser.name = ((String)userData.get('FirstName') + ' ' + (String)userData.get('LastName')).trim();
                }else{
                    sfUser.name = (String)userData.get('LastName');
                }
                sfUser.firstName = (String)userData.get('FirstName');
                sfUser.lastName = (String)userData.get('LastName');
                sfUser.sfUsername = (String)userData.get('Username');
                sfUser.sfProfileId= (String)userData.get('ProfileId');
                sfUser.isActive = (Boolean)userData.get('IsActive');
                users.add(sfUser);
            }
            
        }catch(UnauthorizedException e){
            throw new AuraHandledException('Unauthorized');
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
        Map<String,QueueDAO> deskGroupMap = new Map<String,QueueDAO>();
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
}