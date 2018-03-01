var express = require('express');
var app = express();
var server = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/',express.static(__dirname + '/client'));

server.listen(80);

var io = require('socket.io')(server,{});

console.log('Сервер запущен :)')

var SOCKET_LIST = {};

var Entity = function() {
	var self = {
		x:0,
		y:0,
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



var Player = function(id,name){
	var self = Entity();
	self.x = 0;
	self.y = 0;
	self.id = id;
	self.name = name;
	self.health = 100;
	self.size = 50;
	self.startSize = self.size;
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack=false;
	self.mouseAngle=0;
	self.maxSpd = 10;
	self.color = Tools.generateColor();
	self.bulletColor = Tools.generateColor();


	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();

		if(self.pressingAttack){
			var b=Bullet(self.id);
			b.x=self.x;
			b.y=self.y;
			self.pressingAttack = false;
		}
		if (self.health <= 0) {
			Player.onDisconnect(self.id);
			var socket = SOCKET_LIST[self.id];
			socket.emit('restart');
		}
	}

	self.hit = function(){
		self.health-=10;
		self.size=5+(self.health/100)*(self.startSize-5)
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

Player.onConnect = function(socket,name){
	console.log('Пользователь ' + socket.id + ' подключился.');
	var player = Player(socket.id,name);
	socket.on('mousePosition',function(data){
		var x = data.x;
		var y = data.y; 
		// var x = data.x - player.x;
		// var y = data.y - player.y; 
		player.mouseAngle = Math.atan2(y,x)/Math.PI * 180;
	})
	socket.on('keyPress',function(data){
		if (data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack=data.state;
	});
}

Player.onDisconnect = function(id){
	delete Player.list[id];
}

Player.update = function(){
	var pack=[];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push({
			id:player.id,
			x:player.x,
			y:player.y,
			name:player.name,
			health:player.health,
			size:player.size,
			color:player.color
		});
	}
	return pack;
}

var Bullet = function(parentId){
	var self = Entity();
	self.id=Math.random();
	self.size = 8;
	self.maxSpd = 20;
	self.angle = Player.list[parentId].mouseAngle;
	self.spdX=Math.cos(self.angle/180*Math.PI) * self.maxSpd;
	self.spdY=Math.sin(self.angle/180*Math.PI) * self.maxSpd;
	self.color = Player.list[parentId].bulletColor;

	self.timer = 0;
	self.toRemove = false;

	var super_update=self.update;
	self.update=function(){

		if (self.timer++ > 50)	{
			self.toRemove = true;
		}

		if (self.toRemove){
			self.delete();
		}

		super_update();

		for(var i in Player.list){
			var player = Player.list[i];
			var distance = Math.sqrt(Math.pow(player.x-self.x,2)+Math.pow(player.y-self.y,2))<player.size+self.size;
			if (parentId !== player.id && distance) {
				self.delete();
				player.hit();
			}
		}
	}
	self.delete = function(){
		delete Bullet.list[self.id];
	}
	Bullet.list[self.id]=self;
	return self;
}

Bullet.list = {};

Bullet.update = function(){
	var pack=[];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();
		pack.push({
			x:bullet.x,
			y:bullet.y,
			color:bullet.color,
			size:bullet.size
		});
	}
	return pack;
}


io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	socket.on('createPlayer',function(data){
		Player.onConnect(socket,data.name);
		socket.emit('getId',{selfId:socket.id});
	});
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket.id);
		console.log('Пользователь ' + socket.id + ' отключился.');
	});
	
});

setInterval(function(){
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
	}

	for (var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPosition',pack);
	}
},30);


var Tools = {
	generateColor: function(){
		return '#' + Math.floor(Math.random()*16777215).toString(16);
	},
	getRandomInt: function(min,max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
};