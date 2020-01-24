({

    dragElement: function (cmp,event,helper) {
        var isFirefox = typeof InstallTrigger !== 'undefined';
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        var elmnt = document.getElementById("vc");
        var elmnt2 = document.getElementById("vid-wrapper");
        //var elmnt2 = document.getElementById("play-button-container");
        var elmnt3 = document.getElementById("custom-seekbar");
        var elmnt4 = document.getElementById("video-duration");
        /*if (document.getElementById("vc")) {
            document.getElementById("vc").onmousedown = dragMouseDown;
        } else {
             elmnt.onmousedown = dragMouseDown;
        }*/
        elmnt2.onmousedown = dragMouseDown;

     function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
       	document.onmousemove = elementDrag;
    }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    if(cmp.get('v.dragAllowed')){  
    	elmnt.style.top = (elmnt.style.top.replace('px','') - pos2) + "px";
    	elmnt.style.left = (elmnt.style.left.replace('px','') - pos1) + "px";
    }
    // set the element's new position:
    /*elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) - anchorLeft + "px";*/
    /*elmnt2.style.top = (elmnt2.offsetTop - pos2) + "px";
    elmnt2.style.left = (elmnt2.offsetLeft - pos1) + "px";  
    elmnt3.style.top = (elmnt3.offsetTop - pos2) + "px";
    elmnt3.style.left = (elmnt3.offsetLeft - pos1) + "px";
    elmnt4.style.top = (elmnt4.offsetTop - pos2) + "px";
    elmnt4.style.left = (elmnt4.offsetLeft - pos1) + "px"; */ 
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
    
      var vid = cmp.find("vid").getElement();
      var modalVid = cmp.find("modal-vid").getElement();
      vid.onended = function(){
          cmp.find("play-button-container").getElement().setAttribute("style","display:inline");
          cmp.find("custom-seekbar").getElement().setAttribute("style","display:none");
          cmp.find("video-duration").getElement().setAttribute("style","display:none");
          elmnt2.style.top = (elmnt.offsetTop + 55) + "px";
          elmnt2.style.left = (elmnt.offsetLeft + 60) + "px";
          
          
          if(!cmp.get('v.isModalShown')){
              var vcEvent = cmp.getEvent("vcEvent");
              vcEvent.setParams({"isVideoHighlight": true});
              vcEvent.setParams({"isVideoPlayPauseEnd": true});
              vcEvent.setParams({"timestamp": -1});
              vcEvent.setParams({"videoName": cmp.get('v.videoName')});
              vcEvent.setParams({"videoPlay": false});
              vcEvent.setParams({"videoEnd": true});
              vcEvent.setParams({"modalClosed": false});
              vcEvent.setParams({"isModal": false});
              vcEvent.setParams({"recipe": cmp.get('v.recipe')});
              vcEvent.fire();
          }else{
              //helper.closeVCModalHelper(cmp,event,helper);
              var vcEvent = cmp.getEvent("vcEvent");
              vcEvent.setParams({"isVideoPlayPauseEnd": true});
              vcEvent.setParams({"timestamp": -1});
              vcEvent.setParams({"videoName": cmp.get('v.videoName')});
              vcEvent.setParams({"videoPlay": false});
              vcEvent.setParams({"videoEnd": true});
              vcEvent.setParams({"isModal": true});
              vcEvent.setParams({"modalClosed": false});
              vcEvent.setParams({"recipe": cmp.get('v.recipe')});
              vcEvent.fire();
          }
          	
      }
        if(vid.paused){
            vid.play();
            cmp.set('v.vcPlay',true);
            if(cmp.get('v.isModalShown')){
                modalVid.play();
            }
            
            var vcEvent = cmp.getEvent("vcEvent"); 
            vcEvent.setParams({"isVideoPlayPauseEnd": true});
            vcEvent.setParams({"videoPlay": true});
            vcEvent.setParams({"videoName": cmp.get('v.videoName')});
            vcEvent.setParams({"videoEnd": false});
            vcEvent.setParams({"isModal": cmp.get('v.isModalShown')});
            vcEvent.setParams({"timestamp": Math.floor(vid.currentTime)});
            vcEvent.setParams({"recipe": cmp.get('v.recipe')});
            vcEvent.fire();
            
            if(vid.duration){
                cmp.set('v.videoDuration',Math.floor(vid.duration/60)+':'+Math.round(vid.duration%60));
            }
            cmp.find("play-button-container").getElement().setAttribute("style","display:none");
            cmp.find("custom-seekbar").getElement().setAttribute("style","display:inline");
            cmp.find("video-duration").getElement().setAttribute("style","display:inline");
            
            var lastTime;
            vid.ontimeupdate = function(){
              var firedTimestampsExisting = new Set(cmp.get('v.firedTimestamps'));
              var highlights = cmp.get('v.hightlightTimestamps');
              var currentTimeFloor = Math.floor(vid.currentTime);
              var vcEvent = cmp.getEvent("vcEvent");  
              if(highlights && !$A.util.isEmpty(highlights[currentTimeFloor])){              
                  if(lastTime != currentTimeFloor){
                      lastTime = currentTimeFloor;
                      vcEvent.setParams({"isVideoHighlight": true});
                      vcEvent.setParams({"timestamp": currentTimeFloor});
                      vcEvent.setParams({"videoName": cmp.get('v.videoName')});
                      vcEvent.setParams({"recipe": cmp.get('v.recipe')});
                      vcEvent.fire();
                  }
              }
              var percentage = ( vid.currentTime / vid.duration ) * 100;
              if(!$A.util.isEmpty(cmp.find("custom-seekbar-span"))){
              	cmp.find("custom-seekbar-span").getElement().setAttribute("style","width:"+percentage+"%");
              }
              
            };
        }
        else{
            vid.pause();
            if(cmp.get('v.isModalShown')){
                modalVid.pause();
            }
            cmp.set('v.vcPlay',false);
            
            var vcEvent = cmp.getEvent("vcEvent"); 
            vcEvent.setParams({"isVideoPlayPauseEnd": true});
            vcEvent.setParams({"videoPlay": false});
            vcEvent.setParams({"videoName": cmp.get('v.videoName')});
            vcEvent.setParams({"videoEnd": false});
            vcEvent.setParams({"isModal": cmp.get('v.isModalShown')});
            vcEvent.setParams({"timestamp": Math.floor(vid.currentTime)});
            vcEvent.setParams({"recipe": cmp.get('v.recipe')});
            vcEvent.fire();
            
            //cmp.find('vc').getElement().style.position = 'static';
            cmp.find("play-button-container").getElement().setAttribute("style","display:inline");
            cmp.find("custom-seekbar").getElement().setAttribute("style","display:none");
            cmp.find("video-duration").getElement().setAttribute("style","display:none");
            
            
            if(navigator.userAgent.search("Firefox") > 0){
                //firefox hack
            	cmp.find('vc').getElement().style.position = 'static';
                cmp.find('vc').getElement().style.display = 'none';
                window.setTimeout(
                    $A.getCallback(function() {
                        cmp.find('vc').getElement().style.display = 'inline';
                        cmp.find('vc').getElement().style.position = 'relative';
                    }), 1
                );
            }else{
                //cmp.find('vc').getElement().style.position = 'static';
            }
            
            
            
            
        }
        /*elmnt2.style.top = (elmnt.offsetTop + 55) + "px";
        elmnt2.style.left = (elmnt.offsetLeft + 60) + "px";
      	elmnt3.style.top = (elmnt.offsetTop + 160) + "px";
        elmnt3.style.left = (elmnt.offsetLeft + 0) + "px";
        elmnt4.style.top = (elmnt.offsetTop + 172) + "px";
        elmnt4.style.left = (elmnt.offsetLeft + 0) + "px";*/
      
  	}
  },
    
    closeModalHelper: function(cmp,event,helper){
        cmp.set('v.isModalShown',false);
        
        cmp.find('vc-modal-window').getElement().style.opacity = 0;
        cmp.find('vc-modal-window').getElement().style.display = 'none';
        cmp.find('modal-vid-source').getElement().setAttribute('src','');
        cmp.find('modal-vid').getElement().setAttribute('style','display:none');
        //var modalVid = cmp.find("modal-vid").getElement();
        //modalVid.load();
        
        cmp.find('vc').getElement().setAttribute('style','display:none');
        cmp.find('custom-seekbar').getElement().setAttribute('style','display:none');
        cmp.find('video-duration').getElement().setAttribute('style','display:none');
        cmp.find('vid-source').getElement().setAttribute('src',cmp.get('v.videoSource'));
        
        
        var vcEvent = cmp.getEvent("vcEvent");
        vcEvent.setParams({"isModal": true});
        vcEvent.setParams({"videoName": cmp.get('v.videoName')});
        vcEvent.setParams({"modalClosed": true});
        vcEvent.setParams({"recipe": cmp.get('v.recipe')});
        vcEvent.fire();
        
        /*var vid = cmp.find("vid").getElement();
        vid.onloadeddata = function(){
        	cmp.find('vc').getElement().setAttribute('style','display:inline');
            if (cmp.get('v.offsetTop') == -1){
            	cmp.find('vc').getElement().style.top = "150px";
            }else{
                cmp.find('vc').getElement().style.top = cmp.get('v.offsetTop') +'px';
            }
            if (cmp.get('v.offsetLeft') == -1){
            	cmp.find('vc').getElement().style.left = "950px";
            }else{
                cmp.find('vc').getElement().style.left = cmp.get('v.offsetLeft') +'px';
            }
            cmp.find('vc').getElement().style.position = 'relative';
            cmp.find("play-button-container").getElement().setAttribute("style","display:inline");
        }
        vid.load();*/
    }
})