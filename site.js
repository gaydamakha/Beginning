var app = require('./app');

var io = app.io;

var SOCKET_LIST = app.SOCKET_LIST;

io.sockets.on('connection', function(socket){

	socket.on('aboutReady',function(){
		console.log(app.time+' : Пользователь зашел на сайт - '+socket.id);
	})

	socket.on('disconnect',function(){		

	});
	
});