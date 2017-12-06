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

var Entity = function() {
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
	}
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x +=self.spdX;
		self.y +=self.spdY;
	}
	return self;
}
var Player = function(id){
	var self = Entity();
	self.id = id;
	self.number = "" + Math.floor(10 * Math.random());
	self.create = false;
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.maxSpd = 10;

	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();
	}

	self.updateSpd = function() {

		a=1;

		if (self.pressingRight && self.pressingUp)
			a=Math.pow(2,1/2)/2;
		else if (self.pressingRight && self.pressingDown) 
			a=Math.pow(2,1/2)/2;
		else if (self.pressingLeft && self.pressingUp)
			a=Math.pow(2,1/2)/2;
		else if (self.pressingLeft && self.pressingDown)
			a=Math.pow(2,1/2)/2;

		if (self.pressingRight)
			self.spdX = self.maxSpd*a;
		else if (self.pressingLeft)
			self.spdX = -self.maxSpd*a;
		else
			self.spdX = 0;
		if (self.pressingUp)
			self.spdY = -self.maxSpd*a;
		else if (self.pressingDown)
			self.spdY = self.maxSpd*a;
		else
			self.spdY = 0;
	};
	Player.list[id] = self;
	return self;
}
Player.list = {};

Player.onConnect = function(socket){
	console.log('Пользователь ' + socket.id + ' подключился.');
	var player = Player(socket.id);

	socket.on('createPlayer',function(data){
		player.create = data.flag;
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
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
}

Player.update = function(){
	var pack=[];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push({
			x:player.x,
			y:player.y,
			number:player.number,
			create:player.create
		});
	}
	return pack;
}

var io = require('socket.io')(server,{});


io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

		Player.onConnect(socket);
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
		console.log('Пользователь ' + socket.id + ' отключился.');
	});
	
});

setInterval(function(){
	var pack = Player.update();

	for (var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPosition',pack);
	}
},1000/25);