@isTest
public class TrialSignUpApexControllerTest {
    @isTest static void testSignUp() {
        Test.startTest();
        TrialSignUpApexController.signUp('Thomas', 'Stachl', 'teststuff', 'tstachl@salesforce.com', 'Salesforce', '1234', 1, true);
       	System.assert(true);
        Test.stopTest();
    }
    
    @isTest static void checkDeskConfigAuthorizationTest() {
        Test.startTest();
        TrialSignUpApexController.checkDeskConfigAuthorization('123123');
       	System.assert(true);
        Test.stopTest();
    }
    
    @isTest static void createTrialSignUpRecordTest() {
        Test.startTest();
        TrialSignUpApexController.createTrialSignUpRecord('Thomas', 'Stachl', 'teststuff', 'tstachl@salesforce.com', 'Salesforce', 'US', 'devel', 'test', 1, true);
       	System.assert(true);
        Test.stopTest();
    }
    
    @isTest static void checkIfVCAllowedApexTest() {
        Test.startTest();
        TrialSignUpApexController.checkIfVCAllowedApex('123123');
       	System.assert(true);
        Test.stopTest();        
    }
    
    @isTest static void createTrialTest() {
        Test.startTest();
        TrialSignUpApexController.createTrial(
        	TrialSignUpApexController.createTrialSignUpRecord('Thomas', 'Stachl', 'teststuff', 'tstachl@salesforce.com', 'Salesforce', 'US', 'devel', 'test', 1, true),
			new TrialSignUpApexController.UserInput()
        );
       	System.assert(true);
        Test.stopTest();        
    }
    
    /*
    @isTest static void testCreateTrial {
        Test.startTest();
        CustomResult cr = 

        TrialSignUpApexController.createTrial(cr, ui)
    }
	*/
}