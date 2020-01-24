({
	myAction : function(component, event, helper) {
		
	},
    
    goToList : function(cmp, event, helper) {
        var myEvent = cmp.getEvent("recipeComponentChange");
        myEvent.setParams({"componentName": 'RecipeList'});
        myEvent.fire();
    },
    
    showModal: function(cmp, event, helper) {
    	cmp.find('breadcrumb-modal').getElement().style.display="inline";
    },
    
    hideModal: function(cmp, event, helper) {
        cmp.find('breadcrumb-modal').getElement().style.display="none";
    	console.log('hello');
    }
})