({
	loadComponent : function(cmp, event, helper) {
        var myEvent = cmp.getEvent("recipeComponentChange");
        myEvent.setParams({"componentName": event.getSource().get('v.name')});
        myEvent.fire();
		
	}
})