({
	init : function(cmp, event, helper) {
    	helper.checkLogin(cmp,event,helper);
        cmp.get('v.highlightTimestampsMap').intro[20] = helper.showTab1;
        cmp.get('v.highlightTimestampsMap').intro[36] = helper.showTab2;
        cmp.get('v.highlightTimestampsMap').intro[72] = helper.showTab3;
        cmp.get('v.highlightTimestampsMap').intro[94] = helper.showTab1;
        
        cmp.get('v.functionsMemory').intro[20] = helper.showTab1;
        cmp.get('v.functionsMemory').intro[36] = helper.showTab2;
        cmp.get('v.functionsMemory').intro[72] = helper.showTab3;
        cmp.get('v.functionsMemory').intro[94] = helper.showTab1;
        helper.createRecipeActivity(cmp,{action: 'Load', recipe: 'List', feature:'Recipe'});
    },
    
    afterRender : function(cmp, event, helper) {
        var currentTabId = cmp.get('v.currentTabId');
        var currentTab = cmp.get('v.currentTabId').replace('-','-content-');
        if(cmp.find(currentTab) && cmp.find(currentTabId)){
            cmp.find(currentTab).getElement().classList.remove('slds-hide');
            cmp.find(currentTab).getElement().classList.add('slds-show');
            cmp.find(currentTabId).getElement().parentNode.classList.add('slds-is-active');
            var currentTabElement = cmp.find(currentTabId).getElement();
            switch(currentTabId){
                case 'tab-1': currentTabElement.innerHTML = 'Part 1: Channels & Case Management'; break;
                case 'tab-2': currentTabElement.innerHTML = 'Part 2: Agent Productivity & Support Center'; break;
                case 'tab-3': currentTabElement.innerHTML = 'Part 3: Data Migration & Cutover'; break;   
                default:
            }
        }
        var vc = cmp.find('vc');
        if(vc && cmp.get('v.setVC')){
            var offsetTop = document.getElementById("main-container").offsetTop;
            var offsetLeft = document.getElementById("main-container").offsetLeft;
    		vc.changeVideo(cmp.get('v.vcVideos')['intro'],
                                   'intro',
                                   cmp.get('v.highlightTimestampsMap')['intro'],0,0,false);
        }
        var vcContainer = cmp.find('virtual-consultant-container');
        if(vcContainer){
            if(cmp.get('v.havePlayedVirtualConsultant')){
                /*if(!vcContainer.getElement().classList.contains('right-banner-after')){
        			vcContainer.getElement().classList.add('right-banner-after');
            	}
            	if(vcContainer.getElement().classList.contains('right-banner')){
                	vcContainer.getElement().classList.remove('right-banner');
        		}*/		
            }else{
                var popover = cmp.find('popover');
                if(popover){
                   
                    window.setTimeout(
                        $A.getCallback(function() {
                            if(!cmp.get('v.havePlayedVirtualConsultant')){
                                popover.getElement().classList.add('popover-show');
                    			popover.getElement().style.display = 'block';
                            	cmp.find('popover').getElement().style.opacity = 1;
                            	cmp.find('main-container').getElement().style.opacity = 0.5;
                            }
                        }), 2000
                    );
                }
                /*if(!vcContainer.getElement().classList.contains('right-banner')){
            		vcContainer.getElement().classList.add('right-banner');    
            	}
				if(vcContainer.getElement().classList.contains('right-banner-after')){
                	vcContainer.getElement().classList.remove('right-banner-after');
    			}*/
            }
        }
        
    },
    
    loadComponent : function(cmp, event, helper) {
        var myEvent = cmp.getEvent("recipeComponentChange");
        myEvent.setParams({"componentName": event.currentTarget.name});
        myEvent.fire();
        console.log('event fired: ',event.currentTarget.name);
	},
    
    handleTabClick: function(cmp,event,helper){
        helper.clearHighlights(cmp);
        var newTabId = event.target.id;
        var newTab = newTabId.replace('-','-content-');
        var currentTabId = cmp.get('v.currentTabId');
        if (currentTabId){
        	var currentTab = currentTabId.replace('-','-content-');
        }
        if(newTabId != currentTabId && 
          !cmp.get('v.vcInUse') && 
          cmp.find(currentTabId) &&
          cmp.find(newTabId) &&
          cmp.find(newTab) &&
          cmp.find(currentTab) 
          ){
            cmp.find(currentTabId).getElement().parentNode.classList.remove('slds-is-active');
            cmp.find(newTabId).getElement().parentNode.classList.add('slds-is-active');
            cmp.find(newTab).getElement().classList.remove('slds-hide');
            cmp.find(newTab).getElement().classList.add('slds-show');
            cmp.find(currentTab).getElement().classList.remove('slds-show');
            cmp.find(currentTab).getElement().classList.add('slds-hide');
            cmp.set('v.currentTabId',newTabId);
            
            var currentTabElement = cmp.find(currentTabId).getElement();
            var newTabElement = cmp.find(newTabId).getElement();
            switch(currentTabId){
                case 'tab-1': currentTabElement.innerHTML = 'Part 1'; break;
                case 'tab-2': currentTabElement.innerHTML = 'Part 2'; break;
                case 'tab-3': currentTabElement.innerHTML = 'Part 3'; break;   
                default:
            }
            switch(newTabId){
                case 'tab-1': newTabElement.innerHTML = 'Part 1: Channels & Case Management'; break;
                case 'tab-2': newTabElement.innerHTML = 'Part 2: Agent Productivity & Support Center'; break;
                case 'tab-3': newTabElement.innerHTML = 'Part 3: Data Migration & Cutover'; break;   
                default:
            }
        }
    },
    
    
    handleVCEvent: function(cmp,evt,helper){
        var isVideoHighlight = evt.getParam("isVideoHighlight");
        var isVideoPlayPauseEnd = evt.getParam("isVideoPlayPauseEnd");
        var isModal = evt.getParam("isModal");
        
        if(isVideoHighlight){
            helper.handleVideoHighlight(cmp,evt,helper);
        }
        if(isVideoPlayPauseEnd){
            helper.handleVCPlay(cmp,evt,helper);
        }
        if(isModal){
            helper.handleModal(cmp,evt,helper);
        }
        
        if(isVideoPlayPauseEnd && evt.getParam("videoPlay")){
            cmp.set('v.setVC',false);
            var vcContainer = cmp.find('virtual-consultant-container').getElement();
            vcContainer.style.backgroundColor = 'white';
            if(!cmp.get('v.havePlayedVirtualConsultant')){
                cmp.find('main-container').getElement().style.opacity = 1; 
                cmp.find('popover').getElement().style.opacity = 0;
                window.setTimeout(
                    $A.getCallback(function() {
    
                        cmp.find('popover').getElement().style.display = 'none';
                        /*vcContainer.classList.remove('right-banner');
                        vcContainer.classList.add('right-banner-after');*/
                    }), 2001
                );
                cmp.set('v.havePlayedVirtualConsultant',true);
            }
        }
     }
                           
})