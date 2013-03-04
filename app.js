var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8888);

var messages = [];
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

  socket.on('message', function (data) {
    messages.push(data);
    console.log('receive: ' + data);
    socket.broadcast.emit('message', data);
  });

  messages.forEach(function(msg){
    socket.send(msg);
  });
});
