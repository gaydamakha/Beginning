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
	$(window).resize( areaSize );






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