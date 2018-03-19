var express = require('express');
var https = require('https');
var http = require('http');
var app = express();
var fs = require('fs');
var func = require('./app');

var options = {
    key: fs.readFileSync('/etc/ssl/ssl_sertificate1.key'),
    cert: fs.readFileSync('/etc/ssl/ssl_sertificate1.crt')
};

http.Server(app).listen(80);

var server = https.Server(options, app).listen(443);

var TIME = function() {
	var date = new Date();
	date.setHours(date.getUTCHours()+4);
	return date.getHours() + ':' + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
} 

console.log(TIME()+' : Сервер запущен.')

function requireHTTPS(req, res, next) {
    if (!req.secure) {
        //FYI this should work for local development as well
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

var io = require('socket.io')(server,{});


app.use(requireHTTPS);


app.get('/',function(req, res) {
	res.sendFile('/home/hoster/app/client/index.html');
});
app.get('/about',function(req, res) {
	res.sendFile('/home/hoster/app/client/about.html');
});
app.use('/',express.static('/home/hoster/app/client'));

var SOCKET_LIST = {};

var DEBUG = true;

var log = function(data){
	console.log(TIME()+' : '+data);
	for(var i in SOCKET_LIST){
		SOCKET_LIST[i].emit('addToLog',{date:TIME(),log:data});
	}
}

io.sockets.on('connection', function(socket){

	socket.id = Math.random();

	SOCKET_LIST[socket.id] = socket;

	socket.emit('drawMap',{map:func.Map});

	socket.on('createPlayer',function(data){
		socket.name = data.name;
		func.PlayerOnConnect(socket);		
		var msg = socket.name + ' подключился.';
		log(msg);
	});

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		func.PlayerOnDisconnect(socket.id);
		var msg = socket.name + ' отключился.';
		log(msg);

	});

	socket.on('sendMsgToServer',function(data){
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',{id:data.id,msg:data.msg});
		}
	});
	
	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		if (data === 'restart') {
			process.exit(5);
		}else{
			var res = eval(data);
			socket.emit('evalAnswer',res);	
		}
	});
});

setInterval(function(){
	var pack = {
		player:func.PlayerUpdate(),
		bullet:func.BulletUpdate(),
	}
	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',func.initPack);
		socket.emit('update',pack);
		socket.emit('remove',func.removePack);
	}
	func.initPack.player = [];
	func.initPack.bullet = [];
	func.removePack.player = [];
	func.removePack.bullet = [];
},30);