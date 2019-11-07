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

let roomid = document.getElementById('txt-roomid');

roomid.value = connection.token();

document.getElementById('btn-open-or-join-room').onclick = function(){
    this.disabled = true;
    console.log('aaa')
    connection.openOrJoin(roomid.value || 'predefined-roomid')
};

