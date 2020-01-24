global class TrialOnboardingController {
    
    @RemoteAction
    global static Boolean checkIfFirstTime(String sfInstanceUrl){
        List<Recipe_Activity__c> rac = [select id from Recipe_Activity__c where 
                                        Feature__c = 'Authentication' and 
                                        Action__c = 'Complete' and 
                                        Section__c = 'Salesforce'and 
                                        Recipe_Session__r.Salesforce_instance_url__c = :sfInstanceUrl];
        if(rac != null && rac.size() > 0){
        	return false;
        }else{
            return true;
        }
    }
    
    /* Associates orgid with trial_signup__c record. Then checks if VC is allowed
     * based on settings in Recipe_allow_list__c
     */
    
    @RemoteAction
    global static Boolean checkIfVCAllowed(String myDomain, String sfOrgId, String createdDateString){
        
        String deskSiteId;
        String AOVBand;
        String trialSignUpId;
        List<Trial_SignUp__c> tsList = [select id, Desk_Endpoint__c, created_Org__c, Desk_Site_Id__c from Trial_Signup__c where 
                                        mydomain__c = :myDomain and 
                                        token__c != null and 
                                        token_secret__c != null
                                        order by createdDate desc
                                        limit 1];
        if(tsList != null && tsList.size() > 0){
            Boolean hasOrgId = false;
            for(Trial_SignUp__c ts:tsList){
                if(ts.created_Org__c != null && ts.created_Org__c.trim().length() > 0){
                    hasOrgId = true;
                }
                if(deskSiteId == null){
                    deskSiteId = ts.Desk_Site_Id__c;
                }
                trialSignUpId = ts.Id;
            }
            if(!hasOrgId){
                Trial_SignUp__c tsToUpdate = tsList[0];
                tsToUpdate.created_Org__c = sfOrgId;
                update tsToUpdate;
            }
            
        }
        
        
         // Get AOVBand from Desk_Customer_Data__c based on Desk Site Id
            
         List<Desk_Customer_Data__c> dcdl = [select AOV_Band__c from Desk_Customer_Data__c where Desk_Site_Id__c = :deskSiteId limit 1];
            
         for(Desk_Customer_Data__c dcd:dcdl){
             AOVBand = dcd.AOV_Band__c;
         }
         if(AOVBand != null){   
            if(AOVBand.contains('A:')){
                AOVBand = 'A';
            }else if (AOVBand.contains('B:')){
                AOVBand = 'B';
            }else if (AOVBand.contains('C:')){
                AOVBand = 'C';
            }else if (AOVBand.contains('D:')){
                AOVBand = 'D';
            }else if (AOVBand.contains('E:')){
                AOVBand = 'E';
            }
             
             List<Recipe_Allow_List__c> rallbyOrg = [select id from Recipe_Allow_List__c where
                                                     orgId__c = :sfOrgId and block__c = false
                                                    ];
             if(rallbyOrg != null && rallbyOrg.size()> 0){
                 return true;
             }
 			
             
             //DateTime currentTime = System.now();
             DateTime currentTime = Datetime.valueOf(createdDateString.replace('T',' ').replace('.000Z',''));
             Date currDate = currentTime.date();
             Time currTime = currentTime.time();
             Datetime local = datetime.newinstance(currDate,currTime);   
                
             List<Recipe_Allow_List__c> rall = [select id from Recipe_Allow_List__c where
                                               start_datetime__c <= :currentTime and (end_datetime__c > :currentTime or end_datetime__c = null) and Allowed_AOV_Bands__c includes (:AOVBand) and Block__c = false];
            
            if(rall != null && rall.size() > 0 ){
                 List<Recipe_Allow_List__c> rallbyOrgBlocked = [select id from Recipe_Allow_List__c where
                                                    orgId__c = :sfOrgId and block__c = true
                                                  ];
                if(rallbyOrgBlocked != null && rallbyOrgBlocked.size() > 0){
                    return false;
                }else{
                    Recipe_Allow_List__c ral = new Recipe_Allow_List__c(
                							orgId__c = sfOrgId,
                        			trial_SignUp__c = trialSignUpId
                    						);
                 	insert ral;
                    return true;
                }
            }
         }
        
     	return false;
	}
    
    @RemoteAction
    global static void logVC(String sfOrgId, String event, String Browser){
        String trialSignUpId;
        List<Trial_SignUp__c> tsList = [select id from Trial_Signup__c where Created_Org__c = :sfOrgId order by createddate desc limit 1];
        if(tsList != null && tsList.size() > 0){
        	trialSignUpId = tsList[0].id;
            Recipe_Activity__c rac = new Recipe_Activity__c(
                				Feature__c = 'Trial Onboarding',
        						trial_signup__c = trialSignupId,
            					Action__c = event,
            					Browser__c = Browser
        						);
            insert rac;
        }
        
        
    
    }
    
    

}