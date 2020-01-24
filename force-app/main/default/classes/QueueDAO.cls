public class QueueDAO {

    @auraenabled
    public string name;
    @auraenabled
    public string sfDeveloperName;
    @auraenabled
    public string sfQueueEmail;
    @auraenabled
    public Boolean sfQueueDoesSendEmailToMembers;
    @auraenabled
    public string deskGroupId;
    @auraenabled
    public string sfQueueId;
    @auraenabled
    public string sfQueueSobject;
    @auraenabled
    public Boolean inDesk;
    @auraenabled
    public Boolean inSalesforce;
    @auraenabled
    public Boolean isManual;
    @auraenabled
    public Boolean selected;
    @auraenabled
    public List<UserDAO> users;
    @auraenabled
    public String errorStatusCode;
	@auraenabled
    public String errorMessage;
    @auraenabled
    public String errorField;

}