({
	init : function(cmp, event, helper) {
        helper.getUrlSessionInfoLocal(cmp,event,helper);
        helper.createRecipeActivity(cmp,{action: 'Load', recipe: 'Article Migration', feature:'Recipe'});
        //helper.createDeskMigration(cmp,event,helper,'Article');
	},
    
    customizeLink: function(cmp,event,helper){
        console.log('In Url');  
        cmp.find('retURL').getElement().value = 'lightning/o/Case?token='+cmp.get('v.deskToken')+'&secret='+cmp.get('v.deskTokenSecret')+'&dmId='+cmp.get('v.deskMigrationId');
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