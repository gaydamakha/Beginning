$(document).ready(function(){
	var area = document.getElementById('canvas');
	var areaCtx = area.getContext('2d');
	var socket = io();
	var btnStart = document.getElementById('btnStart');

	areaSize = function(){
	    area.width = $(window).width()-8;
	    area.height = $(window).height()-5;
	}
	areaSize();
	$(window).resize(areaSize);


	btnStart.onclick = function(){

		$(".box").css("display", "none");
		$("#canvas").css({"display":"block","border":"solid 2px #1DE"});

		socket.emit('createPlayer',{flag:true})		
	}

	socket.on('newPosition',function(data){
		areaCtx.clearRect(0,0,area.width,area.height);

		for (var i=0; i<data.length;i++){
			if (data[i].create === true) {
				areaCtx.beginPath();
				areaCtx.fillStyle = 'red';
				areaCtx.arc(data[i].x, data[i].y, 30, 0, 2*Math.PI, false);
				areaCtx.fill();

				areaCtx.lineWidth = 2;
				areaCtx.strokeStyle = 'blue';
				areaCtx.stroke();

				areaCtx.fillStyle = 'black';
				areaCtx.font = '20px Exo_2';
				areaCtx.textAlign  = 'center';
				areaCtx.textBaseline   = 'bottom';
				areaCtx.fillText(data[i].number,data[i].x,data[i].y+10);
			}
		}
	});

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