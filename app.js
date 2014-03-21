var express = require("express")
var http = require("http")

var app = express()
var server = http.createServer(app)

app.use(express.static(__dirname + "/public"))

server.listen(8080)

var io = require("socket.io").listen(server)

io.sockets.on("connection", function(socket)
{
	console.log("client connected!")
	
	socket.on("disconnect", function()
	{
		console.log("client disconnected!")
	})
})
