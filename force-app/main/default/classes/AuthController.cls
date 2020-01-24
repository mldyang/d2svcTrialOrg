public with sharing class AuthController {

  public String authUrl { get; set; }
  public STring authSuccess { get; set; }

  public PageReference authorize() {
    DeskOAuth oa = new DeskOAuth();
    String trialSignUpId = ApexPages.currentPage().getParameters().get('trialSignUpId');
    String deskSiteName = ApexPages.currentPage().getParameters().get('deskSiteName');
    System.debug('DeskSiteNames: '+deskSiteName);
    Boolean remoteSiteResult = ToolingClient.createRemoteSiteSetting(Helper.parseEndPoint(deskSiteName), deskSiteName , 'Created for Trial Sign Up');
      if(remoteSiteResult){
          authUrl = oa.startAuthorization(trialSignUpId, deskSiteName);
          System.debug(authUrl);
          if(authUrl == null) {
              // this.message = oa.message;
              ToolingClient.deleteRemoteSiteSetting(Helper.parseEndPoint(deskSiteName), null, null);
              return new PageReference('javascript: "window.close()"');
          } else {
              return new PageReference(authUrl);
          }
      }
      return new PageReference('javascript: "window.close()"');
  }
	
    
  public PageReference completeAuthorization() {
    String token = ApexPages.currentPage().getParameters().get('oauth_token');
    String trialSignUpId = ApexPages.currentPage().getParameters().get('trialSignUpId');
 	System.debug('trialSignUpId='+trialSignUpId);
    if(token!=null)
    {
      
        
      String verifier = ApexPages.currentPage().getParameters().get('oauth_verifier');
      DeskOAuth oa = new DeskOAuth();
      oa.completeAuthorization(token,verifier,trialSignUpId);
      System.debug('Auth Successful');
      
      
    }
    else {
      System.debug('Invalid request. Missing parameter oauth_token');
    }
    return new PageReference('javascript: "window.close()"');
  }
    
}