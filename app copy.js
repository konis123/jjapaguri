'use strict';

var os = require('os');
var nodeStatic = require('node-static');
//var socketIO = require('socket.io');
var express = require('express');
var app = express();
var http = require('http').createServer(app);

app.use(express.static('public'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

let roomID;
// app.get('/room/:roomId', function(req, res){
//   roomID = req.params.roomId;
//   console.log("roomID 나오나? "+roomID);
//   res.sendFile(__dirname + '/room.html');
// });
app.get('/room/', function(req, res){
  roomID = req.query.roomid;
  console.log("roomID 나오나? "+roomID);
  res.sendFile(__dirname + '/room.html');
});

http.listen(process.env.PORT||3000, function(){
  console.log('listening on *:3000');
});

let room_info = new Object();

var io = require('socket.io')(http);
const RTCMultiConnectionServer = require('rtcmulticonnection-server');
io.on('connection', function(socket) {
  var initiatorChannel = '';
    if (!io.isConnected) {
        io.isConnected = true;
    }

    socket.on('new-channel', function (data) {
        if (!channels[data.channel]) {
            initiatorChannel = data.channel;
        }

        channels[data.channel] = data.channel;
        onNewNamespace(data.channel, data.sender);
    });

    socket.on('presence', function (channel) {
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
    });

    socket.on('disconnect', function (channel) {
        if (initiatorChannel) {
            delete channels[initiatorChannel];
        }
    });


});

function onNewNamespace(channel, sender) {
  io.of('/' + channel).on('connection', function (socket) {
      var username;
      if (io.isConnected) {
          io.isConnected = false;
          socket.emit('connect', true);
      }

      socket.on('message', function (data) {
          if (data.sender == sender) {
              if(!username) username = data.data.sender;
              
              socket.broadcast.emit('message', data.data);
          }
      });
      
      socket.on('disconnect', function() {
          if(username) {
              socket.broadcast.emit('user-left', username);
              username = null;
          }
      });
  });
}
