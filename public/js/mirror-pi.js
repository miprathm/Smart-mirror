$(document).ready(function()
{
	calendar.show("#calendar");
	weather.show("#weather");
	feed.show("#feed");
	aiclient.start();
});

$(window).resize(function() {
	feed.format("#feed");
});
