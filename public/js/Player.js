function Player(scene, loader, socket, isMaster, faceIndex)
{
	// KEYS:
	//	- 37: left
	//	- 39: right
	//	- 32: space
	this.keys = [37, 39, 32]

	this.mesh = null
	this.rightPressed = false
	this.leftPressed = false
	this.groundSpeed = .01
	this.isMaster = isMaster
	this.faceIndex = faceIndex
	this.socket = socket
	
	var self = this
	loader.load("data/girl.js", function(geometry, materials)
	{
		self.mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))
		scene.add(self.mesh)
		self.mesh.castShadow = true
		self.mesh.receiveShadow = true
		
		self.mesh.position.set(0, 0, 0)
	})
	
	if (this.isMaster)
	{
		document.addEventListener('keydown', function(event)
		{
			if (self.keys.indexOf(event.keyCode) != -1)
				event.preventDefault()
			
			if (event.keyCode == 37)
				self.leftPressed = true
			if (event.keyCode == 39)
				self.rightPressed = true
		})
		
		document.addEventListener('keyup', function(event)
		{
			if (self.keys.indexOf(event.keyCode) != -1)
				event.preventDefault()
			
			if (event.keyCode == 37)
				self.leftPressed = false
			if (event.keyCode == 39)
				self.rightPressed = false
		})
	}
	else
	{
		socket.on("playerMoved", function(data)
		{
			if (!self.mesh)
				return
			
			if (data.faceIndex == self.faceIndex)
				self.mesh.position = data.position
		})
	}
}

Player.prototype.update = function(time, dt, tower)
{
	if (!this.mesh)
		return
	
	var dir = 0
	if (this.leftPressed)
		dir -= 1
	if (this.rightPressed)
		dir += 1
	this.mesh.position.x += dir * this.groundSpeed * dt
	
	if (this.isMaster)
	{
		this.socket.emit("movePlayer", {position: this.mesh.position, faceIndex: this.faceIndex})
	}
}
