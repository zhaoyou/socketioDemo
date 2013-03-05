var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8888);

var messages = [];
var onlinelist = [];

function handler (req, res) {
  fs.readFile(__dirname + '/chat.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
};

io.sockets.on('connection', function (socket) {


  // save client session info.
  socket.on('storeclient', function(data){
    onlinelist.push({
      'userId': data.userId,
      'clientId': socket.id
    });

    // send for other online userlist.
    io.sockets.emit("onlineuser", onlinelist);

    // send to self online userlist.
  //  socket.emit("onlineuser", onlinelist);
  });

  socket.on('message', function (data) {
    console.log('data.to',  data.to, data.msg);
    var message = {
      'sender': getUserId(socket.id),
      'msg': data.msg
    };
    if (data.to == 'all') {
      messages.push(message);
      socket.broadcast.emit('message', message);
      console.log('from user message', message);
    } else {
      io.sockets.socket[getClientId(data.to)].emit('message', message);
    }
    console.log('receive: ' + data);
  });


  socket.on('disconnect', function() {
    var userId = '';
    for (var i = 0; i < onlinelist.length; i++) {
      var client = onlinelist[i];
      if (client.clientId == socket.id) {
        userId = client.userId;
        onlinelist.splice(i, 1);
      }
    }
    console.log("user disconnect", userId);
    socket.broadcast.emit("onlineuser", onlinelist);
  });

  messages.forEach(function(msg){
    socket.emit('message', msg);
  });

});

function getClientId(userId) {
  for (var i = 0; i < onlinelist.length; i++) {
    if (onlinelist[i].userId == userId) {
      return onlinelist[i].clientId;
    }
  }
}

function getUserId(clientId) {
  for (var j = 0; j < onlinelist.length; j++) {
    if (onlinelist[j].clientId == clientId) {
      console.log(clientId, onlinelist[j].userId);
      return onlinelist[j].userId;
    }
  }
}
