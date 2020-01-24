public class RecipeHelper {
    
    public static String getSessionId() {
      String jString = '';

      if (Test.IsRunningTest()) {
          jString = '{"sessionId":""}';
      } else {
          jString = Page.SessionId.getContent().toString();
      }

      Map<String, Object> m = (Map<String, Object>) JSON.deserializeUntyped(jString);
      return (String) m.get('sessionId');
  }

}