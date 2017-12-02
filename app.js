var express = require('express');
var app = express();
var server = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/',express.static(__dirname + '/client'));

server.listen(80);

console.log('Сервер запущен.')

var SOCKET_LIST = {};
var PLAYER_LIST = {};


var Player = function(id){
	var self = {
		x:250,
		y:250,
		id:id,
		number:"" + Math.floor(10 * Math.random()),
		pressingRight:false,
		pressingLeft:false,
		pressingUp:false,
		pressingDown:false,
		maxSpd:10,
	};
	self.updatePosition = function(){

		a=1;
		if (self.pressingRight && self.pressingUp ||
			self.pressingRight && self.pressingDown ||
			self.pressingLeft  && self.pressingUp ||
			self.pressingLeft  && self.pressingDown ||
			self.pressingUp    && self.pressingRight ||
			self.pressingDown  && self.pressingRight ||
			self.pressingUp    && self.pressingLeft ||
			self.pressingDown  && self.pressingLeft)
			a=Math.pow(2,1/2)/2;

		if (self.pressingRight)
			self.x+=self.maxSpd*a;
		if (self.pressingLeft)
			self.x-=self.maxSpd*a;
		if (self.pressingUp)
			self.y-=self.maxSpd*a;
		if (self.pressingDown)
			self.y+=self.maxSpd*a;
	};
	return self;
}

var io = require('socket.io')(server,{});

io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;

	console.log('Пользователь ' + socket.id + ' подключился.');

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
		console.log('Пользователь ' + socket.id + ' отключился.');
	});

	socket.on('keyPress',function(data){
		if (data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
	});
});

setInterval(function(){
	var pack=[];
	for(var i in PLAYER_LIST){
		var player = PLAYER_LIST[i];
		player.updatePosition();
		pack.push({
			x:player.x,
			y:player.y,
			number:player.number
		});
	}
	for (var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPosition',pack);
	}
},1000/25);