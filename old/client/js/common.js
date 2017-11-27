$(document).ready(function(){
	var area = document.getElementById('main_canvas');
	var areaCtx = area.getContext('2d');
	var chatOutput = document.getElementById('chatOutput');
	var chatInput = document.getElementById('chatInput');
	var chatForm = document.getElementById('chatForm');
	var playerName = document.getElementById('playerName');
	var getNameInput = document.getElementById('getNameInput');
	var getNameForm = document.getElementById('getNameForm');
	mousePosition = function(event){		
    	var x = event.clientX;
    	var y = event.clientY;
    	socket.emit('mousePosition',{x:x,y:y})
	}

	
	areaSize = function(){
	    area.width = $(window).width()-2;
	    area.height = $(window).height()-1;
	}
	areaSize();
	$(window).resize( areaSize );

	var socket = io();

	socket.on('newPositions',function(data) {
		areaCtx.clearRect(0,0,area.clientWidth,area.clientHeight);
//		areaCtx.clearArc(0,0,area.clientWidth,area.clientHeight);

		for(var i = 0 ; i < data.player.length; i++){

			areaCtx.beginPath();
			areaCtx.fillStyle = 'red';
			areaCtx.arc(data.player[i].x, data.player[i].y, 30, 0, 2*Math.PI, false);
			areaCtx.fill();

			areaCtx.lineWidth = 2;
			areaCtx.strokeStyle = 'blue';
			areaCtx.stroke();

			areaCtx.beginPath();
			areaCtx.moveTo(data.player[i].x, data.player[i].y);
			areaCtx.lineTo(data.player[i].x+30*Math.cos(data.player[i].mouseAngle), data.player[i].y+30*Math.sin(data.player[i].mouseAngle));
			//areaCtx.lineTo(data.player[i].x+15*Math.cos(data.player[i].mouseAngle), data.player[i].y+15*Math.sin(data.player[i].mouseAngle);
			areaCtx.lineWidth = 2;
			areaCtx.strokeStyle = 'blue';
			areaCtx.stroke();




			areaCtx.fillStyle = 'black';
			areaCtx.font = '16px Exo_2';
			areaCtx.textAlign  = 'center';
			areaCtx.textBaseline   = 'bottom';
			areaCtx.fillText(data.player[i].name,data.player[i].x,data.player[i].y-35);
		}

		for(var i = 0 ; i < data.shell.length; i++){
			areaCtx.fillStyle = 'black';
			areaCtx.fillRect(data.shell[i].x,data.shell[i].y,20,20);
		}

	});

	document.onkeydown = function(event){		
    if(event.keyCode === 68)    //d
        socket.emit('keyPress',{inputId:'right',state:true});
    else if(event.keyCode === 83)   //s
        socket.emit('keyPress',{inputId:'down',state:true});
    else if(event.keyCode === 65) //a
        socket.emit('keyPress',{inputId:'left',state:true});
    else if(event.keyCode === 87) // w
        socket.emit('keyPress',{inputId:'up',state:true});           
	}

	document.onkeyup = function(event){
    if(event.keyCode === 68)    //d
        socket.emit('keyPress',{inputId:'right',state:false});
    else if(event.keyCode === 83)   //s
        socket.emit('keyPress',{inputId:'down',state:false});
    else if(event.keyCode === 65) //a
        socket.emit('keyPress',{inputId:'left',state:false});
    else if(event.keyCode === 87) // w
        socket.emit('keyPress',{inputId:'up',state:false});
	}


    area.onmousedown = function(event){
    	socket.emit('keyPress',{inputId:'leftBtn',state:true});
    }
    area.onmouseup = function(event){
    	socket.emit('keyPress',{inputId:'leftBtn',state:false});
    }
    area.onmousemove = function(event){
    	mousePosition(event);
   //  	var x = 0;
   //  	var y = 0;

   //  	socket.on('newPositions',function(data){
   //  		for(var i = 0 ; i < data.player.length; i++){
		 //    	x = event.clientX-data.player[i].x;
		 //    	y = event.clientY-data.player[i].y;
			// }
   //  	});
   //  	// var x = -250 +event.clientX - 8;
   //  	// var y = -250 +event.clientY - 8;
   //  	var angle = Math.atan2(y,x)/ Math.PI*180;
   //  	console.log(x+'   '+y+'   '+angle);
   //  	socket.emit('keyPress',{inputId:'mouseAngle',state:angle});
    }

    socket.on('addToChat',function(data){
    	chatOutput.innerHTML+='<li>'+data+'</li>';
    })

    socket.on('evalAnswer',function(data){
    	console.log(data);
    })

    chatForm.onsubmit = function(e) {
    	e.preventDefault();
    	if(chatInput.value[0]==='/'){
    		socket.emit('evalServer',chatInput.value.slice(1));
    	}
    	else if (!chatInput.value=="") {
    		if (chatInput.value.length > 100) {
    			alert('Сообщение не должно привышать 100 символов.')
    		}
    		else {
    			socket.emit('sendMsgToServer',chatInput.value);
    		}
    	}
    	chatInput.value = "";
    }

    socket.on('pushName',function(data){
    	playerName.innerHTML=data;
    })
    getNameForm.onsubmit = function(e) {
    	e.preventDefault();
    	if (!getNameInput.value=="") {
			if (getNameInput.value.length > 100) {
				alert('Имя не должно превышать 16 символов')
			}
			else {
				socket.emit('getName',getNameInput.value);
				getNameForm.parentNode.removeChild(getNameForm);
			}
		}
    	getNameInput.value = "";
    }

});








$(document).ready(function(){


	  $('#menuBtn').on('click', function() {
	    $('#menu').toggleClass('active')
	  });


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