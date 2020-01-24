({
	afterRender : function(cmp, event, helper) {
        if(cmp.find('vc') && cmp.find('vid-container')){
      		helper.dragElement(cmp,event,helper);
    	}
        
	},

    seekbarClick: function(cmp,e,helper){
        var vid = cmp.find('vid').getElement();
        var customSeekbar = cmp.find('custom-seekbar').getElement();
        var anchorLeft = cmp.find('vc').getElement().offsetLeft;
        var left = (e.pageX - customSeekbar.offsetLeft - anchorLeft);
        var totalWidth = customSeekbar.offsetWidth;
        var percentage = ( left / totalWidth );
        var vidTime = vid.duration * percentage;
        var previousTime = vid.currentTime;
        vid.currentTime = vidTime;
		var currentTime = vid.currentTime;
        if(cmp.get('v.isModalShown')){
            var modalVid = cmp.find("modal-vid").getElement();
            modalVid.currentTime = modalVid.duration * percentage;
            currentTime = modalVid.duration * percentage;
        }
        var isModal = false;
        if(cmp.get('v.isModalShown')){
            isModal = true;
        }
        var vcEvent = cmp.getEvent("vcEvent");
        vcEvent.setParams({"isVideoHighlight": true});
        vcEvent.setParams({"timestamp": Math.floor(previousTime) + ' - ' + Math.floor(currentTime)});
        vcEvent.setParams({"videoName": cmp.get('v.videoName')});
        vcEvent.setParams({"seekbarClick": true});
        vcEvent.setParams({"isModal": isModal});
        vcEvent.setParams({"recipe": cmp.get('v.recipe')});
        vcEvent.fire();
        
    },
    
    changeVideo : function (cmp, event, helper) {
        if(cmp.find('vc')){
            cmp.find('vc').getElement().style.display = 'none';
            
            //cmp.find('custom-seekbar').getElement().setAttribute('style','display:none');
            //cmp.find('video-duration').getElement().setAttribute('style','display:none');
            var params = event.getParam('arguments');
            console.log('videosource', params.videoSource);
            cmp.find('vid-source').getElement().setAttribute('src',params.videoSource);
            cmp.set('v.videoName',params.videoName);
            cmp.set('v.videoSource',params.videoSource);
            cmp.set('v.hightlightTimestamps',params.highlightTimestamps);        
            var vid = cmp.find("vid").getElement();
            vid.onloadeddata = function(){
                cmp.find('vc').getElement().setAttribute('style','display:inline;');
                console.log('vc style: ',cmp.find('vc').getElement().style);
                if(!$A.util.isEmpty(params.offsetTop)){
                    cmp.find('vc').getElement().style.top = params.offsetTop +"px";
                    cmp.set('v.offsetTop',params.offsetTop);
                }else{
                    cmp.find('vc').getElement().style.top = "150px";
                    cmp.set('v.offsetTop',-1);
                }
                cmp.find('vc').getElement().style.position = 'relative';
                if(!$A.util.isEmpty(params.offsetLeft)){
                    cmp.find('vc').getElement().style.left = params.offsetLeft + "px";
                    cmp.set('v.offsetLeft',params.offsetLeft);
                }else{
                    cmp.find('vc').getElement().style.left = "950px";
                    cmp.set('v.offsetLeft',-1);
                }
                
                
                if(!$A.util.isEmpty(params.dragAllowed)){
                    cmp.set('v.dragAllowed',params.dragAllowed);
                }else{ 
                    cmp.set('v.dragAllowed',true);
                }
                //cmp.find("play-button-container").getElement().setAttribute("style","display:inline");
                if(vid.duration){
                    cmp.set('v.videoDuration',Math.floor(vid.duration/60)+':'+Math.round(vid.duration%60));
                }
                if(cmp.get('v.vcPlay') && !params.pauseVideo){
                    vid.play();
                    cmp.find("play-button-container").getElement().setAttribute("style","display:none");
                    cmp.find("custom-seekbar").getElement().setAttribute("style","display:inline");
                    cmp.find("video-duration").getElement().setAttribute("style","display:inline");
                    
                    var vcEvent = cmp.getEvent("vcEvent"); 
                    vcEvent.setParams({"isVideoPlayPauseEnd": true});
                    vcEvent.setParams({"videoPlay": true});
                    vcEvent.setParams({"videoName": cmp.get('v.videoName')});
                    vcEvent.setParams({"videoEnd": false});
                    vcEvent.setParams({"recipe": cmp.get('v.recipe')});
                    vcEvent.fire();
                }
                if(params.pauseVideo){
                   cmp.find("play-button-container").getElement().setAttribute("style","display:inline") 
                }
            }
            if(vid){
                vid.load();
            }
            
            var vcEvent = cmp.getEvent("vcEvent");
            vcEvent.setParams({"isVideoHighlight": true});
            vcEvent.setParams({"timestamp": -1});
            vcEvent.setParams({"videoName": cmp.get('v.videoName')});
            vcEvent.setParams({"recipe": cmp.get('v.recipe')});
            vcEvent.fire();
        }
        
    },
    
    closeModal: function (cmp,evt, helper){
        helper.closeModalHelper(cmp,evt,helper);
    },
    
    launchModal: function (cmp,event, helper){
        var modalVideoLoaded = false;
        var vcVideoLoaded = false;
        cmp.set('v.isLoading',true);
        cmp.set('v.isModalShown',true);
        cmp.find('vc').getElement().setAttribute('style','display:none');
        cmp.find('vc-modal-window').getElement().style.display = 'inline';
        var params = event.getParam('arguments');
        window.setTimeout(
            $A.getCallback(function() {
                cmp.find('vc-modal-window').getElement().style.opacity = 1;
                if(params.vcVideoTitle){
                	//cmp.find('vc-explain-title').getElement().innerHTML = params.vcVideoTitle;
                	document.getElementById('vc-explain-title').innerHTML = params.vcVideoTitle;
                }
            }), 100
        );

        
        cmp.find('modal-vid-source').getElement().setAttribute('src',params.modalVideoSource);
        cmp.find('vid-source').getElement().setAttribute('src',params.vcVideoSource);
        var modalVid = cmp.find("modal-vid").getElement();
        var vcVid = cmp.find("vid").getElement();
        modalVid.load();
        vcVid.load();
        modalVid.onloadeddata = function(){
            if (vcVid.readyState >= 2){
                playVideos();
            }
        }
        vcVid.onloadeddata = function(){
            cmp.set('v.videoDuration',Math.floor(vcVid.duration/60)+':'+Math.round(vcVid.duration%60));
            if (modalVid.readyState >= 2){
                playVideos();
            }
        }
		
        
        
        function playVideos(){
            cmp.set('v.isLoading',false);
            
            cmp.find('vc').getElement().setAttribute('style','display:inline');
            cmp.find('modal-vid').getElement().setAttribute('style','display:block');
            
            if ($A.util.isEmpty(params.offsetTop)){
            	cmp.find('vc').getElement().style.top = "150px";
            }else{
                cmp.find('vc').getElement().style.top = params.offsetTop +'px';
            }
            cmp.find('vc').getElement().style.position = 'relative';
            if ($A.util.isEmpty(params.offsetLeft)){
            	cmp.find('vc').getElement().style.left = "950px";
            }else{
                cmp.find('vc').getElement().style.left = params.offsetLeft +'px';
            }
            cmp.find("play-button-container").getElement().setAttribute("style","display:none");
            
            cmp.find("custom-seekbar").getElement().setAttribute("style","display:inline");
            cmp.find("video-duration").getElement().setAttribute("style","display:inline");
            cmp.set('v.hightlightTimestamps',null);
            
            vcVid.play();
            modalVid.play();
            
            var vcEvent = cmp.getEvent("vcEvent"); 
            vcEvent.setParams({"isVideoPlayPauseEnd": true});
            vcEvent.setParams({"videoPlay": true});
            vcEvent.setParams({"videoName": cmp.get('v.videoName')});
            vcEvent.setParams({"videoEnd": false});
            vcEvent.setParams({"isModal": true});
            vcEvent.setParams({"recipe": cmp.get('v.recipe')});
            vcEvent.fire();
        }
    }
})