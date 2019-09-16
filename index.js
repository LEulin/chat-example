var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
    console.log(msg)
  });
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});


var numUsers = 0;

//listen on every connection
io.on('connection', (socket) => {
  console.log('New user connected')
  var addedUser = false;
  //default username
  socket.username = "Undefined"

  //listen on change_username
  socket.on('change_username', (data) => {
    socket.username = data.username
    console.log(socket.username)
  })

  //listen on new_message
  socket.on('new_message', (data) => {
    //broadcast the new message
    io.sockets.emit('new_message', { message: data.message, username: socket.username });
  })

  //listen on typing
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', { username: socket.username })
  })

  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    })

    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
    console.log(numUsers);
  })
  
})