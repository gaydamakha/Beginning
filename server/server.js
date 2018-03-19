var express = require('express');
var path = require('path');
var https = require('https');
var http = require('http');
var app = express();
var fs = require('fs');
var game = require('./app');

LOCALHOST = true;
DEBUG = true;

if(!LOCALHOST){
    var options = {
        key: fs.readFileSync('/etc/ssl/ssl_sertificate1.key'),
        cert: fs.readFileSync('/etc/ssl/ssl_sertificate1.crt')
    };
    http.Server(app).listen(80);
    var server = https.Server(options, app).listen(443);

    app.use(requireHTTPS);
    app.get('/',function(req, res) {
        res.sendFile('/home/hoster/app/client/index.html');
    });
    app.get('/about',function(req, res) {
        res.sendFile('/home/hoster/app/client/about.html');
    });
    app.use('/',express.static('/home/hoster/app/client'));

}else{
    var server = http.Server(app).listen(80);

    app.get('/',function(req, res) {
        res.sendFile(path.join(__dirname, '../client', 'index.html'));
    });
    app.use('/',express.static(path.join(__dirname, '../client')));
}

console.log(TIME()+' : Сервер запущен.')

var io = require('socket.io')(server,{});

var SOCKET_LIST = {};

io.sockets.on('connection', function(socket){

    socket.id = Math.random();

    SOCKET_LIST[socket.id] = socket;

    socket.emit('drawMap',{map:game.Map});

    socket.on('createPlayer',function(data){
        socket.name = data.name;
        game.PlayerOnConnect(socket);
        var msg = socket.name + ' подключился.';
        log(msg);
    });

    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        game.PlayerOnDisconnect(socket.id);
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
        player:game.PlayerUpdate(),
        bullet:game.BulletUpdate(),
    }

    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('init',game.initPack);
        socket.emit('update',pack);
        socket.emit('remove',game.removePack);
    }
    game.initPack.player = [];
    game.initPack.bullet = [];
    game.removePack.player = [];
    game.removePack.bullet = [];
},30);

function log(data){
    console.log(TIME()+' : '+data);
    for(var i in SOCKET_LIST){
        SOCKET_LIST[i].emit('addToLog',{date:TIME(),log:data});
    }
}
function TIME() {
    var date = new Date();
    date.setHours(date.getUTCHours()+4);
    return date.getHours() + ':' + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
}
function requireHTTPS(req, res, next) {
    if (!req.secure) {
        //FYI this should work for local development as well
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}