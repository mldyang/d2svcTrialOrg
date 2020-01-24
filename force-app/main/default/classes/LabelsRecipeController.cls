public class LabelsRecipeController {
    
    @auraenabled
    public static List<LabelDAO> getDeskLabels(String authenticationId){
        List<UserDAO> users = new List<UserDAO>();
        Map<String,UserDAO> deskUserMap = new Map<String,UserDAO>();
        try{
            System.debug('authenticationId: '+authenticationId);
            DeskClient dc = DeskClient.getInstance(authenticationId);
            
            Map<String, Object> responseMap = dc.getLabels();
            List<Object> entries = (List<object>)((Map<String, Object>)responseMap.get('_embedded')).get('entries');
            List<LabelDAO> labels = new List<LabelDAO>();
            for (Object entry:entries){
                Map<String,Object> entryMap = (Map<String,Object>)entry;
                LabelDAO label = new LabelDAO();
                label.label = (String)entryMap.get('name');
                labels.add(label);
            }
            return labels;    
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
        
    }
    
    @auraenabled
    public static List<PicklistValue> getCaseTypeValuesApex(String authenticationId){
        try{                          
            //Map<String,String> picklistValues = new Map<String,String>();
            List<PicklistValue> picklistValueList = new List<PicklistValue>();
            ToolingClient tc = ToolingClient.getInstance(authenticationId);
            String response = tc.getStandardPicklistValues('CaseType');
            List<Object> StandardValuesList = (List<Object>)((Map<String,Object>)((Map<String,Object>)((List<Object>)((Map<String,Object>)JSON.deserializeUntyped(response)).get('records'))[0]).get('Metadata')).get('standardValue');
            for(Object standardValueObject:StandardValuesList){
                Map<String,Object> standardValueMap = (Map<String,Object>)standardValueObject;
                PicklistValue pv = new PicklistValue();
                pv.valueName = (String)standardValueMap.get('valueName');
                pv.label = (String)standardValueMap.get('label');
                picklistValueList.add(pv);
            }           
            return picklistValueList;
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }    
    }

}