public class QueueRecipeController {
    
    @auraenabled
    public static List<QueueDAO> getGroupsAndQueues(String authenticationId){
        List<QueueDAO> groups = new List<QueueDAO>();
        Map<String,QueueDAO> deskGroupMap = new Map<String,QueueDAO>();
        Map<String,String> queueTypeMap = new Map<String,String>();
        try{
            DeskClient dc = DeskClient.getInstance(authenticationId);
            
            Map<String, Object> responseMap = dc.getGroups();
            List<Object> entries = (List<object>)((Map<String, Object>)responseMap.get('_embedded')).get('entries');
           
            for (Object entry:entries){
                Map<String, Object> c = (Map<String, Object>)entry;
                if(!(Boolean)c.get('deleted')){
                    QueueDAO deskGroup = new QueueDAO();
                    deskGroup.deskGroupId = String.valueOf(c.get('id'));
                    deskGroup.name = (String)c.get('name');
                    deskGroup.inDesk = true;
                    groups.add(deskGroup);
                    deskGroupMap.put(deskGroup.name,deskGroup);
                }
            }
            
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
                    if(deskGroupMap.get(name) != null){
                        QueueDAO deskGroup = deskGroupMap.get(name);
                        deskGroup.sfQueueId = (String)queueInfo.get('Id');
                        deskGroup.sfQueueEmail = (String)queueInfo.get('Email');
                        deskGroup.sfDeveloperName = (String)queueInfo.get('DeveloperName');
                        deskGroup.sfQueueDoesSendEmailToMembers = (Boolean)queueInfo.get('DoesSendEmailToMembers');
                        deskGroup.inSalesforce = true;
                    }
                     
                    QueueDAO sfQueue = new QueueDAO();
                    sfQueue.sfQueueId = (String)queueInfo.get('Id');
                    sfQueue.sfQueueEmail = (String)queueInfo.get('Email');
                    sfQueue.name= (String)queueInfo.get('Name');
                    sfQueue.sfDeveloperName = (String)queueInfo.get('DeveloperName');
                    sfQueue.sfQueueDoesSendEmailToMembers = (Boolean)queueInfo.get('DoesSendEmailToMembers');
                    sfQueue.inSalesforce = true;
                    groups.add(sfQueue);
                }

            }
            
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        return groups; 
    }
    
    public static void testQcreate(){
        List<QueueDAO> qlist = new List<QueueDAO>();
        Map<String, QueueDAO> qMap = new Map<String, QueueDAO>();
        
        QueueDAO q1 = new QueueDAO();
        q1.name = 'New3';
        q1.sfDeveloperName = 'New3';
        //q1.sfQueueId ='Id1';
            
        QueueDAO q2 = new QueueDAO();
        q2.name = 'New4';
        q2.sfDeveloperName = 'New4';
        //q2.sfQueueId = 'Id2';
        
       	qlist.add(q1);
        qlist.add(q2);
        qMap.put('q1',q1);
        qMap.put('q2',q2);
        //System.debug(createQueues(qlist,'Ps3M4BIW1524340240409'));
        //createQueueType(qMap,'');
    }
    
    @auraenabled
    public static List<QueueDAO> createQueues(String queueString, String authenticationId){
    	List<QueueDAO> queueus = (List<QueueDAO>)JSON.deserialize(queueString, List<QueueDAO>.class);
    //public static List<QueueDAO> createQueues(List<QueueDAO> queueus, String authenticationId){
        Map<String, QueueDAO> queueMap = new Map<String, QueueDAO>();
        Integer count = 0;
        try{
            for(QueueDAO queue:queueus){
                count++;
                queueMap.put('queue-'+ count, queue);
            }
            String jsonString = '{ "records" : [';
            for (string ref:queueMap.keyset()){
                QueueDAO queue = queueMap.get(ref);
                if(queue.sfQueueId == null || queue.sfQueueId.length() == 0){
                    System.debug('creating json');
                    jsonString += '{ "attributes" : {"type" : "Group", "referenceId" : "' +  ref +'"},';
                    jsonString += '"Name" : "'+ queue.name +'",';
                    jsonString += '"Type" : "Queue",';
                    jsonString += '"DeveloperName" : "'+ queue.sfDeveloperName +'"},'; 
                }
            }
            jsonString = jsonString.removeEnd(',');
            jsonString += ']}';
            System.debug('jsongString: '+jsonString);
            
            RestClient rc = RestClient.getInstance(authenticationId);
            Map<String,Object> responseMap = rc.createQueues(jsonString);
            
            System.debug('responseMap: '+responseMap);
            
            if(!(Boolean)responseMap.get('hasErrors')){
                for(Object retValue:(List<Object>)responseMap.get('results')){
                    Map<String,Object> retQueue = (Map<String,Object>)retValue;
                    String referenceId = (String)retQueue.get('referenceId');
                    QueueDAO queue = queueMap.get(referenceId);
                    queue.sfQueueId = (String)retQueue.get('id');
                }
                if(!createQueueType(queueMap,authenticationId)){
                    throw new FailedException('Failed');
                }
            }else{
                for(Object retValue:(List<Object>)responseMap.get('results')){
                    Map<String,Object> retQueue = (Map<String,Object>)retValue;
                    String referenceId = (String)retQueue.get('referenceId');
                    QueueDAO queue = queueMap.get(referenceId);
                    List<Object> errorList = (List<Object>)retQueue.get('errors');
                    for(Object errorObject:errorList){
                        Map<String,Object> error = (Map<String,Object>)errorObject;
                        queue.errorStatusCode = (String)error.get('statusCode');
                        queue.errorMessage = (String)error.get('message');
                        List<Object> errorFields =	(List<Object>)error.get('fields');
                        String errorFieldString;
                        for(Object errorField:errorFields){
                            if(errorFieldString == null) errorFieldString = (String)errorField;
                            else errorFieldString += ', '+ (String)errorField;
                        }
                        queue.errorField = errorFieldString;
                        break;
                    }
                }
                        
            }
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    	return queueMap.values();
    }
    
    private static boolean createQueueType(Map<String, QueueDAO> queueMap, String authenticationId){
        try{
            String jsonString = '{ "records" : [';
            for (string ref:queueMap.keyset()){
                QueueDAO queue = queueMap.get(ref);
                if(queue.sfQueueId != null && queue.sfQueueId.length() > 0){
                    System.debug('creating json');
                    jsonString += '{ "attributes" : {"type" : "QueueSobject", "referenceId" : "' +  ref +'"},';
                    jsonString += '"QueueId" : "'+ queue.sfQueueId +'",';
                    jsonString += '"SobjectType" : "Case"},';
                }
            }
             jsonString = jsonString.removeEnd(',');
             jsonString += ']}';
            
            System.debug('jsonString: '+jsonString);
            
            RestClient rc = RestClient.getInstance(authenticationId);
            Map<String,Object> responseMap = rc.createQueueType(jsonString);
            
            System.debug('responseMap: '+responseMap);
            
            if(!(Boolean)responseMap.get('hasErrors')){
                return true;
            }else{
                for(Object retValue:(List<Object>)responseMap.get('results')){
                    Map<String,Object> retQueue = (Map<String,Object>)retValue;
                    String referenceId = (String)retQueue.get('referenceId');
                    QueueDAO queue = queueMap.get(referenceId);
                    List<Object> errorList = (List<Object>)retQueue.get('errors');
                    for(Object errorObject:errorList){
                        Map<String,Object> error = (Map<String,Object>)errorObject;
                        queue.errorStatusCode = (String)error.get('statusCode');
                        queue.errorMessage = (String)error.get('message');
                        List<Object> errorFields =	(List<Object>)error.get('fields');
                        String errorFieldString;
                        for(Object errorField:errorFields){
                            if(errorFieldString == null) errorFieldString = (String)errorField;
                            else errorFieldString += ', '+ (String)errorField;
                        }
                        queue.errorField = errorFieldString;
                        break;
                    }
                }
                return false;
            }
		}catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }          
    }

}