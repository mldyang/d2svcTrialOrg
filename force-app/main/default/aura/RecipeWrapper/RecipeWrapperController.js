({
	changeRecipeComponent : function(component, event, helper) {
        
        var name = 'c:AddEmailChannel';
        var param = event.getParam("componentName");
        console.log('component to be created: ',param);
        $A.createComponent(
            'c:'+param,
            {
                "oauthRecordIdentifier" : component.getReference('v.oauthRecordIdentifier')
            },
            function(createdComponent){                
                if (component.isValid()) {
                    var targetCmp = component.find('recipeComponent');
                    //var body = targetCmp.get("v.body");
                    //body.push(createdComponent);
                    targetCmp.set("v.body", createdComponent); 
                    if(param != 'RecipeList'){
                        component.find('headerDiv').getElement().setAttribute("style","box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.1);padding-top:20px");
                    }else{
                        component.find('headerDiv').getElement().setAttribute("style","border-shadow: none;padding-top:16px");
                    }
                }
            }
        );
		
	},
    
    init : function(cmp, event, helper) {
        
        console.log('inside recipe wrapper: ' +cmp.get('v.oauthRecordIdentifier'));
        
       /* var name = 'c:EmailRecipe';
        var param = event.getParam("componentName");
        
        $A.createComponent(
            name,
            {

            },
            function(createdComponent){                
                if (component.isValid()) {
                    var targetCmp = component.find('recipeComponent');
                    //var body = targetCmp.get("v.body");
                    //body.push(createdComponent);
                    targetCmp.set("v.body", createdComponent); 
                    if(param != 'RecipeList'){
                        component.find('headerDiv').getElement().setAttribute("style","box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.1);padding-top:20px");
                    }else{
                        component.find('headerDiv').getElement().setAttribute("style","border-shadow: none;padding-top:16px");
                    }
                }
            }
        );*/
		
	}
})