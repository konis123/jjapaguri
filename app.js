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

app.get('/room/:roomId', function(req, res){
  res.sendFile(__dirname + '/room.html');
});

http.listen(process.env.PORT||3000, function(){
  console.log('listening on *:3000');
});

var io = require('socket.io')(http);
io.sockets.on('connection', function(socket) {
  /*
  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(message) {
    log('Client said: ', message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function(){
    console.log('received bye');
  });
  */
  ///////////////////////////////////////

  var room_info = 'foo';

  socket.on('message', function(message) {
    console.log('Client said: ', message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  socket.on('request', (room) => {
    socket.broadcast.emit("getRequest", room);
    room_info = room;
  });

  socket.on('response', (room, isGrant) => {
      if(isGrant){
          socket.broadcast.emit("getResponse", room, isGrant);
          socket.emit("enter", room);
      }else{
        console.log('방에 들어가는거 거절.');
      }
  });

  socket.on("onCollabo", (id) => {
      socket.emit("collabo", room_info);
  });

  socket.on("enter", (room, id) => {
      socket.emit("collabo", room);
      console.log("enter: " + room);
  });

  socket.on("connect", () => {
      socket.emit("onCollabo", socket.id);
  });

  socket.on("create or join", (room) => {
      console.log("received request to create or join room " + room);

      var clientsInRoom = io.sockets.adapter.rooms[room];
      var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
      console.log("Room "+room + "now has "+ numClients + " client(s)");

      if(numClients === 0){
          socket.join(room);
          console.log("client id: "+socket.id+" created room " + room);
          socket.emit('created', room, socket.id);
      }else if(numClients === 1){
          console.log("client id: "+socket.id+" created room " + room);
          io.sockets.in(room).emit("join", room);
          socket.join(room);
          socket.emit("joined", room, socket.id);
          io.sockets.in(room).emit("ready", room);
          socket.broadcast.emit("ready", room);            
      }else{
          socket.emit('full', room);
      }
  });


});
