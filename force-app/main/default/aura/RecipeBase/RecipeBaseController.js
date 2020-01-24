({
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
    }
})