$(document).ready(function(){

	var area = document.getElementById('canvas');
	var areaCtx = area.getContext('2d');
	var socket = io();
	var box = document.getElementById('box');

	areaSize = function(){
	    area.width = $(window).width()-8;
	    area.height = $(window).height()-5;
	}
	areaSize();
	//areaCtx.font='30px Arial';
	$(window).resize( areaSize );

	socket.on('newPosition',function(data){
		areaCtx.clearRect(0,0,area.width,area.height);
		for (var i=0; i<data.length;i++)
			areaCtx.fillText(data[i].number,data[i].x,data[i].y);
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