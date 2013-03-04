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
  });

  socket.on('message', function (data) {
    messages.push(data);
    console.log('receive: ' + data);
    socket.broadcast.emit('message', data);
  });

  messages.forEach(function(msg){
    socket.send(msg);
  });
});
