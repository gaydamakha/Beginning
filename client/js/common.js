$(document).ready(function(){

	//variables

	var area = document.getElementById('canvas');
	var areaCtx = area.getContext('2d');
	var socket = io();

	var miniMap = document.getElementById('miniMap');
	var miniMapCtx = miniMap.getContext('2d');	

	miniMap.width = 150;
	miniMap.height = 150;
	

	areaSize = function(){
	    area.width = $(window).width()-8;
	    area.height = $(window).height()-5;
	}
	areaSize();
	$(window).resize(areaSize);

	//images

	var Img = {};
	Img.map = new Image();
	Img.map.src = '/img/bg3_o2.png';



	//login

	var login = document.getElementById('login');
	var inputName = document.getElementById('inputName');
	var btnStart = document.getElementById('btnStart');

    login.onsubmit = function(e) {
		e.preventDefault();
		if (!inputName.value=="") {
			if (inputName.value.length > 16) {
				alert('Имя не должно превышать 16 символов');
				inputName.value = "";

			}
			else {
				socket.emit('createPlayer',{name:inputName.value})	
				login.parentNode.removeChild(login);
				$(".box-login, .box-game, #box-chat").toggle();
			}
		}
    }
    //restart
    restart.onsubmit = function(e) {
		e.preventDefault();

		socket.emit('createPlayer',{name:inputName.value})	

		$(".box-restart, .box-game").toggle();
    }
    socket.on('restart',function(){    	
		$(".box-restart, .box-game").toggle();
    });


    // Outpu chat and info
	var info = document.getElementById('box-chat');
	var chatInput = document.getElementById('chat-input');
	var chatOutput = document.getElementById('chat-output-ul');

	socket.on('addToChat',function(data){
		chatOutput.innerHTML += '<li><span>'+Player.list[data.id].name+ '</span> : '+ data.msg + '</li>';
        chatOutput.scrollTop = 9999;
        Player.list[data.id].setMsg(data.msg);
	});
	socket.on('evalAnswer',function(data){
		console.log(data);
	});

	socket.on('addToLog',function(data){
		chatOutput.innerHTML += '<li><span>'+data.date+ '</span> : '+ data.log + '</li>';
        chatOutput.scrollTop = 9999;
	});

    chat.onsubmit = function(e) {
		e.preventDefault();
		if(chatInput.value[0] === '/'){
			socket.emit('evalServer',chatInput.value.slice(1));
		}else if(chatInput.value.length > 40){	
			alert('Message must not exceed 16 characters!');
			chatInput.value = "";

		}else if(!chatInput.value == ''){
			socket.emit('sendMsgToServer',{id:selfId,msg:chatInput.value});
		}
		chatInput.value = '';
    }


    //game
	
	var Player = function(initPack){
		var self = {};
		self.id = initPack.id;
		self.x = initPack.x;
		self.y = initPack.y;
		self.size = initPack.size;
		self.name = initPack.name;
		self.color = initPack.color;
		self.msgTimmer = {
			d:500,
			value:500,
		};
		self.msg = '123';

		self.draw = function(){
			areaCtx.beginPath();
			areaCtx.fillStyle = ''+self.color;
			var x = self.x - Player.list[selfId].x + area.width/2;
			var y = self.y - Player.list[selfId].y + area.height/2;
			areaCtx.arc(x, y, self.size, 0, 2*Math.PI, false);
			areaCtx.fill();

			areaCtx.lineWidth = 2;
			areaCtx.strokeStyle = 'blue';
			areaCtx.stroke();

			areaCtx.fillStyle = 'black';
			areaCtx.font = '20px Exo_2';
			areaCtx.textAlign  = 'center';
			areaCtx.textBaseline   = 'bottom';
			areaCtx.fillText(self.name,x,y-50);


			if (self.msgTimmer.value++ < self.msgTimmer.d ) {
				self.printMsg(x,y);
			}

			self.drawInMiniMap();
		}
		self.setMsg = function(data){
			self.msg = data;
			self.msgTimmer.value = 0; 
		}
		self.printMsg = function(x,y){


			areaCtx.fillStyle = 'black';
			areaCtx.font = '20px Exo_2';
			areaCtx.textAlign  = 'center';
			areaCtx.textBaseline   = 'bottom';
			areaCtx.fillText(self.msg,x,y-70);



			console.log(self.msg);
		}
		self.drawInMiniMap = function(){
			miniMapCtx.beginPath();
			miniMapCtx.fillStyle = ''+self.color;
			var x = (self.x-Map.areaX) / (Map.areaW / miniMap.width );
			var y = (self.y-Map.areaY) / (Map.areaH / miniMap.height );
			miniMapCtx.arc(x, y, 4, 0, 2*Math.PI, false);
			miniMapCtx.fill();
		}
		Player.list[self.id] = self;
		
		return self;
	}

	Player.list = {};

		
	var Bullet = function(initPack){
		var self = {};
		self.id = initPack.id;
		self.x = initPack.x;
		self.y = initPack.y;
		self.color = initPack.color;
		self.size = initPack.size;

		self.draw = function(){			
			areaCtx.beginPath();
			areaCtx.fillStyle = ''+self.color;
			var x = self.x - Player.list[selfId].x +area.width/2;
			var y = self.y - Player.list[selfId].y +area.height/2;
			areaCtx.arc(x, y, self.size, 0, 2*Math.PI, false);
			areaCtx.fill();
		}
		
		Bullet.list[self.id] = self;		
		return self;
	}
	Bullet.list = {};
	
	var selfId = null;
    
	socket.on('init',function(data){
		if(data.selfId)
			selfId = data.selfId;	
		for(var i = 0 ; i < data.player.length; i++){
			new Player(data.player[i]);
		}
		for(var i = 0 ; i < data.bullet.length; i++){
			new Bullet(data.bullet[i]);
		}
	});
	
	socket.on('update',function(data){
		for(var i = 0 ; i < data.player.length; i++){
			var pack = data.player[i];
			var p = Player.list[pack.id];
			if(p){
				if(pack.x !== undefined)
					p.x = pack.x;
				if(pack.y !== undefined)
					p.y = pack.y;
				if(pack.size !== undefined)
					p.size = pack.size;
				if(pack.score !== undefined)
					p.score = pack.score;
			}
		}
		for(var i = 0 ; i < data.bullet.length; i++){
			var pack = data.bullet[i];
			var b = Bullet.list[data.bullet[i].id];
			if(b){
				if(pack.x !== undefined)
					b.x = pack.x;
				if(pack.y !== undefined)
					b.y = pack.y;
			}
		}
	});
	
	socket.on('remove',function(data){
		for(var i = 0 ; i < data.player.length; i++){
			delete Player.list[data.player[i]];
		}
		for(var i = 0 ; i < data.bullet.length; i++){
			delete Bullet.list[data.bullet[i]];
		}
	});
	
	setInterval(function(){
		if (!selfId) {
    		return;			
		}
		drawMap();
		printScore();
		for(var i in Player.list)
			Player.list[i].draw();
		for(var i in Bullet.list)
			Bullet.list[i].draw();
	},10);
	//score
	var printScore = function(){
		areaCtx.fillStyle = 'black';
		areaCtx.font = '40px Exo_2';
		areaCtx.textAlign  = 'left';
		areaCtx.textBaseline   = 'bottom';
		areaCtx.fillText(Player.list[selfId].score,20,60);
	}
	// map
	var Map = function(initMap) {
		var self = {};
		self.width = initMap.width;
		self.height = initMap.height;
		self.size = initMap.size;

		self.areaX = initMap.minX;
		self.areaY = initMap.minY;
		self.areaW = initMap.maxX-initMap.minX;
		self.areaH = initMap.maxY-initMap.minY;


		self.KX = self.width/Img.map.width;
		self.KY = self.height/Img.map.height;

		self.draw = function(){	
			// console.log('Рисуется карта');		
			var x = area.width/2 - Player.list[selfId].x;
			var y = area.height/2 - Player.list[selfId].y;
			for (i = 0; i < self.KX; i++){
				for(j = 0; j < self.KY; j++){
					areaCtx.drawImage(Img.map,x+Img.map.width*i,y+Img.map.height*j,Img.map.width,Img.map.height);
				}
			}
			areaCtx.lineWidth = 2;
			areaCtx.strokeStyle = 'blue';
			areaCtx.strokeRect(x+self.areaX,y+self.areaY,self.areaW,self.areaH);
		}	
		Map = self;	
		return self;
	}

	socket.on('drawMap',function(data){
		Map(data.map);
		//console.log('Карта принята');
	})
	var drawMap=function(){
		areaCtx.clearRect(0,0,area.width,area.height);
		miniMapCtx.clearRect(0,0,miniMap.width,miniMap.height);
		Map.draw();
	}


	//controls
	var control = true;
	area.onclick  = function(){	
		control = true;
	}

	info.onclick = function(){
		control = false;
	}	

	document.onkeydown = function(event){
		if (control) {
			if (event.keyCode === 68)
				socket.emit('keyPress',{inputId:'right',state:true});
			else if (event.keyCode === 83)
				socket.emit('keyPress',{inputId:'down',state:true});
			else if (event.keyCode === 65)
				socket.emit('keyPress',{inputId:'left',state:true});
			else if (event.keyCode === 87)
				socket.emit('keyPress',{inputId:'up',state:true});			
		}
	}
	document.onkeyup = function(event){
		if (control) {
			if (event.keyCode === 68)
				socket.emit('keyPress',{inputId:'right',state:false});
			else if (event.keyCode === 83)
				socket.emit('keyPress',{inputId:'down',state:false});
			else if (event.keyCode === 65)
				socket.emit('keyPress',{inputId:'left',state:false});
			else if (event.keyCode === 87)
				socket.emit('keyPress',{inputId:'up',state:false});			
		}
	}

	area.onmousedown=function(event){
		socket.emit('keyPress',{inputId:'attack',state:true});
	}
	area.onmouseup=function(event){
		socket.emit('keyPress',{inputId:'attack',state:false});
	}
	area.onmousemove=function(event) {
		var mouseX = event.clientX - area.getBoundingClientRect().left;
		var mouseY = event.clientY - area.getBoundingClientRect().top;
		mouseX -= area.width/2;
		mouseY -= area.height/2;
    	socket.emit('mousePosition',{x:mouseX,y:mouseY})

	}

	var toggle = function(){
		this.toggleClass('disabled');
	}


});

$(function() {
	//Chrome Smooth Scroll
	try {
		$.browserSelector();
		if($("html").hasClass("chrome")) {
			$.smoothScroll();
		}
	} catch(err) {

	};

	$("img, a").on("dragstart", function(event) { event.preventDefault(); });

		
});