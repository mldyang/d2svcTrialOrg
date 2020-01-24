({
	init : function(cmp, event, helper) {
        helper.getUrlSessionInfo(cmp,event,helper);
        helper.createRecipeActivity(cmp,{action: 'Load', recipe: 'Support Process', feature:'Recipe'});
	},
    
    afterRender : function(cmp, event, helper) {
        var vc = cmp.find('vc');
        if(vc && cmp.get('v.setVC')){
            vc.changeVideo(cmp.get('v.vcVideos')['intro'],
                           'intro',
                           cmp.get('v.highlightTimestampsMap')['intro']);
            cmp.set('v.setVC',false);
        }
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