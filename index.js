var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('chat_message', function (msg) {
    io.emit('chat_message', msg);
    console.log(msg)
  });
});


http.listen(port, function () {
  console.log('listening on *:' + port);
});


var numUsers = 0;

//every connection
io.on('connection', (socket) => {
  console.log('New user connected')
  var addedUser = false;
  //default username
  socket.username = "Anonymous"

  //change username
  socket.on('change_username', (data) => {
    socket.username = data.username
    console.log(socket.username)
  })

  //new message
  socket.on('new_message', (data) => {
    //broadcasting the new message
    io.sockets.emit('new_message', { message: data.message, username: socket.username });
  })

  //typing
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', { username: socket.username })
  })
  //adding connected new usernames
  socket.on('add user', (username) => {
    if (addedUser) return;

    // storing username
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    })

    //global connection
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
    console.log(numUsers);
  })
  
})