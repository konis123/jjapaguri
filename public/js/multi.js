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
let stream;
connection.onstream = function(event){
    videoTag = event.mediaElement;
    stream = event.stream;
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

    recorder = new RecordRTC(stream, {
        type: 'video',
        mimeType: 'video/webm',
    });
    await recorder.startRecording();
    recorder.camera = await stream;
    


})

var endBtn = document.getElementById('end');
endBtn.addEventListener("click", async ()=>{
    console.log('end click');
    
    recorder.stopRecording(function() {
        let blob = recorder.getBlob();
        invokeSaveAsDialog(blob,'test.mp4');
    });


    // const blob = new Blob(recordedBlobs, {type: 'video/webm'});
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.style = 'display: none';
    // a.href = url;
    // a.download = 'test.webm';
    // document.body.appendChild(a);
    // a.click();
    // setTimeout(() => {
    //   document.body.removeChild(a);
    //   window.URL.revokeObjectURL(url);
    // }, 100);

    // get recorded blob
    var blob = recorder.getBlob();
    // generating a random file name
    var fileName = 'test.mp4';
    console.log(1);
    // we need to upload "File" --- not "Blob"
    var fileObject = new File([blob], fileName, {
        type: 'video/mp4'
    });
    console.log(2);
    var formData = new FormData();
    // recorded data
    await formData.append('video-blob', fileObject);
    // file name
    await formData.append('video-filename', fileObject.name);
    
    var upload_url = 'http://ec2-15-164-228-137.ap-northeast-2.compute.amazonaws.com/efspoint/videos/';
    
    console.log(3);
    // upload using jQuery
    $.ajax({
        url: upload_url, // replace with your own server URL
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        crossOrigin: true,
        type: 'POST',
        success: function(response) {
            alert('업로드 성공!'); // error/failure
        }
    });

});