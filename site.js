
	


var express = require('express');
var app = express();
var server = require('http').Server(app);

var TIME = function() {
	var date = new Date();
	date.setHours(date.getUTCHours()+4);
	return date.getHours() + ':' + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
} 


console.log(TIME()+' : Сайт запущен');

var io = require('socket.io')(server,{});

var SOCKET_LIST = {};


io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	socket.on('aboutReady',function(){
		console.log('Пользователь зашел на сайт');
	})
});