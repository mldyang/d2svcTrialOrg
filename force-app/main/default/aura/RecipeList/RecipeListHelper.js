({
	checkLogin: function(cmp,event,helper){
        cmp.set('v.isProcessing',true);
        var action = cmp.get('c.checkLogin');
        action.setParams({
            authenticationId: cmp.get('v.oauthRecordIdentifier')
        });
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('checkLogin',res.getReturnValue());
            if (state === 'SUCCESS') {
                var ret = res.getReturnValue();
                if (!ret.validSession) {
                    $A.createComponent(
                        'c:RecipeAuthentication',
                        {
                            "oauthRecordIdentifier": cmp.getReference('v.oauthRecordIdentifier'),
                            "authorizedDesk": true
                        },
                        function(createdComponent){                
                            if (cmp.isValid()) {
                                console.log('created component');
                                var targetCmp = cmp.find('listWrapper');
                                targetCmp.set("v.body", createdComponent);
                            }
                        }
                    );
                    cmp.set('v.isProcessing',false);
                }else{
                    cmp.set('v.havePlayedVirtualConsultant', ret.havePlayedVirtualConsultant);
                    //cmp.set('v.havePlayedVirtualConsultant', false);
                    helper.hasSocial(cmp,event,helper);
                }
            }else if (state === 'ERROR') {
                var errors = res.getError();
                console.error('Unknown Error occurred');
                cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
				cmp.set('v.showError',true);
              	cmp.find('toast').set('v.type','error');
              	cmp.set('v.isProcessing',false);
          }       
       });
       $A.enqueueAction(action);
   },
    
    hasSocial: function(cmp,event,helper){
        cmp.set('v.isProcessing',true);
        var action = cmp.get('c.hasSocialChannels');
        action.setParams({
            authenticationId: cmp.get('v.oauthRecordIdentifier')
        });
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('hasSocialChannels',res.getReturnValue());
            if (state === 'SUCCESS') {
                cmp.set('v.socialEnabled', res.getReturnValue());
                cmp.set('v.isProcessing',false);
            }else if (state === 'ERROR') {
                var errors = res.getError();
                console.error('Unknown Error occurred');
                cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
				cmp.set('v.showError',true);
              	cmp.find('toast').set('v.type','error');
              	cmp.set('v.isProcessing',false);
           }       
       });
       $A.enqueueAction(action);
   },
    
    showTab1: function(cmp,event,helper){
 	   cmp.set('v.setVC',false);	
       cmp.set('v.currentTabId','tab-1');
       var tab1 = cmp.find('tab-1').getElement(); 
       var tab2 = cmp.find('tab-2').getElement();
       var tab3 = cmp.find('tab-3').getElement(); 
       tab1.innerHTML = 'Part 1: Channels & Case Management';
       tab2.innerHTML = 'Part 2'; 
       tab3.innerHTML = 'Part 3'; 
        
       cmp.find('tab-1').getElement().parentNode.classList.add('slds-is-active');
       cmp.find('tab-2').getElement().parentNode.classList.remove('slds-is-active');
       cmp.find('tab-3').getElement().parentNode.classList.remove('slds-is-active');
        
       cmp.find('tab-content-2').getElement().classList.remove('slds-show');
       cmp.find('tab-content-2').getElement().classList.add('slds-hide');
       cmp.find('tab-content-3').getElement().classList.remove('slds-show');
       cmp.find('tab-content-3').getElement().classList.add('slds-hide');
       cmp.find('tab-content-1').getElement().classList.remove('slds-hide');
       cmp.find('tab-content-1').getElement().classList.add('slds-show');
       helper.clearHighlights(cmp);

    },
    
    showTab2: function(cmp,event,helper){
 	   cmp.set('v.setVC',false);	
       cmp.set('v.currentTabId','tab-2');
       var tab1 = cmp.find('tab-1').getElement(); 
       var tab2 = cmp.find('tab-2').getElement();
       var tab3 = cmp.find('tab-3').getElement(); 
       tab1.innerHTML = 'Part 1';
       tab2.innerHTML = 'Part 2: Agent Productivity & Support Center'; 
       tab3.innerHTML = 'Part 3'; 
        
       cmp.find('tab-1').getElement().parentNode.classList.remove('slds-is-active');
       cmp.find('tab-2').getElement().parentNode.classList.add('slds-is-active');
       cmp.find('tab-3').getElement().parentNode.classList.remove('slds-is-active');
        
       cmp.find('tab-content-1').getElement().classList.remove('slds-show');
       cmp.find('tab-content-1').getElement().classList.add('slds-hide');
       cmp.find('tab-content-3').getElement().classList.remove('slds-show');
       cmp.find('tab-content-3').getElement().classList.add('slds-hide');
       cmp.find('tab-content-2').getElement().classList.remove('slds-hide');
       cmp.find('tab-content-2').getElement().classList.add('slds-show');
       helper.clearHighlights(cmp);

    },
    
    showTab3: function(cmp,event,helper){
 	   cmp.set('v.setVC',false);	
       cmp.set('v.currentTabId','tab-3');
       var tab1 = cmp.find('tab-1').getElement(); 
       var tab2 = cmp.find('tab-2').getElement();
       var tab3 = cmp.find('tab-3').getElement(); 
       tab1.innerHTML = 'Part 1';
       tab2.innerHTML = 'Part 2'; 
       tab3.innerHTML = 'Part 3: Data Migration & Cutover'; 
        
       cmp.find('tab-1').getElement().parentNode.classList.remove('slds-is-active');
       cmp.find('tab-2').getElement().parentNode.classList.remove('slds-is-active');
       cmp.find('tab-3').getElement().parentNode.classList.add('slds-is-active');
        
       cmp.find('tab-content-1').getElement().classList.remove('slds-show');
       cmp.find('tab-content-1').getElement().classList.add('slds-hide');
       cmp.find('tab-content-2').getElement().classList.remove('slds-show');
       cmp.find('tab-content-2').getElement().classList.add('slds-hide');
       cmp.find('tab-content-3').getElement().classList.remove('slds-hide');
       cmp.find('tab-content-3').getElement().classList.add('slds-show');
       helper.clearHighlights(cmp);
    },
    
    clearHighlights: function(cmp){
    	var highlights = cmp.find('vc-highlight')	
        var i;
        if(Array.isArray(highlights)){
            for(i = 0; i < highlights.length; i++ ){
                if(highlights[i]){
                    highlights[i].getElement().style.setProperty("width", "0px");
                    highlights[i].getElement().style.setProperty("height", "0px");
                    highlights[i].getElement().classList.remove('vc-horizontal');
                    highlights[i].getElement().classList.remove('vc-vertical');
                }
            }
        }else{
            if(highlights){
                highlights.getElement().style.setProperty("width", "0px");
                highlights.getElement().style.setProperty("height", "0px");
                highlights.getElement().classList.remove('vc-horizontal');
                highlights.getElement().classList.remove('vc-vertical');
            }
        }
    }
})