var game = null

window.onload = function()
{
	game = new Game()
	requestAnimationFrame(update)
}

function update(timestamp)
{
	game.update(timestamp)
	requestAnimationFrame(update)
}
