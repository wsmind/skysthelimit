function Player(scene, loader, socket, isMaster, faceIndex)
{
	// KEYS:
	//	- 37: left
	//	- 39: right
	//	- 32: space
	this.keys = [37, 39, 32]

	this.mesh = null
	this.isMaster = isMaster
	this.faceIndex = faceIndex
	this.socket = socket
	
	this.rightPressed = false
	this.leftPressed = false
	this.groundSpeed = .01
	this.airSpeed = .005
	this.jumpSpeed = 0
	this.animation = null
	
	var self = this
	loader.load("data/girl.js", function(geometry, materials)
	{
		self.mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials))
		scene.add(self.mesh)
		
		self.mesh.position.set(0, 0, 0.5)
		
		var materials = self.mesh.material.materials
		for (var k in materials)
		{
			materials[k].skinning = true
		}
		THREE.AnimationHandler.add(self.mesh.geometry.animations[0])
		self.animation = new THREE.Animation(self.mesh, "Idle", THREE.AnimationHandler.CATMULLROM)
		self.animation.play()
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
			if (event.keyCode == 32 && !event.repeat)
				self.jumpSpeed = .015
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

Player.prototype.update = function(time, dt, towerFace)
{
	if (!this.mesh)
		return
	
	if (!this.isMaster)
		return
	
	if (this.animation)
	{
		this.animation.update(dt / 1000)
	}
	
	var dir = 0
	if (this.leftPressed)
		dir -= 1
	if (this.rightPressed)
		dir += 1
	var speed = this.mesh.position.y > 0 ? this.airSpeed : this.groundSpeed
	
	this.jumpSpeed -= .00005 * dt
	this.jumpSpeed = Math.max(this.jumpSpeed, -.03)
	
	this.mesh.position.x += dir * speed * dt
	this.mesh.position.y += this.jumpSpeed * dt
	
	// compute current bounding box
	var min = new THREE.Vector2(-0.2, 0.0)
	var max = new THREE.Vector2(0.2, 1.1)
	min.add(this.mesh.position)
	max.add(this.mesh.position)
	this.boundingBox = new THREE.Box2(min, max)
	
	tempBox = new THREE.BoxHelper() // [-1, 1]^3
	var size = this.boundingBox.size()
	var center = this.boundingBox.center()
	tempBox.scale.set(size.x * 0.5, size.y * 0.5, 0.5)
	tempBox.position = new THREE.Vector3(center.x, center.y, 0.5)
	
	// apply collision and trigger events
	var self = this
	towerFace.collide(this, function(collisionInfo, block)
	{
		// exclude this contact if it is separating
		//if (vec2.dot(this.speed, collisionInfo.normal) > 0)
		//	return
		
		var offsetX = collisionInfo.normal.x * collisionInfo.depth
		var offsetY = collisionInfo.normal.y * collisionInfo.depth
		self.mesh.position.x += offsetX
		self.mesh.position.y += offsetY
		self.boundingBox.min.x += offsetX
		self.boundingBox.min.y += offsetY
		self.boundingBox.max.x += offsetX
		self.boundingBox.max.y += offsetY
		
		// keep only tangent velocity
		/*var normalVelocity = 
		vec2.scale(normalVelocity, collisionInfo.normal, vec2.dot(this.speed, collisionInfo.normal))
		vec2.subtract(this.speed, this.speed, normalVelocity)*/
		
		// check if we collided with the ground
		//if (-collisionInfo.normal.y > Math.abs(collisionInfo.normal.x))
		//	this.grounded = true
	})

	
	if (this.mesh.position.y <= 0)
	{
		this.mesh.position.y = 0
		this.jumpSpeed = 0
	}
	
	// broadcast new position to other players
	this.socket.emit("movePlayer", {position: this.mesh.position, faceIndex: this.faceIndex})
}
