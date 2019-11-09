let connection = new RTCMultiConnection();
//var request = require('request');

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
let videoTag;
connection.onstream = function(event){
    videoTag = event.mediaElement;

    if(event.type === 'local' && flag){
        localVideosContainer.appendChild(videoTag)
    }

    if(event.type === 'remote' && !flag){
        flag = false;
        remoteVideosContainer.appendChild(videoTag)
        console.log(videoTag.id+'---------------')
    }

};

let roomid = document.getElementById('txt-roomid');

roomid.value = connection.token();

let flag = false;

document.getElementById('btn-open-or-join-room').onclick = async function(){

    // const options = {
    //     uri:'http://ec2-15-164-224-142.ap-northeast-2.compute.amazonaws.com:8000/room/test', 
    //     method: 'POST',
    //     form: {
    //       id: roomid.value,
    //     }
    // }

    // const response = await request('http://ec2-15-164-224-142.ap-northeast-2.compute.amazonaws.com:8000/room/'+roomid.value, function (error, response, body) {
    //     //callback
    // });
    // flag = response.result;

    $.get("https://jjapaguri.herokuapp.com/room/"+roomid.value, function(data){
        // flag = response.result;
        flag = data
        console.log(flag)
      });
    
    this.disabled = true;
    connection.openOrJoin(roomid.value || 'predefiend-roomid')
};


//스타트, 엔드 버튼-----------
var saveBtn = document.getElementById('start');
saveBtn.addEventListener("click", async ()=>{
    console.log('start click');
    //mediaRecorder.save();

    // if(remoteStream !== undefined){
    //     var streamFromVideoTag = remoteVideo.captureStream(15); // 15 is frame-rates
    //     recorder = RecordRTC(streamFromVideoTag, {type: 'video'});
    //     recorder.startRecording();
    // }else{
    //     console.log('recorder undefined')
    // }

    recorder = new RecordRTC(videoTag, {
        type: 'video',
        mimeType: 'video/webm',
    });
    await recorder.startRecording();
    recorder.camera = await remoteStream;
    
})

var endBtn = document.getElementById('end');
endBtn.addEventListener("click", async ()=>{
    console.log('end click');
    
    recorder.stopRecording(function() {
        let blob = recorder.getBlob();
        invokeSaveAsDialog(blob,'test.mp4');
    });


});