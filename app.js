var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/',express.static(__dirname + '/client'));

serv.listen(3000);

console.log('Сервер запущен.')

var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket){
	console.log('Пользователь подключился.');
})