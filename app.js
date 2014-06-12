var express = require("express")
var http = require("http")

var app = express()
var server = http.createServer(app)

app.use(express.static(__dirname + "/public"))

server.listen(8086)

var io = require("socket.io").listen(server, { log: false })

// tower faces
var faces = []
for (var i = 0; i < 4; i++)
{
	faces.push({
		socket: null,
		playerName: null
	})
}

function findFreeFace()
{
	for (var i in faces)
	{
		var face = faces[i]
		if (face.socket == null)
			return i
	}
	
	return null
}

io.sockets.on("connection", function(socket)
{
	socket.on("registerPlayer", function(data)
	{
		var faceIndex = findFreeFace()
		if (faceIndex === null)
		{
			socket.emit("registrationFailed", {message: "Server full. Sorry. [gtfo you moron]"})
			console.log("player rejected: " + data.playerName)
		}
		else
		{
			socket.set("faceIndex", faceIndex, function()
			{
				var face = faces[faceIndex]
				face.socket = socket
				face.playerName = data.playerName
				
				socket.emit("registrationSuccess", {playerName: face.playerName, faceIndex: faceIndex})
				socket.broadcast.emit("playerJoined", {playerName: face.playerName, faceIndex: faceIndex})
				
				// send join events for all players that were already registered
				for (var i in faces)
				{
					if (faces[i].socket && (i != faceIndex))
						socket.emit("playerJoined", {playerName: faces[i].playerName, faceIndex: i})
				}
				
				console.log("player " + data.playerName + " takes face " + faceIndex)
			})
		}
	})
	
	socket.on("disconnect", function()
	{
		socket.get("faceIndex", function(err, faceIndex)
		{
			if (err) throw err
			
			var face = faces[faceIndex]
			
			socket.broadcast.emit("playerLeaved", {playerName: face.playerName, faceIndex: faceIndex})
			console.log("player " + face.playerName + " leaved")
			
			face.socket = null
			face.playerName = null
		})
	})
	
	socket.on("movePlayer", function(data)
	{
		socket.broadcast.emit("playerMoved", data)
	})
	
	socket.on("activateBlock", function(data)
	{
		console.log("activation required for block " + data.blockIndex + " on face " +  data.faceIndex)
		socket.emit("blockActivated", data)
		socket.broadcast.emit("blockActivated", data)
	})
})
