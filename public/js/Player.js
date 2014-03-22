function Player(scene, loader, socket)
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
	
	var self = this
	loader.load("data/test-object.js", function(geometry, materials)
	{
		self.mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))
		scene.add(self.mesh)
		self.mesh.castShadow = true
		self.mesh.receiveShadow = true
		
		self.mesh.position.set(0, 2, 0)
	})
	
	document.addEventListener('keydown', function(event) {
		if (self.keys.indexOf(event.keyCode) != -1)
			event.preventDefault()
		
		if (event.keyCode == 37)
			self.leftPressed = true
		if (event.keyCode == 39)
			self.rightPressed = true
	})
	
	document.addEventListener('keyup', function(event) {
		if (self.keys.indexOf(event.keyCode) != -1)
			event.preventDefault()
		
		if (event.keyCode == 37)
			self.leftPressed = false
		if (event.keyCode == 39)
			self.rightPressed = false
	})
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
}
