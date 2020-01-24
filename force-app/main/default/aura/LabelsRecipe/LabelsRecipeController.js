({
	init : function(cmp, event, helper) {
		
	},
    
    hideButtons: function(cmp,event,helper){
        cmp.find('footer').getElement().style.display = 'none';
        cmp.find('addRow').getElement().style.display = 'none';
    },
    
    showButtons: function(cmp,event,helper){
        cmp.find('footer').getElement().style.display = 'block';
        cmp.find('addRow').getElement().style.display = 'block';
    },
    
    
    next : function(cmp, event, helper) {
        cmp.set('v.showError',false);
        var models = cmp.get('v.model'); 
        var sectionDisplay = cmp.get('v.sectionDisplay');
        if(sectionDisplay['intro']){
            sectionDisplay['intro'] = false;
            sectionDisplay['casetype'] = true;
            helper.getDeskLabels(cmp,event,helper);
        } 
        else if(sectionDisplay['casetype']){
            console.log(cmp.get('v.labelsCaseType'));
        } 
        else if (sectionDisplay['existing']){
             
        } 
        else if (sectionDisplay['newFieldType']){
                   
        } 
        else if (sectionDisplay['newField']){
                    
        }
        else if (sectionDisplay['complete']){
                                
        }
        cmp.set('v.sectionDisplay',sectionDisplay);

	},
    
    back : function(cmp, event, helper) {
        var sectionDisplay = cmp.get('v.sectionDisplay');
        var models = cmp.get('v.model');
        if(sectionDisplay['intro']){
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }
        else if(sectionDisplay['casetype']){
                sectionDisplay['intro'] = true;
             	sectionDisplay['casetype'] = false; 
        }
        else if (sectionDisplay['existing']){
             sectionDisplay['casetype'] = true;
             sectionDisplay['existing'] = false;          
        } 
        else if (sectionDisplay['newFieldType']){
             sectionDisplay['existing'] = true;
             sectionDisplay['newFieldType'] = false;          
        }
        else if (sectionDisplay['newField']){
            
        } 
        else if (sectionDisplay['byEmailKeywords']){
           
        } 
        else if (sectionDisplay['complete']){
            var myEvent = cmp.getEvent("recipeComponentChange");
            myEvent.setParams({"componentName": 'RecipeList'});
            myEvent.fire();
        }
        cmp.set('v.sectionDisplay',sectionDisplay);
	},
    
    
    
    handleToastClick: function (cmp, evt, helper) {
        var message = evt.getParam("message");
        if(message = 'bypassVerification'){
           var vc = cmp.find('vc'); 
           var sectionDisplay = cmp.get('v.sectionDisplay');
        }
    },
    
    addRow: function(cmp, event, helper) {
        var rows;
        var sectionDisplay = cmp.get('v.sectionDisplay');
        if (sectionDisplay.casetype){
            rows = cmp.get('v.labelsCaseType');
            rows.push({label: null, salesforceField: 'CaseType', existingInSalesforce: false, newToSalesforce: true});
            cmp.set('v.labelsCaseType',rows);
        }

	},
    
    delRow: function(cmp, event, helper) {
        var rows;
        var name = event.target.name;
        var row = parseInt(name.replace('row',''));
        
        cmp.set('v.',rows);
        var sectionDisplay = cmp.get('v.sectionDisplay');
        if (sectionDisplay.casetype){
            rows = cmp.get('v.labelsCaseType');
            if(rows.length > 1){
                var newRows = [];
                for(var key in rows){
                    if(key < row) newRows.push(rows[key]);
                    else if (key > row){
                        rows[key-1].label = rows[key].label;
                        rows[key-1].newToSalesforce = rows[key].newToSalesforce;
                        rows[key-1].existingInSalesforce = rows[key].existingInSalesforce;
                        newRows.push(rows[key-1]);
                    } 
                }
                cmp.set('v.labelsCaseType',newRows);
            }else{
                rows[row].label = null;
                rows[row].newToSalesforce = true;
                rows[row].existingInSalesforce = false;
                cmp.set('v.labelsCaseType',rows);
            }
            
        }
        
        
            
	},
    
    customizeLink: function(cmp,event,helper){
        console.log('In Url');  
        cmp.find('frontdoor-form').getElement().submit();
    },
})