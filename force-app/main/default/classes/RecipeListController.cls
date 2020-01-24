public class RecipeListController {
    
    public class CustomResult
    {
        @AuraEnabled public Boolean validSession;
        @AuraEnabled public Boolean havePlayedVirtualConsultant;
  
    }
    
    @auraenabled
    public static CustomResult checkLogin(String authenticationId){
        CustomResult cr = new CustomResult();
        try{

            String recipeSessionUserId;
            String currentUserId;
            String currentUsername;
            List<String> returnVal = new List<String>();
          	RestClient rc = RestClient.getInstance(authenticationId);
            recipeSessionUserId = rc.getUserId();
            Map<String, Object> userInfoMap = rc.getUserInfo();            
            currentUserId = (String)userInfoMap.get('user_id');
            currentUsername = (String)userInfoMap.get('preferred_username');
            
            if(recipeSessionUserId == currentUserId){
                cr.validSession = true;
            }else{
                cr.validSession = false;
            }
            
            List<Recipe_Activity__c> ral = [select id from Recipe_Activity__c where Recipe_Session__r.Username__c = :currentUsername and Feature__c = 'Virtual Consultant' and Action__c = 'Play' limit 1];
            if(ral != null && ral.size() > 0){
                cr.havePlayedVirtualConsultant = true;
            }else{
                cr.havePlayedVirtualConsultant = false;
            }
            
        }catch(FailedException e){
            cr.validSession = false;
        }catch(Exception e){
            cr.validSession = false;
        }
        return cr;
    }
    
    @auraenabled
    public static Boolean hasSocialChannels(String authenticationId){

        try{
            DeskClient dc = DeskClient.getInstance(authenticationId);
            
            Map<String, Object> responseMapF = dc.getFacebookAccounts();
            List<Object> entriesF = (List<object>)((Map<String, Object>)responseMapF.get('_embedded')).get('entries');
            
            if(entriesF != null && entriesF.size() > 0){
                return true;
            }else{
                Map<String, Object> responseMapT = dc.getTwitterAccounts();
                List<Object> entriesT = (List<object>)((Map<String, Object>)responseMapT.get('_embedded')).get('entries');
                if(entriesT != null && entriesT.size() > 0){
                    return true;
                }                
            }
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }
        return false;
    }

}