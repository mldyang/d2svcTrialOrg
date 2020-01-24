public class RecipeBaseController {
    
    @auraenabled
    public static void createRecipeActivity(String activityString){
        RecipeActivityDAO rad = (RecipeActivityDAO)JSON.deserialize(activityString, RecipeActivityDAO.class);
        if(rad.isModal == null) rad.isModal = false;
        Recipe_Session__c rs = new Recipe_Session__c(Record_Identifier_Token__c = rad.recordIdentifier);
        
        Recipe_Activity__c ra = new Recipe_Activity__c(
            					Action__c = rad.action,
            					Feature__c = rad.feature,
            					Recipe__c = rad.recipe,
            					Recipe_Session__r = rs,
            					section__c = rad.section,
            					video__c = rad.video,
            					isModal__c = rad.isModal
        						);
        insert ra;
    }
    
    @auraenabled
    public static List<String> getUrlSessionInfoMethod(String recordIdentifier){
        RestClient rc = RestClient.getInstance(recordIdentifier);
        List<String> ret = new List<String>();
        try{
            ret.add(rc.getSalesforceEndpoint());
            ret.add(rc.getAccessToken());
            ret.add(rc.getOrgId());
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        } 
        return ret;
    }
    
    @auraenabled
    public static String createDeskMigrationApex(String type, String deskEndPoint, String recordIdentifier){
        RestClient rc = RestClient.getInstance(recordIdentifier);
        String json = '{ "DESKSCMT__Migration_Type__c" : "'+ type +'", "DESKSCMT__Desk_Endpoint__c": "'+ deskEndPoint + '"}';
        try{
           return rc.createDeskMigration(json);
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        } 
        //return true;
    }
    

}