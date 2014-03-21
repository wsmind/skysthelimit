window.onload = function()
{
	var socket = io.connect()
	
	socket.on("connect", function()
	{
		alert("connected!")
	})
	
	socket.on("disconnect", function()
	{
		alert("disconnected!")
	})
}
