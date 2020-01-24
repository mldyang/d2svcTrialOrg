({
	init : function(cmp, event, helper) {
        helper.getUrlSessionInfo(cmp,event,helper);
        helper.createRecipeActivity(cmp,{action: 'Load', recipe: 'Admin Training', feature:'Recipe'});
	},
    
    customizeLink: function(cmp,event,helper){
        console.log('In Url');  
        cmp.find('frontdoor-form').getElement().submit();
    },
    
    back : function(cmp, event, helper) {
        var myEvent = cmp.getEvent("recipeComponentChange");
        myEvent.setParams({"componentName": 'RecipeList'});
        myEvent.fire();
    }
})