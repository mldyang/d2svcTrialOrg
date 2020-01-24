({
	
    /*createComponentController.js*/
    doInit : function(cmp) {
        
    },
    
    close : function(cmp, event, helper) {
        console.log(cmp.get("v.body"));
		cmp.set('v.isActive',false);
	},
    
    generateToastEvent: function(cmp, event, helper) {
        var myEvent = cmp.getEvent("toastClickEvent");
        myEvent.setParams({"message": cmp.get('v.linkMessage')});
        myEvent.fire();
    }
})