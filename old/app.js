var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/',express.static(__dirname + '/client'));

serv.listen(2000);

console.log('Сервер запущен.')

var SOCKET_LIST = {};

var Object = function() {
	var ctrl = {
		x  : 250,
		y  : 250,
		speedX:0,
		speedY:0,
		id : ""
	}

	ctrl.update = function(){
		ctrl.move();
	}
	ctrl.move = function() {
		ctrl.x+=ctrl.speedX;
		ctrl.y+=ctrl.speedY;
	}
	return ctrl;
}

var Player = function(id) {
	var ctrl = Object();
		ctrl.id = id;
		ctrl.name = "None_"+id
		ctrl.moveRight=false;
		ctrl.moveLeft=false;
		ctrl.moveUp=false;
		ctrl.moveDown=false;
		ctrl.btnAttack = false;
		ctrl.mouseAngle = 0;
		ctrl.speedAttack = 20;
		ctrl.timer = ctrl.speedAttack;
		ctrl.speed = 8;
	

	var super_update = ctrl.update;

	ctrl.update = function(){
		ctrl.updateSpeed();
		super_update();
		if (ctrl.timer !== ctrl.speedAttack){
			ctrl.timer++;
		}

		if (ctrl.btnAttack) {
			if (ctrl.timer === ctrl.speedAttack) {				
				ctrl.shootShell(ctrl.mouseAngle);
				ctrl.timer  = 0;
			} 		
		}	
	}
	ctrl.shootShell = function(angle){


		var s = Shell(angle);
		s.x = ctrl.x;
		s.y = ctrl.y;
	}

	ctrl.updateSpeed = function() {
		if(ctrl.moveRight) 		ctrl.speedX=ctrl.speed;
		else if(ctrl.moveLeft)	ctrl.speedX=-ctrl.speed;
		else 					ctrl.speedX = 0;

		if(ctrl.moveUp)			ctrl.speedY=-ctrl.speed;
		else if(ctrl.moveDown)	ctrl.speedY=+ctrl.speed;
		else 					ctrl.speedY = 0;
		
		
	}
	Player.list[id] = ctrl;
	return ctrl;
}

Player.list ={};

Player.onConnect = function(socket) {
	var player = Player(socket.id);	
	console.log('Подключился пользователь '+socket.id);

	socket.emit('pushName',player.name)
	socket.on('getName',function(data){
		player.name = ""+data;
		socket.emit('pushName',player.name)
	})
	socket.on('mousePosition',function(data){
		var x = data.x - player.x;
		var y = data.y - player.y; 
		player.mouseAngle = Math.atan2(y,x);
	})
	socket.on('keyPress',function(data){
        if(data.inputId === 'left')
            player.moveLeft = data.state;
        else if(data.inputId === 'right')
            player.moveRight = data.state;
        else if(data.inputId === 'up')
            player.moveUp = data.state;
        else if(data.inputId === 'down')
            player.moveDown = data.state;
        else if(data.inputId === 'leftBtn')
            player.btnAttack = data.state;
        // else if(data.inputId === 'mouseAngle')
        //     player.mouseAngle = data.state;
    });
	socket.on('sendMsgToServer',function(data) {
		for (var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',player.name + ': '+data);
		}
	});
}
Player.update = function(){	
	var pack =[];
	for (var i in Player.list) {
		var player = Player.list[i];
		player.update();
		pack.push({
			x:player.x,
			y:player.y,
			id:player.id,
			name:player.name,
			mouseAngle:player.mouseAngle,
		});
	}
	return pack;
}
Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
}





var Shell = function(angle) {
	var ctrl = Object();
	ctrl.id = Math.floor(Math.random()*10000);
	ctrl.speed = 20;
	ctrl.speedX = Math.cos(angle)*ctrl.speed;
	ctrl.speedY = Math.sin(angle)*ctrl.speed;

	ctrl.timer = 0;
	ctrl.toRemove = false;
	var super_update = ctrl.update;
	ctrl.update = function(){
		if (ctrl.timer++ > 100)
			ctrl.toRemove = true;
		super_update();
	}
	Shell.list[ctrl.id] = ctrl;
	return ctrl;
}
Shell.list = {};

Shell.update = function() {
	var pack =[];
	for (var i in Shell.list) {
		var shell = Shell.list[i];
		shell.update();
		pack.push({
			x:shell.x,
			y:shell.y,
		});
	}
	return pack;
}




var DEBUG = true;

var io = require('socket.io')(serv,{});
io.sockets.on('connection',function(socket) {

	socket.id = Math.floor(Math.random()*10000);
	SOCKET_LIST[socket.id] = socket;
	
	Player.onConnect(socket);

	socket.on('disconnect',function() {
		delete SOCKET_LIST[socket.id];	
		Player.onDisconnect(socket);		
		console.log('Пользлватель '+socket.id+' отключился');
	});

	// socket.on('sendMsgToServer',function(data) {
	// 	var playerName = ""+socket.id;
	// 	for (var i in SOCKET_LIST){
	// 		SOCKET_LIST[i].emit('addToChat',playerName + ': '+data);
	// 	}
	// });
	socket.on('evalServer',function(data) {
		if (!DEBUG) {
			return;
		}
		var res = eval(data);
		socket.emit('evalAnswer',res);
	});

   
});

setInterval(function() {
	var pack = {
		player : Player.update(),
		shell  : Shell.update(),
	}
	for (var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions',pack);
	}

},1000/40);