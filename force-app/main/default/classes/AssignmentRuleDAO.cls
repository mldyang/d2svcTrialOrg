public class AssignmentRuleDAO {
    
    @auraenabled
    public Boolean isActive;
    @auraenabled
    public String  fullName; 
    @auraenabled
    public List<RuleEntryDAO> ruleEntryList;

    public class RuleEntryDAO{
        @auraenabled
        public String assignedTo;
        @auraenabled
        public String assignedToType;
        @auraenabled
        public String emailTemplate;
        @auraenabled
        public String booleanFilter;
        @auraenabled
        public List<FilterItemDAO> filterItems;
        //Naveen to add order number
    }

}