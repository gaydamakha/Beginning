$(document).ready(function(){

	//variables

	var area = document.getElementById('canvas');
	var areaCtx = area.getContext('2d');
	var socket = io();
	var btnStart = document.getElementById('btnStart');

	var login = document.getElementById('login');
	var inputName = document.getElementById('inputName');

	areaSize = function(){
	    area.width = $(window).width()-8;
	    area.height = $(window).height()-5;
	}
	areaSize();
	$(window).resize(areaSize);

	//images

	var Img = {};
	Img.map = new Image();
	Img.map.src = 'https://avatanplus.com/files/resources/original/56f7f59ec2d95153b897744e.png';


	//login
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
				$(".box-login").css("display", "none");
			}
		}
    }
    //restart
    restart.onsubmit = function(e) {
		e.preventDefault();

		socket.emit('createPlayer',{name:inputName.value})	

		$(".box-restart").css("display", "none");
    }
    socket.on('restart',function(){    	
		$(".box-restart").css("display", "block");
    });

    //game
    var selfId = null;
    var id = null;
    socket.on('getId',function(data){
    	selfId = data.selfId;
    });
	socket.on('newPosition',function(data){
		areaCtx.clearRect(0,0,area.width,area.height);
		if (!selfId) {
    		return;			
		}
		for (var i=0; i<data.player.length;i++) {
			if (data.player[i].id === selfId) {
				id = i;
			}
		}
		// map start
		var x = area.width/2 - data.player[id].x;
		var y = area.height/2 - data.player[id].y;
		for (var i = 0; i < 3; i++) {
			for(var j = 0; j < 3; j++){
				areaCtx.drawImage(Img.map,x+Img.map.width*i,y+Img.map.height*j);
			}
		}
		// map finish
		for (var i=0; i<data.player.length;i++){
			areaCtx.beginPath();
			areaCtx.fillStyle = ''+data.player[i].color;
			var x = data.player[i].x - data.player[id].x +area.width/2;
			var y = data.player[i].y - data.player[id].y +area.height/2;
			areaCtx.arc(x, y, data.player[i].size, 0, 2*Math.PI, false);
			areaCtx.fill();

			areaCtx.lineWidth = 2;
			areaCtx.strokeStyle = 'blue';
			areaCtx.stroke();

			areaCtx.fillStyle = 'black';
			areaCtx.font = '20px Exo_2';
			areaCtx.textAlign  = 'center';
			areaCtx.textBaseline   = 'bottom';
			areaCtx.fillText(data.player[i].name,x,y-50);
		}; 

		for (var i=0; i<data.bullet.length;i++){
			areaCtx.beginPath();
			areaCtx.fillStyle = ''+data.bullet[i].color;
			var x = data.bullet[i].x - data.player[id].x +area.width/2;
			var y = data.bullet[i].y - data.player[id].y +area.height/2;
			areaCtx.arc(x, y, data.bullet[i].size, 0, 2*Math.PI, false);
			areaCtx.fill();
		}
	});

	//controls

	document.onkeydown = function(event){
		if (event.keyCode === 68)
			socket.emit('keyPress',{inputId:'right',state:true});
		else if (event.keyCode === 83)
			socket.emit('keyPress',{inputId:'down',state:true});
		else if (event.keyCode === 65)
			socket.emit('keyPress',{inputId:'left',state:true});
		else if (event.keyCode === 87)
			socket.emit('keyPress',{inputId:'up',state:true});
	};
	document.onkeyup = function(event){
		if (event.keyCode === 68)
			socket.emit('keyPress',{inputId:'right',state:false});
		else if (event.keyCode === 83)
			socket.emit('keyPress',{inputId:'down',state:false});
		else if (event.keyCode === 65)
			socket.emit('keyPress',{inputId:'left',state:false});
		else if (event.keyCode === 87)
			socket.emit('keyPress',{inputId:'up',state:false});
	};
	document.onmousedown=function(event){
		socket.emit('keyPress',{inputId:'attack',state:true});
	}
	document.onmouseup=function(event){
		socket.emit('keyPress',{inputId:'attack',state:false});
	}
	document.onmousemove=function(event) {
		var mouseX = event.clientX - area.getBoundingClientRect().left;
		var mouseY = event.clientY - area.getBoundingClientRect().top;
		mouseX -= area.width/2;
		mouseY -= area.height/2;
		console.log(mouseX+':'+mouseY);
    	socket.emit('mousePosition',{x:mouseX,y:mouseY})

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