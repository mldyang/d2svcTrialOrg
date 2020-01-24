({
	handleVideoHighlight: function(cmp, evt, helper){
        var currentTimeFloor = evt.getParam("timestamp");
        var currentVideo = evt.getParam('videoName');
        var highlights = cmp.find('vc-highlight'); //.getElement();
        var highlight;
        var highlightTimestamps = cmp.get('v.highlightTimestampsMap')[currentVideo];
        var i;
        console.log(currentTimeFloor);
        if(currentTimeFloor == -1 || evt.getParam("seekbarClick") ){
           clearHighlight(highlights);
           if (evt.getParam("seekbarClick")){
          	 setContext();
               helper.createRecipeActivity(cmp,{action: 'Seek', video: currentVideo, feature:'Virtual Consultant', section: currentTimeFloor, recipe: evt.getParam('recipe')});  
           }
        }
        else if(!$A.util.isEmpty(highlightTimestamps[currentTimeFloor])){
            if(highlightTimestamps[currentTimeFloor] == 0){
                 clearHighlight(highlights);
            }
            else if (typeof highlightTimestamps[currentTimeFloor] === 'function'){
                highlightTimestamps[currentTimeFloor](cmp,evt,helper);
            }
            else{
                var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    				scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                var el;
                var element = cmp.find(highlightTimestamps[currentTimeFloor][0]);
                var highlightInstructions = highlightTimestamps[currentTimeFloor];
                if(Array.isArray(highlightInstructions) && highlightInstructions[0].constructor === Array) {
                    var maxHighlightLimit;
                    if (highlightInstructions.length > 3){
                        maxHighlightLimit = 3;
                    }else{
                        maxHighlightLimit = highlightInstructions.length;
                    }
                    for(i=0;i < maxHighlightLimit ;i++){
                        element = cmp.find(highlightTimestamps[currentTimeFloor][i][0]);
                        if(!element){
                            element = document.getElementById(highlightTimestamps[currentTimeFloor][i][0]);
                            if(element){
                                el = element.getBoundingClientRect();
                            }
                        }else{
                            if (Array.isArray(element)){
                                if(element[i]){
                                	el = element[i].getElement().getBoundingClientRect();
                                }
                            }else{
                                el = element.getElement().getBoundingClientRect();
                            }
                        }
                        if(Array.isArray(highlights)){
                            if(highlights[i]){
                        		highlight = highlights[i].getElement();
                                if(el){
                                    doHighlight(highlight,highlightTimestamps[currentTimeFloor][i],el,element.offsetWidth);
                                }
                            }else{
                                break;
                            }
                        }else{
                            highlight = highlights.getElement();
                            if(el){
                                doHighlight(highlight,highlightTimestamps[currentTimeFloor][i],el);
                            }
                            break;
                        }
                        
                    }
                }else{          
                    if(!element){
                        element = document.getElementById(highlightTimestamps[currentTimeFloor][0]);
                        if(element){
                            el = element.getBoundingClientRect();
                        }
                    }else{
                        if (Array.isArray(element)){
                            el = element[0].getElement().getBoundingClientRect();
                        }else{
                            el = element.getElement().getBoundingClientRect();
                        }
                    }
                    if(Array.isArray(highlights)){
                        highlight = highlights[0].getElement();
                    }else{
                        highlight = highlights.getElement();
                    }
                    
                    if(el){
                    	doHighlight(highlight,highlightTimestamps[currentTimeFloor],el,element.offsetWidth);
                	}
                }
                
            }
        }
        function doHighlight(highlight,hightlightInstruction,el,elementWidth){
            if(hightlightInstruction[1] == 'bottom'){
                if(hightlightInstruction[2]){
                    highlight.style.top = el.bottom + scrollTop + hightlightInstruction[2] + "px";
                }else{
                    highlight.style.top = el.bottom + scrollTop + "px";
                }
                if(hightlightInstruction[3]){
                    highlight.style.left = el.left + scrollLeft + hightlightInstruction[3] + "px";
                }else{
                    highlight.style.left = el.left + scrollLeft + "px";
                }
                highlight.classList.add('vc-horizontal');
                var highlightWidth;
                if(elementWidth < 50){
                    highlightWidth = elementWidth;
                }else{
                    highlightWidth = 50;
                }
                highlight.style.setProperty("width", highlightWidth + "px");
                
            }
            if(hightlightInstruction[1] == 'left'){
                highlight.style.setProperty("border-left-width", "thick");
                highlight.style.top = el.top + scrollTop + "px";
                if(hightlightInstruction[2]){
                    highlight.style.left = el.left + scrollLeft + highlightTimestamps[currentTimeFloor][2] + "px";
                }else{
                    highlight.style.left = el.left + scrollLeft + "px";
                }
                highlight.classList.add('vc-vertical');
                //highlight.style.setProperty("height", "50px");
                highlight.style.setProperty("height", el.bottom - el.top + "px");
            }
        }
        function clearHighlight(highlights){
            var i;
           if(Array.isArray(highlights)){
               for(i = 0; i < highlights.length; i++ ){
                   highlights[i].getElement().style.setProperty("width", "0px");
                   highlights[i].getElement().style.setProperty("height", "0px");
                   highlights[i].getElement().classList.remove('vc-horizontal');
                   highlights[i].getElement().classList.remove('vc-vertical');
               }
           }else{
                highlights.getElement().style.setProperty("width", "0px");
                highlights.getElement().style.setProperty("height", "0px");
                highlights.getElement().classList.remove('vc-horizontal');
                highlights.getElement().classList.remove('vc-vertical');
           }
        }
        function setContext(){
            var currentTimeFloor = evt.getParam("timestamp");
            var currentVideo = evt.getParam('videoName');
            var functionsMemory = cmp.get('v.functionsMemory')[currentVideo];
            var functionToCall;
            if(functionsMemory){
                for(var key in functionsMemory){
                    if(currentTimeFloor > key){
                        functionToCall = functionsMemory[key];
                    }
                }
                if(typeof functionToCall === 'function'){
                    functionToCall(cmp,evt,helper);
                }
            } 
        }
	},
    
    handleVCPlay: function(cmp, evt, helper){
        var vcPlay = evt.getParam("videoPlay");
        var vcEnd = evt.getParam("videoEnd");
        var vcPause = false;
        var isModal = evt.getParam("isModal");
        var currentTimeFloor = evt.getParam("timestamp");
        if(vcPlay){
            cmp.set('v.vcInUse',true);
        }
        if(!vcPlay && !vcEnd){
            vcPause = true;
            cmp.set('v.vcInUse',false);
        }
        if(vcEnd){
            cmp.set('v.vcInUse',false);
        }
        var videoName = evt.getParam('videoName');
        var vc = cmp.find('vc');
        cmp.set('v.vcPlay',evt.getParam("videoPlay"));
        
        var action;
        var section;
        if(vcPlay) {
            action = 'Play';
            section = currentTimeFloor;
        }
        if(vcPause){ 
            action = 'Pause';
            section = currentTimeFloor
        }
        if(vcEnd) {
            action = 'Complete';
            section = '';
        }
        
        
        helper.createRecipeActivity(cmp,{action: action, video: videoName, isModal: isModal, feature:'Virtual Consultant', section: section, recipe: evt.getParam('recipe')});     
        
        
        if(evt.getParam("videoEnd") && cmp.get('v.vcModalVideos')[videoName] && !isModal){
            window.setTimeout(
            $A.getCallback(function() {
                    //cmp.find('main-grid').getElement().style.opacity = 0.1;
                    document.getElementById('main-grid').style.opacity = 0.1;
                }), 100
            );
            
            vc.launchModal(cmp.get('v.vcModalVideos')[videoName][0],
                          cmp.get('v.vcModalVideos')[videoName][1],
                          cmp.get('v.vcModalVideos')[videoName][2],
                          150,950);
        }
    },
    
    handleModal: function(cmp,evt,helper){
        var vc = cmp.find('vc');
        var videoName = evt.getParam('videoName');
        //cmp.find('main-grid').getElement().style.opacity = 1;
        var videoEnd = evt.getParam("videoEnd");
        var modalClosed = evt.getParam("modalClosed");
        if (modalClosed){
            document.getElementById('main-grid').style.opacity = 1;
            vc.changeVideo(cmp.get('v.vcVideos')[videoName],
                                 videoName,
                                cmp.get('v.highlightTimestampsMap')[videoName],
                          null,null,null,true);
        }
        if (videoEnd){
            vc.closeModal();
            /*document.getElementById('main-grid').style.opacity = 1;
            vc.changeVideo(cmp.get('v.vcVideos')[videoName],
                                 videoName,
                                cmp.get('v.highlightTimestampsMap')[videoName]);*/
        }
    },
    
    createRecipeActivity: function(cmp,activity){
        activity.recordIdentifier = cmp.get('v.oauthRecordIdentifier');
        console.log('createRecipeActivity',activity);
    	var action = cmp.get('c.createRecipeActivity');
        action.setParams({ activityString : JSON.stringify(activity) });
        action.setCallback(this, function(res) {
          var state = res.getState();
          if (state === 'SUCCESS') {
              console.log('Activity Logged');
          }
        });
        $A.enqueueAction(action);
	},
    
    getUrlSessionInfo: function (cmp, evt, helper) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Fetching Salesforce Authentication Info ...');
        var action = cmp.get('c.getUrlSessionInfoMethod');
        action.setParams({recordIdentifier: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getUrlSessionInfoApex: ',res.getReturnValue());            
            if (state === 'SUCCESS') {
                if(res.getReturnValue()){
                	cmp.set('v.sfUrl',res.getReturnValue()[0]);
                	cmp.set('v.sfSessionId',res.getReturnValue()[1]);
                    //if(cmp.get('v.orgId')){
                        cmp.set('v.orgId',res.getReturnValue()[2]);
                    //}
                }
                cmp.set('v.isProcessing',false);
                window.scrollTo(0, 0, 'smooth');
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get authentication information for Salesforce');
                    }
                    if(errors[0].message == 'Unknown'){
                        cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                    }
                    
                } else {
                    console.error('Unknown Error occurred');
                    cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                }
                cmp.set('v.showError',true);
                cmp.find('toast').set('v.type','error');
                cmp.find('nextButton').set('v.disabled','true');
                cmp.set('v.isProcessing',false);
            }
            
        });
        $A.enqueueAction(action);
    },
    
    createDeskMigration: function (cmp, evt, helper,type) {
        cmp.set('v.isProcessing',true);
        cmp.set('v.processingMessage','Creating Migration Config ...');
        var action = cmp.get('c.createDeskMigrationApex');
        action.setParams({type: type, deskEndPoint:cmp.get('v.deskEndPoint'), recordIdentifier: cmp.get('v.oauthRecordIdentifier')});
        action.setCallback(this, function(res) {
            var state = res.getState();
            console.log('getUrlSessionInfoApex: ',res.getReturnValue());            
            if (state === 'SUCCESS') {
                if(res.getReturnValue()){
                	cmp.set('v.deskMigrationId',res.getReturnValue());
                }
                cmp.set('v.isProcessing',false);
            } else if (state === 'ERROR') {
                var errors = res.getError();
                console.log('errors: ',errors);
                if (errors && errors.length > 0) {
                    if(errors[0].message == 'Unauthorized'){
                        cmp.set('v.errorMessage','Unable to access Salesforce');
                    }if(errors[0].message == 'Failed'){
                        cmp.set('v.errorMessage','Failed to get authentication information for Salesforce');
                    }
                    if(errors[0].message == 'Unknown'){
                        cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                    }
                    
                } else {
                    console.error('Unknown Error occurred');
                    cmp.set('v.errorMessage','An error has occured. Contact support@desk.com');                        
                }
                cmp.set('v.showError',true);
                cmp.find('toast').set('v.type','error');
                cmp.find('nextButton').set('v.disabled','true');
                cmp.set('v.isProcessing',false);
            }
            
        });
        $A.enqueueAction(action);
    }
    
    
})