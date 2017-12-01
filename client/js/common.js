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
	areaCtx.font='30px Arial';
	$(window).resize( areaSize );

	socket.on('newPosition',function(data){
		areaCtx.clearRect(0,0,area.width,area.height);
		for (var i=0; i<data.length;i++)
			areaCtx.fillText('LEHA',data[i].x,data[i].y);
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