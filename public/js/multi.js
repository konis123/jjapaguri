let connection = new RTCMultiConnection();

connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';//'localhost:3000'

connection.session = {
    audio: true,
    video: true
};

connection.sdpConstraints.mandatory = {
    offerToReceivaAudio: true,
    offerToReceiveVideo: true
};

var localVideosContainer = document.getElementById('local-videos-container')
var remoteVideosContainer = document.getElementById('remote-videos-container')
connection.onstream = function(event){
    var video = event.mediaElement;

    if(event.type === 'local' && flag){
        flag = false;
        localVideosContainer.appendChild(video)
    }

    if(event.type === 'remote'){
        remoteVideosContainer.appendChild(video)
    }

};

let roomid = document.getElementById('txt-roomid');

roomid.value = connection.token();

let flag = true;

document.getElementById('btn-open-or-join-room').onclick = function(){
    this.disabled = true;
    connection.openOrJoin(roomid.value || 'predefiend-roomid')
};

