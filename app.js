var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/',express.static(__dirname + '/client'));

serv.listen(80);


console.log('Сервер запущен.')

var SOCKET_LIST = {};

var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	socket.x = 0;
	socket.y = 0;
	SOCKET_LIST[socket.id] = socket;
	console.log('Пользователь ' + socket.id + ' подключился.');
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		console.log('Пользователь ' + socket.id + ' отключился.')
	});
});

setInterval(function(){
	var pack=[];
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		pack.push({
			x:socket.x++,
			y:socket.y++
		});
	}
	for (var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPosition',pack);
	}
},1000/25);