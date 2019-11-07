let connection = new RTCMultiConnection();
// var request = require('request');

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
        localVideosContainer.appendChild(video)
    }

    if(event.type === 'remote' && !flag){
        flag = false;
        remoteVideosContainer.appendChild(video)
    }

};

let roomid = document.getElementById('txt-roomid');

roomid.value = connection.token();

let flag = false;

document.getElementById('btn-open-or-join-room').onclick = async function(){

    const options = {
        uri:'http://google.com', 
        method: 'POST',
        form: {
          id: roomid.value,
        }
    }
    const flag = await request(options)

    this.disabled = true;
    connection.openOrJoin(roomid.value || 'predefiend-roomid')
};

