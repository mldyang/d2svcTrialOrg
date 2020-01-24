public class CaseAutoResponseRuleDAO {
    
    @auraenabled
    public Boolean isActive;
    @auraenabled
    public String  fullName; 
    @auraenabled
    public List<RuleEntryBean> ruleEntryList;

    public class RuleEntryBean{
        @auraenabled
        public String replyToEmail;
        @auraenabled
        public String senderEmail;
        @auraenabled
        public String senderName;
        @auraenabled
        public String emailTemplate;
        @auraenabled
        public Boolean notifyCcRecipients;
        @auraenabled
        public List<FilterItemDAO> filterItems;
        
        
    }

}