$(document).ready(function(){
	var socket = io();
	socket.emit('aboutReady');







});


$(document).ready(function(){

	areaSize = function(){
		setTimeout(function() {
			contenHeight = $(window).height()-$('#header').height();
			$('#content').height(contenHeight);
			console.log('Resize');
		}, 300);
	};
	areaSize();
	$(window).resize(areaSize);
	$('.navbar-toggler').click(areaSize);

	Check = {
	  	children : function(){
	    	var parentId = $(this).attr('id');
	    	if ($(this).is(':checked')){
	         	$('.cb-c[data-target = "'+parentId+'"]').prop('checked', true).each(Check.children);
	      	} else {
	        	$('.cb-c[data-target = "'+parentId+'"]').prop('checked', false).each(Check.children);
	      	}
	  	},
	  	parent : function(){
	    	var childrenTarget = $(this).attr('data-target');
	    	var countAll = $('.cb-c[data-target = "'+childrenTarget+'"]').length;
	    	var countChacked = $('.cb-c[data-target = "'+childrenTarget+'"]:checked').length;
	    	if (countAll === countChacked){
	    		$('.cb-p[id = "'+childrenTarget+'"]').prop('checked', true).each(Check.parent);
	    	}else {
	      		$('.cb-p[id = "'+childrenTarget+'"]').prop('checked', false).each(Check.parent);
	    	}
	  	}
	}
	
	$('.cb-p').click(Check.children);
	$('.cb-c').click(Check.parent);


});