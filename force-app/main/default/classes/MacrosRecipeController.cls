public class MacrosRecipeController {
    //get Macros name, then description
    //get Macros action
    //get Macros from svc to compare to the ones we're importing from Desk to see if it already exists
    //validate Macros (is it supported? user input needed)
    //create Macros in svc - name/description/what object
    //create Macros action
 
   @auraenabled
    public static List<MacroDAO> getDeskMacros(String authenticationId,Integer pageNo){
        Map<String,MacroDAO> macrosMap = new Map<String,MacroDAO>();
        try{
            DeskClient dc = DeskClient.getInstance(authenticationId);
            Map<String, Object> responseMap = dc.getMacros(pageNo);
            List<Object> entries = (List<object>)((Map<String, Object>)responseMap.get('_embedded')).get('entries');
			Integer totalEntries = (Integer)responseMap.get('total_entries');
		    Integer count = 0;
            Integer startPosition = 10*(Integer.valueOf(pageNo)-1)+1;
            Integer endPosition = startPosition + entries.size() - 1;
            for (Object entry:entries){
                Map<String, Object> c = (Map<String, Object>)entry;
                MacroDAO m = new MacroDAO();
                m.deskMacroId = (Long)c.get('id');
                m.name = (String)c.get('name');
                m.description = (String)c.get('description');
                m.totalDeskMacros = totalEntries;
                m.startPosition = startPosition;
                m.endPosition = endPosition;
                macrosMap.put(m.name.toLowerCase(),m);
            }
            
            RestClient rc = RestClient.getinstance(authenticationId);
			List<Object> records = rc.queryRecords('select id, Name, Description from Macro');
			
            for(Object recObject:records){
                Map<String,Object> sfMacroMap = (Map<String,Object>)recObject;
                String sfMacroId = (String)sfMacroMap.get('Id');
                String name = (String)sfMacroMap.get('Name');
                String description = sfMacroMap.get('Description') == null? null : (String) sfMacroMap.get('Description');
                if(macrosMap.get(name.toLowerCase()) != null){
                   macrosMap.get(name.toLowerCase()).sfMacroId = sfMacroId; 
                    if(String.isEmpty(macrosMap.get(name.toLowerCase()).description)){
                      	macrosMap.get(name.toLowerCase()).description = description;  
                    } 
                }/*else{
                   MacroDAO m = new MacroDAO();
                    m.name = name;
                    m.description = description;
                    m.sfMacroId = sfMacroId;
                    m.totalDeskMacros = totalEntries;
                    m.startPosition = startPosition;
                	m.endPosition = endPosition;
                    macrosMap.put(name, m);
                }*/
            }
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }
        System.debug('DESK MACRO RETURNED: '+macrosMap.values());
        return macrosMap.values();
    }
    
    @auraenabled
    public static List<MacroDAO> getMacrosActions(String authenticationId,String macrosListString){
        List<MacroDAO> macrosList = (List<MacroDAO>)JSON.deserialize(macrosListString, List<MacroDAO>.class);
        Map<String,MacroDAO> macrosMap = new Map<String,MacroDAO>();
        try{
            DeskClient dc = DeskClient.getInstance(authenticationId);
            for(MacroDAO macro:macrosList){
                Map<String, Object> responseMap = dc.getMacroActions(macro.deskMacroId);
                List<Object> entries = (List<object>)((Map<String, Object>)responseMap.get('_embedded')).get('entries');
                List<MacroActionDAO> mActions = new List<MacroActionDAO>();
                for (Object entry:entries){
                    Map<String, Object> maMap = (Map<String, Object>)entry;
                    if((Boolean)maMap.get('enabled')){
                        MacroActionDAO ma = new MacroActionDAO();
                        ma.instructionId = (Long)maMap.get('id');
                        ma.actionType = (String)maMap.get('type');
                        ma.value = (String)maMap.get('value');
                        mActions.add(ma);                   
                    }
                }
                macro.actions = mActions;
            }
        }catch(FailedException e){
            throw new AuraHandledException('Failed');
        }catch(Exception e){
            throw new AuraHandledException('Unknown');
        }
        return macrosList;
    }
    
    
    
    
    public static List<MacroDAO> createMarcros(String macrosString, String authenticationId ){
        List<MacroDAO> macros = (List<MacroDAO>)JSON.deserialize(macrosString, List<MacroDAO>.class);
       	System.debug('macros: '+macros);
        //create JSON for calling the Rest API to create Macro and MacroInstruction Records
       
        return macros;
    }
    
}