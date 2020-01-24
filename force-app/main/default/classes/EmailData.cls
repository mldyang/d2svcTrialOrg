public class EmailData {
    
  
    @auraenabled
    public String name {get; set;}
    @auraenabled
    public String email {get; set;}
    @auraenabled
    public Boolean selected {get; set;}
    @auraenabled
    public Boolean verified {get; set;}
    @auraenabled
    public String recordId {get; set;}
    @auraenabled
    public String caseOwner {get; set;}
    @auraenabled
    public String caseOwnerType {get; set;}
    @auraenabled    
    public String emailServicesAddress {get; set;}
    @auraenabled    
    public String caseOrigin {get; set;}
    
    public EmailData(String name, String email){
        this.name = name;
        this.email = email;
        this.selected = false;
    }
    
    public EmailData(){
        
    }
    

}