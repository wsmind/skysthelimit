var game = null

window.onload = function()
{
	var socket = io.connect()
	
	socket.on("connect", function()
	{
		console.log("connected!")
	})
	
	socket.on("disconnect", function()
	{
		console.log("disconnected!")
	})
	
	game = new Game()
	requestAnimationFrame(update)
}

function update(timestamp)
{
	game.update(timestamp)
	requestAnimationFrame(update)
}
