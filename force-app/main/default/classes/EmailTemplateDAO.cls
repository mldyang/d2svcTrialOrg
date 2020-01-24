public class EmailTemplateDAO {
    
    @auraenabled
    public String Id {get; set;}
    @auraenabled
    public String sessionId {get; set;}
    @auraenabled
    public String url {get; set;}
    @auraenabled
    public String letterhead; 
    @auraenabled
    public String content;
    @auraenabled
    public String subject;
    @auraenabled
    public Boolean available;
    @auraenabled
    public String fullName;
    @auraenabled
    public String developerName;
    @auraenabled
    public String name;
    @auraenabled
    public String style;
    @auraenabled
    public String textOnly;
    
    //have to replace typeString with type in JSON generated before metadata API callout
    @auraenabled
    public String typeString;
    @auraenabled
    public String encodingKey;
    @auraenabled
    public String description;
    @auraenabled
    public datetime createdDate;
    //public static String standardHTMLContent = '';
    //public static String standardTextContent = '';
    
    public static String standardHTMLContent = '<table border="0" cellpadding="5" width="550" cellspacing="5" height="400" ><tr valign="top" height="400" ><td tEditID="c1r1" style=" background-color:#FFFFFF; color:#000000; bEditID:r3st1; bLabel:main; font-size:12pt; font-family:arial;" aEditID="c1r1" locked="0" ><![CDATA[<div style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt;"><font color="#333333" size="4" face="Arial, sans-serif"><b>'+
                'Re: {!Case.Subject}</b></font></div><font face="Arial, sans-serif" style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt;"><font style="color: rgb(0, 0, 0); font-size: 12pt;"><span style="font-size: 12pt; color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);"><font color="#333333"><span style="font-size: 14px;"><b><div><span style="background-color: rgb(255, 255, 255);"><font color="#333333">' + 
                '<span style="font-size: 14px;"><b><br></b></span></font></span></div></b></span></font></span></font>{!Organization.Name}<font style="color: rgb(0, 0, 0); font-size: 12pt;"><span style="font-size: 12pt; color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);"><font color="#333333"><span style="font-size: 14px;">  |  </span></font></span><span style="font-size: 12pt; color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);">' + 
                '<font color="#333333"><span style="font-size: 11.2px;">{!Case.CreatedDate}</span><span style="font-size: 14px;"> </span></font></span></font></font><div style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt;"><font face="Arial, sans-serif" size="2"><br style="color: rgb(51, 51, 51); background-color: rgb(255, 255, 255);">Dear {!Contact.Name},</font></div><div style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt;">' + 
                '<font face="Arial, sans-serif" size="2"><br></font></div><div style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt;"><span style="color: rgb(51, 51, 51); background-color: rgb(255, 255, 255);"><font face="Arial, sans-serif" size="2">Thank you for submitting your request. We have received your request and are working on responding to you as soon as possible.</font></span></div><div style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt;">' + 
                '<font face="Arial, sans-serif" size="2"><br></font></div><div style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt;"><font face="Arial, sans-serif" size="2">For your reference, here are your case details:</font></div><div style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt;"><font face="Arial, sans-serif" size="2"><br></font></div><div style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt;"><font face="Arial, sans-serif" size="2">' + 
                '- Case #: {!Case.CaseNumber}<br>- Subject: {!Case.Subject}<br>- Description: {!Case.Description}<br style="background-color: rgb(255, 255, 255);"><br style="color: rgb(51, 51, 51); background-color: rgb(255, 255, 255);"><span style="color: rgb(51, 51, 51); background-color: rgb(255, 255, 255);">Thanks in advance for your patience and support.</span></font></div><div style="">' + 
                '<font color="#333333" face="Arial, sans-serif" style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt;"><span style="font-size: 14px;"><br></span></font><div style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt; background-color: rgb(250, 250, 250); border: 0px; padding: 2px;"><font face="Arial, sans-serif"><font color="#333333" face="arial"><span style="font-size: 11.2px;">This message was sent to </span>' + 
                '</font><a href="mailto:{!Contact.Email}" target="_blank" style="color: rgb(17, 85, 204); font-family: arial; font-size: 11.2px;">{!Contact.Email}</a><font color="#333333" face="arial"><span style="font-size: 11.2px;"> in reference to Case #</span></font><font color="#333333"><span style="font-size: 11.2px;">{!Case.CaseNumber}</span></font><font color="#333333" face="arial"><span style="font-size: 11.2px;">.</span></font></font>' + 
                '</div><div style="color: rgb(0, 0, 0); font-family: arial; font-size: 12pt; border: 0px; padding: 2px;"><font face="Arial, sans-serif" style=""><font color="#333333" face="arial" style=""><span style="font-size: 11.2px; background-color: rgb(255, 255, 255);">{!Case.ThreadId}</span></font></font></div><font size="1" color="#ffffff"><br style="font-family: Arial, sans-serif; background-color: rgb(255, 255, 255);">' + 
                '<font face="arial">{!Case.Thread_Id}</font></font></div>]]></td></tr></table>';
    
    public static String standardTextContent = 'Re: {!Case.Subject}' + 
            '\n\n'+
            '{!Organization.Name} | {!Case.CreatedDate}'+
            '\n\n' +
            'Dear {!Contact.Name},'+
            '\n\n' +
            'Thank you for submitting your request. We have received your request and are working on responding to you as soon as possible.' +
            '\n\n' +
            'For your reference, here are your case details:' +
            '\n\n' + 
            '- Case #: {!Case.CaseNumber}\n' +
            '- Subject: {!Case.Subject}\n' + 
            '- Description: {!Case.Description}\n' + 
            '\n\n' +
            'Thanks in advance for your patience and support.' +
            '\n\n' +
            'This message was sent to {!Contact.Email} in reference to Case #{!Case.CaseNumber}.' +
            '\n{!Case.Thread_Id}';

}