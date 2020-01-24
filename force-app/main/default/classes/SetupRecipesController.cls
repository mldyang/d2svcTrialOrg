public class SetupRecipesController {
    
    private static String consumerSecret = '8658257023524960554';
    
     public void test() {
         
         System.debug('_sfdc_canvas_authvalue: '+ApexPages.currentPage().getParameters().get('_sfdc_canvas_authvalue'));
         System.debug('signed_request: '+ApexPages.currentPage().getParameters().get('signed_request'));
         /*String jsonString = SignedRequest.verifyAndDecodeAsJson(ApexPages.currentPage().getParameters().get('signed_request'),'');
         Map<String, Object> values = (Map<String,Object>)JSON.deserializeUntyped(jsonString);
         String sessionId = (String)((Map<String,Object>)values.get('client')).get('oauthToken');
         System.debug('SeessionId: ' + sessionId.substring(0, 15) + ' ' +  sessionId.substring(15));*/
     }
    
    

}