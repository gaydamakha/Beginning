$(document).ready(function(){
	var socket = io();
	socket.emit('aboutReady');
});


$(document).ready(function(){
	// $('content').scrollspy({ target: '#navbar_header', offset: 500 });
	// $('content').each(function () {
	//  	var $spy = $(this).scrollspy('refresh')
	// });

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

});