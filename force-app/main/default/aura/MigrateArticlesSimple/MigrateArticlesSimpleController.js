({
	init : function(cmp, event, helper) {
        helper.getUrlSessionInfo(cmp,event,helper);
        //CHANGE TO THE METHOD BELOW WHEN THE FORM IS READY
        //helper.getUrlSessionInfoLocal(cmp,event,helper);
        helper.createRecipeActivity(cmp,{action: 'Load', recipe: 'Article Migration', feature:'Recipe'});
	},
    
    customizeLink: function(cmp,event,helper){
        console.log('In Url');  
        //CHANGE TO THE FROM URL BELOW WHEN THE FORM IS READY
        //cmp.find('retURL').getElement().value = 'lightning/o/Case?token='+cmp.get('v.deskToken')+'&secret='+cmp.get('v.deskTokenSecret')+'&dmId='+cmp.get('v.deskMigrationId');
        cmp.find('frontdoor-form').getElement().submit();
    },
    
    back : function(cmp, event, helper) {
        var myEvent = cmp.getEvent("recipeComponentChange");
        myEvent.setParams({"componentName": 'RecipeList'});
        myEvent.fire();
    },
    
    next : function(cmp, event, helper) {
        cmp.find('frontdoor-form').getElement().submit();
    }
})