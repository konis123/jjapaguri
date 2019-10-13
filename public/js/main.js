var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
//let remoteStream;

let localVideo = document.getElementById('localVideo');
let remoteVideo = document.getElementById('remoteVideo');

//let mediaRecorder;//mediastreamRecorder 사용시
let recorder;//recordRTC 사용시
//let blob;//recordRTC 사용시

var saveBtn = document.getElementById('start');
saveBtn.addEventListener("click",async ()=>{
    console.log('start click');
    //mediaRecorder.save();

    // var streamFromVideoTag = localVideo.captureStream(15); // 15 is frame-rates
    // recorder = RecordRTC(streamFromVideoTag, {type: 'video'});
    // recorder.startRecording();

    // recorder = new RecordRTCPromisesHandler(remoteStream, {
    //     type: 'video'
    // });
    //recorder.startRecording();

    // const sleep = m => new Promise(r => setTimeout(r, m));
    // await sleep(3000);

    // let options = {mimeType: 'video/webm;codecs=vp9'};
    // var mediaRecorder = new MediaRecorder(remoteStream, options);

    // recorder = new RecordRTC(remoteStream, {
    //     type: 'video',
    //     mimeType: 'video/webm',
    // });
    // await recorder.startRecording();
    // recorder.camera = await remoteStream;
})

var endBtn = document.getElementById('end');
endBtn.addEventListener("click", async ()=>{
    console.log('end click');

    // const sleep = m => new Promise(r => setTimeout(r, m));
    // await sleep(3000);

    // await recorder.stopRecording(function() {
    //     blob = recorder.getBlob();
    //     //invokeSaveAsDialog(blob);
    // });

    const sleep = m => new Promise(r => setTimeout(r, m));
    await sleep(3000);
    
    recorder.stopRecording(function() {
        let blob = recorder.getBlob();
        //invokeSaveAsDialog(blob);
    });

    recorder.save('tttt.mp4');
    // await recorder.stopRecording();
    // blob = await recorder.getBlob();
    // console.log(blob);
    // await invokeSaveAsDialog(blob);
    // await recorder.destroy();
    // recorder = null;

    //const blob = new Blob(recordedBlobs, {type: 'video/webm'});
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


});


var pcConfig = {
    'iceServers': [
        {url:'stun:stun.l.google.com:19302'},
        {urls:"turn:numb.viagenie.ca", credential:"muazkh",username:"webrtc@live.com"}
    ]};

var sdpConstraints = {
    offerToReceivaAudio: false,
    offerToReceiveVideo: true
};

localVideo.addEventListener("loadedmetadata", function(){
    console.log('left: goStream with width and height', localVideo.videoWidth, localVideo.videoHeight);
});

remoteVideo.addEventListener("loadedmetadata", function(){
    console.log("right goStream with width and height", remoteVideo.videoWidth, remoteVideo.videoHeight);
});

remoteVideo.addEventListener("resize", () => {
    console.log(`Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`);
});

var socket = io.connect();

socket.on('connect', () => {
    socket.emit("onCollabo", socket.id);
});

socket.on('collabo', (room) => {
    socket.emit("create or join", room);
    console.log("Attempted to create or join room", room);
});

// socket.on('ready', function() {
//     console.log('Socket is ready');
//     createPeerConnection();
// });

socket.on('created', (room) => {
    console.log("Created room " + room);
    isInitiator = true;
});

socket.on('full', (room) => {
    alert('Room ' + room + ' is full. We will create a new room for you.');
    window.location.hash = '';
    window.location.reload();
});

socket.on('join', (room) => {
    console.log("Another peer made a request to join room "+room);
    console.log("This peer is the initiator of room "+room + "!");
    isChannelReady = true;
});

socket.on('joined', (room) => {
    console.log("joined: "+room);
    isChannelReady = true;
});

socket.on('disconnect', () => {
    console.log('counterpart disconnected');
    isChannelReady = false;
    isStarted = false;
  });

socket.on('log', (array) => {
    console.log.apply(console, array);
});

function sendMessage(message){
    console.log("client sending message: ", message);
    socket.emit('message', message);
}

socket.on('message', (message) => {
    console.log("Client received message:", message);
    if(message === 'got user media'){
        maybeStart();
    }else if(message.type === 'offer'){
        if(!isInitiator && !isStarted){
            maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
    }else if(message.type === 'answer' && isStarted){
        pc.setRemoteDescription(new RTCSessionDescription(message));
    }else if(message.type === 'candidate' && isStarted){
        var candidate = new RTCIceCandidate({sdpMLineIndex: message.label, candidate: message.candidate});
        pc.addIceCandidate(candidate);
    }else if(message === 'bye' && isStarted){
        handleRemoteHangup();
    }
});

//RecordRTC 사용
var mediaConstraints = {
    //audio: true,
    video: true
};
navigator.mediaDevices.getUserMedia(mediaConstraints)
    .then(goStream).catch((e) => {
        alert("getUserMedia() error."+ e.name);
    });

function goStream(stream){
    console.log("adding local stream.");
    localStream = stream;
    localVideo.srcObject = stream;

    // recorder = new RecordRTCPromisesHandler(localStream, {
    //     type: 'video'
    // });
    // recorder.startRecording();

    sendMessage("got user media");
    if(isInitiator){
        maybeStart();
    }
}

var constraints = {
    video: true
};

console.log("Getting user media with constraints", constraints);

if(location.hostname !== 'localhost'){
    requestTurn("stun:stun.l.google.com:19302");
}

function maybeStart(){
    console.log(">>>maybeStart() ", isStarted, localStream, isChannelReady);
    if(!isStarted && typeof localStream !== 'undefined' && isChannelReady){
        console.log(">>>creating peer connection");
        createPeerConnection();
        pc.addStream(localStream);
        isStarted = true;
        console.log('isInitiator', isInitiator);
        if(isInitiator){
            doCall();
        }
    }
}

window.onbeforeunload = function(){
    //sendMessage('bye');
    socket.emit('bye', 'byebye');
};

function createPeerConnection(){
    try{
        pc = new RTCPeerConnection(pcConfig);
        pc.onicecandidate = handleIceCandidate;
        pc.onaddstream = handleRemoteStreamAdded;
        pc.onremovestream = handleRemoteStreamRemoved;
        console.log("Created RTCPeerConnection");
    }catch(e){
        console.log("failed to create peerconnection, exception: "+e.message);
        alert("cannot create rtcpeerconnection object");
        return;
    }
}

function handleIceCandidate(event){

    console.log("icecandidate event", event);
    if(event.candidate){
        sendMessage({type:'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
        });
    }else{
        console.log("end of candidates.");
    }

}

function handleCreateOfferError(event){
    console.log("createOffer() error.", event);
}

function doCall(){
    console.log("Sending offer to peer");
    pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer(){
    console.log("sending answer to peer.")
    pc.createAnswer().then(setLocalAndSendMessage, onCreateSessionDescriptionError);
}

function setLocalAndSendMessage(sessionDescripton){
    pc.setLocalDescription(sessionDescripton);
    console.log("setLocalandsendmessage sending message", sessionDescripton);
    sendMessage(sessionDescripton);
}

function onCreateSessionDescriptionError(error){
    trace("failed to create session desciption: "+error.toString());
}

function requestTurn(turnURL){
/////////////

}
//recordRTC 여기서 선언함!!!!!!!!!!!!!
function handleRemoteStreamAdded(event){
    console.log("remote stream added.");
    var remoteStream = event.stream;

    recorder = RecordRTC(remoteStream, {
        type: 'video'
    });
    recorder.startRecording();

    console.log(event);
    remoteVideo.srcObject = remoteStream;

}

function handleRemoteStreamRemoved(event){
    console.log("remote stream removed. event ", event);
}

function hangup(){
    console.log("hanging up.");
    stop();
    sendMessage('bye');
}

function handleRemoteHangup(){
    console.log("session terminated.");
    stop();
    isInitiator = false;
}

function stop(){
    isStarted = false;
    pc.close();
    pc = null;
}


